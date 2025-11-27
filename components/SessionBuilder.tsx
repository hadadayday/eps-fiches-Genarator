import React, { useState } from 'react';
import { SessionData, Drill, Sport, Level, TacticalSchema } from '../types';
import TacticalEditor from './TacticalEditor';
import { generateDocxBlob } from '../services/docxService';
import * as FileSaverPkg from 'file-saver';
import { Save, FileText, Plus, Trash, Layout } from 'lucide-react';

const saveAs = (FileSaverPkg as any).saveAs || (FileSaverPkg as any).default || FileSaverPkg;

const EMPTY_SCHEMA: TacticalSchema = { description: '', players: [], arrows: [], zones: [], items: [] };

const EMPTY_DRILL: Drill = {
    title: "Nouvelle Situation",
    duration: "15 min",
    goal: "",
    method: "",
    instructions: [],
    variations: { easier: "", harder: "", timeLimited: "" },
    successCriteria: [],
    evaluationCriteria: [],
    schema: EMPTY_SCHEMA
};

const SessionBuilder: React.FC = () => {
    const [session, setSession] = useState<SessionData>({
        title: "Nouvelle Séance",
        level: Level.LEVEL_1_AC,
        sport: Sport.BASKETBALL,
        objective: "",
        duration: 60,
        material: "",
        warmup: { ...EMPTY_DRILL, title: "Échauffement" },
        fundamental: [{ ...EMPTY_DRILL, title: "Situation 1" }],
        final: { ...EMPTY_DRILL, title: "Bilan" }
    });

    const [activeTab, setActiveTab] = useState<'info' | 'warmup' | 'fundamental' | 'final'>('info');
    const [activeDrillIndex, setActiveDrillIndex] = useState(0); // For fundamental array

    const updateSession = (field: keyof SessionData, value: any) => {
        setSession(prev => ({ ...prev, [field]: value }));
    };

    const updateDrill = (section: 'warmup' | 'final', field: keyof Drill, value: any) => {
        setSession(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const updateFundamentalDrill = (index: number, field: keyof Drill, value: any) => {
        const newFundamentals = [...session.fundamental];
        newFundamentals[index] = { ...newFundamentals[index], [field]: value };
        setSession(prev => ({ ...prev, fundamental: newFundamentals }));
    };

    const addFundamentalDrill = () => {
        setSession(prev => ({
            ...prev,
            fundamental: [...prev.fundamental, { ...EMPTY_DRILL, title: `Situation ${prev.fundamental.length + 1}` }]
        }));
    };

    const removeFundamentalDrill = (index: number) => {
        if (session.fundamental.length <= 1) return;
        setSession(prev => ({
            ...prev,
            fundamental: prev.fundamental.filter((_, i) => i !== index)
        }));
        if (activeDrillIndex >= index) setActiveDrillIndex(Math.max(0, activeDrillIndex - 1));
    };

    const handleDownloadDocx = async () => {
        try {
            const blob = await generateDocxBlob(session);
            saveAs(blob, `mon-cours-${session.sport}.docx`);
        } catch (e) {
            console.error(e);
            alert("Erreur export");
        }
    };

    const renderDrillEditor = (drill: Drill, onChange: (field: keyof Drill, value: any) => void) => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Titre</label>
                    <input className="w-full p-2 border rounded" value={drill.title} onChange={e => onChange('title', e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Durée</label>
                    <input className="w-full p-2 border rounded" value={drill.duration} onChange={e => onChange('duration', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">But</label>
                    <textarea className="w-full p-2 border rounded h-20" value={drill.goal} onChange={e => onChange('goal', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dispositif / Moyens</label>
                    <textarea className="w-full p-2 border rounded h-20" value={drill.method} onChange={e => onChange('method', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Consignes (une par ligne)</label>
                    <textarea 
                        className="w-full p-2 border rounded h-24" 
                        value={drill.instructions.join('\n')} 
                        onChange={e => onChange('instructions', e.target.value.split('\n'))} 
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5"/> Éditeur Tactique
                </h3>
                <TacticalEditor 
                    initialSchema={drill.schema} 
                    sport={session.sport as Sport} 
                    onChange={(schema) => onChange('schema', schema)} 
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">
                    Mode Construction
                </h1>
                <button 
                    onClick={handleDownloadDocx}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                    <FileText className="w-4 h-4" /> Exporter Fiche (.docx)
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'info' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                    Infos Générales
                </button>
                <button 
                    onClick={() => setActiveTab('warmup')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'warmup' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                    Échauffement
                </button>
                <button 
                    onClick={() => setActiveTab('fundamental')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'fundamental' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                    Partie Fondamentale
                </button>
                <button 
                    onClick={() => setActiveTab('final')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'final' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                    Bilan
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
                
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Titre de la Séance</label>
                            <input className="w-full p-2 border rounded" value={session.title} onChange={e => updateSession('title', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Activité (Sport)</label>
                            <select className="w-full p-2 border rounded" value={session.sport} onChange={e => updateSession('sport', e.target.value)}>
                                {Object.values(Sport).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Niveau</label>
                            <select className="w-full p-2 border rounded" value={session.level} onChange={e => updateSession('level', e.target.value)}>
                                {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Durée (min)</label>
                            <input type="number" className="w-full p-2 border rounded" value={session.duration} onChange={e => updateSession('duration', parseInt(e.target.value))} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Objectif Principal</label>
                            <input className="w-full p-2 border rounded" value={session.objective} onChange={e => updateSession('objective', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Matériel</label>
                            <input className="w-full p-2 border rounded" value={session.material} onChange={e => updateSession('material', e.target.value)} />
                        </div>
                    </div>
                )}

                {activeTab === 'warmup' && renderDrillEditor(session.warmup, (f, v) => updateDrill('warmup', f, v))}

                {activeTab === 'final' && renderDrillEditor(session.final, (f, v) => updateDrill('final', f, v))}

                {activeTab === 'fundamental' && (
                    <div className="animate-fade-in">
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {session.fundamental.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveDrillIndex(idx)}
                                    className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap ${activeDrillIndex === idx ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    Situation {idx + 1}
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); removeFundamentalDrill(idx); }}
                                        className="hover:text-red-500 cursor-pointer p-1"
                                    >
                                        <Trash className="w-3 h-3" />
                                    </span>
                                </button>
                            ))}
                            <button onClick={addFundamentalDrill} className="px-3 py-1 rounded-full bg-slate-800 text-white text-xs flex items-center gap-1 hover:bg-slate-900">
                                <Plus className="w-3 h-3"/> Ajouter
                            </button>
                        </div>
                        
                        {renderDrillEditor(
                            session.fundamental[activeDrillIndex], 
                            (field, value) => updateFundamentalDrill(activeDrillIndex, field, value)
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default SessionBuilder;