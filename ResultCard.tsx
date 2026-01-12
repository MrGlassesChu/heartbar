import React from 'react';
import { CocktailRecipe } from '../types';

interface ResultCardProps {
  recipe: CocktailRecipe;
  imageUrl: string;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ recipe, imageUrl, onReset }) => {
  const isFallback = imageUrl === "FALLBACK_IMAGE";

  return (
    <div className="w-full max-w-4xl mx-auto animate-float">
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-red-900/50 flex flex-col md:flex-row">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[500px] bg-black">
          {isFallback ? (
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-amber-900 to-black flex items-center justify-center p-8">
               <div className="text-center space-y-4 opacity-70">
                 <span className="text-6xl">🍷</span>
                 <p className="text-amber-200/50 font-serif text-sm italic">
                   這杯酒的意境太深<br/>相機無法捕捉...
                 </p>
               </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gray-900 animate-pulse" />
              <img 
                src={imageUrl} 
                alt={recipe.name} 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-left space-y-6 relative">
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 text-amber-500/20 text-6xl font-serif pointer-events-none">
            福
          </div>

          <div className="space-y-2">
            <span className="text-red-400 text-xs tracking-[0.2em] uppercase font-bold">Your Exclusive Blend</span>
            <h2 className="text-4xl md:text-5xl font-serif text-amber-400 leading-tight">
              {recipe.name}
            </h2>
          </div>

          <p className="text-red-100/80 leading-relaxed italic border-l-2 border-amber-600/50 pl-4">
            {recipe.description}
          </p>

          <div className="space-y-2">
            <h4 className="text-amber-500 text-sm font-bold uppercase tracking-wider">配方 Ingredients</h4>
            <ul className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="text-xs bg-red-900/40 text-red-200 px-3 py-1 rounded-full border border-red-700/30">
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/40 p-6 rounded-xl border border-amber-500/10 mt-4 relative overflow-hidden">
            <div className="absolute -top-4 -left-2 text-4xl text-amber-500/10 font-serif">“</div>
            <p className="text-amber-100/90 font-serif text-lg leading-loose relative z-10 text-justify">
              {recipe.quote}
            </p>
            <div className="absolute -bottom-8 -right-2 text-4xl text-amber-500/10 font-serif">”</div>
          </div>

          <div className="pt-4">
            <button 
              onClick={onReset}
              className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 rounded-full hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg hover:shadow-amber-900/50 text-sm tracking-widest font-bold"
            >
              再來一杯 ANOTHER ROUND
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultCard;