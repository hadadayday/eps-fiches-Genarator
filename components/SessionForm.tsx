import React, { useState } from 'react';
import { GenerationParams, Level, Sport, Difficulty } from '../types';
import { Settings, Users, Clock, Target, Dumbbell, Grid, ClipboardList, Plus, Trash2 } from 'lucide-react';

interface SessionFormProps {
  params: GenerationParams;
  setParams: React.Dispatch<React.SetStateAction<GenerationParams>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const SessionForm: React.FC<SessionFormProps> = ({ params, setParams, onSubmit, isLoading }) => {
  const [newCriterion, setNewCriterion] = useState("");
  
  const handleChange = (field: keyof GenerationParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim() && !params.customCriteria.includes(newCriterion.trim())) {
      setParams(prev => ({
        ...prev,
        customCriteria: [...prev.customCriteria, newCriterion.trim()]
      }));
      setNewCriterion("");
    }
  };

  const handleRemoveCriterion = (indexToRemove: number) => {
    setParams(prev => ({
      ...prev,
      customCriteria: prev.customCriteria.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCriterion();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-indigo-600" />
        Configuration de la Séance
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activité (APS)</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            value={params.sport}
            onChange={(e) => handleChange('sport', e.target.value)}
          >
            {Object.values(Sport).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Niveau Scolaire</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            value={params.level}
            onChange={(e) => handleChange('level', e.target.value)}
          >
            {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Objective */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
             <Target className="inline w-4 h-4 mr-1"/> Objectif Pédagogique
          </label>
          <input 
            type="text" 
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Conserver la balle pour progresser vers la cible"
            value={params.objective}
            onChange={(e) => handleChange('objective', e.target.value)}
          />
        </div>

        {/* Duration, Students & Difficulty Aligned Row */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1"><Clock className="inline w-4 h-4"/> Durée (min)</label>
                 <input 
                    type="number" 
                    className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    value={params.duration}
                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                 />
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1"><Users className="inline w-4 h-4"/> Élèves</label>
                 <input 
                    type="number" 
                    className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    value={params.students}
                    onChange={(e) => handleChange('students', parseInt(e.target.value))}
                 />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1"><Dumbbell className="inline w-4 h-4"/> Difficulté</label>
               <select 
                 className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500"
                 value={params.difficulty}
                 onChange={(e) => handleChange('difficulty', e.target.value)}
               >
                  {Object.values(Difficulty).map(d => (
                      <option key={d} value={d} className="bg-slate-800 text-white">{d}</option>
                  ))}
               </select>
            </div>
        </div>

        {/* Schema Style */}
        <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 mb-1"><Grid className="inline w-4 h-4"/> Style Terrain</label>
             <select 
                className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={params.schemaStyle}
                onChange={(e) => handleChange('schemaStyle', e.target.value)}
             >
                 <option value="zones" className="bg-slate-800 text-white">Zones (Damier)</option>
                 <option value="lanes" className="bg-slate-800 text-white">Couloirs (Longitudinal)</option>
                 <option value="full" className="bg-slate-800 text-white">Terrain complet</option>
             </select>
        </div>
      
        {/* Material */}
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-slate-700 mb-1">Matériel Disponible</label>
           <input 
             type="text"
             className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
             value={params.material}
             onChange={(e) => handleChange('material', e.target.value)}
           />
        </div>

        {/* Custom Criteria Section */}
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <ClipboardList className="inline w-4 h-4 mr-1 text-indigo-600"/> 
                Critères d'évaluation (Optionnel)
            </label>
            <div className="flex gap-2 mb-3">
                <input 
                    type="text" 
                    className="flex-1 p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ajouter un critère (ex: Respect des couloirs)"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    onClick={handleAddCriterion}
                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            
            {params.customCriteria.length > 0 && (
                <div className="space-y-2">
                    {params.customCriteria.map((crit, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                            <span className="text-slate-700 font-medium">• {crit}</span>
                            <button 
                                onClick={() => handleRemoveCriterion(idx)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-slate-400 mt-2">L'IA générera le barème précis pour ces critères.</p>
        </div>

      </div>

      <div className="mt-8">
        <button 
            onClick={onSubmit}
            disabled={isLoading || !params.objective}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all ${isLoading || !params.objective ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
        >
            {isLoading ? 'Génération en cours (IA)...' : 'Générer la Séance'}
        </button>
      </div>
    </div>
  );
};

export default SessionForm;