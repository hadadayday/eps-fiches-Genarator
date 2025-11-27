// types.ts

export enum Sport {
  BASKETBALL = 'Basketball',
  HANDBALL = 'Handball',
  FOOTBALL = 'Football',
  VOLLEYBALL = 'Volleyball',
  FUTSAL = 'Futsal',
  RUGBY = 'Rugby'
}

export enum Level {
  LEVEL_1_AC = '1 A.C (7ème)',
  LEVEL_2_AC = '2 A.C (8ème)',
  LEVEL_3_AC = '3 A.C (9ème)',
  LYCEE = 'Lycée'
}

export enum Difficulty {
  BEGINNER = 'Débutant',
  INTERMEDIATE = 'Intermédiaire',
  ADVANCED = 'Avancé'
}

export enum NumericalSituation {
  SIT_3C2 = '3c2',
  SIT_4C3 = '4c3',
  SIT_5C4 = '5c4',
  SIT_5C5 = '5c5'
}

export interface PlayerPosition {
  id: string; // Internal ID
  label: string; // Display Label (e.g., PG, SG, AR, D1)
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  role: 'attacker' | 'defender' | 'neutral';
  team: 'team1' | 'team2' | 'neutral'; // team1 = White, team2 = Orange
  hasBall?: boolean;
  orientation?: number; // 0-360 degrees, 0 is Up
}

export interface Arrow {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'pass' | 'movement' | 'dribble' | 'rotation' | 'action';
  color?: string;
  label?: string; // Optional label for the arrow
}

export interface BoardItem {
    id: string;
    type: string; // References the icon ID in library
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color?: string;
    label?: string;
}

export interface TacticalSchema {
  description: string;
  players: PlayerPosition[];
  arrows: Arrow[];
  items?: BoardItem[]; // Generic icons from library
  zones: { x: number; y: number; width: number; height: number; color: string }[];
}

export interface Drill {
  title: string;
  duration: string;
  goal: string; // But
  method: string; // Dispositif / Moyens
  instructions: string[]; // Consignes
  variations: {
    easier: string;
    harder: string;
    timeLimited: string;
  };
  successCriteria: string[]; // Critères de réussite
  evaluationCriteria: {
    description: string;
    points_0: string;
    points_1: string;
    points_2: string;
  }[];
  schema: TacticalSchema;
}

export interface SessionData {
  title: string;
  level: string;
  sport: string;
  objective: string;
  duration: number;
  material: string;
  warmup: Drill;
  fundamental: Drill[]; // Usually 2-3 situations
  final: Drill; // Retour au calme
}

export interface GenerationParams {
  level: Level;
  sport: Sport;
  situation: NumericalSituation;
  objective: string;
  duration: number;
  students: number;
  material: string;
  difficulty: Difficulty;
  schemaStyle: 'zones' | 'lanes' | 'full';
  customCriteria: string[];
}