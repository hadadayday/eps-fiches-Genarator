import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import SessionForm from './components/SessionForm';
import SessionPreview from './components/SessionPreview';
import SessionBuilder from './components/SessionBuilder';
import { GenerationParams, SessionData, Level, Sport, Difficulty, NumericalSituation } from './types';
import { generateSession } from './services/geminiService';
import { LayoutDashboard, PenTool, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'generator' | 'builder'>('generator');
  
  // Generator State
  const [params, setParams] = useState<GenerationParams>({
    level: Level.LEVEL_1_AC,
    sport: Sport.BASKETBALL,
    situation: NumericalSituation.SIT_3C2,
    objective: "", // Will be auto-deduced if empty
    duration: 60,
    students: 24,
    material: "12 ballons, 20 plots, 6 chasubles",
    difficulty: Difficulty.INTERMEDIATE,
    schemaStyle: "zones",
    customCriteria: []
  });

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateSession(params);
      setSessionData(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <LayoutDashboard className="w-5 h-5"/>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    EPS GenPro
                </h1>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('generator')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'generator' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Sparkles className="w-4 h-4" /> Générateur IA
                </button>
                <button 
                    onClick={() => setMode('builder')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'builder' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <PenTool className="w-4 h-4" /> Construire ma Fiche
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {mode === 'builder' ? (
            <SessionBuilder />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Form */}
                <div className="lg:col-span-4 space-y-6">
                    <SessionForm 
                        params={params} 
                        setParams={setParams} 
                        onSubmit={handleSubmit} 
                        isLoading={isLoading} 
                    />
                    
                    {/* Info Box */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <h4 className="font-bold mb-2">Instructions</h4>
                        <p>Définissez la situation (ex: 3c2) pour que l'IA déduise automatiquement l'objectif (Conserver/Progresser). Laissez le champ "Objectif" vide pour l'auto-déduction.</p>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            <strong>Erreur:</strong> {error}
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 animate-pulse">Conception de la séance en cours...</p>
                            <p className="text-xs text-slate-400">Génération du texte, des schémas et des critères d'évaluation</p>
                        </div>
                    )}

                    {!isLoading && sessionData && (
                        <SessionPreview data={sessionData} />
                    )}

                    {!isLoading && !sessionData && !error && (
                        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                            <LayoutDashboard className="w-16 h-16 text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">Configurez et lancez la génération pour voir le résultat.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;