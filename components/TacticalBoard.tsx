import React, { forwardRef } from 'react';
import { TacticalSchema, Sport } from '../types';
import { getIconDefinition } from '../data/iconAssets';

interface TacticalBoardProps {
  schema: TacticalSchema;
  width?: number;
  height?: number;
  sport?: string;
}

// --- ASSETS & HELPERS ---

// Ball Icon (Derived from ball.svg)
const BallIcon = ({ x, y, size = 3 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x - size}, ${y - size}) scale(${size * 2 / 64})`}>
    <circle cx="32" cy="32" r="12" fill="#f4a261" stroke="#111" strokeWidth="3"/>
    <path d="M24 24c6 2 8 8 16 8" fill="none" stroke="#111" strokeWidth="2"/>
  </g>
);

// Shirt Icon (Derived from player_shirt_*.svg)
const ShirtIcon = ({ 
  x, 
  y, 
  size = 8, 
  fill, 
  stroke, 
  label 
}: { 
  x: number; 
  y: number; 
  size?: number; 
  fill: string; 
  stroke: string; 
  label: string; 
}) => {
  // Center the 64x64 icon on x,y
  const scale = size / 64;
  const offset = size / 2;

  return (
    <g transform={`translate(${x - offset}, ${y - offset}) scale(${scale})`}>
      {/* Jersey Upper */}
      <path 
        d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 C48 26, 44 28, 40 28 L24 28 C20 28, 16 26, 16 22 Z"
        fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Jersey Lower */}
      <path 
        d="M18 28 L46 28 C50 28, 52 34, 50 40 L44 52 C43 54, 41 56, 38 56 L26 56 C23 56, 21 54, 20 52 L14 40 C12 34, 14 28, 18 28 Z"
        fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Label */}
      <text 
        x="32" 
        y="30" 
        fontFamily="Arial, sans-serif" 
        fontSize="18" 
        fontWeight="bold" 
        fill={stroke} 
        textAnchor="middle" 
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  );
};

const createArrowPath = (x1: number, y1: number, x2: number, y2: number, type: string) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (type === 'dribble') {
        // Zigzag for dribble
        const steps = Math.max(2, Math.floor(distance / 3)); 
        const nx = -dy / distance;
        const ny = dx / distance;
        const amplitude = 1.5;

        let d = `M ${x1} ${y1}`;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const cx = x1 + dx * t;
            const cy = y1 + dy * t;
            const sign = i % 2 === 0 ? 1 : -1;
            if (i === steps) d += ` L ${x2} ${y2}`;
            else d += ` L ${cx + nx * amplitude * sign} ${cy + ny * amplitude * sign}`;
        }
        return d;
    } 
    
    if (type === 'rotation' || type === 'action') {
        // Slight curve for rotation/action
        const mx = (x1 + x2) / 2 - (dy * 0.15); 
        const my = (y1 + y2) / 2 + (dx * 0.15);
        return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
    }

    // Straight line for pass and movement
    return `M ${x1} ${y1} L ${x2} ${y2}`;
};

const BasketballCourt = ({ lineColor }: { lineColor: string }) => (
    <>
        <rect x="2" y="2" width="96" height="96" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <line x1="50" y1="2" x2="50" y2="98" stroke={lineColor} strokeWidth="0.8" />
        <circle cx="50" cy="50" r="12" fill="none" stroke={lineColor} strokeWidth="0.8" />
        
        {/* Left Basket */}
        <rect x="2" y="38" width="16" height="24" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <path d="M 2 30 Q 25 50 2 70" fill="none" stroke={lineColor} strokeWidth="0.8" /> 
        <circle cx="5" cy="50" r="1.5" fill="none" stroke={lineColor} strokeWidth="0.8" /> 

        {/* Right Basket */}
        <rect x="82" y="38" width="16" height="24" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <path d="M 98 30 Q 75 50 98 70" fill="none" stroke={lineColor} strokeWidth="0.8" /> 
        <circle cx="95" cy="50" r="1.5" fill="none" stroke={lineColor} strokeWidth="0.8" /> 
    </>
);

const HandballCourt = ({ lineColor }: { lineColor: string }) => (
    <>
        <rect x="2" y="10" width="96" height="80" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <line x1="50" y1="10" x2="50" y2="90" stroke={lineColor} strokeWidth="0.8" />
        
        {/* Left Area */}
        <path d="M 2 15 L 10 15 Q 22 50 10 85 L 2 85" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <path d="M 2 10 L 14 10 Q 28 50 14 90 L 2 90" fill="none" stroke={lineColor} strokeWidth="0.5" strokeDasharray="3,2" />
        <rect x="0" y="45" width="2" height="10" fill="#333" />

        {/* Right Area */}
        <path d="M 98 15 L 90 15 Q 78 50 90 85 L 98 85" fill="none" stroke={lineColor} strokeWidth="0.8" />
        <path d="M 98 10 L 86 10 Q 72 50 86 90 L 98 90" fill="none" stroke={lineColor} strokeWidth="0.5" strokeDasharray="3,2" />
        <rect x="98" y="45" width="2" height="10" fill="#333" />
    </>
);

const FootballCourt = ({ lineColor }: { lineColor: string }) => (
    <>
         <rect x="2" y="2" width="96" height="96" fill="none" stroke={lineColor} strokeWidth="0.8" />
         <line x1="50" y1="2" x2="50" y2="98" stroke={lineColor} strokeWidth="0.8" />
         <circle cx="50" cy="50" r="10" fill="none" stroke={lineColor} strokeWidth="0.8" />
         {/* Goals */}
         <rect x="0" y="42" width="4" height="16" stroke={lineColor} fill="none" strokeWidth="0.8" />
         <rect x="96" y="42" width="4" height="16" stroke={lineColor} fill="none" strokeWidth="0.8" />
         {/* Areas */}
         <rect x="2" y="25" width="15" height="50" fill="none" stroke={lineColor} strokeWidth="0.8"/>
         <rect x="83" y="25" width="15" height="50" fill="none" stroke={lineColor} strokeWidth="0.8"/>
    </>
);

const TacticalBoard = forwardRef<SVGSVGElement, TacticalBoardProps>(({ schema, width = 600, height = 400, sport }, ref) => {
  
  const isHandball = sport === Sport.HANDBALL;
  const isFootball = sport === Sport.FOOTBALL;
  const courtColor = isHandball ? '#f0e68c' : isFootball ? '#dcfce7' : '#e0f2fe'; 
  const lineColor = isHandball ? '#000000' : isFootball ? '#ffffff' : '#1e3a8a';

  return (
    <div className="border-2 border-slate-800 rounded-lg overflow-hidden bg-white shadow-md inline-block">
      <svg 
        ref={ref}
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Court */}
        <rect x="0" y="0" width="100" height="100" fill={courtColor} />
        
        {/* Markings */}
        {isHandball ? <HandballCourt lineColor={lineColor} /> : isFootball ? <FootballCourt lineColor={isFootball ? 'white' : lineColor} /> : <BasketballCourt lineColor={lineColor} />}

        {/* Zones */}
        {schema.zones?.map((zone, idx) => (
            <rect 
                key={`zone-${idx}`}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill={zone.color}
                opacity={0.2}
                stroke="none"
            />
        ))}

        {/* Existing Arrows from AI */}
        {schema.arrows?.map((arrow, idx) => {
            const isMovement = arrow.type === 'movement';
            const strokeColor = arrow.color || '#333';
            const pathData = createArrowPath(arrow.fromX, arrow.fromY, arrow.toX, arrow.toY, arrow.type);
            
            return (
              <g key={`arrow-${idx}`}>
                <defs>
                  <marker id={`arrowhead-${idx}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
                  </marker>
                </defs>
                
                <path 
                    d={pathData}
                    stroke={strokeColor}
                    strokeWidth={isMovement ? "1.2" : "1.8"}
                    strokeDasharray={isMovement ? "4" : "0"}
                    fill="none"
                    markerEnd={`url(#arrowhead-${idx})`}
                />
              </g>
            );
        })}

        {/* Existing Players from AI */}
        {schema.players?.map((player, idx) => {
             // ... existing player logic ...
            let fill = '#ffffff';
            let stroke = '#1e3a8a';
            if (player.team === 'team2' || player.role === 'defender') {
                fill = '#f4a261'; stroke = '#7c2d12';
            } else if (player.label === 'GB' || player.label === 'G') {
                fill = '#fde047'; stroke = '#854d0e';
            }
            const orientation = player.orientation || 0;
            const size = 8;
            return (
              <g key={`player-${idx}`} transform={`translate(${player.x}, ${player.y})`}>
                <g transform={`rotate(${orientation})`}>
                    <path d={`M 0 -${size/2 + 2} L -1.5 -${size/2} L 1.5 -${size/2} Z`} fill={stroke} stroke="none" />
                </g>
                <ShirtIcon x={0} y={0} size={size} fill={fill} stroke={stroke} label={player.label || player.id} />
                {player.hasBall && <BallIcon x={size/2 - 1} y={-size/2 + 1} size={3} />}
              </g>
            );
        })}

        {/* NEW: GENERIC BOARD ITEMS (Builder Mode) */}
        {schema.items?.map((item, idx) => {
            const def = getIconDefinition(item.type);
            if (!def) return null;

            const color = item.color || def.defaultColor || '#000';
            // Scale item: SVG icons are typically defined 64x64 or similar. 
            // In 0-100 system, scale 1 means roughly 6-10 units size depending on definition.
            // We use transform scale.
            
            return (
                <g key={item.id} transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}>
                     {/* Center the icon visually */}
                     <g transform="translate(-32, -32)">
                         {def.render(color)}
                     </g>
                     {item.label && (
                         <text y="40" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black" stroke="white" strokeWidth="0.5">
                             {item.label}
                         </text>
                     )}
                </g>
            );
        })}

        {/* Legend */}
        <g transform="translate(2, 92)">
             <rect x="0" y="0" width="55" height="7" fill="white" opacity="0.9" rx="1" stroke="#e2e8f0" strokeWidth="0.2" />
             <g transform="translate(3, 3.5) scale(0.1)">
                <path d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 L48 22 L40 28 L24 28 L16 22 Z M18 28 L46 28 L50 40 L44 52 L38 56 L26 56 L20 52 L14 40 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="20" />
             </g>
             <text x="6" y="4.5" fontSize="2.5" fontWeight="600">Att</text>
             <g transform="translate(12, 3.5) scale(0.1)">
                <path d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 L48 22 L40 28 L24 28 L16 22 Z M18 28 L46 28 L50 40 L44 52 L38 56 L26 56 L20 52 L14 40 Z" fill="#f4a261" stroke="#7c2d12" strokeWidth="20" />
             </g>
             <text x="15" y="4.5" fontSize="2.5" fontWeight="600">Déf</text>
             <circle cx="21" cy="3.5" r="1.5" fill="#f97316" />
             <text x="23.5" y="4.5" fontSize="2.5" fontWeight="600">Bal</text>
        </g>
      </svg>
    </div>
  );
});

export default TacticalBoard;