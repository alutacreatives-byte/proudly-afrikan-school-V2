import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
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
  Download,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FocusQuestResult } from '../../types';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { useAuthCredit } from '../../../context/AuthCreditContext';

export const FOCUS_WORLDS = [
  {
    id: 'bio-dome',
    name: 'Futuristic Bio-Dome',
    tag: 'BOTANICAL ECOSYSTEM',
    desc: 'Lush botanical structures, energy conduits, and holographic flora cultivating knowledge.',
    colorPrimary: '#10B981',
    colorSecondary: '#059669',
    accentColor: '#34D399',
  },
  {
    id: 'crystal-citadel',
    name: 'Floating Crystal Citadel',
    tag: 'GEOMETRIC SPIRES',
    desc: 'Crystalline resonance chambers, floating monoliths, and harmonic energy spires.',
    colorPrimary: '#8B5CF6',
    colorSecondary: '#7C3AED',
    accentColor: '#A78BFA',
  },
  {
    id: 'quantum-observatory',
    name: 'Quantum Observatory',
    tag: 'STELLAR RINGS',
    desc: 'Particle accelerators, cosmic lenses, and stellar rings charting the cosmos.',
    colorPrimary: '#3B82F6',
    colorSecondary: '#2563EB',
    accentColor: '#60A5FA',
  },
  {
    id: 'neo-zen',
    name: 'Neo-Zen Garden',
    tag: 'TRANQUIL SANCTUARY',
    desc: 'Minimalist stone lanterns, glowing bonsai trees, and ripples of serene focus.',
    colorPrimary: '#F59E0B',
    colorSecondary: '#D97706',
    accentColor: '#FBBF24',
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea Bioluminescent Lab',
    tag: 'ABYSSAL RESEARCH',
    desc: 'Submersible observation domes, glowing coral reefs, and deep-sea energy currents.',
    colorPrimary: '#06B6D4',
    colorSecondary: '#0891B2',
    accentColor: '#22D3EE',
  },
];

export const FOCUS_SOUNDTRACKS = [
  { id: 'none', name: 'No Music', url: '' },
  { id: 'ambient', name: 'Ambient', url: 'https://assets.mixkit.co/music/preview/mixkit-spirit-in-the-woods-139.mp3' },
  { id: 'deep-focus', name: 'Deep Focus', url: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3' },
  { id: 'calm', name: 'Calm', url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3' },
  { id: 'atmospheric', name: 'Atmospheric', url: 'https://assets.mixkit.co/music/preview/mixkit-hazy-afternoon-462.mp3' },
  { id: 'nature', name: 'Nature', url: 'https://assets.mixkit.co/music/preview/mixkit-forest-stream-1215.mp3' },
  { id: 'futuristic', name: 'Futuristic', url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3' },
];

interface FocusQuestGeneratorProps {
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

export const FocusQuestGenerator: React.FC<FocusQuestGeneratorProps> = ({
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
  const { canAfford, consumeCredits, openAuthModal } = useAuthCredit();

  // Setup Form State
  const [topic, setTopic] = useState<string>(existingResource?.topic || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingResource?.durationMinutes || 25);
  const [selectedWorldId, setSelectedWorldId] = useState<string>(existingResource?.worldType || 'bio-dome');
  const [selectedSoundtrackId, setSelectedSoundtrackId] = useState<string>('ambient');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  // Audio state during active quest
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(true);
  const [audioVolume, setAudioVolume] = useState<number>(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentWorld = FOCUS_WORLDS.find((w) => w.id === selectedWorldId) || FOCUS_WORLDS[0];
  const currentSoundtrack = FOCUS_SOUNDTRACKS.find((s) => s.id === selectedSoundtrackId) || FOCUS_SOUNDTRACKS[1];

  // Handle Audio playback lifecycle
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = audioVolume;
  }, [audioVolume]);

  useEffect(() => {
    if (!activeSession || activeSession.isCompleted || selectedSoundtrackId === 'none' || !currentSoundtrack.url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      if (activeSession.isPaused || !activeSession.isRunning || !isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.warn('Audio autoplay prevented or stream failed:', err);
        });
      }
    }
  }, [activeSession?.isRunning, activeSession?.isPaused, activeSession?.isCompleted, isAudioPlaying, selectedSoundtrackId]);

  const handleStartQuest = () => {
    if (!topic.trim()) {
      setError('Please enter what you are studying to begin your Focus Quest.');
      return;
    }
    setError(null);

    const totalSecs = durationMinutes * 60;
    const newSession = {
      topic: topic.trim(),
      durationMinutes,
      totalSeconds: totalSecs,
      remainingSeconds: totalSecs,
      worldType: selectedWorldId,
      soundtrackId: selectedSoundtrackId,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
    };

    setIsAudioPlaying(selectedSoundtrackId !== 'none');
    if (onStartSession) {
      onStartSession(newSession);
    }
  };

  const handleSaveResult = () => {
    if (!activeSession && !existingResource) return;
    const resData: FocusQuestResult = {
      id: existingResource?.id || `quest-${Date.now()}`,
      title: `Focus Quest: ${activeSession?.topic || topic}`,
      topic: activeSession?.topic || topic,
      subject: 'STUDY FOCUS',
      durationMinutes: activeSession?.durationMinutes || durationMinutes,
      worldType: activeSession?.worldType || selectedWorldId,
      completedAt: new Date().toISOString(),
      toolType: 'focus-quest',
      createdAt: new Date().toISOString(),
    };

    saveResourceToStorage({
      id: resData.id,
      toolType: 'focus-quest' as any,
      title: resData.title,
      subject: resData.subject || 'STUDY FOCUS',
      topic: resData.topic,
      createdAt: resData.createdAt || new Date().toISOString(),
      data: resData,
    } as any);

    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  // If there is an active session or viewing an existing completed resource
  const session = activeSession || (existingResource ? {
    topic: existingResource.topic,
    durationMinutes: existingResource.durationMinutes,
    totalSeconds: existingResource.durationMinutes * 60,
    remainingSeconds: 0,
    worldType: existingResource.worldType,
    soundtrackId: 'none',
    isRunning: false,
    isPaused: false,
    isCompleted: true,
  } : null);

  const progressPercent = session ? Math.max(0, Math.min(100, Math.round(((session.totalSeconds - session.remainingSeconds) / session.totalSeconds) * 100))) : 0;

  // Determine progressive stage
  let stageTitle = 'Blueprint & Foundations';
  let stageDescription = 'Initial architectural lines and core energy spark emerging from the void.';
  if (progressPercent >= 75) {
    stageTitle = 'Masterpiece Radiance & Completion';
    stageDescription = 'The structural masterpiece is fully integrated and radiating with luminous energy.';
  } else if (progressPercent >= 50) {
    stageTitle = 'Detail, Foliage & Ecosystem Expansion';
    stageDescription = 'Secondary structures, vibrant ecosystem networks, and active particle flow appear.';
  } else if (progressPercent >= 25) {
    stageTitle = 'Core Architecture & Foundations';
    stageDescription = 'Pillars, primary walls, and atmosphere are materializing into physical space.';
  }

  if (session?.isCompleted || progressPercent >= 100) {
    stageTitle = 'QUEST COMPLETE';
    stageDescription = 'The digital world has been fully revealed through unwavering focus and study.';
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hidden audio element for seamless looping soundtrack inside Focus Quest */}
      {currentSoundtrack.url && (
        <audio
          ref={audioRef}
          src={currentSoundtrack.url}
          loop
          preload="auto"
        />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onBack();
            }}
            className="p-2.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer shadow-2xs flex items-center gap-2 font-mono text-xs font-bold uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#E63956] text-[11px] font-mono font-bold uppercase tracking-wider">
                IMMERSIVE FOCUS
              </span>
              <span className="text-xs font-mono text-stone-400">06 / STUDY SUITE</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#161616] uppercase tracking-tight mt-1">
              FOCUS QUEST
            </h1>
          </div>
        </div>

        {session && session.isRunning && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold uppercase animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Session Active
            </span>
          </div>
        )}
      </div>

      {/* If no session is active and not viewing existing resource, show Setup Screen */}
      {!session ? (
        <div className="bg-white border border-stone-200/90 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-8 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-[#18181B] text-[#E63956] flex items-center justify-center mx-auto shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-[#161616] tracking-tight">
              BEGIN YOUR FOCUS QUEST
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Immersive study sessions designed for deep retention. Enter your study topic, select your duration, soundtrack, and watch your digital world progressively develop as you maintain focus.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                1. What are you studying? *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Physics & Wave Functions, Constitutional Law..."
                className="w-full px-5 py-4 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:border-[#E63956] focus:bg-white outline-none font-medium text-stone-900 transition-all text-base shadow-2xs"
              />
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Select Focus Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { mins: 25, label: '25 Min', tag: 'Standard Focus' },
                  { mins: 45, label: '45 Min', tag: 'Deep Immersion' },
                  { mins: 60, label: '60 Min', tag: 'Masterclass' },
                  { mins: 90, label: '90 Min', tag: 'Epic Expedition' },
                ].map((d) => (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setDurationMinutes(d.mins)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      durationMinutes === d.mins
                        ? 'border-[#E63956] bg-rose-50/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="font-display font-black text-xl text-[#161616]">{d.label}</div>
                    <div className="text-[11px] font-mono font-bold uppercase text-stone-500 mt-1">{d.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Soundtrack Selector */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <Music className="w-4 h-4 text-[#E63956]" />
                <span>3. Focus Soundtrack (Optional Royalty-Free Audio)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {FOCUS_SOUNDTRACKS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSoundtrackId(s.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      selectedSoundtrackId === s.id
                        ? 'border-[#E63956] bg-rose-50 text-[#E63956] font-bold shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-300 font-medium'
                    }`}
                  >
                    <Music className={`w-4 h-4 ${selectedSoundtrackId === s.id ? 'text-[#E63956]' : 'text-stone-400'}`} />
                    <span className="text-xs font-mono uppercase truncate w-full">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* World Environment Selector */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-stone-700">
                4. Choose Immersive World Environment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FOCUS_WORLDS.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorldId(w.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      selectedWorldId === w.id
                        ? 'border-[#E63956] bg-white shadow-md ring-2 ring-[#E63956]/20'
                        : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                        {w.tag}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full shadow-inner"
                        style={{ backgroundColor: w.colorPrimary }}
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg text-[#161616] uppercase leading-tight mb-1">
                        {w.name}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {w.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStartQuest}
                className="w-full py-5 rounded-2xl bg-[#E63956] hover:bg-[#d52b48] text-white font-display font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(230,57,86,0.3)] transition-all cursor-pointer"
              >
                <Compass className="w-6 h-6 animate-spin-slow" />
                <span>START FOCUS QUEST →</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active / Completed Session Immersive Experience */
        <div className="space-y-8">
          {/* Main Immersive World Display & Controls Container */}
          <div className="relative rounded-[3rem] bg-[#0F1117] text-white p-6 sm:p-12 overflow-hidden shadow-2xl border border-stone-800 flex flex-col items-center justify-between min-h-[560px]">
            {/* Background Atmosphere & Ambient Gradients */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${currentWorld.colorPrimary} 0%, transparent 70%)`,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Top Bar inside Immersive Screen */}
            <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-800">
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E63956] block mb-1">
                  {currentWorld.name.toUpperCase()} • {progressPercent}% DEVELOPED
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  {session.topic}
                </h2>
              </div>

              {/* Secondary Countdown Timer */}
              <div className="flex items-center gap-4 bg-stone-900/80 border border-stone-700 px-6 py-3 rounded-2xl backdrop-blur-md">
                <Clock className="w-5 h-5 text-[#E63956]" />
                <div className="font-mono font-black text-2xl tracking-widest text-white">
                  {Math.floor(session.remainingSeconds / 60).toString().padStart(2, '0')}:
                  {(session.remainingSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Centerpiece: Progressive Visual World Art Piece */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto w-full">
              {/* Evolving Visual World Representation (Interactive Digital Art) */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Outer Pulsing Rings */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed opacity-30 animate-spin-slow"
                  style={{ borderColor: currentWorld.accentColor }}
                />
                <div
                  className="absolute inset-4 rounded-full border opacity-40"
                  style={{ borderColor: currentWorld.colorPrimary }}
                />

                {/* Central Evolving World Core */}
                <div
                  className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center p-6 shadow-2xl transition-all duration-700 transform hover:scale-105"
                  style={{
                    background: `radial-gradient(circle, ${currentWorld.colorPrimary} 0%, #18181B 90%)`,
                    boxShadow: `0 0 ${Math.max(20, progressPercent * 0.8)}px ${currentWorld.colorPrimary}60`,
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-xs" />
                  
                  <div className="relative z-10 flex flex-col items-center space-y-2">
                    {progressPercent >= 100 || session.isCompleted ? (
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                    ) : (
                      <Compass className="w-14 h-14 text-white animate-pulse" />
                    )}
                    <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-wider">
                      {progressPercent}%
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-300">
                      World Synergy
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage Description */}
              <div className="space-y-2 bg-stone-900/90 border border-stone-800 p-6 rounded-3xl backdrop-blur-sm w-full shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider" style={{ color: currentWorld.accentColor }}>
                  <Sparkles className="w-4 h-4" />
                  <span>{stageTitle}</span>
                </div>
                <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed">
                  {stageDescription}
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono text-stone-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Auto-pauses when tab is inactive</span>
                </div>

                {/* Subtle Integrated Music Controls */}
                {!session.isCompleted && currentSoundtrack.url && (
                  <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl">
                    <Music className="w-3.5 h-3.5 text-[#E63956]" />
                    <select
                      value={selectedSoundtrackId}
                      onChange={(e) => {
                        setSelectedSoundtrackId(e.target.value);
                        if (e.target.value === 'none') {
                          setIsAudioPlaying(false);
                        } else {
                          setIsAudioPlaying(true);
                        }
                      }}
                      className="bg-transparent text-stone-200 text-xs font-mono uppercase outline-none cursor-pointer pr-1"
                    >
                      {FOCUS_SOUNDTRACKS.map((s) => (
                        <option key={s.id} value={s.id} className="bg-stone-900 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                      className="p-1 rounded hover:bg-stone-800 text-stone-300 transition-colors cursor-pointer"
                      title={isAudioPlaying ? 'Mute Soundtrack' : 'Play Soundtrack'}
                    >
                      {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="w-16 accent-[#E63956] cursor-pointer"
                      title="Volume"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!session.isCompleted && progressPercent < 100 ? (
                  <>
                    {session.isPaused ? (
                      <button
                        type="button"
                        onClick={onResumeSession}
                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Play className="w-4 h-4" />
                        <span>Resume Quest</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onPauseSession}
                        className="px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        onStopSession && onStopSession();
                      }}
                      className="px-5 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4" />
                      <span>End Quest</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleSaveResult}
                      className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{saved ? 'Saved to My Sets!' : 'Save Completed Quest'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        onStopSession && onStopSession();
                      }}
                      className="px-6 py-3.5 rounded-2xl bg-[#E63956] hover:bg-[#d52b48] text-white font-mono text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>New Quest</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
