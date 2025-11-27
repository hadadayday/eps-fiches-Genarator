import React from 'react';

export interface IconDefinition {
  id: string;
  name: string;
  category: 'player' | 'ball' | 'arrow' | 'equipment' | 'zone';
  defaultColor?: string;
  render: (color: string) => React.ReactNode;
}

export const ICON_LIBRARY: IconDefinition[] = [
  // --- PLAYERS ---
  {
    id: 'shirt-blue',
    name: 'Joueur Bleu',
    category: 'player',
    defaultColor: '#4da3ff',
    render: (color) => (
      <g>
        <path d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 C48 26, 44 28, 40 28 L24 28 C20 28, 16 26, 16 22 Z" fill={color} stroke="#003f7d" strokeWidth="2"/>
        <path d="M18 28 L46 28 C50 28, 52 34, 50 40 L44 52 C43 54, 41 56, 38 56 L26 56 C23 56, 21 54, 20 52 L14 40 C12 34, 14 28, 18 28 Z" fill={color} stroke="#003f7d" strokeWidth="2"/>
      </g>
    )
  },
  {
    id: 'shirt-orange',
    name: 'Joueur Orange',
    category: 'player',
    defaultColor: '#f4a261',
    render: (color) => (
      <g>
        <path d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 C48 26, 44 28, 40 28 L24 28 C20 28, 16 26, 16 22 Z" fill={color} stroke="#7a3b00" strokeWidth="2"/>
        <path d="M18 28 L46 28 C50 28, 52 34, 50 40 L44 52 C43 54, 41 56, 38 56 L26 56 C23 56, 21 54, 20 52 L14 40 C12 34, 14 28, 18 28 Z" fill={color} stroke="#7a3b00" strokeWidth="2"/>
      </g>
    )
  },
  {
    id: 'shirt-yellow',
    name: 'Gardien (Jaune)',
    category: 'player',
    defaultColor: '#ffd54a',
    render: (color) => (
      <g>
        <path d="M16 12 C16 9, 20 6, 24 6 L40 6 C44 6, 48 9, 48 12 L48 22 C48 26, 44 28, 40 28 L24 28 C20 28, 16 26, 16 22 Z" fill={color} stroke="#8a6d00" strokeWidth="2"/>
        <path d="M18 28 L46 28 C50 28, 52 34, 50 40 L44 52 C43 54, 41 56, 38 56 L26 56 C23 56, 21 54, 20 52 L14 40 C12 34, 14 28, 18 28 Z" fill={color} stroke="#8a6d00" strokeWidth="2"/>
      </g>
    )
  },

  // --- BALLS ---
  {
    id: 'ball-football',
    name: 'Ballon Football',
    category: 'ball',
    render: () => (
      <g>
        <circle cx="32" cy="32" r="28" fill="white" stroke="black" strokeWidth="2"/>
        <path d="M32 4 L38 20 L54 20 L42 32 L48 48 L32 40 L16 48 L22 32 L10 20 L26 20 Z" fill="black"/>
      </g>
    )
  },
  {
    id: 'ball-basketball',
    name: 'Ballon Basket',
    category: 'ball',
    defaultColor: '#f97316',
    render: (color) => (
      <g>
        <circle cx="32" cy="32" r="28" fill={color} stroke="#333" strokeWidth="2"/>
        <path d="M4 32 Q 32 32 60 32" fill="none" stroke="#333" strokeWidth="2"/>
        <path d="M32 4 Q 32 32 32 60" fill="none" stroke="#333" strokeWidth="2"/>
        <path d="M10 10 Q 32 32 54 54" fill="none" stroke="#333" strokeWidth="2"/>
        <path d="M54 10 Q 32 32 10 54" fill="none" stroke="#333" strokeWidth="2"/>
      </g>
    )
  },
  {
    id: 'ball-handball',
    name: 'Ballon Hand',
    category: 'ball',
    defaultColor: '#ef4444',
    render: (color) => (
      <g>
        <circle cx="32" cy="32" r="24" fill={color} stroke="white" strokeWidth="2"/>
        <path d="M16 16 L48 48 M48 16 L16 48" stroke="white" strokeWidth="2"/>
      </g>
    )
  },

  // --- ARROWS ---
  {
    id: 'arrow-h',
    name: 'Flèche Horizontale',
    category: 'arrow',
    defaultColor: '#3b82f6',
    render: (color) => (
      <g transform="translate(0, 24)">
         <line x1="2" y1="8" x2="54" y2="8" stroke={color} strokeWidth="6" strokeLinecap="round"/>
         <polygon points="54,0 64,8 54,16" fill={color}/>
      </g>
    )
  },
  {
      id: 'arrow-v',
      name: 'Flèche Verticale',
      category: 'arrow',
      defaultColor: '#ef4444',
      render: (color) => (
        <g transform="translate(24, 0)">
           <line x1="8" y1="2" x2="8" y2="54" stroke={color} strokeWidth="6" strokeLinecap="round"/>
           <polygon points="0,54 8,64 16,54" fill={color}/>
        </g>
      )
  },
  {
    id: 'arrow-curve',
    name: 'Flèche Courbe',
    category: 'arrow',
    defaultColor: '#3b82f6',
    render: (color) => (
        <g>
            <path d="M4 32 Q 32 4 60 32" fill="none" stroke={color} strokeWidth="4" markerEnd="url(#arrowhead)"/>
            <polygon points="56,28 64,32 56,36" fill={color} transform="rotate(45 60 32)"/>
        </g>
    )
  },
  {
    id: 'arrow-dashed',
    name: 'Flèche Mouvement',
    category: 'arrow',
    defaultColor: '#64748b',
    render: (color) => (
       <g transform="translate(0, 24)">
         <line x1="2" y1="8" x2="54" y2="8" stroke={color} strokeWidth="4" strokeDasharray="8,4" strokeLinecap="round"/>
         <polygon points="54,0 64,8 54,16" fill={color}/>
      </g>
    )
  },

  // --- EQUIPMENT ---
  {
      id: 'cone',
      name: 'Plot / Cône',
      category: 'equipment',
      defaultColor: '#f97316',
      render: (color) => (
          <g>
              <rect x="16" y="48" width="32" height="8" fill={color}/>
              <polygon points="20,48 44,48 32,8" fill={color}/>
          </g>
      )
  },
  {
      id: 'goal-football',
      name: 'But Foot/Hand',
      category: 'equipment',
      defaultColor: '#000000',
      render: (color) => (
          <g>
              <rect x="2" y="16" width="60" height="32" fill="none" stroke={color} strokeWidth="4"/>
              <line x1="2" y1="16" x2="16" y2="4" stroke={color} strokeWidth="2"/>
              <line x1="62" y1="16" x2="48" y2="4" stroke={color} strokeWidth="2"/>
              <line x1="16" y1="4" x2="48" y2="4" stroke={color} strokeWidth="2"/>
              {/* Net */}
              <path d="M6 16 L18 4 M14 16 L26 4 M22 16 L34 4 M30 16 L42 4 M38 16 L50 4" stroke={color} strokeWidth="0.5"/>
          </g>
      )
  },
  {
      id: 'basket-hoop',
      name: 'Panier Basket',
      category: 'equipment',
      defaultColor: '#ef4444',
      render: (color) => (
          <g>
              <circle cx="32" cy="32" r="16" fill="none" stroke={color} strokeWidth="3"/>
              <line x1="32" y1="16" x2="32" y2="0" stroke="gray" strokeWidth="4"/>
              <rect x="12" y="0" width="40" height="4" fill="white" stroke="gray"/>
          </g>
      )
  }
];

export const getIconDefinition = (id: string) => ICON_LIBRARY.find(i => i.id === id);