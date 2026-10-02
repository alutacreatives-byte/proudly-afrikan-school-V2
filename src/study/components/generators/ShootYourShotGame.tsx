import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Target, 
  Sparkles, 
  Bookmark, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  Award,
  Clock,
  Shield,
  Layers,
  Zap,
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FocusQuestResult } from '../../types';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

export const SHOOT_FIELDS = [
  {
    id: 'MATHEMATICS',
    name: 'MATHEMATICS',
    tag: 'FUTURISTIC MATHEMATICAL DIMENSION',
    desc: 'Deep space grid corridor with floating geometric structures, equations, and numbers.',
    colorPrimary: '#3B82F6',
    colorSecondary: '#1D4ED8',
    accentColor: '#93C5FD',
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950',
  },
  {
    id: 'SCIENCE',
    name: 'SCIENCE',
    tag: 'FUTURISTIC SCIENTIFIC RESEARCH',
    desc: 'Laboratory research lab with molecular forms, particles, and energy fields.',
    colorPrimary: '#10B981',
    colorSecondary: '#047857',
    accentColor: '#6EE7B7',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
  },
  {
    id: 'MEDICINE',
    name: 'MEDICINE',
    tag: 'FUTURISTIC MEDICAL ENVIRONMENT',
    desc: 'Sophisticated medical environment with anatomical forms, cells, and scanning technology.',
    colorPrimary: '#E63956',
    colorSecondary: '#9B1C31',
    accentColor: '#FCA5A5',
    bgGradient: 'from-rose-950 via-slate-900 to-red-950',
  },
  {
    id: 'FINANCE',
    name: 'FINANCE',
    tag: 'FUTURISTIC FINANCIAL CITY',
    desc: 'Huge financial city with buildings, market data charts, tickers, and data structures.',
    colorPrimary: '#F59E0B',
    colorSecondary: '#B45309',
    accentColor: '#FCD34D',
    bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
  },
  {
    id: 'TECHNOLOGY',
    name: 'TECHNOLOGY',
    tag: 'FUTURISTIC DIGITAL WORLD',
    desc: 'Deep digital world with networks, data structures, circuit architecture, and servers.',
    colorPrimary: '#8B5CF6',
    colorSecondary: '#6D28D9',
    accentColor: '#C4B5FD',
    bgGradient: 'from-purple-950 via-slate-900 to-violet-950',
  },
  {
    id: 'POLITICS',
    name: 'POLITICS',
    tag: 'CINEMATIC GLOBAL POLITICAL ARENA',
    desc: 'Global political environment with world maps, government architecture, and diplomatic nodes.',
    colorPrimary: '#06B6D4',
    colorSecondary: '#0e7490',
    accentColor: '#67E8F9',
    bgGradient: 'from-cyan-950 via-slate-900 to-blue-950',
  },
  {
    id: 'GEOGRAPHY',
    name: 'GEOGRAPHY',
    tag: 'MASSIVE 3D GEOGRAPHIC WORLD',
    desc: 'Vast geographic world with mountains, oceans, terrain, clouds, and mapping grids.',
    colorPrimary: '#EC4899',
    colorSecondary: '#BE185D',
    accentColor: '#F472B6',
    bgGradient: 'from-pink-950 via-slate-900 to-rose-950',
  },
];

interface FallingWord {
  id: string;
  text: string;
  isRelevant: boolean; // True = belongs to topic (DO NOT SHOOT), False = irrelevant distractor (SHOOT THIS)
  x: number; // percentage width 10% to 90%
  y: number; // percentage height 0% (top) to 90% (bottom)
  speed: number;
  scale: number; // 3D depth scale 0.6 to 1.4
  definition: string;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
}

interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

interface FloatingFeedback {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface ShootYourShotProps {
  onBack: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: FocusQuestResult;
  activeSession?: any;
  onStartSession?: (session: any) => void;
  onPauseSession?: () => void;
  onResumeSession?: () => void;
  onStopSession?: () => void;
}

export const ShootYourShotGame: React.FC<ShootYourShotProps> = ({
  onBack,
  onGoHome,
  onSaved,
  existingResource,
  activeSession,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onStopSession,
}) => {
  // Setup State
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('SCIENCE');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'DIFFICULT'>('MEDIUM');
  const [error, setError] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // Active Game State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [shotsHit, setShotsHit] = useState<number>(0);

  // Simulation Entities
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [missedOrWrongWords, setMissedOrWrongWords] = useState<{ word: string; definition: string }[]>([]);

  // Pen Weapon X position (percentage 0% to 100%)
  const [penX, setPenX] = useState<number>(50);
  const playfieldRef = useRef<HTMLDivElement | null>(null);

  const currentField = SHOOT_FIELDS.find((f) => f.id === selectedFieldId) || SHOOT_FIELDS[1];

  // Vocabulary generator based on topic & difficulty
  const generateVocabulary = (topicStr: string, diff: string) => {
    const cleanTopic = topicStr.trim() || 'Core Subject';
    const relevant = [
      { word: cleanTopic, definition: `The central core concept of ${cleanTopic}.` },
      { word: 'Foundational Axiom', definition: 'The baseline operating principle.' },
      { word: 'Empirical Law', definition: 'A tested rule observed consistently.' },
      { word: 'Systemic Variable', definition: 'A dynamic factor in the study model.' },
      { word: 'Structural Theorem', definition: 'A proven theoretical proposition.' },
    ];
    const irrelevant = [
      { word: 'Random Noise', definition: 'Unrelated background static or error.' },
      { word: 'Flawed Hypothesis', definition: 'A discredited assumption.' },
      { word: 'Surface Bias', definition: 'Skewed sample or data anomaly.' },
      { word: 'Arithmetic Glitch', definition: 'Simple computational error.' },
      { word: 'Obsolete Myth', definition: 'Outdated misconception.' },
      { word: 'Generic Filler', definition: 'Meaningless distractor term.' },
    ];

    if (diff === 'MEDIUM' || diff === 'DIFFICULT') {
      relevant.push(
        { word: 'Reciprocal Matrix', definition: 'Inverted array relationship.' },
        { word: 'Advanced Syntax', definition: 'Complex structural rule format.' }
      );
      irrelevant.push(
        { word: 'Plaussible Distractor', definition: 'Superficially related false term.' },
        { word: 'Pseudo-Variable', definition: 'Fake parameter designed to mislead.' }
      );
    }
    return { relevant, irrelevant };
  };

  const handleStartGame = () => {
    if (!topic.trim()) {
      setError('Please enter what you are studying to begin Shoot Your Shot.');
      return;
    }
    setError(null);
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setShotsFired(0);
    setShotsHit(0);
    setFallingWords([]);
    setProjectiles([]);
    setParticles([]);
    setFeedbacks([]);
    setMissedOrWrongWords([]);
  };

  // Main Game Loop (Falling words, Projectile movement, Collision detection, Particle physics)
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;

    // Spawn falling words
    const spawnTimer = setInterval(() => {
      const vocab = generateVocabulary(topic, difficulty);
      const isIrrelevant = Math.random() > 0.4; // 60% irrelevant (targets to shoot), 40% relevant (do not shoot)
      const item = isIrrelevant
        ? vocab.irrelevant[Math.floor(Math.random() * vocab.irrelevant.length)]
        : vocab.relevant[Math.floor(Math.random() * vocab.relevant.length)];

      const newWord: FallingWord = {
        id: `word-${Date.now()}-${Math.random()}`,
        text: item.word,
        isRelevant: !isIrrelevant,
        x: Math.floor(Math.random() * 70) + 15, // 15% to 85% width
        y: 5, // start near top
        speed: (0.15 + level * 0.04) * (difficulty === 'DIFFICULT' ? 1.4 : difficulty === 'MEDIUM' ? 1.1 : 0.8),
        scale: Math.random() * 0.4 + 0.8,
        definition: item.definition,
      };

      setFallingWords((prev) => {
        if (prev.length > 7) return prev;
        return [...prev, newWord];
      });
    }, Math.max(1600 - level * 200, 700));

    // Animation frame loop for smooth 60fps motion
    let animationFrameId: number;
    const updateGame = () => {
      // 1. Update falling words
      setFallingWords((prevWords) => {
        const nextWords: FallingWord[] = [];
        for (const w of prevWords) {
          const nextY = w.y + w.speed;
          // If word reaches bottom (y > 90)
          if (nextY >= 90) {
            // If it was an irrelevant target (should have been shot), player missed a target!
            if (!w.isRelevant) {
              setLives((l) => {
                const nextL = l - 1;
                if (nextL <= 0) setIsGameOver(true);
                return nextL;
              });
              setCombo(0);
              setMissedOrWrongWords((mw) => [...mw, { word: w.text, definition: w.definition }]);
            }
            // Discard word at bottom
            continue;
          }
          nextWords.push({
            ...w,
            y: nextY,
            scale: 0.8 + (nextY / 90) * 0.4, // perspective scale grows as it falls closer
          });
        }
        return nextWords;
      });

      // 2. Update projectiles
      setProjectiles((prevProj) => {
        const nextProj: Projectile[] = [];
        for (const p of prevProj) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 10) {
            // Reached target destination
            continue;
          }
          nextProj.push({
            ...p,
            x: p.x + (dx / dist) * p.speed,
            y: p.y + (dy / dist) * p.speed,
          });
        }
        return nextProj;
      });

      // 3. Update particles
      setParticles((prevParts) => {
        const nextParts: ParticleEffect[] = [];
        for (const pt of prevParts) {
          if (pt.life <= 0) continue;
          nextParts.push({
            ...pt,
            x: pt.x + pt.vx,
            y: pt.y + pt.vy,
            life: pt.life - 0.03,
          });
        }
        return nextParts;
      });

      animationFrameId = requestAnimationFrame(updateGame);
    };

    animationFrameId = requestAnimationFrame(updateGame);

    return () => {
      clearInterval(spawnTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isPaused, isGameOver, level, difficulty, topic]);

  // Handle shooting when player clicks or taps a falling word
  const handleShootWord = (word: FallingWord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying || isPaused || isGameOver) return;

    setShotsFired((prev) => prev + 1);

    const rect = playfieldRef.current?.getBoundingClientRect();
    const clickX = e.clientX - (rect?.left || 0);
    const clickY = e.clientY - (rect?.top || 0);
    const penPixelX = (penX / 100) * (rect?.width || 800);
    const penPixelY = (rect?.height || 600) - 40;

    // Fire projectile from pen tip to target
    const newProj: Projectile = {
      id: `proj-${Date.now()}`,
      x: penPixelX,
      y: penPixelY,
      targetX: clickX,
      targetY: clickY,
      speed: 25,
    };
    setProjectiles((prev) => [...prev, newProj]);

    // Create feedback & particles
    const feedback: FloatingFeedback = {
      id: `fb-${Date.now()}`,
      text: '',
      x: clickX,
      y: clickY,
      color: '#fff',
    };

    // Check if shooting an irrelevant word (CORRECT) vs relevant word (WRONG)
    if (!word.isRelevant) {
      // CORRECT! Shot an irrelevant distractor word -> GOOD SHOT
      setShotsHit((prev) => prev + 1);
      const points = 100 * level * (combo >= 5 ? 2 : 1);
      setScore((s) => s + points);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));

      feedback.text = combo >= 4 ? `🔥 ON FIRE! +${points}` : `GOOD SHOT! +${points}`;
      feedback.color = '#34D399';

      // Spawn explosion particles
      const newParts: ParticleEffect[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        newParts.push({
          id: `pt-${Date.now()}-${i}`,
          x: clickX,
          y: clickY,
          color: currentField.colorPrimary,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
        });
      }
      setParticles((prev) => [...prev, ...newParts]);
    } else {
      // WRONG! Shot a relevant topic word -> WRONG SHOT (loss of life)
      setLives((l) => {
        const nextL = l - 1;
        if (nextL <= 0) setIsGameOver(true);
        return nextL;
      });
      setCombo(0);
      feedback.text = 'WRONG SHOT! -1 LIFE';
      feedback.color = '#E63956';

      setMissedOrWrongWords((prev) => {
        if (prev.some((w) => w.word === word.text)) return prev;
        return [...prev, { word: word.text, definition: word.definition }];
      });
    }

    setFeedbacks((prev) => [...prev, feedback]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedback.id));
    }, 1200);

    // Remove shot word
    setFallingWords((prev) => prev.filter((w) => w.id !== word.id));

    // Level up check
    if (score >= level * 750 && level < 5) {
      setLevel((prev) => prev + 1);
    }
  };

  const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 100;

  const handleSaveResult = () => {
    const resData: FocusQuestResult = {
      id: `shoot-${Date.now()}`,
      title: `Shoot Your Shot: ${topic}`,
      topic,
      subject: selectedFieldId,
      score,
      accuracy,
      levelReached: level,
      missedWords: missedOrWrongWords,
      completedAt: new Date().toISOString(),
      toolType: 'focus-quest',
      createdAt: new Date().toISOString(),
    };

    saveResourceToStorage({
      id: resData.id,
      toolType: 'focus-quest' as any,
      title: resData.title,
      subject: resData.subject || selectedFieldId,
      topic: resData.topic,
      createdAt: resData.createdAt || new Date().toISOString(),
      data: resData,
    } as any);

    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-2 font-mono text-xs font-bold uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#E63956] text-[11px] font-mono font-bold uppercase tracking-wider">
                3D ARCADE SHOOTER
              </span>
              <span className="text-xs font-mono text-stone-400">06 / STUDY SUITE</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight mt-1">
              SHOOT YOUR SHOT
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHowToPlay(true)}
          className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#E63956]" />
          <span>How to Play</span>
        </button>
      </div>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-[#E63956]">GAME MANUAL</span>
              <h3 className="font-display font-black text-2xl uppercase text-[#161616]">HOW TO PLAY</h3>
            </div>
            <div className="space-y-4 text-stone-700 text-sm leading-relaxed">
              <p className="font-medium">
                <strong>Tagline:</strong> KNOW YOUR FIELD. SHOOT WHAT DOESN'T BELONG.
              </p>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-mono text-xs font-bold uppercase text-stone-900">🖊️ WEAPON & MOVEMENT</h4>
                <p className="text-xs">Your 3D futuristic pen launcher sits at the bottom centre. Move your mouse or drag across the screen to glide the pen horizontally.</p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-mono text-xs font-bold uppercase text-stone-900">🎯 FALLING TARGETS</h4>
                <p className="text-xs">Words spawn at the top and fall toward you through the 3D corridor. Shoot irrelevant distractor words (<strong>GOOD SHOT</strong>). DO NOT shoot words that belong to your study topic, or you will lose a life (<strong>WRONG SHOT</strong>)!</p>
              </div>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-3.5 rounded-2xl bg-[#E63956] hover:bg-[#d52b48] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
            >
              GOT IT, LET'S PLAY →
            </button>
          </div>
        </div>
      )}

      {/* START SCREEN */}
      {!isPlaying && !isGameOver ? (
        <div className="bg-white border border-stone-200/90 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-8 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#18181B] text-[#E63956] flex items-center justify-center mx-auto shadow-md">
              <Rocket className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-[#161616] tracking-tight">
              SHOOT YOUR SHOT
            </h2>
            <p className="font-mono font-bold text-xs sm:text-sm text-[#E63956] tracking-widest uppercase">
              KNOW YOUR FIELD. SHOOT WHAT DOESN'T BELONG.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 1. Study Topic */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                1. What are you studying? *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Organic Chemistry, Calculus, Cardiology, Artificial Intelligence..."
                className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:border-[#E63956] focus:bg-white outline-none font-medium text-stone-900 transition-all text-base shadow-2xs"
              />
            </div>

            {/* 2. Choose Field (Exactly 7 fields) */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Choose Your Field
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SHOOT_FIELDS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      selectedFieldId === f.id
                        ? 'border-[#E63956] bg-rose-50/40 shadow-sm ring-2 ring-[#E63956]/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-lg text-[#161616] uppercase">{f.name}</span>
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: f.colorPrimary }} />
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Choose Level */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                3. Choose Your Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['EASY', 'MEDIUM', 'DIFFICULT'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-3.5 px-4 rounded-2xl border-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'border-[#E63956] bg-[#18181B] text-white shadow-md'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-5 rounded-2xl bg-[#E63956] hover:bg-[#d52b48] text-white font-display font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(230,57,86,0.3)] transition-all cursor-pointer"
              >
                <Rocket className="w-6 h-6 animate-bounce" />
                <span>START GAME →</span>
              </button>
            </div>
          </div>
        </div>
      ) : isGameOver ? (
        /* GAME OVER / SHOT REPORT SCREEN */
        <div className="bg-white border border-stone-200/90 rounded-[3rem] p-8 sm:p-12 shadow-2xl space-y-8 max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-100 text-[#E63956] flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <span className="font-mono font-bold text-xs uppercase tracking-widest text-rose-600">
              FIELD BREACHED
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-[#161616]">
              SHOT REPORT
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-mono text-stone-500 uppercase">Final Score</div>
              <div className="font-display font-black text-2xl text-[#161616] mt-1">{score}</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-mono text-stone-500 uppercase">Accuracy</div>
              <div className="font-display font-black text-2xl text-emerald-600 mt-1">{accuracy}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-mono text-stone-500 uppercase">Best Combo</div>
              <div className="font-display font-black text-2xl text-amber-600 mt-1">{maxCombo}x</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-mono text-stone-500 uppercase">Level Reached</div>
              <div className="font-display font-black text-2xl text-purple-600 mt-1">Lvl {level}</div>
            </div>
          </div>

          {missedOrWrongWords.length > 0 && (
            <div className="space-y-3 text-left bg-stone-50 p-6 rounded-3xl border border-stone-200">
              <h4 className="font-mono text-xs font-bold uppercase text-stone-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#E63956]" />
                <span>Words to Review ({missedOrWrongWords.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {missedOrWrongWords.map((mw, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex flex-col gap-1">
                    <span className="font-bold text-rose-700 uppercase">{mw.word}</span>
                    <span className="text-stone-600">{mw.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleSaveResult}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>{saved ? 'Saved to Library!' : 'Save Game Results'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E63956] hover:bg-[#d52b48] text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3D ARCADE GAMEPLAY SCREEN */
        <div className="space-y-6">
          {/* Arcade HUD */}
          <div className="bg-[#18181B] text-white p-4 sm:p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-stone-800 shadow-xl">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">SCORE</span>
                <span className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">{score}</span>
              </div>
              <div className="w-px h-8 bg-stone-800" />
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">LEVEL</span>
                <span className="font-mono font-black text-xl sm:text-2xl text-purple-400">Lvl {level}</span>
              </div>
              <div className="w-px h-8 bg-stone-800" />
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">COMBO</span>
                <span className="font-mono font-black text-xl sm:text-2xl text-amber-400">{combo}x</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">ACCURACY</span>
                <span className="font-mono font-black text-xl sm:text-2xl text-cyan-400">{accuracy}%</span>
              </div>
              <div className="w-px h-8 bg-stone-800" />
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block">LIVES</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((l) => (
                    <div
                      key={l}
                      className={`w-3.5 h-3.5 rounded-full transition-colors ${
                        l <= lives ? 'bg-rose-500 animate-pulse' : 'bg-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          {/* 3D 60FPS Falling Word Arcade Arena */}
          <div
            ref={playfieldRef}
            onMouseMove={(e) => {
              const rect = playfieldRef.current?.getBoundingClientRect();
              if (!rect) return;
              const xPos = ((e.clientX - rect.left) / rect.width) * 100;
              setPenX(Math.max(10, Math.min(90, xPos)));
            }}
            onTouchMove={(e) => {
              const rect = playfieldRef.current?.getBoundingClientRect();
              if (!rect || !e.touches[0]) return;
              const xPos = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
              setPenX(Math.max(10, Math.min(90, xPos)));
            }}
            className={`relative w-full h-[580px] sm:h-[650px] rounded-[2.5rem] bg-gradient-to-b ${currentField.bgGradient} overflow-hidden shadow-2xl border border-stone-800 flex flex-col items-center justify-between select-none cursor-crosshair`}
            style={{ perspective: '1000px' }}
          >
            {/* Perspective Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none transform rotateX-12 scale-125 opacity-30" />

            {/* Top Watermark Info */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/60 block">
                {currentField.tag}
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                TOPIC: {topic}
              </h3>
            </div>

            {/* Falling Words in 3D Space */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {fallingWords.map((w) => (
                <div
                  key={w.id}
                  onClick={(e) => handleShootWord(w, e)}
                  className="absolute pointer-events-auto px-4 py-2.5 rounded-xl bg-black/80 border-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-transform duration-75 cursor-pointer group flex flex-col items-center justify-center text-center hover:scale-110"
                  style={{
                    left: `${w.x}%`,
                    top: `${w.y}%`,
                    borderColor: currentField.colorPrimary,
                    transform: `translate(-50%, -50%) scale(${w.scale})`,
                  }}
                >
                  <span className="font-display font-black text-sm sm:text-base uppercase text-white tracking-wide group-hover:text-amber-300">
                    {w.text}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-stone-400">
                    {w.isRelevant ? 'Belongs' : 'Target'}
                  </span>
                </div>
              ))}
            </div>

            {/* Projectiles Traveling From Pen Tip */}
            <div className="absolute inset-0 z-25 pointer-events-none">
              {projectiles.map((p) => (
                <div
                  key={p.id}
                  className="absolute w-2 h-4 rounded-full bg-amber-300 shadow-[0_0_12px_#F59E0B]"
                  style={{ left: p.x - 4, top: p.y }}
                />
              ))}
            </div>

            {/* Explosion Particles */}
            <div className="absolute inset-0 z-25 pointer-events-none">
              {particles.map((pt) => (
                <div
                  key={pt.id}
                  className="absolute w-2 h-2 rounded-full shadow-sm"
                  style={{
                    left: pt.x,
                    top: pt.y,
                    backgroundColor: pt.color,
                    opacity: pt.life,
                  }}
                />
              ))}
            </div>

            {/* Floating Feedback Texts */}
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="absolute font-mono font-black text-lg sm:text-xl uppercase animate-float-up pointer-events-none drop-shadow-lg"
                  style={{ left: fb.x, top: fb.y, color: fb.color }}
                >
                  {fb.text}
                </div>
              ))}
            </div>

            {/* 3D Futuristic Pen Weapon at Bottom Centre */}
            <div
              className="absolute bottom-4 z-20 pointer-events-none transition-all duration-75 flex flex-col items-center"
              style={{ left: `${penX}%`, transform: 'translateX(-50%)' }}
            >
              {/* Pen Tip (Firing Point) */}
              <div className="w-2 h-4 bg-amber-400 rounded-t-full shadow-[0_0_15px_#F59E0B] animate-pulse" />
              {/* Pen Barrel */}
              <div className="w-8 h-20 rounded-t-2xl bg-gradient-to-r from-stone-800 via-stone-700 to-stone-900 border-2 border-stone-600 shadow-2xl flex flex-col items-center justify-between py-2">
                <div className="w-4 h-1 bg-amber-500 rounded-full" />
                <div className="w-1.5 h-10 bg-stone-900/60 rounded-full" />
                <div className="w-5 h-1.5 bg-stone-500 rounded-full" />
              </div>
              <div className="font-mono text-[9px] text-stone-400 uppercase tracking-widest mt-1 whitespace-nowrap">
                3D PEN LAUNCHER
              </div>
            </div>

            {/* Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                <h3 className="font-display font-black text-3xl uppercase text-white">GAME PAUSED</h3>
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="px-8 py-3.5 rounded-2xl bg-[#E63956] text-white font-mono text-xs font-bold uppercase cursor-pointer shadow-lg"
                >
                  RESUME GAME
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
