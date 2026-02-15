
import React, { useState, useEffect } from 'react';
import { CHASSIS_PARTS } from './constants.ts';
import { CardState, GameStatus } from './types.ts';
import { generateChassisImages } from './services/geminiService.ts';
import Card from './components/Card.tsx';

const App: React.FC = () => {
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [loadingStep, setLoadingStep] = useState('');
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chassis_memory_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    let interval: number;
    if (status === GameStatus.PLAYING) {
      interval = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const initGame = async () => {
    setStatus(GameStatus.GENERATING);
    setLoadingStep('Drawing cartoon parts with Gemini AI...');
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setFlippedIndices([]);

    try {
      const imageUrls = await generateChassisImages(CHASSIS_PARTS);
      
      const gameCards: CardState[] = [];
      CHASSIS_PARTS.forEach(part => {
        const basePart = {
          name: part,
          id: part,
          imageUrl: imageUrls[part]
        };
        gameCards.push({
          ...basePart,
          uniqueId: `${part}-1`,
          isFlipped: false,
          isMatched: false
        });
        gameCards.push({
          ...basePart,
          uniqueId: `${part}-2`,
          isFlipped: false,
          isMatched: false
        });
      });

      const shuffled = gameCards.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setStatus(GameStatus.PLAYING);
    } catch (err) {
      console.error(err);
      setLoadingStep('Failed to load images. Retrying...');
      setTimeout(initGame, 2000);
    }
  };

  const handleCardClick = (uniqueId: string) => {
    if (flippedIndices.length === 2) return;
    
    setCards(prev => prev.map(c => 
      c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedIndices(prev => [...prev, uniqueId]);
  };

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = flippedIndices;
      const firstCard = cards.find(c => c.uniqueId === firstId);
      const secondCard = cards.find(c => c.uniqueId === secondId);

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.uniqueId === firstId || c.uniqueId === secondId) 
              ? { ...c, isMatched: true, isFlipped: false } 
              : c
          ));
          setMatches(m => m + 1);
          setFlippedIndices([]);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.uniqueId === firstId || c.uniqueId === secondId) 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    if (matches === CHASSIS_PARTS.length && status === GameStatus.PLAYING) {
      setStatus(GameStatus.WON);
      if (!highScore || timer < highScore) {
        setHighScore(timer);
        localStorage.setItem('chassis_memory_highscore', timer.toString());
      }
    }
  }, [matches, status, timer, highScore]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen text-white p-4 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bungee text-blue-500 mb-2 drop-shadow-lg">
          CHASSIS MASTER
        </h1>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
          Memory Puzzle Challenge
        </p>
      </header>

      <main className="w-full max-w-4xl bg-slate-900/50 rounded-3xl p-6 border border-slate-700 shadow-2xl backdrop-blur-sm">
        {status === GameStatus.IDLE && (
          <div className="py-20 text-center">
            <div className="mb-8 inline-block p-6 bg-slate-800 rounded-full animate-bounce">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Ready to test your car part knowledge?</h2>
            <button 
              onClick={initGame}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bungee text-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Start Game
            </button>
          </div>
        )}

        {status === GameStatus.GENERATING && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold mb-2 animate-pulse">{loadingStep}</h3>
            <p className="text-slate-400 text-sm">Please wait while the AI generates custom parts for you...</p>
          </div>
        )}

        {(status === GameStatus.PLAYING || status === GameStatus.WON) && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center">
                <div className="text-xs text-slate-400 font-bold">MOVES</div>
                <div className="text-2xl font-bungee text-blue-400">{moves}</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center">
                <div className="text-xs text-slate-400 font-bold">MATCHES</div>
                <div className="text-2xl font-bungee text-green-400">{matches}/{CHASSIS_PARTS.length}</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center">
                <div className="text-xs text-slate-400 font-bold">TIME</div>
                <div className="text-2xl font-bungee text-yellow-400">{formatTime(timer)}</div>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center">
                <div className="text-xs text-slate-400 font-bold">RECORD</div>
                <div className="text-2xl font-bungee text-purple-400">{highScore ? formatTime(highScore) : '--:--'}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map(card => (
                <Card 
                  key={card.uniqueId} 
                  card={card} 
                  onClick={handleCardClick}
                  disabled={status === GameStatus.WON}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={initGame}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors"
              >
                Reset Game
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="mt-12 text-slate-500 text-sm text-center">
        <p>Featured Parts: {CHASSIS_PARTS.join(' • ')}</p>
        <p className="mt-2 text-xs opacity-50">Powered by Gemini 2.5 Flash Image Model</p>
      </footer>

      {status === GameStatus.WON && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bungee text-blue-500 mb-2">VICTORY!</h2>
            <p className="text-slate-300 mb-6">You masterfully matched all chassis parts!</p>
            
            <div className="bg-slate-800 rounded-2xl p-4 mb-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Taken:</span>
                <span className="font-bold text-white">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Moves:</span>
                <span className="font-bold text-white">{moves}</span>
              </div>
            </div>

            <button 
              onClick={initGame}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bungee text-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
