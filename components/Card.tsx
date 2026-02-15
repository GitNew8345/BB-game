
import React from 'react';
import { CardState } from '../types';

interface CardProps {
  card: CardState;
  onClick: (id: string) => void;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  return (
    <div 
      className="relative w-full h-32 md:h-48 perspective-1000 cursor-pointer"
      onClick={() => !disabled && !card.isFlipped && !card.isMatched && onClick(card.uniqueId)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card (The Back in game terms) */}
        <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center backface-hidden shadow-lg">
          <div className="text-blue-500 opacity-20 transform rotate-12 scale-150 font-black text-4xl select-none">
            ?
          </div>
        </div>

        {/* Back of Card (The Part Image) */}
        <div className="absolute inset-0 bg-white border-2 border-blue-400 rounded-xl flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-xl p-2 overflow-hidden">
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-2/3 object-contain mb-1"
          />
          <span className="text-[10px] md:text-xs font-bold text-slate-800 text-center leading-tight">
            {card.name}
          </span>
          {card.isMatched && (
            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
