import React from 'react';

interface LoadingScreenProps {
  status: 'analyzing' | 'mixing';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-amber-100 space-y-8 animate-pulse">
      <div className="relative">
        {/* Cocktail Shaker Icon Animation */}
        <div className="text-6xl animate-bounce text-amber-400 opacity-80">
          {status === 'analyzing' ? '🥂' : '🍸'}
        </div>
        <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full"></div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-serif text-amber-300">
          {status === 'analyzing' ? '正在細讀您的心事...' : '正在為您調製專屬特調...'}
        </h3>
        <p className="text-red-200/60 font-light text-sm">
          {status === 'analyzing' ? '酒保正在思考最適合您的風味' : '加入一點春節的喜氣與希望'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;