import React, { useRef } from 'react';
import { SessionData, Drill } from '../types';
import TacticalBoard from './TacticalBoard';
import { Download, FileText, Image as ImageIcon, FileJson } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import * as FileSaverPkg from 'file-saver';
import { generateDocxBlob } from '../services/docxService';

// Robust file-saver import handling for CDN environments
const saveAs = (FileSaverPkg as any).saveAs || (FileSaverPkg as any).default || FileSaverPkg;

interface SessionPreviewProps {
  data: SessionData;
}

const DrillCard: React.FC<{ drill: Drill; index?: number; sport: string }> = ({ drill, index, sport }) => {
    const boardRef = useRef<SVGSVGElement>(null);

    const downloadPNG = async () => {
        if (boardRef.current && boardRef.current.parentElement) {
             try {
                 const dataUrl = await htmlToImage.toPng(boardRef.current.parentElement as HTMLElement, {
                     backgroundColor: '#ffffff',
                     fontEmbedCSS: '' // Fix for "Failed to read the 'cssRules' property" with CORS stylesheets (Tailwind CDN)
                 });
                 saveAs(dataUrl, `schema-${drill.title.replace(/\s+/g, '-').toLowerCase()}.png`);
             } catch (error) {
                 console.error("Error generating PNG:", error);
                 alert("Erreur lors de la génération de l'image. Veuillez réessayer.");
             }
        }
    };

    if (!drill) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">
                        {index !== undefined ? `Situation ${index + 1}` : "Phase"} ({drill.duration})
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{drill.title}</h3>
                </div>
                <button onClick={downloadPNG} className="text-slate-400 hover:text-indigo-600" title="Télécharger Schéma PNG">
                    <ImageIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Text Content */}
                <div className="space-y-4 text-sm text-slate-600">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong className="block text-slate-800 mb-1">But:</strong>
                        {drill.goal}
                    </div>
                     <div>
                        <strong className="block text-slate-800">Dispositif / Moyens:</strong>
                        {drill.method}
                    </div>
                    <div>
                        <strong className="block text-slate-800">Consignes:</strong>
                        <ul className="list-disc list-inside space-y-1">
                            {drill.instructions?.map((inst, i) => <li key={i}>{inst}</li>) || <li>Aucune consigne spécifique</li>}
                        </ul>
                    </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-green-50 text-green-800 p-2 rounded border border-green-100">
                            <strong>+ Facile:</strong> {drill.variations?.easier || "-"}
                        </div>
                        <div className="bg-red-50 text-red-800 p-2 rounded border border-red-100">
                            <strong>+ Difficile:</strong> {drill.variations?.harder || "-"}
                        </div>
                    </div>
                    
                    {/* Evaluation Grid */}
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <strong className="block text-slate-800 mb-2">Grille d'évaluation:</strong>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200">
                                        <th className="p-2 font-semibold">Critère</th>
                                        <th className="p-2 font-semibold text-center w-16">0 pt</th>
                                        <th className="p-2 font-semibold text-center w-16">2 pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drill.evaluationCriteria?.map((crit, idx) => (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="p-2">{crit.description}</td>
                                            <td className="p-2 text-center bg-red-50/50">{crit.points_0}</td>
                                            <td className="p-2 text-center bg-green-50/50">{crit.points_2}</td>
                                        </tr>
                                    )) || <tr><td colSpan={3} className="p-2 text-center text-slate-400">Aucun critère défini</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Visual */}
                <div className="flex flex-col items-center justify-start bg-slate-50 rounded-lg p-2">
                    {drill.schema ? (
                        <TacticalBoard ref={boardRef} schema={drill.schema} sport={sport} width={400} height={300} />
                    ) : (
                        <div className="w-[400px] h-[300px] flex items-center justify-center text-slate-400 italic">Pas de schéma disponible</div>
                    )}
                    <p className="text-xs text-slate-400 mt-2 italic">Représentation générée par IA</p>
                </div>
            </div>
        </div>
    );
};

const SessionPreview: React.FC<SessionPreviewProps> = ({ data }) => {

  const handleDownloadDocx = async () => {
      try {
          const blob = await generateDocxBlob(data);
          saveAs(blob, `seance-${data.sport}-${data.level}.docx`);
      } catch (e) {
          console.error("Erreur lors de la génération DOCX:", e);
          alert("Erreur lors de la création du fichier Word.");
      }
  };

  const handleDownloadJSON = () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'seance-data.json');
  };

  if (!data) return null;

  return (
    <div className="w-full space-y-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{data.title || "Séance Générée"}</h1>
                <p className="text-slate-500 text-sm">{data.level} • {data.sport}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
                <button 
                    onClick={handleDownloadDocx}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <FileText className="w-4 h-4" /> Télécharger .DOCX
                </button>
                <button 
                    onClick={handleDownloadJSON}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                >
                    <FileJson className="w-4 h-4" /> JSON
                </button>
            </div>
        </div>

        {/* Content */}
        <div>
            {data.warmup && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3">1. Échauffement</h2>
                    <DrillCard drill={data.warmup} sport={data.sport} />
                </div>
            )}

            {data.fundamental && data.fundamental.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3">2. Partie Fondamentale</h2>
                    {data.fundamental.map((drill, idx) => (
                        <DrillCard key={idx} drill={drill} index={idx} sport={data.sport} />
                    ))}
                </div>
            )}

            {data.final && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-indigo-500 pl-3">3. Retour au calme</h2>
                    <DrillCard drill={data.final} sport={data.sport} />
                </div>
            )}
        </div>
    </div>
  );
};

export default SessionPreview;