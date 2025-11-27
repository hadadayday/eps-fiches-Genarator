import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerationParams, SessionData } from "../types";

// Helper to get API key
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key not found in environment variables.");
    throw new Error("Clé API manquante. Veuillez vérifier la configuration.");
  }
  return key;
};

// Define the Schema for Gemini 2.5 Flash Structured Output
const playerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    label: { type: Type.STRING, description: "Label technique (ex: PG, SG, C pour Basket; AR, AL, DC pour Hand)" },
    x: { type: Type.NUMBER, description: "Position X en pourcentage (0-100)" },
    y: { type: Type.NUMBER, description: "Position Y en pourcentage (0-100)" },
    role: { type: Type.STRING, enum: ["attacker", "defender", "neutral"] },
    team: { type: Type.STRING, enum: ["team1", "team2", "neutral"], description: "team1=Attaque (Blanc), team2=Défense (Orange)" },
    hasBall: { type: Type.BOOLEAN },
    orientation: { type: Type.NUMBER, description: "Orientation en degrés (0=Haut)" },
  },
  required: ["x", "y", "role", "id", "label", "team"],
};

const arrowSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fromX: { type: Type.NUMBER },
    fromY: { type: Type.NUMBER },
    toX: { type: Type.NUMBER },
    toY: { type: Type.NUMBER },
    type: { type: Type.STRING, enum: ["pass", "movement", "dribble", "rotation", "action"] },
    label: { type: Type.STRING, description: "Optionnel: description de l'action" }
  },
  required: ["fromX", "fromY", "toX", "toY", "type"],
};

const schemaDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    players: { type: Type.ARRAY, items: playerSchema },
    arrows: { type: Type.ARRAY, items: arrowSchema },
    zones: {
        type: Type.ARRAY, 
        items: {
            type: Type.OBJECT, 
            properties: {
                x: {type: Type.NUMBER}, y: {type: Type.NUMBER}, width: {type: Type.NUMBER}, height: {type: Type.NUMBER}, color: {type: Type.STRING}
            }
        }
    }
  },
  required: ["players", "arrows"],
};

const evaluationItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        description: {type: Type.STRING},
        points_0: {type: Type.STRING, description: "Critère pour 0 point (Non acquis)"},
        points_1: {type: Type.STRING, description: "Critère pour 1 point (En cours)"},
        points_2: {type: Type.STRING, description: "Critère pour 2 points (Acquis)"}
    }
}

const drillSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    duration: { type: Type.STRING },
    goal: { type: Type.STRING, description: "But de la situation" },
    method: { type: Type.STRING, description: "Dispositif et moyens" },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    variations: {
      type: Type.OBJECT,
      properties: {
        easier: { type: Type.STRING },
        harder: { type: Type.STRING },
        timeLimited: { type: Type.STRING },
      },
    },
    successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
    evaluationCriteria: { type: Type.ARRAY, items: evaluationItemSchema },
    schema: schemaDataSchema,
  },
  required: ["title", "goal", "method", "instructions", "variations", "successCriteria", "schema"],
};

const sessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    level: { type: Type.STRING },
    sport: { type: Type.STRING },
    objective: { type: Type.STRING },
    duration: { type: Type.NUMBER },
    material: { type: Type.STRING },
    warmup: drillSchema,
    fundamental: { type: Type.ARRAY, items: drillSchema },
    final: drillSchema,
  },
  required: ["title", "level", "sport", "objective", "warmup", "fundamental", "final"],
};

export const generateSession = async (params: GenerationParams): Promise<SessionData> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const customCriteriaText = params.customCriteria && params.customCriteria.length > 0 
    ? `\nIMPORTANT - CRITÈRES D'ÉVALUATION IMPOSÉS :\nL'utilisateur a défini les critères d'évaluation suivants : ${JSON.stringify(params.customCriteria)}. Tu DOIS utiliser ces critères pour construire les grilles d'évaluation de chaque situation (warmup, fondamentale, final). Pour chaque critère imposé, définis les descriptions précises pour 0 point, 1 point et 2 points en lien avec la situation.`
    : `\nGénère des critères d'évaluation pertinents (Technique, Tactique, Moteur) adaptés à la situation.`;

  const prompt = `
    Tu es un Expert Générateur de Diagrammes Tactiques et Pédagogue EPS.
    Génère une séance complète et des schémas tactiques de haute précision pour : ${params.sport}.

    Contexte :
    - Niveau : ${params.level}
    - Objectif : ${params.objective}
    - Matériel : ${params.material}

    RÈGLES STRICTES POUR LES SCHÉMAS TACTIQUES (OBLIGATOIRE) :
    1. JOUEURS :
       - Utilise des labels spécifiques au sport :
         * BASKETBALL : PG (Meneur), SG (Arrière), SF (Ailier), PF (Ailier fort), C (Pivot).
         * HANDBALL : AL (Ailier Gauche), AR (Ailier Droit), ARG (Arrière Gauche), ARD (Arrière Droit), DC (Demi-Centre), P (Pivot), GB (Gardien).
       - Équipes :
         * 'team1' (Blanc) = Attaquants principaux.
         * 'team2' (Orange) = Défenseurs ou opposants.
       - Orientation : Indique l'angle (0-360) où le joueur regarde.

    2. FLÈCHES ET ACTIONS :
       - 'pass' : Ligne pleine (Passe).
       - 'movement' : Ligne pointillée (Déplacement sans ballon).
       - 'dribble' : Ligne zigzag ou courbe (Dribble).
       - 'rotation' : Double flèche ou courbe (Échange de poste).
       - 'action' : Flèche épaisse (Tir, action décisive).

    3. TERRAIN :
       - Positionne les joueurs de manière réaliste (ex: Ailiers dans les coins, Pivot dans la raquette).
       - Le ballon doit être attribué à un joueur clé (DC ou PG).

    Structure de la séance :
    1. Échauffement.
    2. Partie Fondamentale (2-3 situations progressives).
    3. Bilan.

    ${customCriteriaText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sessionSchema,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SessionData;
    } else {
        throw new Error("Réponse vide de l'IA");
    }
  } catch (error) {
    console.error("Error generating session:", error);
    throw error;
  }
};