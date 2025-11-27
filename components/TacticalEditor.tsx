import React, { useState, useRef, useEffect } from 'react';
import { BoardItem, TacticalSchema, Sport } from '../types';
import TacticalBoard from './TacticalBoard';
import { ICON_LIBRARY, IconDefinition } from '../data/iconAssets';
import { Trash2, RotateCw, ZoomIn, ZoomOut, Move, Type, Palette } from 'lucide-react';

interface TacticalEditorProps {
    initialSchema?: TacticalSchema;
    sport: Sport;
    onChange: (schema: TacticalSchema) => void;
}

const TacticalEditor: React.FC<TacticalEditorProps> = ({ initialSchema, sport, onChange }) => {
    const [items, setItems] = useState<BoardItem[]>(initialSchema?.items || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
    const [isDraggingOnCanvas, setIsDraggingOnCanvas] = useState(false);

    // Sync changes to parent
    useEffect(() => {
        onChange({
            description: "Custom Diagram",
            players: [], // In builder mode, we use 'items' for everything
            arrows: [],
            zones: [],
            items: items
        });
    }, [items, onChange]);

    // --- DRAG FROM LIBRARY ---
    const handleDragStart = (e: React.DragEvent, type: string) => {
        setDraggedItemType(type);
        e.dataTransfer.setData("application/react-dnd-type", type);
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/react-dnd-type");
        if (!type || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newItem: BoardItem = {
            id: Date.now().toString(),
            type,
            x,
            y,
            rotation: 0,
            scale: 0.12, // Default relative scale
            color: ICON_LIBRARY.find(i => i.id === type)?.defaultColor
        };

        setItems(prev => [...prev, newItem]);
        setSelectedId(newItem.id);
        setDraggedItemType(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    // --- CANVAS INTERACTION ---
    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent board drag
        setSelectedId(id);
        setIsDraggingOnCanvas(true);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingOnCanvas || !selectedId || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        setItems(prev => prev.map(item => 
            item.id === selectedId ? { ...item, x, y } : item
        ));
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingOnCanvas(false);
    };

    // --- ITEM PROPERTIES ---
    const updateItem = (updates: Partial<BoardItem>) => {
        if (!selectedId) return;
        setItems(prev => prev.map(item => 
            item.id === selectedId ? { ...item, ...updates } : item
        ));
    };

    const deleteItem = () => {
        if (!selectedId) return;
        setItems(prev => prev.filter(i => i.id !== selectedId));
        setSelectedId(null);
    };

    const selectedItem = items.find(i => i.id === selectedId);

    // Group icons by category
    const categories = ['player', 'ball', 'arrow', 'equipment'];

    return (
        <div className="flex flex-col md:flex-row gap-4 h-[600px] bg-slate-100 rounded-xl border border-slate-300 overflow-hidden">
            
            {/* LIBRARY SIDEBAR */}
            <div className="w-full md:w-48 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500">
                    Bibliothèque
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                    {categories.map(cat => (
                        <div key={cat}>
                            <h4 className="text-xs font-bold text-indigo-600 mb-2 uppercase">{cat}</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {ICON_LIBRARY.filter(i => i.category === cat).map(icon => (
                                    <div 
                                        key={icon.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, icon.id)}
                                        className="cursor-grab hover:bg-slate-100 p-2 rounded border border-slate-100 flex flex-col items-center"
                                        title={icon.name}
                                    >
                                        <svg viewBox="0 0 64 64" className="w-8 h-8 pointer-events-none">
                                            {icon.render(icon.defaultColor || 'black')}
                                        </svg>
                                        <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{icon.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CANVAS AREA */}
            <div className="flex-1 flex flex-col relative bg-slate-50">
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden"
                     onMouseMove={handleCanvasMouseMove}
                     onMouseUp={handleCanvasMouseUp}
                     onMouseLeave={handleCanvasMouseUp}
                >
                    <div 
                        className="relative shadow-lg border-2 border-slate-300"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{ width: '100%', maxWidth: '600px', aspectRatio: '3/2' }}
                    >
                         {/* We assume TacticalBoard can render 'items' prop now */}
                         <TacticalBoard 
                            ref={svgRef} 
                            schema={{ description: '', players: [], arrows: [], zones: [], items }} 
                            sport={sport}
                            width={600}
                            height={400}
                         />

                         {/* Overlay for selection handles (Transparent interaction layer) */}
                         {items.map(item => (
                             <div 
                                key={item.id}
                                onMouseDown={(e) => handleMouseDown(e, item.id)}
                                className={`absolute w-8 h-8 -ml-4 -mt-4 cursor-move rounded-full ${selectedId === item.id ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : 'hover:bg-slate-500/10'}`}
                                style={{ 
                                    left: `${item.x}%`, 
                                    top: `${item.y}%`,
                                }}
                             />
                         ))}
                    </div>
                </div>

                {/* PROPERTIES BAR */}
                {selectedItem ? (
                    <div className="h-16 bg-white border-t border-slate-200 flex items-center px-4 gap-4 overflow-x-auto">
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Édition:</span>
                        
                        {/* Rotation */}
                        <div className="flex items-center gap-2">
                             <RotateCw className="w-4 h-4 text-slate-400" />
                             <input 
                                type="range" min="0" max="360" 
                                value={selectedItem.rotation}
                                onChange={(e) => updateItem({ rotation: parseInt(e.target.value) })}
                                className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>

                        {/* Scale */}
                        <div className="flex items-center gap-2">
                             <ZoomIn className="w-4 h-4 text-slate-400" />
                             <input 
                                type="range" min="0.05" max="0.3" step="0.01"
                                value={selectedItem.scale}
                                onChange={(e) => updateItem({ scale: parseFloat(e.target.value) })}
                                className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                             />
                        </div>

                        {/* Color */}
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-slate-400" />
                            <input 
                                type="color"
                                value={selectedItem.color}
                                onChange={(e) => updateItem({ color: e.target.value })}
                                className="w-6 h-6 rounded border-none cursor-pointer"
                            />
                        </div>

                        {/* Label */}
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                value={selectedItem.label || ''}
                                onChange={(e) => updateItem({ label: e.target.value })}
                                placeholder="Label..."
                                className="w-20 p-1 text-xs border border-slate-300 rounded"
                            />
                        </div>

                        <div className="flex-1"></div>

                        <button 
                            onClick={deleteItem}
                            className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs font-bold">Supprimer</span>
                        </button>
                    </div>
                ) : (
                    <div className="h-16 bg-slate-50 border-t border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        Sélectionnez un élément sur le terrain pour le modifier
                    </div>
                )}
            </div>
        </div>
    );
};

export default TacticalEditor;