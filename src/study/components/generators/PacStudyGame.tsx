import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  Heart,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Zap,
  Bookmark,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  X,
  Info,
  Layers,
  Award,
  Target,
  Clock,
  Flame,
} from 'lucide-react';
import { PAC_CATEGORIES, PacCategory, CollectibleItem } from './pacman/pacmanData';
import { CollectibleVisual, getItemSvgDataUrl } from './pacman/PacmanIcons';
import { pacmanAudio } from './pacman/pacmanAudio';
import { saveResourceToStorage } from '../../../build/utils/storage';
import { FocusQuestResult } from '../../types';

// Maze definition (19 columns x 22 rows)
// '#' = Wall
// '.' = Collectible learning object
// '*' = Power Pellet (Energizer)
// ' ' = Empty path
// 'T' = Wrap Tunnel
// '-' = Ghost House door
// 'G' = Ghost Spawn
// 'P' = Pac-Hero starting tile
const MAZE_GRID = [
  '###################', // 0
  '#*.......#.......*#', // 1
  '#.##.###.#.###.##.#', // 2
  '#.##.###.#.###.##.#', // 3
  '#.................#', // 4
  '#.##.#.#####.#.##.#', // 5
  '#....#...#...#....#', // 6
  '####.### # ###.####', // 7
  '   #.# G G G #.#   ', // 8
  '####.# ##### #.####', // 9
  'T   .  --G--  .   T', // 10
  '####.# ##### #.####', // 11
  '   #.#       #.#   ', // 12
  '####.#.#####.#.####', // 13
  '#........#........#', // 14
  '#.##.###.#.###.##.#', // 15
  '#*..#....P....#..*#', // 16
  '###.#.#.#####.#.###', // 17
  '#.....#...#...#...#', // 18
  '#.#######.#.#####.#', // 19
  '#.................#', // 20
  '###################', // 21
];

const COLS = 19;
const ROWS = 22;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';
type Difficulty = 'EASY' | 'MEDIUM' | 'DIFFICULT';

interface Ghost {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  dir: Direction;
  targetX: number;
  targetY: number;
  homeX: number;
  homeY: number;
  state: 'normal' | 'frightened' | 'eaten';
}

interface TileItem {
  col: number;
  row: number;
  item: CollectibleItem;
  collected: boolean;
  isPowerPellet: boolean;
}

interface PacStudyGameProps {
  onBack?: () => void;
  onGoHome?: () => void;
  onSaved?: () => void;
  existingResource?: FocusQuestResult;
  activeSession?: unknown;
  onStartSession?: (topic: string, duration: number) => void;
  onPauseSession?: () => void;
  onResumeSession?: () => void;
  onStopSession?: () => void;
}

export const PacStudyGame: React.FC<PacStudyGameProps> = ({
  onBack,
  onSaved,
}) => {
  // Game Setup State
  const [selectedCategory, setSelectedCategory] = useState<PacCategory>(PAC_CATEGORIES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('MEDIUM');
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'>('START');

  // Stats & Progress
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [itemsCollectedCount, setItemsCollectedCount] = useState<number>(0);
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [learnedItems, setLearnedItems] = useState<CollectibleItem[]>([]);
  const [activeReveal, setActiveReveal] = useState<{ item: CollectibleItem; time: number } | null>(null);
  const [latestConcept, setLatestConcept] = useState<CollectibleItem | null>(null);
  const [frightenedSeconds, setFrightenedSeconds] = useState<number>(0);

  // Active brief reveal timeout ref (briefly displays concept for ~3.2s)
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerReveal = useCallback((item: CollectibleItem) => {
    setActiveReveal({ item, time: Date.now() });
    setLatestConcept(item);
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = setTimeout(() => {
      setActiveReveal(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Toast & Modal
  const [saved, setSaved] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Canvas & Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const tileSizeRef = useRef<number>(34);

  // Image cache for SVG rendering on canvas
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Player state refs (for 60fps loop)
  const playerPos = useRef<{ x: number; y: number }>({ x: 9, y: 16 });
  const playerDir = useRef<Direction>('NONE');
  const nextPlayerDir = useRef<Direction>('NONE');
  const mouthAngle = useRef<number>(0.2);
  const mouthSpeed = useRef<number>(1);

  // Ghosts state ref
  const ghostsRef = useRef<Ghost[]>([]);
  const frightenedTimerRef = useRef<number>(0);
  const frightenedDurationRef = useRef<number>(7);

  // Maze tiles with items
  const tilesRef = useRef<TileItem[]>([]);

  // Speed configs based on difficulty
  const speedRef = useRef<{ player: number; ghost: number }>({ player: 5.4, ghost: 4.3 });

  // Touch Swipe tracking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Preload SVG illustrations whenever category changes
  useEffect(() => {
    selectedCategory.items.forEach((item) => {
      if (!imageCache.current.has(item.id)) {
        const img = new Image();
        img.src = getItemSvgDataUrl(item, 56);
        imageCache.current.set(item.id, img);
      }
    });
  }, [selectedCategory]);

  // Initialize maze items for selected category
  const initMaze = useCallback((category: PacCategory, difficulty: Difficulty) => {
    // Preload category images
    category.items.forEach((item) => {
      if (!imageCache.current.has(item.id)) {
        const img = new Image();
        img.src = getItemSvgDataUrl(item, 56);
        imageCache.current.set(item.id, img);
      }
    });

    const itemsList = category.items;
    let itemIdx = 0;
    const newTiles: TileItem[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const char = MAZE_GRID[r][c];
        if (char === '.') {
          const item = itemsList[itemIdx % itemsList.length];
          newTiles.push({
            col: c,
            row: r,
            item,
            collected: false,
            isPowerPellet: false,
          });
          itemIdx++;
        } else if (char === '*') {
          const item = itemsList[itemIdx % itemsList.length];
          newTiles.push({
            col: c,
            row: r,
            item,
            collected: false,
            isPowerPellet: true,
          });
          itemIdx++;
        }
      }
    }

    tilesRef.current = newTiles;
    setTotalItemsCount(newTiles.length);
    setItemsCollectedCount(0);
    setLearnedItems([]);
    setScore(0);
    setCombo(0);
    setActiveReveal(null);
    setFrightenedSeconds(0);
    frightenedTimerRef.current = 0;

    // Set lives & speeds based on difficulty
    if (difficulty === 'EASY') {
      setLives(4);
      speedRef.current = { player: 5.2, ghost: 3.4 };
      frightenedDurationRef.current = 10;
    } else if (difficulty === 'MEDIUM') {
      setLives(3);
      speedRef.current = { player: 5.5, ghost: 4.2 };
      frightenedDurationRef.current = 7;
    } else {
      setLives(3);
      speedRef.current = { player: 5.8, ghost: 5.0 };
      frightenedDurationRef.current = 5;
    }

    // Reset Player
    playerPos.current = { x: 9, y: 16 };
    playerDir.current = 'NONE';
    nextPlayerDir.current = 'NONE';

    // Initialize 4 Ghosts: Blinky (Red), Pinky (Pink), Inky (Cyan), Clyde (Orange)
    ghostsRef.current = [
      {
        id: 'blinky',
        name: 'Blinky',
        color: '#EF4444',
        x: 9,
        y: 8,
        dir: 'UP',
        targetX: 9,
        targetY: 16,
        homeX: 17,
        homeY: 1,
        state: 'normal',
      },
      {
        id: 'pinky',
        name: 'Pinky',
        color: '#EC4899',
        x: 8,
        y: 10,
        dir: 'UP',
        targetX: 9,
        targetY: 16,
        homeX: 1,
        homeY: 1,
        state: 'normal',
      },
      {
        id: 'inky',
        name: 'Inky',
        color: '#06B6D4',
        x: 9,
        y: 10,
        dir: 'UP',
        targetX: 9,
        targetY: 16,
        homeX: 17,
        homeY: 20,
        state: 'normal',
      },
      {
        id: 'clyde',
        name: 'Clyde',
        color: '#F97316',
        x: 10,
        y: 10,
        dir: 'UP',
        targetX: 9,
        targetY: 16,
        homeX: 1,
        homeY: 20,
        state: 'normal',
      },
    ];
  }, []);

  // Helper: check if a tile is walkable for player
  const isTileWalkable = (col: number, row: number): boolean => {
    if (row < 0 || row >= ROWS) return false;
    // Tunnel wrapping
    if (row === 10 && (col < 0 || col >= COLS)) return true;
    if (col < 0 || col >= COLS) return false;

    const char = MAZE_GRID[row][col];
    return char !== '#' && char !== '-';
  };

  // Helper: check if a tile is walkable for ghosts
  const isGhostWalkable = (col: number, row: number, canEnterGate: boolean = false): boolean => {
    if (row < 0 || row >= ROWS) return false;
    if (row === 10 && (col < 0 || col >= COLS)) return true;
    if (col < 0 || col >= COLS) return false;

    const char = MAZE_GRID[row][col];
    if (char === '#') return false;
    if (char === '-' && !canEnterGate) return false;
    return true;
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') {
        if (e.key === ' ' && gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        nextPlayerDir.current = 'UP';
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        nextPlayerDir.current = 'DOWN';
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        nextPlayerDir.current = 'LEFT';
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        nextPlayerDir.current = 'RIGHT';
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setGameState('PAUSED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch Swipe Handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      nextPlayerDir.current = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      nextPlayerDir.current = dy > 0 ? 'DOWN' : 'UP';
    }
  };

  // Start game handler
  const handleStartGame = () => {
    initMaze(selectedCategory, selectedDifficulty);
    setGameState('PLAYING');
    pacmanAudio.playStart();
  };

  // Restart game handler
  const handleRestart = () => {
    initMaze(selectedCategory, selectedDifficulty);
    setGameState('PLAYING');
    pacmanAudio.playStart();
  };

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    pacmanAudio.setMuted(next);
  };

  // Reset player & ghosts after losing a life
  const resetAfterDeath = () => {
    playerPos.current = { x: 9, y: 16 };
    playerDir.current = 'NONE';
    nextPlayerDir.current = 'NONE';

    ghostsRef.current.forEach((g) => {
      g.x = g.homeX === 17 ? 9 : 8;
      g.y = 10;
      g.dir = 'UP';
      g.state = 'normal';
    });
  };

  // Save session to user sets
  const handleSaveToSets = () => {
    const result: FocusQuestResult = {
      title: `Pac-Study: ${selectedCategory.name}`,
      topic: selectedCategory.name,
      subject: selectedCategory.name,
      score,
      completedAt: new Date().toISOString(),
      toolType: 'focus-quest',
    };
    saveResourceToStorage({
      id: `pac-study-${Date.now()}`,
      toolType: 'focus-quest',
      title: result.title,
      subject: result.subject || selectedCategory.name,
      topic: result.topic,
      createdAt: new Date().toISOString(),
      data: result,
    });
    setSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  // Dynamic Canvas Resize (desktop large arcade sizing vs mobile/tablet)
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      // Use available width and height of the center arcade stage
      const containerW = Math.max(260, rect.width - 24);
      const containerH = Math.max(300, rect.height - 24);

      // Compute optimal tile size so the maze expands to dominate the center area
      const tsW = Math.floor(containerW / COLS);
      const tsH = Math.floor(containerH / ROWS);
      let ts = Math.min(tsW, tsH);

      // Ensure crisp display and expand to dominate without arbitrary low caps
      ts = Math.max(18, ts);

      const w = ts * COLS;
      const h = ts * ROWS;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      tileSizeRef.current = ts;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    let isMounted = true;
    lastTimeRef.current = performance.now();

    const gameLoop = (currentTime: number) => {
      if (!isMounted) return;

      const deltaSec = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
      }

      const tileSize = tileSizeRef.current || 34;

      // ==========================================
      // 1. UPDATE PLAYER MOVEMENT & COLLISION
      // ==========================================
      const p = playerPos.current;
      const speed = speedRef.current.player * deltaSec;

      // Handle Direction changes at intersections
      if (nextPlayerDir.current !== playerDir.current && nextPlayerDir.current !== 'NONE') {
        const curCol = Math.round(p.x);
        const curRow = Math.round(p.y);
        const distToCenter = Math.hypot(p.x - curCol, p.y - curRow);

        let targetCol = curCol;
        let targetRow = curRow;
        if (nextPlayerDir.current === 'UP') targetRow -= 1;
        if (nextPlayerDir.current === 'DOWN') targetRow += 1;
        if (nextPlayerDir.current === 'LEFT') targetCol -= 1;
        if (nextPlayerDir.current === 'RIGHT') targetCol += 1;

        if (distToCenter < 0.28 && isTileWalkable(targetCol, targetRow)) {
          playerDir.current = nextPlayerDir.current;
          if (playerDir.current === 'UP' || playerDir.current === 'DOWN') p.x = curCol;
          if (playerDir.current === 'LEFT' || playerDir.current === 'RIGHT') p.y = curRow;
        }
      }

      // Move player forward in current direction
      let dx = 0;
      let dy = 0;
      if (playerDir.current === 'UP') dy = -1;
      if (playerDir.current === 'DOWN') dy = 1;
      if (playerDir.current === 'LEFT') dx = -1;
      if (playerDir.current === 'RIGHT') dx = 1;

      const nextX = p.x + dx * speed;
      const nextY = p.y + dy * speed;

      // Check wall collision ahead
      const checkCol = dx > 0 ? Math.ceil(nextX) : Math.floor(nextX);
      const checkRow = dy > 0 ? Math.ceil(nextY) : Math.floor(nextY);

      if (isTileWalkable(checkCol, checkRow)) {
        p.x = nextX;
        p.y = nextY;
      } else {
        p.x = Math.round(p.x);
        p.y = Math.round(p.y);
        playerDir.current = 'NONE';
      }

      // Tunnel wrapping for player (Row 10)
      if (Math.round(p.y) === 10) {
        if (p.x < -0.5) p.x = COLS - 0.5;
        if (p.x > COLS - 0.5) p.x = -0.5;
      }

      // Mouth chomping animation
      mouthAngle.current += mouthSpeed.current * deltaSec * 8;
      if (mouthAngle.current > 0.48) {
        mouthAngle.current = 0.48;
        mouthSpeed.current = -1;
      } else if (mouthAngle.current < 0.05) {
        mouthAngle.current = 0.05;
        mouthSpeed.current = 1;
      }

      // Check Item Collection
      tilesRef.current.forEach((t) => {
        if (!t.collected) {
          const dist = Math.hypot(p.x - t.col, p.y - t.row);
          if (dist < 0.42) {
            t.collected = true;

            if (t.isPowerPellet) {
              pacmanAudio.playPowerPellet();
              setScore((s) => s + 200);
              // Trigger Frightened mode
              frightenedTimerRef.current = frightenedDurationRef.current;
              setFrightenedSeconds(Math.ceil(frightenedDurationRef.current));
              ghostsRef.current.forEach((g) => {
                if (g.state !== 'eaten') g.state = 'frightened';
              });
            } else {
              pacmanAudio.playChomp(t.col % 2 === 0);
              setScore((s) => s + 50 + combo * 5);
              setCombo((c) => c + 1);
            }

            setItemsCollectedCount((prev) => {
              const nextCount = prev + 1;
              if (nextCount >= totalItemsCount && totalItemsCount > 0) {
                setGameState('VICTORY');
              }
              return nextCount;
            });

            // Educational Reveal trigger (briefly displays concept for ~3.2s)
            triggerReveal(t.item);
            setLearnedItems((prev) => {
              if (prev.some((it) => it.id === t.item.id)) return prev;
              return [...prev, t.item];
            });
          }
        }
      });

      // ==========================================
      // 2. UPDATE FRIGHTENED TIMER
      // ==========================================
      if (frightenedTimerRef.current > 0) {
        frightenedTimerRef.current -= deltaSec;
        setFrightenedSeconds(Math.max(0, Math.ceil(frightenedTimerRef.current)));
        if (frightenedTimerRef.current <= 0) {
          ghostsRef.current.forEach((g) => {
            if (g.state === 'frightened') g.state = 'normal';
          });
        }
      }

      // ==========================================
      // 3. UPDATE GHOSTS
      // ==========================================
      const gSpeedBase = speedRef.current.ghost * deltaSec;
      ghostsRef.current.forEach((g) => {
        let gSpeed = gSpeedBase;
        if (g.state === 'frightened') gSpeed *= 0.62;
        if (g.state === 'eaten') gSpeed *= 1.85;

        // Target tile calculation
        if (g.state === 'eaten') {
          // Returning to ghost house gate
          g.targetX = 9;
          g.targetY = 10;
          if (Math.hypot(g.x - 9, g.y - 10) < 0.5) {
            g.state = 'normal';
          }
        } else if (g.state === 'frightened') {
          // Scatter away to opposite corner
          g.targetX = g.homeX;
          g.targetY = g.homeY;
        } else {
          // Normal targeting per Ghost personality
          if (g.id === 'blinky') {
            g.targetX = Math.round(p.x);
            g.targetY = Math.round(p.y);
          } else if (g.id === 'pinky') {
            let aheadX = Math.round(p.x);
            let aheadY = Math.round(p.y);
            if (playerDir.current === 'UP') aheadY -= 3;
            if (playerDir.current === 'DOWN') aheadY += 3;
            if (playerDir.current === 'LEFT') aheadX -= 3;
            if (playerDir.current === 'RIGHT') aheadX += 3;
            g.targetX = aheadX;
            g.targetY = aheadY;
          } else if (g.id === 'inky') {
            g.targetX = Math.round(p.x * 2 - (ghostsRef.current[0]?.x || 9));
            g.targetY = Math.round(p.y * 2 - (ghostsRef.current[0]?.y || 8));
          } else {
            const dist = Math.hypot(g.x - p.x, g.y - p.y);
            if (dist > 7) {
              g.targetX = Math.round(p.x);
              g.targetY = Math.round(p.y);
            } else {
              g.targetX = g.homeX;
              g.targetY = g.homeY;
            }
          }
        }

        // Tunnel wrapping for ghosts
        if (Math.round(g.y) === 10) {
          if (g.x < -0.5) g.x = COLS - 0.5;
          if (g.x > COLS - 0.5) g.x = -0.5;
        }

        // Check if ghost reached intersection tile center to choose next direction
        const gTileX = Math.round(g.x);
        const gTileY = Math.round(g.y);
        const distToCenter = Math.hypot(g.x - gTileX, g.y - gTileY);

        if (distToCenter < 0.12) {
          const moves: { dir: Direction; dx: number; dy: number }[] = [
            { dir: 'UP', dx: 0, dy: -1 },
            { dir: 'DOWN', dx: 0, dy: 1 },
            { dir: 'LEFT', dx: -1, dy: 0 },
            { dir: 'RIGHT', dx: 1, dy: 0 },
          ];

          const reverseOf: Record<Direction, Direction> = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT',
            NONE: 'NONE',
          };

          const validMoves = moves.filter((m) => {
            if (m.dir === reverseOf[g.dir]) return false;
            return isGhostWalkable(gTileX + m.dx, gTileY + m.dy, g.state === 'eaten');
          });

          if (validMoves.length > 0) {
            validMoves.sort((a, b) => {
              const da = Math.hypot(gTileX + a.dx - g.targetX, gTileY + a.dy - g.targetY);
              const db = Math.hypot(gTileX + b.dx - g.targetX, gTileY + b.dy - g.targetY);
              return da - db;
            });

            g.dir = validMoves[0].dir;
            if (g.dir === 'UP' || g.dir === 'DOWN') g.x = gTileX;
            else g.y = gTileY;
          } else {
            g.dir = reverseOf[g.dir];
          }
        }

        // Move ghost in selected direction
        let gdx = 0;
        let gdy = 0;
        if (g.dir === 'UP') gdy = -1;
        if (g.dir === 'DOWN') gdy = 1;
        if (g.dir === 'LEFT') gdx = -1;
        if (g.dir === 'RIGHT') gdx = 1;

        g.x += gdx * gSpeed;
        g.y += gdy * gSpeed;

        // Collision with Player
        const colDist = Math.hypot(p.x - g.x, p.y - g.y);
        if (colDist < 0.65) {
          if (g.state === 'frightened') {
            pacmanAudio.playEatGhost();
            g.state = 'eaten';
            setScore((s) => s + 400);
          } else if (g.state === 'normal') {
            pacmanAudio.playDeath();
            setCombo(0);
            setLives((l) => {
              const nextLives = l - 1;
              if (nextLives <= 0) {
                setGameState('GAMEOVER');
              } else {
                resetAfterDeath();
              }
              return nextLives;
            });
          }
        }
      });

      // ==========================================
      // 4. DRAW EVERYTHING TO CANVAS
      // ==========================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark sleek maze background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Maze Walls
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const char = MAZE_GRID[r][c];
          const px = c * tileSize;
          const py = r * tileSize;

          if (char === '#') {
            // Neon maze wall block with subtle bevel
            ctx.fillStyle = selectedCategory.wallColor;
            ctx.fillRect(px, py, tileSize, tileSize);

            // Subtle inner border with neon accent
            ctx.strokeStyle = selectedCategory.accentColor;
            ctx.lineWidth = 1.4;
            ctx.strokeRect(px + 1.5, py + 1.5, tileSize - 3, tileSize - 3);
          } else if (char === '-') {
            // Ghost house gate
            ctx.strokeStyle = '#F472B6';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(px, py + tileSize / 2);
            ctx.lineTo(px + tileSize, py + tileSize / 2);
            ctx.stroke();
          }
        }
      }

      // Draw Collectibles (Actual Educational Visual Objects!)
      tilesRef.current.forEach((t) => {
        if (!t.collected) {
          const cx = t.col * tileSize + tileSize / 2;
          const cy = t.row * tileSize + tileSize / 2;

          if (t.isPowerPellet) {
            // Pulsing Power Pellet (Energizer)
            const pulse = 0.75 + Math.sin(currentTime * 0.009) * 0.25;
            ctx.beginPath();
            ctx.arc(cx, cy, tileSize * 0.38 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = '#FDE047';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // High-contrast backing plate so the object is prominent against the corridor floor
            const badgeRadius = tileSize * 0.42;
            ctx.beginPath();
            ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.fill();
            ctx.strokeStyle = `${t.item.color}88`;
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // Draw the actual authentic SVG visual object!
            const img = imageCache.current.get(t.item.id);
            if (img && img.complete && img.naturalWidth > 0) {
              const itemDrawSize = tileSize * 0.70;
              ctx.drawImage(img, cx - itemDrawSize / 2, cy - itemDrawSize / 2, itemDrawSize, itemDrawSize);
            } else {
              // Direct vector fallback
              ctx.beginPath();
              ctx.arc(cx, cy, badgeRadius * 0.5, 0, Math.PI * 2);
              ctx.fillStyle = t.item.color;
              ctx.fill();
            }
          }
        }
      });

      // Draw Ghosts
      ghostsRef.current.forEach((g) => {
        const gx = g.x * tileSize + tileSize / 2;
        const gy = g.y * tileSize + tileSize / 2;
        const r = tileSize * 0.44;

        ctx.save();
        ctx.translate(gx, gy);

        if (g.state === 'eaten') {
          // Floating white eyes
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(-4, -2, 4, 0, Math.PI * 2);
          ctx.arc(4, -2, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1E3A8A';
          ctx.beginPath();
          ctx.arc(-3.5, -2, 2, 0, Math.PI * 2);
          ctx.arc(4.5, -2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ghost Body
          const isFrightened = g.state === 'frightened';
          const isFlashing = isFrightened && frightenedTimerRef.current < 2 && Math.floor(currentTime / 200) % 2 === 0;

          ctx.fillStyle = isFlashing ? '#FFFFFF' : isFrightened ? '#1D4ED8' : g.color;

          ctx.beginPath();
          // Dome head
          ctx.arc(0, -r * 0.2, r * 0.8, Math.PI, 0, false);
          // Skirt tentacles
          ctx.lineTo(r * 0.8, r * 0.8);
          ctx.lineTo(r * 0.4, r * 0.5);
          ctx.lineTo(0, r * 0.8);
          ctx.lineTo(-r * 0.4, r * 0.5);
          ctx.lineTo(-r * 0.8, r * 0.8);
          ctx.closePath();
          ctx.fill();

          // Eyes
          if (isFrightened) {
            ctx.fillStyle = '#FDE047';
            ctx.beginPath();
            ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
            ctx.arc(4, -2, 1.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-4.5, -2, 3.5, 0, Math.PI * 2);
            ctx.arc(4.5, -2, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupil direction
            let pdx = 0;
            let pdy = 0;
            if (g.dir === 'LEFT') pdx = -1.5;
            if (g.dir === 'RIGHT') pdx = 1.5;
            if (g.dir === 'UP') pdy = -1.5;
            if (g.dir === 'DOWN') pdy = 1.5;

            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.arc(-4.5 + pdx, -2 + pdy, 1.8, 0, Math.PI * 2);
            ctx.arc(4.5 + pdx, -2 + pdy, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Draw Player (Pac-Hero)
      const px = p.x * tileSize + tileSize / 2;
      const py = p.y * tileSize + tileSize / 2;
      const pr = tileSize * 0.46;

      let rotation = 0;
      if (playerDir.current === 'RIGHT') rotation = 0;
      if (playerDir.current === 'DOWN') rotation = Math.PI / 2;
      if (playerDir.current === 'LEFT') rotation = Math.PI;
      if (playerDir.current === 'UP') rotation = (Math.PI * 3) / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rotation);

      // Chomping mouth arc
      ctx.beginPath();
      ctx.arc(0, 0, pr, mouthAngle.current, Math.PI * 2 - mouthAngle.current, false);
      ctx.lineTo(0, 0);
      ctx.closePath();

      // Golden radial gradient
      const pGrad = ctx.createRadialGradient(-pr * 0.2, -pr * 0.2, 2, 0, 0, pr);
      pGrad.addColorStop(0, '#FEF08A');
      pGrad.addColorStop(0.6, '#FACC15');
      pGrad.addColorStop(1, '#CA8A04');
      ctx.fillStyle = pGrad;
      ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye
      ctx.beginPath();
      ctx.arc(pr * 0.1, -pr * 0.5, pr * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#1E293B';
      ctx.fill();

      ctx.restore();

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, totalItemsCount, combo, selectedCategory.wallColor, selectedCategory.accentColor]);

  // Accuracy calculation
  const accuracy = totalItemsCount > 0 ? Math.round((itemsCollectedCount / totalItemsCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-40 bg-[#020617] text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* TOP ARCADE NAVIGATION STRIP */}
      <header className="h-14 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-950/95 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors text-xs font-mono font-bold uppercase cursor-pointer"
            >
              ← Study Suite
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
              PAC-<span className="text-amber-400">STUDY</span>
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              FULL-SCREEN ARCADE MODE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="pac-how-to-play-btn"
            onClick={() => setShowHowToPlay(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer text-xs font-mono font-bold uppercase flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">How To Play</span>
          </button>

          <button
            id="pac-mute-toggle"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Saved Toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-bounce font-medium text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Session saved to My Sets!</span>
        </div>
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-amber-400" />
                <h3 className="font-display font-black text-xl text-white uppercase">PAC-STUDY ARCADE</h3>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 font-bold block mb-0.5">Collect Visual Concepts</strong>
                  Each collectible in the maze is an authentic, illustrated scientific concept from your chosen field. Collecting it reveals its name and factual description!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-200 font-bold block mb-0.5">Power Pellets & Ghost Chomping</strong>
                  Chomp corner energizers to turn Blinky, Pinky, Inky, and Clyde blue. Chomp them for a huge 400 point bonus!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold block mb-0.5">Controls</strong>
                  Use Arrow Keys or W-A-S-D on keyboard. On mobile/tablet, use swipe gestures across the maze or tap the on-screen D-pad.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase hover:bg-amber-400 transition-colors"
            >
              GOT IT, LET'S PLAY
            </button>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ARCADE LAYOUT:
          DESKTOP (lg): 3 COLUMNS (LEFT STATS | CENTER DOMINANT MAZE | RIGHT STATS & LEARNING)
          TABLET / MOBILE: VERTICAL RESPONSIVE ADAPTIVE LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden w-full p-2.5 sm:p-3 lg:p-4 gap-3 xl:gap-4 min-h-0">
        {/* ========================================================= */}
        {/* LEFT COLUMN: GAME STATISTICS & CONTROLS (DESKTOP)        */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 2xl:w-96 flex-col gap-3 shrink-0 overflow-y-auto pr-1 custom-scrollbar">
          {/* Active Score Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-widest flex items-center justify-between">
              <span>SCORE</span>
              {combo > 1 && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {combo}x STREAK
                </span>
              )}
            </div>
            <div className="text-3xl xl:text-4xl font-black text-white font-mono tracking-tight mt-1">
              {score.toLocaleString()}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Difficulty</span>
              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-800 border border-slate-700 text-amber-300">
                {selectedDifficulty}
              </span>
            </div>
          </div>

          {/* Active Category Marquee */}
          <div
            className="border rounded-2xl p-4 shadow-xl backdrop-blur-md transition-all"
            style={{
              backgroundColor: `${selectedCategory.themeColor}12`,
              borderColor: `${selectedCategory.themeColor}55`,
            }}
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" style={{ color: selectedCategory.themeColor }} />
              ACTIVE SUBJECT
            </div>
            <div className="text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
              <span style={{ color: selectedCategory.themeColor }}>{selectedCategory.name}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              {selectedCategory.tagline}
            </p>
            <div className="mt-2.5 text-[11px] font-mono text-slate-400">
              {selectedCategory.items.length} Authentic Concepts Loaded
            </div>
          </div>

          {/* Pursuers / Ghost Radar Monitor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 flex items-center justify-between">
              <span>PURSUERS RADAR</span>
              {frightenedSeconds > 0 && (
                <span className="text-blue-400 font-mono font-bold animate-pulse">
                  FRIGHTENED: {frightenedSeconds}s
                </span>
              )}
            </div>

            {/* Ghost status rows */}
            <div className="space-y-2">
              {[
                { name: 'Blinky (Shadow)', color: '#EF4444', role: 'Direct Chaser' },
                { name: 'Pinky (Speedy)', color: '#EC4899', role: 'Ambusher' },
                { name: 'Inky (Bashful)', color: '#06B6D4', role: 'Flanker' },
                { name: 'Clyde (Pokey)', color: '#F97316', role: 'Scatterer' },
              ].map((ghost, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ghost.color }} />
                    <span className="font-bold text-slate-200">{ghost.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {frightenedSeconds > 0 ? 'VULNERABLE' : ghost.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Frightened mode bar */}
            {frightenedSeconds > 0 && (
              <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-blue-500/40">
                <div
                  className="bg-blue-500 h-full transition-all duration-200"
                  style={{ width: `${(frightenedSeconds / 7) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Desktop Controls Reference */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-1">
              DESKTOP CONTROLS
            </div>
            <div className="flex items-center justify-between">
              <span>Navigate</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[10px]">Arrow Keys / WASD</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Pause / Resume</span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[10px]">Space Bar</kbd>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: LARGE PAC-MAN MAZE (DOMINANT ELEMENT)      */}
        {/* ========================================================= */}
        <main className="flex-1 flex flex-col items-center justify-center relative min-w-0 h-full overflow-hidden bg-slate-950/70 rounded-2xl border border-slate-800/80 shadow-2xl p-2 sm:p-3">
          {/* Mobile/Tablet Compact HUD Header */}
          <div className="lg:hidden w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400">PAC-STUDY</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                {selectedCategory.name}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="font-bold text-white">{score.toLocaleString()} PTS</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE LEARNING REVEAL BANNER (FLOATING HUD) */}
          {activeReveal && (
            <div className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/40 rounded-xl shadow-2xl flex items-center gap-3 mb-2 animate-in fade-in duration-200">
              <div className="p-1 bg-slate-950 rounded-lg border border-amber-500/50 shrink-0">
                <CollectibleVisual item={activeReveal.item} size={34} glow />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    JUST COLLECTED
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {activeReveal.item.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-1 mt-0.5 font-medium">
                  {activeReveal.item.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-amber-400 font-mono">+50</span>
              </div>
            </div>
          )}

          {/* THE LARGE MAZE ARENA CONTAINER (EXPANDS TO FILL CENTER STAGE) */}
          <div
            ref={containerRef}
            className="relative w-full flex-1 flex flex-col items-center justify-center overflow-hidden min-h-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Scaled HTML5 Game Canvas */}
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-2xl ring-1 ring-slate-800 cursor-crosshair max-w-full max-h-full object-contain"
              style={{
                boxShadow: `0 0 24px ${selectedCategory.accentColor}25, 0 10px 30px rgba(0,0,0,0.8)`,
              }}
            />

            {/* START SCREEN OVERLAY */}
            {gameState === 'START' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 overflow-y-auto">
                <div className="max-w-xl w-full py-4 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3 tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" /> ARCADE LEARNING MAZE
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                    PAC-<span className="text-amber-400">STUDY</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-md">
                    Navigate classic corridors, collect illustrated concepts across 8 knowledge fields, and evade the 4 pursuers.
                  </p>

                  {/* 8 KNOWLEDGE CATEGORIES */}
                  <div className="w-full mb-4">
                    <div className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
                      <span>CATEGORY SELECTION</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Selected: {selectedCategory.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PAC_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory.id === cat.id;
                        return (
                          <button
                            key={cat.id}
                            id={`cat-select-${cat.id.toLowerCase()}`}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-lg mb-1.5 flex items-center justify-center border"
                              style={{
                                backgroundColor: `${cat.themeColor}22`,
                                borderColor: cat.themeColor,
                              }}
                            >
                              <span className="text-xs font-black" style={{ color: cat.themeColor }}>
                                {cat.name.slice(0, 2)}
                              </span>
                            </div>
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {cat.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {cat.items.length} Concepts
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LIVE PREVIEW OF SELECTED CATEGORY'S OBJECTS */}
                  <div className="w-full mb-5 bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                      <span>PREVIEW OBJECTS IN THIS MAZE ({selectedCategory.name})</span>
                      <span className="text-amber-400">{selectedCategory.items.length} Total</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {selectedCategory.items.slice(0, 6).map((sample) => (
                        <div
                          key={sample.id}
                          className="flex flex-col items-center p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center"
                        >
                          <CollectibleVisual item={sample} size={26} glow />
                          <span className="text-[9px] font-bold text-slate-200 mt-1 truncate max-w-full">
                            {sample.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DIFFICULTY SELECTOR */}
                  <div className="w-full mb-5">
                    <div className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                      DIFFICULTY
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['EASY', 'MEDIUM', 'DIFFICULT'] as Difficulty[]).map((diff) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                          <button
                            key={diff}
                            id={`diff-select-${diff.toLowerCase()}`}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* START GAME BUTTON */}
                  <button
                    id="pac-start-btn"
                    onClick={handleStartGame}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    START GAME <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* PAUSED OVERLAY */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                <h2 className="text-2xl font-black text-white mb-2">GAME PAUSED</h2>
                <p className="text-xs text-slate-400 mb-4">Press SPACE or click resume to return to the maze</p>
                <button
                  id="pac-resume-btn"
                  onClick={() => setGameState('PLAYING')}
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
                >
                  RESUME GAME
                </button>
              </div>
            )}

            {/* GAMEOVER OVERLAY */}
            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 overflow-y-auto">
                <div className="max-w-md w-full py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                    <RotateCcw className="w-6 h-6" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">SESSION COMPLETE</h2>
                  <p className="text-xs text-slate-400 mb-4">
                    You collected <strong className="text-amber-400">{itemsCollectedCount}</strong> concepts in {selectedCategory.name}!
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">FINAL SCORE</div>
                      <div className="text-xl font-black text-white mt-0.5">{score.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">CONCEPTS MASTERED</div>
                      <div className="text-xl font-black text-emerald-400 mt-0.5">{learnedItems.length}</div>
                    </div>
                  </div>

                  {/* WHAT YOU LEARNED PREVIEW */}
                  {learnedItems.length > 0 && (
                    <div className="w-full mb-4 text-left bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide mb-2.5">
                        <BookOpen className="w-4 h-4 text-amber-400" /> WHAT YOU LEARNED
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {learnedItems.map((it) => (
                          <div key={it.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                            <CollectibleVisual item={it} size={24} className="shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-white">{it.name}</div>
                              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{it.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full">
                    <button
                      id="pac-replay-btn"
                      onClick={handleRestart}
                      className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
                    >
                      PLAY AGAIN
                    </button>
                    <button
                      id="pac-change-cat-btn"
                      onClick={() => setGameState('START')}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                    >
                      CHANGE CATEGORY
                    </button>
                  </div>

                  <button
                    id="pac-save-btn"
                    onClick={handleSaveToSets}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Save Session to My Sets
                  </button>
                </div>
              </div>
            )}

            {/* VICTORY OVERLAY */}
            {gameState === 'VICTORY' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 overflow-y-auto">
                <div className="max-w-md w-full py-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                    <Trophy className="w-6 h-6" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">MAZE CLEARED!</h2>
                  <p className="text-xs text-slate-400 mb-4">
                    Flawless run! You collected all <strong className="text-emerald-400">{totalItemsCount}</strong> concepts in {selectedCategory.name}!
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">FINAL SCORE</div>
                      <div className="text-xl font-black text-amber-400 mt-0.5">{score.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">ACCURACY</div>
                      <div className="text-xl font-black text-emerald-400 mt-0.5">100%</div>
                    </div>
                  </div>

                  {/* WHAT YOU LEARNED */}
                  <div className="w-full mb-4 text-left bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide mb-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> COMPLETE MASTERY CATALOG
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {learnedItems.map((it) => (
                        <div key={it.id} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                          <CollectibleVisual item={it} size={24} className="shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{it.name}</div>
                            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{it.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <button
                      id="pac-vic-replay-btn"
                      onClick={handleRestart}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
                    >
                      PLAY AGAIN
                    </button>
                    <button
                      id="pac-vic-change-btn"
                      onClick={() => setGameState('START')}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                    >
                      NEXT CATEGORY
                    </button>
                  </div>

                  <button
                    id="pac-vic-save-btn"
                    onClick={handleSaveToSets}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Save Session to My Sets
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE / TABLET VIRTUAL D-PAD CONTROLS (VISIBLE ON MOBILE/TABLET) */}
          <div className="lg:hidden w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl mt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <div>Items: {itemsCollectedCount} / {totalItemsCount}</div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">Swipe on maze to steer</div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="dpad-left"
                onClick={() => {
                  nextPlayerDir.current = 'LEFT';
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 active:text-slate-950 text-slate-200 flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
                aria-label="Move Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col gap-1.5">
                <button
                  id="dpad-up"
                  onClick={() => {
                    nextPlayerDir.current = 'UP';
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 active:text-slate-950 text-slate-200 flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
                  aria-label="Move Up"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  id="dpad-down"
                  onClick={() => {
                    nextPlayerDir.current = 'DOWN';
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 active:text-slate-950 text-slate-200 flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
                  aria-label="Move Down"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
              <button
                id="dpad-right"
                onClick={() => {
                  nextPlayerDir.current = 'RIGHT';
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 active:bg-amber-500 active:text-slate-950 text-slate-200 flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
                aria-label="Move Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: STATS & EDUCATIONAL INFORMATION (DESKTOP)   */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:w-80 xl:w-96 2xl:w-[26rem] flex-col gap-3 shrink-0 overflow-y-auto pr-1 custom-scrollbar">
          {/* Vitals: Lives, Accuracy & Completion Meter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                PAC-HERO VITALS
              </span>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                    } transition-colors`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800/80">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] uppercase font-bold text-slate-400">ACCURACY</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  {accuracy}%
                </div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] uppercase font-bold text-slate-400">COLLECTED</div>
                <div className="text-base font-black text-white font-mono mt-0.5">
                  {itemsCollectedCount} <span className="text-[10px] text-slate-400">/ {totalItemsCount}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span>Maze Cleared</span>
                <span>{totalItemsCount > 0 ? Math.round((itemsCollectedCount / totalItemsCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${totalItemsCount > 0 ? (itemsCollectedCount / totalItemsCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* PROMINENT ACTIVE LEARNING CARD */}
          <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ACTIVE LEARNING CONCEPT
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono text-[9px]">
                {activeReveal ? 'JUST COLLECTED' : 'CONCEPT FOCUS'}
              </span>
            </div>

            {(() => {
              const displayItem = activeReveal?.item || latestConcept || selectedCategory.items[0];
              return displayItem ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-center shadow-lg shrink-0">
                      <CollectibleVisual item={displayItem} size={44} glow />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                        {displayItem.category}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight mt-0.5">
                        {displayItem.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                    {displayItem.description}
                  </div>
                </div>
              ) : (
                <div className="py-6 px-3 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-2 text-slate-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-300">Navigate and chomp objects!</div>
                  <div className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    Each collected concept will appear here with its full scientific definition.
                  </div>
                </div>
              );
            })()}
          </div>

          {/* REAL-TIME DISCOVERY CATALOG FEED */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                DISCOVERY LOG
              </span>
              <span className="font-mono text-emerald-400">
                {learnedItems.length} UNLOCKED
              </span>
            </div>

            {learnedItems.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {learnedItems.slice().reverse().map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800">
                      <CollectibleVisual item={item} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No items collected yet in this run.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
