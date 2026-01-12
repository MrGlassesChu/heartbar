import React, { useState, useRef } from 'react';
import { AppStatus, CocktailRecipe } from './types';
import { generateCocktailRecipe, generateCocktailImage } from './services/geminiService';
import AudioPlayer, { AudioPlayerHandle } from './components/AudioPlayer';
import LoadingScreen from './components/LoadingScreen';
import ResultCard from './components/ResultCard';

function App() {
  const [mood, setMood] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [recipe, setRecipe] = useState<CocktailRecipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Ref to control audio player directly
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

  const handleSubmit = async () => {
    if (!mood.trim()) return;

    // CRITICAL: Play music immediately on user interaction (Click)
    if (audioPlayerRef.current) {
        audioPlayerRef.current.playMusic();
    }

    setStatus(AppStatus.ANALYZING);
    setErrorMsg('');

    try {
      // Step 1: Generate Text Recipe
      const recipeData = await generateCocktailRecipe(mood);
      setRecipe(recipeData);
      
      // Step 2: Generate Image
      setStatus(AppStatus.MIXING);
      const generatedImage = await generateCocktailImage(recipeData.visualPrompt);
      setImageUrl(generatedImage);
      
      setStatus(AppStatus.SERVED);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      
      let msg = err.message || "系統發生未知錯誤";
      
      // Friendly mapping for 429 (Rate Limit)
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
          msg = "今晚客人太多，酒館目前客滿 (API 配額額滿)。\n\n建議：如果您是下載使用的，請確認您已設定自己的 API Key，這將徹底解決此問題。";
      }
      
      setErrorMsg(msg);
    }
  };

  const handleReset = () => {
    setMood('');
    setStatus(AppStatus.IDLE);
    setRecipe(null);
    setImageUrl(null);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-950 via-slate-900 to-black text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl"></div>
         {/* Subtle Grain Overlay */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
      </div>

      <AudioPlayer ref={audioPlayerRef} />

      <main className="relative container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        
        {/* Header - Always visible unless served (optional transition, keeping simple) */}
        {status !== AppStatus.SERVED && (
          <header className="text-center mb-12 space-y-4 animate-float">
            <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              春節心情小酒館
            </h1>
            <p className="text-red-200/60 font-light tracking-widest text-sm md:text-base">
              LUNAR NEW YEAR MOOD BISTRO
            </p>
          </header>
        )}

        {/* Status: IDLE */}
        {status === AppStatus.IDLE && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="glass-panel p-8 md:p-12 rounded-2xl shadow-2xl shadow-red-900/20 text-center">
              <p className="text-amber-100/80 mb-8 font-serif text-lg leading-relaxed">
                今晚，這座城市依然喧囂，但這裡很安靜。<br/>
                寫下你的心情，無論是喜悅、疲憊、期待還是惆悵。<br/>
                讓我為你調製一杯專屬的春節特調。
              </p>
              
              <div className="relative group">
                <textarea
                  value={mood}
                  onChange={(e) => setMood((e.target as any).value)}
                  placeholder="今晚的心情是..."
                  className="w-full h-40 bg-black/20 border border-amber-900/30 rounded-xl p-4 text-amber-100 placeholder-red-200/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none text-lg font-light"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-red-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!mood.trim()}
                className="mt-8 px-10 py-4 bg-gradient-to-r from-red-900 to-red-800 border border-red-700/50 text-amber-100 rounded-full font-serif text-lg hover:from-red-800 hover:to-red-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(153,27,27,0.3)] hover:shadow-[0_0_30px_rgba(185,28,28,0.4)]"
              >
                請給我一杯 Please
              </button>
            </div>
          </div>
        )}

        {/* Status: LOADING (Analyzing or Mixing) */}
        {(status === AppStatus.ANALYZING || status === AppStatus.MIXING) && (
           <LoadingScreen status={status} />
        )}

        {/* Status: ERROR */}
        {status === AppStatus.ERROR && (
          <div className="glass-panel p-8 rounded-xl text-center max-w-md border-red-500/30">
            <div className="text-4xl mb-4">🥀</div>
            <p className="text-red-200 mb-6 font-mono text-xs md:text-sm break-all leading-relaxed whitespace-pre-wrap">
               {errorMsg}
            </p>
            <button 
              onClick={handleReset}
              className="px-6 py-2 border border-amber-500/30 text-amber-200 rounded-full hover:bg-amber-900/20 transition-colors"
            >
              再試一次 Retry
            </button>
          </div>
        )}

        {/* Status: SERVED */}
        {status === AppStatus.SERVED && recipe && imageUrl && (
          <ResultCard 
            recipe={recipe} 
            imageUrl={imageUrl} 
            onReset={handleReset} 
          />
        )}

        {/* Footer */}
        <footer className="absolute bottom-4 text-center w-full text-red-900/40 text-xs">
          <p>© 2025 Spring Festival Bistro. AI Bartender Powered by Gemini.</p>
        </footer>

      </main>
    </div>
  );
}

export default App;