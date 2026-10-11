import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  History, 
  Flame, 
  Leaf, 
  Flower2, 
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import './studyFocusFlowers.css';

interface SessionRecord {
  id: string;
  durationMinutes: number;
  completedAt: string;
  wiltedSeconds: number;
  bloomScore: number;
}

interface StudyFocusGeneratorProps {
  onBack: () => void;
  onGoHome?: () => void;
}

const DURATIONS = [15, 25, 45, 60];
const STORAGE_KEY_SESSIONS = 'study_focus_completed_sessions_v1';
const STORAGE_KEY_CURRENT = 'study_focus_active_state_v1';

export const StudyFocusGenerator: React.FC<StudyFocusGeneratorProps> = ({ onBack, onGoHome }) => {
  // Duration & Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Tab visibility & Wilting state
  const [isPageHidden, setIsPageHidden] = useState<boolean>(false);
  const [wiltFactor, setWiltFactor] = useState<number>(0); // 0 (healthy) -> 1 (fully wilted)
  const [wiltedSecondsTotal, setWiltedSecondsTotal] = useState<number>(0);

  // Tooltip / popover for Attention Slipping badge on mobile tap / hover
  const [showAttentionTooltip, setShowAttentionTooltip] = useState<boolean>(false);

  // Sound effects
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // History / Persistence
  const [completedSessions, setCompletedSessions] = useState<SessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track session start & timestamps
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load any previously saved session progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDuration) setSelectedDuration(parsed.selectedDuration);
        if (typeof parsed.secondsRemaining === 'number' && parsed.secondsRemaining > 0) {
          setSecondsRemaining(parsed.secondsRemaining);
          if (parsed.isRunning) {
            setIsRunning(false);
            setIsPaused(true);
          }
        }
        if (typeof parsed.wiltFactor === 'number') {
          setWiltFactor(parsed.wiltFactor);
        }
        if (typeof parsed.wiltedSecondsTotal === 'number') {
          setWiltedSecondsTotal(parsed.wiltedSecondsTotal);
        }
      }
    } catch (e) {
      console.error('Failed to load focus session state', e);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (isCompleted) {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
      return;
    }
    const stateToSave = {
      selectedDuration,
      secondsRemaining,
      isRunning,
      isPaused,
      wiltFactor,
      wiltedSecondsTotal,
    };
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }
  }, [selectedDuration, secondsRemaining, isRunning, isPaused, wiltFactor, wiltedSecondsTotal, isCompleted]);

  // Audio helper (gentle harmonic chimes using Web Audio API)
  const playChime = (type: 'complete' | 'click' | 'wilt') => {
    if (!soundEnabled) return;
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'complete') {
        // Celestial blooming chord: C5 - E5 - G5 - C6
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 1.9);
        });
      } else if (type === 'wilt') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.82);
      }
    } catch {
      // AudioContext not available or blocked
    }
  };

  // Browser Tab Visibility Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.hidden;
      setIsPageHidden(hidden);

      if (hidden) {
        // Learner left tab during session
        lastActiveTimestampRef.current = Date.now();
      } else {
        // Learner returned
        if (isRunning && !isPaused && !isCompleted) {
          const awayMs = Date.now() - lastActiveTimestampRef.current;
          const awaySec = Math.floor(awayMs / 1000);
          if (awaySec > 2) {
            // Wilt gradually: increases with time away (max 1.0)
            setWiltFactor(prev => Math.min(1.0, prev + awaySec * 0.035));
            setWiltedSecondsTotal(prev => prev + awaySec);
            playChime('wilt');
          }
        }
        lastActiveTimestampRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused, isCompleted]);

  // Main Accurate Timer & Wilting Ticker
  useEffect(() => {
    if (!isRunning || isPaused || isCompleted) return;

    lastActiveTimestampRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.max(1, Math.round((now - lastActiveTimestampRef.current) / 1000));
      lastActiveTimestampRef.current = now;

      // If document is hidden while active, plant wilts gradually
      if (document.hidden) {
        setWiltFactor(prev => Math.min(1.0, prev + 0.03));
        setWiltedSecondsTotal(prev => prev + deltaSec);
        return; // Pause countdown progress while away
      }

      setSecondsRemaining(prev => {
        const next = prev - deltaSec;
        if (next <= 0) {
          clearInterval(interval);
          finishSession();
          return 0;
        }
        return next;
      });

      // Slowly recover wilt if back and focusing
      setWiltFactor(prev => Math.max(0, prev - 0.005));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, isCompleted]);

  // Session completion logic
  const finishSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(true);
    setWiltFactor(0); // Restore fully blooming state!
    playChime('complete');

    const bloomScore = Math.max(60, Math.round(100 - wiltedSecondsTotal * 0.5));
    const newRecord: SessionRecord = {
      id: `focus-${Date.now()}`,
      durationMinutes: selectedDuration,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      wiltedSeconds: wiltedSecondsTotal,
      bloomScore,
    };

    const updated = [newRecord, ...completedSessions].slice(0, 15);
    setCompletedSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    } catch {
      // ignore
    }
  };

  // Controls
  const handleSelectDuration = (mins: number) => {
    if (isRunning) return;
    playChime('click');
    setSelectedDuration(mins);
    setSecondsRemaining(mins * 60);
    setIsCompleted(false);
    setWiltFactor(0);
    setWiltedSecondsTotal(0);
  };

  const handleStart = () => {
    playChime('click');
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    lastActiveTimestampRef.current = Date.now();
  };

  const handlePause = () => {
    playChime('click');
    // Manual pause does NOT trigger wilting per specification
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResume = () => {
    playChime('click');
    setIsRunning(true);
    setIsPaused(false);
    // When the learner selects RESUME FOCUS, remove the warning and restore the plant's healthy growth
    setWiltFactor(0);
    setShowAttentionTooltip(false);
    lastActiveTimestampRef.current = Date.now();
  };

  const handleReset = () => {
    playChime('click');
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setSecondsRemaining(selectedDuration * 60);
    setWiltFactor(0);
    setWiltedSecondsTotal(0);
    setShowAttentionTooltip(false);
    localStorage.removeItem(STORAGE_KEY_CURRENT);
  };

  // Calculate Growth & Progress
  const totalSeconds = selectedDuration * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - secondsRemaining);
  const rawProgress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) : 0;
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round(rawProgress * 100));

  // Plant growth scale: from 0.5 seedling to 1.05 magnificent full bouquet
  const growthScale = isCompleted ? 1.08 : 0.52 + (rawProgress * 0.48);

  // Bloom factor for petal opening
  const bloomFactor = isCompleted ? 1.0 : Math.max(0.2, rawProgress);

  // Time format MM:SS
  const minsDisplay = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const secsDisplay = (secondsRemaining % 60).toString().padStart(2, '0');

  // Wilting visual styles (droop, desaturate, rotate downwards)
  const wiltDroopAngle = wiltFactor * 32; // degrees droop
  const wiltDesaturate = wiltFactor * 68; // percentage
  const wiltBrightness = 1 - (wiltFactor * 0.38);

  // Flag for whether the plant is wilting or attention has slipped
  const isWiltingCondition = isPageHidden || wiltFactor > 0.05;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-stone-500 mb-1">
            <span className="text-[#E63956] font-bold">TOOL 03</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <Leaf className="w-3.5 h-3.5" />
              STUDY FOCUS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            STUDY FOCUS
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold border border-emerald-200">
              Active Plant Companion
            </span>
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Nurture glowing, blossoming flowers while you study. Maintain unbroken presence to watch vibrant petals bloom—leave your tab and the flowers begin to wilt.
          </p>
        </div>

        {/* Sound toggle & Quick Stats */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span className="font-mono text-[11px]">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <div className="bg-white border border-stone-200 px-3 py-2 rounded-xl flex items-center gap-2 shadow-xs">
            <Flame className="w-4 h-4 text-amber-500" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-stone-400 leading-none">Completed</div>
              <div className="text-xs font-bold font-mono text-stone-800 leading-tight">
                {completedSessions.length} {completedSessions.length === 1 ? 'Plant' : 'Plants'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Stage: CodePen Glowing Night Garden + 3D Ceramic Pot + Timer */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0b1522] via-[#09182d] to-[#040814] text-white shadow-2xl border border-white/10 p-6 sm:p-10 flex flex-col items-center">
        {/* Atmospheric Night Sky Lights & Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Nebula clouds */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-sky-400/15 rounded-full blur-3xl" />
          
          {/* Subtle starry twinkling particles */}
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                width: `${(i % 3) + 1.5}px`,
                height: `${(i % 3) + 1.5}px`,
                top: `${(i * 19) % 85}%`,
                left: `${(i * 23) % 95}%`,
                opacity: 0.2 + (i % 5) * 0.15,
                animation: `flower-sparkle ${2.5 + (i % 4)}s ease-in-out infinite ${(i * 0.4)}s`,
              }}
            />
          ))}

          {/* Floating glowing pollen dust during focus */}
          {isRunning && !isPaused && (
            <>
              {[...Array(14)].map((_, i) => (
                <div
                  key={`pollen-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]"
                  style={{
                    bottom: '42%',
                    left: `${38 + (i * 3.5) - 20}%`,
                    animation: `flower-floating-pollen ${3 + (i % 3)}s ease-out infinite ${i * 0.45}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Status Pill Badge */}
        <div className="relative z-20 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono font-medium tracking-wide">
            {isCompleted ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span className="text-amber-200 font-bold">FULL 9-FLOWER BOUQUET BLOSSOMED</span>
              </>
            ) : isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 text-stone-300" />
                <span className="text-stone-300">SESSION PAUSED (SAFE FROM WILTING)</span>
              </>
            ) : isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300 font-semibold">9 FLOWERS FLOURISHING ({Math.round(progressPercent)}%)</span>
                {wiltFactor > 0.05 && (
                  <span className="text-amber-300 text-[11px] ml-1">
                    [Wilted: {Math.round(wiltFactor * 100)}%]
                  </span>
                )}
              </>
            ) : (
              <>
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-stone-300">READY TO FOCUS • {selectedDuration} MIN SESSION</span>
              </>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTANICAL VIRTUAL POTTED PLANT STAGE (9 GROWING FLOWERS)       */}
        {/* ============================================================== */}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center select-none py-2">
          {/* Plant Canvas Container with Scale and Wilt Filter */}
          <div 
            className="flower-garden-stage transition-all duration-700 ease-out"
            style={{
              filter: `saturate(${100 - wiltDesaturate}%) brightness(${wiltBrightness})`,
            }}
          >
            {/* Scaler wrapper for growing stems & blossoms */}
            <div 
              className="flowers-container w-full h-full flex justify-center items-end"
              style={{
                transform: `scale(${growthScale})`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)',
              }}
            >
              {/* ============================================================== */}
              {/* FLOWER 1: Centerpiece Tall Crimson Rose / Bloom                */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--1 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${0 + (wiltDroopAngle * 0.4)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                  <div className="flower__light flower__light--2" />
                  <div className="flower__light flower__light--3" />
                  <div className="flower__light flower__light--4" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--1" />
                  <div className="flower__line__leaf flower__line__leaf--2" />
                  <div className="flower__line__leaf flower__line__leaf--3" />
                  <div className="flower__line__leaf flower__line__leaf--4" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 2: Mid-Left Azure / Cyan Flower                        */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--2 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${-12 + (wiltDroopAngle * 0.65)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.94})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                  <div className="flower__light flower__light--2" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--1" />
                  <div className="flower__line__leaf flower__line__leaf--3" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 3: Mid-Right Violet / Purple Flower                     */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--3 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${14 + (wiltDroopAngle * 0.65)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.94})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                  <div className="flower__light flower__light--3" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--2" />
                  <div className="flower__line__leaf flower__line__leaf--4" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 4: Left Angled Golden Amber Bloom                       */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--4 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${-22 + (wiltDroopAngle * 0.8)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.88})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--2" />
                  <div className="flower__light flower__light--4" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--1" />
                  <div className="flower__line__leaf flower__line__leaf--4" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 5: Right Angled Emerald Jade Bloom                      */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--5 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${24 + (wiltDroopAngle * 0.8)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.88})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                  <div className="flower__light flower__light--3" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--2" />
                  <div className="flower__line__leaf flower__line__leaf--3" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 6: Outer Left Low Flaring Coral Pink Bloom              */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--6 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${-32 + (wiltDroopAngle * 0.9)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.82})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--2" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--3" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 7: Outer Right Low Flaring Indigo Bloom                 */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--7 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${34 + (wiltDroopAngle * 0.9)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.82})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--1" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 8: Front-Center High Magenta Bloom                      */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--8 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${-3 + (wiltDroopAngle * 0.45)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.96})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--1" />
                  <div className="flower__light flower__light--2" />
                  <div className="flower__light flower__light--4" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--2" />
                  <div className="flower__line__leaf flower__line__leaf--4" />
                </div>
              </div>

              {/* ============================================================== */}
              {/* FLOWER 9: Mid-Front Tangerine Sunburst Bloom                   */}
              {/* ============================================================== */}
              <div 
                className="flower-unit flower-unit--9 transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${5 + (wiltDroopAngle * 0.55)}deg)`,
                }}
              >
                <div 
                  className="flower__leafs"
                  style={{
                    transform: `scale(${bloomFactor * 0.9})`,
                  }}
                >
                  <div className="flower__leaf flower__leaf--1" />
                  <div className="flower__leaf flower__leaf--2" />
                  <div className="flower__leaf flower__leaf--3" />
                  <div className="flower__leaf flower__leaf--4" />
                  <div className="flower__white-circle" />
                  <div className="flower__light flower__light--2" />
                  <div className="flower__light flower__light--3" />
                </div>
                <div className="flower__line">
                  <div className="flower__line__leaf flower__line__leaf--1" />
                  <div className="flower__line__leaf flower__line__leaf--3" />
                </div>
              </div>

              {/* Lush Base Fern Foliage Overhanging Pot Rim */}
              <div className="absolute bottom-2 flex items-center justify-center gap-1 z-25 pointer-events-none">
                <div 
                  className="w-14 h-5 bg-gradient-to-t from-emerald-800 to-emerald-400 rounded-full -rotate-45 -translate-x-10 shadow-md origin-right transition-transform"
                  style={{ transform: `rotate(${-45 + (wiltDroopAngle * 0.5)}deg) translateX(-38px)` }}
                />
                <div 
                  className="w-16 h-5.5 bg-gradient-to-t from-emerald-700 to-emerald-300 rounded-full -rotate-20 -translate-x-4 shadow-md origin-right transition-transform"
                  style={{ transform: `rotate(${-20 + (wiltDroopAngle * 0.5)}deg) translateX(-16px)` }}
                />
                <div 
                  className="w-14 h-5 bg-gradient-to-t from-emerald-600 to-lime-400 rounded-full rotate-15 translate-x-4 shadow-md origin-left transition-transform"
                  style={{ transform: `rotate(${15 + (wiltDroopAngle * 0.5)}deg) translateX(16px)` }}
                />
                <div 
                  className="w-14 h-5 bg-gradient-to-t from-emerald-800 to-emerald-400 rounded-full rotate-45 translate-x-10 shadow-md origin-left transition-transform"
                  style={{ transform: `rotate(${45 + (wiltDroopAngle * 0.5)}deg) translateX(38px)` }}
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DETAILED REALISTIC 3D CERAMIC PLANT POT                        */}
          {/* ============================================================== */}
          <div className="relative w-48 sm:w-56 flex flex-col items-center -mt-2 z-30">
            {/* Soil Interior with Glowing Organic Substrate */}
            <div className="w-full h-5 rounded-[50%] bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-2 border-stone-700 shadow-inner flex items-center justify-center overflow-hidden">
              <div className="w-3/4 h-2 rounded-full bg-emerald-950/80 blur-xs" />
            </div>

            {/* Pot Lip / Rim (Curved 3D Highlight & Shadow) */}
            <div className="w-[104%] h-7 -mt-2.5 rounded-2xl bg-gradient-to-r from-[#442c1d] via-[#a36037] via-50% to-[#382215] shadow-lg border-t border-amber-300/30 flex items-center justify-center">
              <div className="w-11/12 h-1 bg-amber-200/20 rounded-full blur-xs" />
            </div>

            {/* Pot Main Body (Tapered Terracotta with Radial 3D Specular Sheen) */}
            <div 
              className="w-full h-28 -mt-1 bg-gradient-to-r from-[#2c1a10] via-[#8c4b28] via-45% via-[#b8693c] via-60% to-[#25150c] shadow-2xl relative overflow-hidden flex flex-col items-center justify-between py-3 border-b-4 border-[#180d07]"
              style={{
                clipPath: 'polygon(4% 0%, 96% 0%, 82% 100%, 18% 100%)',
              }}
            >
              {/* Subtle Engraved Geometric Emblem on Pot */}
              <div className="w-10 h-10 rounded-full border border-amber-200/30 flex items-center justify-center bg-black/20 shadow-inner mt-1">
                <Flower2 className="w-5 h-5 text-amber-200/50" />
              </div>

              {/* Vertical Lighting Reflection Streak */}
              <div className="absolute top-0 bottom-0 left-1/3 w-8 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />

              {/* Pot Base Accent Line */}
              <div className="w-1/2 h-0.5 bg-amber-300/20 rounded-full mb-1" />
            </div>

            {/* Pot Ceramic Saucer / Dish */}
            <div className="w-[84%] h-4 -mt-1 rounded-b-2xl bg-gradient-to-r from-[#24150c] via-[#7d4122] to-[#20120a] shadow-xl border-t border-amber-400/20 flex items-center justify-center">
              <div className="w-4/5 h-0.5 bg-amber-300/15 rounded-full" />
            </div>

            {/* Ground Contact Shadow */}
            <div className="w-56 h-4 bg-black/60 rounded-[50%] blur-sm -mt-1" />
          </div>

          {/* ============================================================== */}
          {/* PROMINENT COUNTDOWN TIMER DIRECTLY BENEATH POT                 */}
          {/* ============================================================== */}
          <div className="mt-6 flex flex-col items-center text-center">
            {/* Big Digital Display */}
            <div className="flex items-baseline justify-center gap-1 font-mono tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span className="text-5xl sm:text-6xl font-black">{minsDisplay}</span>
              <span className="text-4xl sm:text-5xl font-light text-white/50 animate-pulse">:</span>
              <span className="text-5xl sm:text-6xl font-black text-emerald-400">{secsDisplay}</span>
            </div>

            {/* Session Sub-label */}
            <div className="text-stone-400 text-xs font-mono uppercase tracking-widest mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Target: {selectedDuration} Minutes</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{Math.round(progressPercent)}% Blossomed</span>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full max-w-md mt-5">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm p-0.5 border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-500 shadow-[0_0_12px_#34d399]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Duration Selector Buttons (15, 25, 45, 60 minutes) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                disabled={isRunning}
                onClick={() => handleSelectDuration(dur)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === dur
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400 scale-105'
                    : isRunning
                    ? 'bg-white/5 text-stone-500 border border-white/5 cursor-not-allowed opacity-50'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20 border border-white/10 hover:text-white'
                }`}
              >
                {dur} MIN
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* MAIN ACTION CONTROLS & ATTENTION WARNING BADGE                 */}
          {/* ============================================================== */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            {!isRunning && !isPaused && !isCompleted && (
              <button
                type="button"
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Focus
              </button>
            )}

            {isRunning && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                {/* When attention is slipping (e.g. learner returned or tab hidden/wilting), show the compact flashing badge */}
                {isWiltingCondition && (
                  <div className="relative group/warning w-full sm:w-auto flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAttentionTooltip(!showAttentionTooltip)}
                      onMouseEnter={() => setShowAttentionTooltip(true)}
                      onMouseLeave={() => setShowAttentionTooltip(false)}
                      className="px-4 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-600 border border-rose-400/80 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 animate-attention-flash cursor-pointer transition-all"
                      title="Your flowers are wilting. Return to your focus session to help them bloom again."
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0" />
                      <span>ATTENTION SLIPPING</span>
                    </button>

                    {/* Popover / Tooltip on hover or tap */}
                    <div 
                      className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-stone-900/95 border border-rose-500/60 rounded-xl text-rose-100 text-xs font-sans shadow-2xl backdrop-blur-md z-40 transition-all pointer-events-none text-center ${
                        showAttentionTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden group-hover/warning:block group-hover/warning:opacity-100 group-hover/warning:scale-100'
                      }`}
                    >
                      Your flowers are wilting. Return to your focus session to help them bloom again.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={handlePause}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-500/90 hover:bg-amber-500 text-stone-950 font-mono text-sm font-bold uppercase tracking-wider shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    Pause Focus
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-400 hover:text-rose-300 border border-white/10 transition-all cursor-pointer shrink-0"
                    title="Cancel Session"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isPaused && !isCompleted && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                {/* ATTENTION SLIPPING warning badge beside RESUME FOCUS if plant is wilting or page was hidden */}
                {isWiltingCondition && (
                  <div className="relative group/warning w-full sm:w-auto flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAttentionTooltip(!showAttentionTooltip)}
                      onMouseEnter={() => setShowAttentionTooltip(true)}
                      onMouseLeave={() => setShowAttentionTooltip(false)}
                      className="px-4 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-600 border border-rose-400/80 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 animate-attention-flash cursor-pointer transition-all"
                      title="Your flowers are wilting. Return to your focus session to help them bloom again."
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0" />
                      <span>ATTENTION SLIPPING</span>
                    </button>

                    {/* Popover / Tooltip on hover or tap */}
                    <div 
                      className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-stone-900/95 border border-rose-500/60 rounded-xl text-rose-100 text-xs font-sans shadow-2xl backdrop-blur-md z-40 transition-all pointer-events-none text-center ${
                        showAttentionTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden group-hover/warning:block group-hover/warning:opacity-100 group-hover/warning:scale-100'
                      }`}
                    >
                      Your flowers are wilting. Return to your focus session to help them bloom again.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-mono text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Resume Focus
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
                    title="Reset session"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isCompleted && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 font-mono text-sm font-bold uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-105 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Sow Another Seed
              </button>
            )}
          </div>

          {/* Session Complete Celebration Box */}
          {isCompleted && (
            <div className="mt-8 max-w-md w-full bg-emerald-950/70 border border-emerald-400/30 backdrop-blur-md rounded-2xl p-5 text-center animate-fadeIn shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-200">Session Flourished!</h3>
              <p className="text-xs text-emerald-300/80 mt-1">
                You maintained unbroken focus for {selectedDuration} minutes. All 9 flowers have fully blossomed into a vibrant bouquet and are saved in your botanical records.
              </p>
              <div className="mt-3 pt-3 border-t border-emerald-800/60 flex items-center justify-around text-xs font-mono">
                <div>
                  <span className="text-emerald-400 block text-base font-bold">+{selectedDuration}m</span>
                  <span className="text-stone-400 text-[10px]">STUDY TIME</span>
                </div>
                <div>
                  <span className="text-amber-300 block text-base font-bold">9 / 9</span>
                  <span className="text-stone-400 text-[10px]">FLOWERS BLOOMED</span>
                </div>
                <div>
                  <span className="text-emerald-300 block text-base font-bold">100%</span>
                  <span className="text-stone-400 text-[10px]">VITALITY</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botanical Study Garden History & Records */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Completed Botanical Focus Sessions
              </h2>
              <p className="text-xs text-stone-500">
                Persisted session records of cultivated flowers and unbroken presence.
              </p>
            </div>
          </div>
          {completedSessions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all completed session records?')) {
                  setCompletedSessions([]);
                  localStorage.removeItem(STORAGE_KEY_SESSIONS);
                }
              }}
              className="text-[11px] font-mono text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Records
            </button>
          )}
        </div>

        {completedSessions.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Flower2 className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-medium text-stone-500">No completed sessions yet</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Start a 15, 25, 45, or 60-minute focus session above. Keep your tab open to nurture all 9 glowing flowers into full bloom.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-stone-100">
            {completedSessions.map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono">
                    {session.durationMinutes}m
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                      <span>{session.durationMinutes}-Minute Botanical Focus</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                        9 Flowers Bloomed
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      {session.completedAt}
                      {session.wiltedSeconds > 0 && (
                        <span className="text-amber-600 ml-2">
                          (Away time: {session.wiltedSeconds}s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    Vitality: {session.bloomScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
