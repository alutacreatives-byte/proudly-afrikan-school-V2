import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Grid,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Compass,
  X,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Volume2,
  CheckCircle2,
  ExternalLink,
  Bookmark,
} from 'lucide-react';
import { SavedResource } from '../types';
import { saveResourceToStorage } from '../utils/storage';

export interface SlideItem {
  id?: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  slideContent?: string;
  bullets?: string[];
  keyPoints?: string[];
  speakerNotes?: string;
  visualCue?: string;
  layout?: string;
  conceptBadge?: string;
}

interface BuildInteractivePresentationProps {
  resource: SavedResource;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
  showSpeakerNotes: boolean;
  setShowSpeakerNotes: (show: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fs: boolean) => void;
  onExportDoc?: () => void;
  onExportPdf?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

// ==========================================
// WebGL Fluid Distortion & Movement Shader
// Directly inspired by: https://codepen.io/grisum/pen/gOEQVMO
// ==========================================
const VERTEX_SHADER_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDirection;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uDistortionStrength;
  uniform float uSlideSeed;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uPrevColorA;
  uniform vec3 uPrevColorB;
  uniform vec3 uPrevColorC;
  uniform float uColorBlend;

  // Simplex 2D noise helper
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouseP = (uMouse - 0.5) * vec2(aspect, 1.0);

    // Mouse distance ripple
    float distMouse = length(p - mouseP);
    float mouseWave = sin(distMouse * 14.0 - uTime * 3.5) * exp(-distMouse * 3.8);

    // Transition wave front sweeping across screen
    float waveFront = uv.x - uProgress;
    if (uDirection < 0.0) {
      waveFront = (1.0 - uv.x) - uProgress;
    }
    float transitionPulse = sin(clamp(uProgress * 3.14159, 0.0, 3.14159));
    float transitionWave = sin(waveFront * 16.0 + uTime * 4.0) * transitionPulse * uDistortionStrength;

    // Organic Perlin noise displacement
    float noise1 = snoise(uv * 3.2 + vec2(uTime * 0.12, uSlideSeed * 0.3));
    float noise2 = snoise(uv * 6.5 - vec2(uTime * 0.18, uSlideSeed * 0.5));
    float totalDisplacement = (noise1 * 0.045 + noise2 * 0.02) + (mouseWave * 0.06) + (transitionWave * 0.09);

    // Distorted UV coords with chromatic dispersion (RGB offset)
    vec2 uvR = uv + vec2(totalDisplacement * 1.15, totalDisplacement * 0.85);
    vec2 uvG = uv + vec2(totalDisplacement * 1.0, totalDisplacement * 1.0);
    vec2 uvB = uv + vec2(totalDisplacement * 0.85, totalDisplacement * 1.15);

    // Base background dark charcoal base: #09090D
    vec3 cBg = vec3(0.035, 0.035, 0.045);

    // Smoothly blend between previous slide palette and active slide palette from dark colour treatments
    float cb = smoothstep(0.0, 1.0, uColorBlend);
    vec3 palA = mix(uPrevColorA, uColorA, cb);
    vec3 palB = mix(uPrevColorB, uColorB, cb);
    vec3 palC = mix(uPrevColorC, uColorC, cb);

    // Fluid ribbon gradient field
    float ribbon1 = sin(uvG.x * 3.8 + uvG.y * 4.2 + uTime * 0.35 + noise1 * 2.2);
    float ribbon2 = cos(uvG.x * 5.2 - uvG.y * 3.1 - uTime * 0.45 + noise2 * 2.5);
    float flow = smoothstep(-0.6, 0.9, ribbon1 * 0.5 + ribbon2 * 0.5);

    // Chromatic dispersion rendering
    float rChannel = smoothstep(-0.4, 0.8, sin(uvR.x * 3.8 + uvR.y * 4.2 + uTime * 0.35 + noise1 * 2.2));
    float gChannel = flow;
    float bChannel = smoothstep(-0.8, 0.6, cos(uvB.x * 5.2 - uvB.y * 3.1 - uTime * 0.45 + noise2 * 2.5));

    // Dynamic dark gradient blend alternating between slides
    vec3 brandGradient = mix(palA, palB, clamp(uvG.x * 0.75 + uvG.y * 0.45 + sin(uTime * 0.22) * 0.22, 0.0, 1.0));
    brandGradient = mix(brandGradient, palC, clamp(noise1 * 0.5 + 0.5, 0.0, 1.0));

    // Rich dark fluid wave intensity across ribbons (always dark, never bright or pale)
    float fluidIntensity = clamp((rChannel * 0.70 + gChannel * 0.80 + bChannel * 0.60) * 0.68, 0.0, 1.0);
    vec3 finalColor = mix(cBg, brandGradient, fluidIntensity);

    // Subtle dark glowing center halo tinted by active primary color
    float halo = exp(-length(p) * 1.5) * 0.30;
    finalColor += palA * halo;

    // Fluid crest highlight tinted by secondary color
    float crest = pow(clamp(flow * 0.9 + noise1 * 0.25, 0.0, 1.0), 2.5) * 0.20;
    finalColor += palB * crest;

    // Fluid shimmer on transition matching accent color
    finalColor += palC * transitionPulse * 0.25;

    // Corner vignette keeping text readable while retaining rich fluid edges
    float vignette = 1.0 - smoothstep(0.45, 1.35, length(uv - 0.5) * 1.3);
    finalColor *= clamp(vignette, 0.4, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface BuildColorPalette {
  name: string;
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
}

// Alternating DARK fluid background colour treatments ensuring strong text contrast:
// 1. Dark orange
// 2. Dark blue
// 3. Deep purple
// 4. Deep burgundy
// 5. Dark teal
// 6. Midnight blue
// 7. Deep indigo
// 8. Dark charcoal
const BUILD_PALETTES: BuildColorPalette[] = [
  // 1. Dark Orange: Deep burnt sienna & smoldering terracotta
  {
    name: 'Dark Orange',
    primary: [0.42, 0.16, 0.05], // Deep Burnt Sienna #6B290D
    secondary: [0.28, 0.10, 0.03], // Dark Terracotta #471A08
    accent: [0.52, 0.22, 0.07], // Smoldering Amber #853812
  },
  // 2. Dark Blue: Deep ocean sapphire & dark royal navy
  {
    name: 'Dark Blue',
    primary: [0.07, 0.15, 0.36], // Deep Navy Blue #12265C
    secondary: [0.04, 0.09, 0.24], // Midnight Ocean #0A173D
    accent: [0.12, 0.22, 0.48], // Dark Royal Blue #1F387A
  },
  // 3. Deep Purple: Royal dark plum & midnight amethyst
  {
    name: 'Deep Purple',
    primary: [0.24, 0.07, 0.34], // Royal Dark Plum #3D1257
    secondary: [0.14, 0.04, 0.22], // Midnight Violet #240A38
    accent: [0.32, 0.10, 0.44], // Dark Amethyst #521A70
  },
  // 4. Deep Burgundy: Dark wine, maroon & oxblood
  {
    name: 'Deep Burgundy',
    primary: [0.32, 0.05, 0.12], // Dark Maroon Wine #520D1F
    secondary: [0.20, 0.03, 0.08], // Deep Oxblood #330814
    accent: [0.42, 0.08, 0.16], // Black Cherry #6B1429
  },
  // 5. Dark Teal: Abyssal ocean teal & dark petrol
  {
    name: 'Dark Teal',
    primary: [0.04, 0.22, 0.24], // Deep Abyssal Teal #0A383D
    secondary: [0.02, 0.13, 0.15], // Dark Petrol #052126
    accent: [0.08, 0.28, 0.30], // Deep Cyan Trench #14474D
  },
  // 6. Midnight Blue: Starlight midnight cosmos
  {
    name: 'Midnight Blue',
    primary: [0.05, 0.09, 0.24], // Starlight Midnight #0D173D
    secondary: [0.02, 0.05, 0.15], // Deep Cosmos #050D26
    accent: [0.09, 0.15, 0.34], // Night Sky #172657
  },
  // 7. Deep Indigo: Dark twilight indigo
  {
    name: 'Deep Indigo',
    primary: [0.14, 0.07, 0.32], // Dark Mystic Indigo #241252
    secondary: [0.08, 0.03, 0.20], // Twilight Shadow #140833
    accent: [0.20, 0.11, 0.42], // Deep Violet Indigo #331C6B
  },
  // 8. Dark Charcoal: Slate graphite & smoky obsidian
  {
    name: 'Dark Charcoal',
    primary: [0.12, 0.12, 0.15], // Deep Slate Graphite #1F1F26
    secondary: [0.07, 0.07, 0.09], // Obsidian Stone #121217
    accent: [0.17, 0.17, 0.21], // Smoky Quartz #2B2B36
  },
];

function useWebGLShaderCanvas(
  slideIndex: number,
  isTransitioning: boolean,
  direction: number,
  enableWebGL: boolean,
  distortionLevel: number
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const currentSlideIndexRef = useRef<number>(slideIndex);
  const prevSlideIndexRef = useRef<number>(slideIndex);
  const colorBlendRef = useRef<number>(1.0);
  const progressRef = useRef<number>(1.0);
  const dirRef = useRef<number>(direction);
  const isTransitioningRef = useRef<boolean>(isTransitioning);
  const distortionLevelRef = useRef<number>(distortionLevel);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    distortionLevelRef.current = distortionLevel;
  }, [distortionLevel]);

  // When slideIndex changes, trigger smooth color blend from previous slide palette to new palette
  useEffect(() => {
    if (currentSlideIndexRef.current !== slideIndex) {
      prevSlideIndexRef.current = currentSlideIndexRef.current;
      currentSlideIndexRef.current = slideIndex;
      colorBlendRef.current = 0.0;
      progressRef.current = 0.0;
      dirRef.current = direction;
    }
  }, [slideIndex, direction]);

  useEffect(() => {
    if (!enableWebGL) {
      const canvas = canvasRef.current;
      if (canvas) {
        const gl = canvas.getContext('webgl');
        if (gl) {
          gl.clearColor(0.06, 0.06, 0.075, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    function createShader(type: number, src: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn('Shader compile failed', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link failed', gl.getProgramInfoLog(prog));
      return;
    }
    progRef.current = prog;
    gl.useProgram(prog);

    // Quad geometry: 2 triangles covering (-1..1)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(prog, 'uTime');
    const uProgressLoc = gl.getUniformLocation(prog, 'uProgress');
    const uDirectionLoc = gl.getUniformLocation(prog, 'uDirection');
    const uResolutionLoc = gl.getUniformLocation(prog, 'uResolution');
    const uMouseLoc = gl.getUniformLocation(prog, 'uMouse');
    const uDistStrengthLoc = gl.getUniformLocation(prog, 'uDistortionStrength');
    const uSlideSeedLoc = gl.getUniformLocation(prog, 'uSlideSeed');
    const uColorALoc = gl.getUniformLocation(prog, 'uColorA');
    const uColorBLoc = gl.getUniformLocation(prog, 'uColorB');
    const uColorCLoc = gl.getUniformLocation(prog, 'uColorC');
    const uPrevColorALoc = gl.getUniformLocation(prog, 'uPrevColorA');
    const uPrevColorBLoc = gl.getUniformLocation(prog, 'uPrevColorB');
    const uPrevColorCLoc = gl.getUniformLocation(prog, 'uPrevColorC');
    const uColorBlendLoc = gl.getUniformLocation(prog, 'uColorBlend');

    let running = true;

    function render(now: number) {
      if (!running || !gl || !progRef.current) return;

      const elapsed = (now - startTimeRef.current) * 0.001;

      // Smooth mouse follow
      mousePosRef.current.x += (targetMouseRef.current.x - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (targetMouseRef.current.y - mousePosRef.current.y) * 0.08;

      // Animate progress to 1
      if (progressRef.current < 1.0) {
        progressRef.current = Math.min(1.0, progressRef.current + 0.045);
      }

      // Smoothly animate fluid color shift between slide palettes
      if (colorBlendRef.current < 1.0) {
        colorBlendRef.current = Math.min(1.0, colorBlendRef.current + 0.035);
      }

      // Check canvas dimensions
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = Math.max(1, canvas.clientWidth);
        canvas.height = Math.max(1, canvas.clientHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.useProgram(progRef.current);
      if (uTimeLoc) gl.uniform1f(uTimeLoc, elapsed);
      if (uProgressLoc) gl.uniform1f(uProgressLoc, progressRef.current);
      if (uDirectionLoc) gl.uniform1f(uDirectionLoc, dirRef.current);
      if (uResolutionLoc) gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      if (uMouseLoc) gl.uniform2f(uMouseLoc, mousePosRef.current.x, mousePosRef.current.y);
      if (uDistStrengthLoc) gl.uniform1f(uDistStrengthLoc, (isTransitioningRef.current ? 1.6 : 0.8) * distortionLevelRef.current);
      if (uSlideSeedLoc) gl.uniform1f(uSlideSeedLoc, currentSlideIndexRef.current * 1.37);

      // Apply the same fluid background effect across every slide
      const prevPalette = BUILD_PALETTES[0];
      const curPalette = BUILD_PALETTES[0];

      if (uColorALoc) gl.uniform3fv(uColorALoc, curPalette.primary);
      if (uColorBLoc) gl.uniform3fv(uColorBLoc, curPalette.secondary);
      if (uColorCLoc) gl.uniform3fv(uColorCLoc, curPalette.accent);
      if (uPrevColorALoc) gl.uniform3fv(uPrevColorALoc, prevPalette.primary);
      if (uPrevColorBLoc) gl.uniform3fv(uPrevColorBLoc, prevPalette.secondary);
      if (uPrevColorCLoc) gl.uniform3fv(uPrevColorCLoc, prevPalette.accent);
      if (uColorBlendLoc) gl.uniform1f(uColorBlendLoc, colorBlendRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
        targetMouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      running = false;
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (gl) {
        gl.deleteBuffer(posBuffer);
        if (progRef.current) gl.deleteProgram(progRef.current);
      }
    };
  }, [enableWebGL]);

  return canvasRef;
}

export const BuildInteractivePresentation: React.FC<BuildInteractivePresentationProps> = ({
  resource,
  activeSlideIndex,
  setActiveSlideIndex,
  showSpeakerNotes,
  setShowSpeakerNotes,
  isFullscreen,
  setIsFullscreen,
  onExportDoc,
  onExportPdf,
  onSave,
  isSaved = false,
}) => {
  const [internalSaved, setInternalSaved] = useState<boolean>(false);
  const handleSave = () => {
    if (onSave) {
      onSave();
    } else if (resource) {
      saveResourceToStorage(resource);
      setInternalSaved(true);
      setTimeout(() => setInternalSaved(false), 2500);
    }
  };
  const data = (resource.data?.data && typeof resource.data.data === 'object' && !Array.isArray(resource.data.data))
    ? resource.data.data
    : (resource.data || {});
  const rawSlides: any[] = Array.isArray(data.slides) && data.slides.length > 0
    ? data.slides
    : Array.isArray((resource as any).slides) && (resource as any).slides.length > 0
      ? (resource as any).slides
      : [];

  // Standardize slides array
  const slides: SlideItem[] = rawSlides.map((s, idx) => ({
    id: s.id || `slide-${idx + 1}`,
    slideNumber: s.slideNumber || idx + 1,
    title: s.title || s.heading || `Slide ${idx + 1}`,
    subtitle: s.subtitle || s.subheading || '',
    slideContent: s.slideContent || s.content || '',
    bulletPoints: s.bulletPoints || s.bullets || s.keyPoints || [],
    speakerNotes: s.speakerNotes || s.notes || '',
    visualCue: s.visualCue || s.diagramDescription || '',
    layout: s.layout || (idx === 0 ? 'title' : idx === rawSlides.length - 1 ? 'summary' : 'concept'),
    conceptBadge: s.conceptBadge || (idx === 0 ? 'OVERVIEW' : `KEY CONCEPT 0${idx + 1}`),
  }));

  const totalSlides = slides.length;
  const currentSlide = slides[activeSlideIndex] || slides[0] || {
    slideNumber: 1,
    title: resource.title || 'Presentation',
    slideContent: 'Comprehensive curriculum presentation and analysis.',
  };

  // State
  const [transitionDirection, setTransitionDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [autoplayProgress, setAutoplayProgress] = useState<number>(0);
  const [showGridModal, setShowGridModal] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showControlsHud, setShowControlsHud] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // WebGL Fluid & 3D Interactive Controls
  const [enableWebGL, setEnableWebGL] = useState<boolean>(true);
  const [enable3DTilt, setEnable3DTilt] = useState<boolean>(true);
  const [distortionLevel, setDistortionLevel] = useState<number>(1.2);

  // 3D Parallax Tilt state (Max Knight style)
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebGL shader canvas
  const shaderCanvasRef = useWebGLShaderCanvas(
    activeSlideIndex,
    isTransitioning,
    transitionDirection,
    enableWebGL,
    distortionLevel
  );

  // Slide transition logic with animation state
  const goToSlide = useCallback(
    (targetIdx: number) => {
      if (targetIdx === activeSlideIndex || targetIdx < 0 || targetIdx >= totalSlides) return;
      const dir = targetIdx > activeSlideIndex ? 1 : -1;
      setTransitionDirection(dir);
      setIsTransitioning(true);
      setActiveSlideIndex(targetIdx);
      setAutoplayProgress(0);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 550);
    },
    [activeSlideIndex, totalSlides, setActiveSlideIndex]
  );

  const nextSlide = useCallback(() => {
    if (activeSlideIndex < totalSlides - 1) {
      goToSlide(activeSlideIndex + 1);
    } else if (isAutoplay) {
      goToSlide(0);
    }
  }, [activeSlideIndex, totalSlides, goToSlide, isAutoplay]);

  const prevSlide = useCallback(() => {
    if (activeSlideIndex > 0) {
      goToSlide(activeSlideIndex - 1);
    }
  }, [activeSlideIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setShowSpeakerNotes(!showSpeakerNotes);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowGridModal((prev) => !prev);
          break;
        case 'Escape':
          if (showGridModal) {
            e.preventDefault();
            setShowGridModal(false);
          } else if (isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nextSlide,
    prevSlide,
    goToSlide,
    totalSlides,
    isFullscreen,
    setIsFullscreen,
    showSpeakerNotes,
    setShowSpeakerNotes,
    showGridModal,
  ]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = 50; // tick every 50ms
    const totalDuration = 7000; // 7 seconds per slide
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoplay, nextSlide]);

  // Presentation stopwatch timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Mouse Parallax Tilt handler
  const handleMouseMoveArena = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current || !enable3DTilt) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normalizedY = (y / rect.height - 0.5) * 2; // -1 to 1

    // Subtly tilt within max 9 degrees for smooth feel
    setTilt({
      rx: -normalizedY * 7,
      ry: normalizedX * 9,
    });

    // Reset HUD inactivity timer in fullscreen
    if (isFullscreen) {
      setShowControlsHud(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        setShowControlsHud(false);
      }, 3500);
    }
  };

  const handleMouseLeaveArena = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Touch Swipe handlers for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  // Wheel / trackpad gesture navigation (debounced)
  const wheelLockRef = useRef<boolean>(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaX) > 40 || Math.abs(e.deltaY) > 60) {
      wheelLockRef.current = true;
      if (e.deltaX > 40 || e.deltaY > 60) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    }
  };

  // Copy slide text
  const handleCopySlideText = () => {
    const text = `${currentSlide.title}\n${currentSlide.subtitle || ''}\n\nKey Points:\n${(
      currentSlide.bulletPoints || []
    )
      .map((b) => `• ${b}`)
      .join('\n')}\n\nSpeaker Notes:\n${currentSlide.speakerNotes || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Download standalone interactive HTML deck
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${resource.title || 'Proudly Afrikan Presentation'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at top right, violet 2%, #D38312 30%, transparent), radial-gradient(circle at bottom center, green -15%, blue 50%, yellow);
      background-size: 300% 300%;
      background-position: 0% 0%;
      animation: gradient 20s ease infinite;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @keyframes gradient {
      33% { background-position: 0% 50%; }
      66% { background-position: 100% 0%; }
      100% { background-position: 0% 0%; }
    }
    header {
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(15,15,18,0.85);
      backdrop-filter: blur(10px);
    }
    .brand {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #E05A2B;
      text-transform: uppercase;
      font-family: monospace;
    }
    .topic {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
    }
    .slide-card {
      width: 100%;
      max-width: 960px;
      min-height: 480px;
      background: linear-gradient(145deg, #18181d, #121215);
      border: 1px solid rgba(224,90,43,0.25);
      border-radius: 28px;
      padding: 48px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      color: #D99B00;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: monospace;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.15;
      text-transform: uppercase;
      background: linear-gradient(to right, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    p.subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 28px;
      line-height: 1.5;
    }
    ul.bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    ul.bullets li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 17px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    ul.bullets li::before {
      content: "•";
      color: #E05A2B;
      font-size: 24px;
      line-height: 1;
    }
    footer {
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: rgba(15,15,18,0.85);
    }
    .nav-btn {
      background: #E05A2B;
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
      font-family: monospace;
    }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .counter { font-family: monospace; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <div class="brand">PROUDLY AFRIKAN • INTERACTIVE DECK</div>
    <div class="topic">${resource.title || 'Curriculum Deck'}</div>
  </header>
  <main class="stage">
    <div class="slide-card" id="slideBox">
      <div>
        <div class="badge" id="slideBadge"></div>
        <h1 id="slideTitle"></h1>
        <p class="subtitle" id="slideSubtitle"></p>
        <ul class="bullets" id="slideBullets"></ul>
      </div>
    </div>
  </main>
  <footer>
    <button class="nav-btn" id="prevBtn">← PREV</button>
    <div class="counter" id="slideCounter"></div>
    <button class="nav-btn" id="nextBtn">NEXT →</button>
  </footer>
  <script>
    const slides = ${JSON.stringify(slides)};
    let cur = 0;
    function render() {
      const s = slides[cur];
      document.getElementById('slideBadge').textContent = 'SLIDE ' + s.slideNumber + ' OF ' + slides.length;
      document.getElementById('slideTitle').textContent = s.title;
      document.getElementById('slideSubtitle').textContent = s.subtitle || '';
      const bContainer = document.getElementById('slideBullets');
      bContainer.innerHTML = '';
      (s.bulletPoints || []).forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        bContainer.appendChild(li);
      });
      document.getElementById('slideCounter').textContent = (cur + 1) + ' / ' + slides.length;
      document.getElementById('prevBtn').disabled = cur === 0;
      document.getElementById('nextBtn').disabled = cur === slides.length - 1;
    }
    document.getElementById('prevBtn').onclick = () => { if(cur > 0) { cur--; render(); } };
    document.getElementById('nextBtn').onclick = () => { if(cur < slides.length - 1) { cur++; render(); } };
    window.onkeydown = (e) => {
      if(e.key === 'ArrowRight' || e.key === ' ') { if(cur < slides.length - 1) { cur++; render(); } }
      else if(e.key === 'ArrowLeft') { if(cur > 0) { cur--; render(); } }
    };
    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resource.title || 'presentation').toLowerCase().replace(/\s+/g, '-')}-interactive-deck.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bullets = currentSlide.bulletPoints || [];
  const prevSlideItem = activeSlideIndex > 0 ? slides[activeSlideIndex - 1] : null;
  const nextSlideItem = activeSlideIndex < totalSlides - 1 ? slides[activeSlideIndex + 1] : null;

  return (
    <div
      className={`w-full transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-[#0A0A0C] text-white flex flex-col justify-between overflow-hidden'
          : 'space-y-6'
      }`}
    >
      {/* ============================================================== */}
      {/* Top Deck Navigation & Meta Header (Sleek Glass Lozenge)       */}
      {/* ============================================================== */}
      <div
        className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm transition-opacity duration-300 ${
          isFullscreen && !showControlsHud ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isFullscreen ? 'absolute top-4 left-4 right-4 z-50 bg-[#161619]/90 border-stone-800 text-white' : ''}`}
      >
        {/* Left: Brand Kicker & Slide Progress Segment */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#E05A2B] to-[#D99B00] animate-pulse" />
            <span className="font-mono text-xs font-bold text-stone-900 tracking-wider uppercase">
              {isFullscreen ? 'FULLSCREEN 3D THEATER' : 'INTERACTIVE DECK'}
            </span>
          </div>

          <span className="text-stone-300 font-mono hidden sm:inline">•</span>

          <div className="hidden md:flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-xs font-bold text-[#E05A2B] shrink-0">
              {String(activeSlideIndex + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs text-stone-400">/</span>
            <span className="font-mono text-xs text-stone-500 shrink-0">
              {String(totalSlides).padStart(2, '0')}
            </span>
            <span className="text-stone-700 text-xs truncate max-w-[200px] lg:max-w-xs font-medium ml-1">
              — {currentSlide.title}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Stopwatch elapsed timer */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200 text-stone-700 font-mono text-xs cursor-pointer hover:bg-stone-200/60 transition-colors"
            title="Click to pause/resume lecture timer"
          >
            <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-[#E05A2B]' : 'text-stone-400'}`} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Autoplay Toggle Button with progress ring */}
          <button
            type="button"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoplay
                ? 'bg-gradient-to-r from-[#E05A2B] to-[#D99B00] text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
            title="Toggle automatic presentation playback (7s per slide)"
          >
            {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#E05A2B]" />}
            <span className="hidden sm:inline">{isAutoplay ? 'PLAYING' : 'AUTOPLAY'}</span>
          </button>

          {/* Grid Overview Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowGridModal(true)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
            title="Slide overview grid (G key)"
          >
            <Grid className="w-4 h-4 text-stone-700" />
          </button>

          {/* Speaker Notes Toggle */}
          <button
            type="button"
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSpeakerNotes
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600'
            }`}
            title="Toggle speaker lecture notes (N key)"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Copy slide text */}
          <button
            type="button"
            onClick={handleCopySlideText}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Copy current slide text"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Save Word (.doc) and PDF */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            title="Save presentation"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>{isSaved || internalSaved ? 'Saved!' : 'Save'}</span>
          </button>

          {onExportDoc && (
            <button
              type="button"
              onClick={onExportDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
              title="Download Word (.doc)"
            >
              <Download className="w-3.5 h-3.5 text-stone-700" />
              <span>Word (.doc)</span>
            </button>
          )}

          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5 text-stone-700" />
              <span>PDF</span>
            </button>
          )}

          {/* WebGL Fluid Toggle */}
          <button
            type="button"
            onClick={() => setEnableWebGL(!enableWebGL)}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase items-center gap-1 transition-all cursor-pointer ${
              enableWebGL
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
            title="Toggle WebGL fluid movement & surface distortion"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D99B00]" />
            <span>FLUID</span>
          </button>

          {/* 3D Tilt Toggle */}
          <button
            type="button"
            onClick={() => {
              setEnable3DTilt(!enable3DTilt);
              if (enable3DTilt) setTilt({ rx: 0, ry: 0 });
            }}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase items-center gap-1 transition-all cursor-pointer ${
              enable3DTilt
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
            title="Toggle 3D card tilt & depth interaction"
          >
            <Layers className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>3D TILT</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#161619] hover:bg-stone-800 text-white shadow-sm transition-all cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen presentation (F key)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-[#D99B00]" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Main 3D Presentation Arena Stage (Max Knight BaVveWM style)   */}
      {/* ============================================================== */}
      <div
        ref={arenaRef}
        onMouseMove={handleMouseMoveArena}
        onMouseLeave={handleMouseLeaveArena}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ perspective: '1200px' }}
        className={`relative w-full rounded-[2.5rem] bg-[#0E0E12] overflow-hidden flex items-center justify-center transition-all ${
          isFullscreen ? 'h-full rounded-none' : 'min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]'
        }`}
      >
        {/* Animated Radial Gradient Background from CodePen: https://codepen.io/BlogFire/pen/wvzMexO */}
        <div
          className="presentation-codepen-wvzmexo absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at top right, violet 2%, #D38312 30%, transparent), radial-gradient(circle at bottom center, green -15%, blue 50%, yellow)',
            backgroundSize: '300% 300%',
            backgroundPosition: '0% 0%',
            animation: 'codepenWvzMexO 20s ease infinite',
          }}
        />

        {/* Ambient Overlay for High Contrast Text Readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none z-1" />

        {/* Active Center Slide (Layered 3D Tilt Card with Parallax Depth) */}
        <div
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0px)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.14s ease-out',
          }}
          className={`relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between min-h-[460px] sm:min-h-[520px] transition-opacity duration-300 ${
            isTransitioning ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Card Top: Metadata and Concept Kicker with 3D Depth */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="flex items-center justify-between gap-4 pb-4 border-b border-white/10"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D99B00] px-3 py-1 rounded-full bg-[#D99B00]/15 border border-[#D99B00]/30 shadow-xs">
                {currentSlide.conceptBadge || `TOPIC INSIGHT • SLIDE ${currentSlide.slideNumber}`}
              </span>
              {(resource.data?.credibleSourceUrl || (resource as any).credibleSourceUrl) && (
                <a
                  href={resource.data?.credibleSourceUrl || (resource as any).credibleSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
                  title={`Researched & verified against credible sources: ${resource.data?.sourceName || (resource as any).sourceName || 'Web Archives'}`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>VERIFIED RESEARCH</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>
              )}
              <span className="font-mono text-xs text-stone-400 hidden sm:inline">
                {resource.subject || 'Curriculum Domain'}
              </span>
            </div>

            <div className="font-mono text-xs font-bold text-stone-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B]" />
              <span>
                {currentSlide.slideNumber} OF {totalSlides}
              </span>
            </div>
          </div>

          {/* Card Middle: Main Pedagogical Content & Visuals */}
          <div
            style={{ transform: 'translateZ(50px)' }}
            className="my-auto py-6 sm:py-8 space-y-6"
          >
            {/* Slide Title with Brand Accent */}
            <div className="space-y-3">
              <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-[1.05] drop-shadow-md">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="font-sans text-base sm:text-xl text-stone-300 max-w-2xl font-normal leading-relaxed">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Content (Paragraphs) */}
            {currentSlide.slideContent && (
              <div className="pt-4 space-y-4">
                <p className="font-sans text-lg text-stone-100 font-normal leading-relaxed">
                  {currentSlide.slideContent}
                </p>
              </div>
            )}
            
            {/* Fallback rendering for older content without slideContent */}
            {!currentSlide.slideContent && currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
              <div className="pt-4 space-y-4">
                {currentSlide.bulletPoints.map((point: string, idx: number) => (
                  <p key={idx} className="font-sans text-lg text-stone-100 font-normal leading-relaxed">
                    {point}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Card Bottom: Navigation Hints and Slide Dots Progress */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-stone-400"
          >
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-stone-300 font-bold">←</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-stone-300 font-bold">→</span>
              <span>keys or swipe to navigate</span>
            </div>

            {/* Mini Dots indicator */}
            <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => goToSlide(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === activeSlideIndex
                      ? 'w-7 bg-gradient-to-r from-[#E05A2B] to-[#D99B00]'
                      : 'w-2 bg-stone-700 hover:bg-stone-500'
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-300">
              <span>{Math.round(((activeSlideIndex + 1) / totalSlides) * 100)}% COMPLETE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PREVIOUS and NEXT Navigation Directly Below Presentation       */}
      {/* ============================================================== */}
      <div className={`w-full flex items-center justify-between gap-4 py-2 ${isFullscreen ? 'px-4 z-40 bg-black/60 backdrop-blur-md rounded-2xl' : ''}`}>
        <button
          type="button"
          disabled={activeSlideIndex === 0}
          onClick={prevSlide}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 font-mono text-xs font-bold uppercase hover:bg-stone-50 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-[#E05A2B]" />
          <span>PREVIOUS</span>
        </button>

        <div className={`font-mono text-xs font-bold ${isFullscreen ? 'text-stone-300' : 'text-stone-500'}`}>
          SLIDE {activeSlideIndex + 1} OF {totalSlides}
        </div>

        <button
          type="button"
          disabled={activeSlideIndex >= totalSlides - 1}
          onClick={nextSlide}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E05A2B] via-[#EA8B1C] to-[#D99B00] text-white font-mono text-xs font-bold uppercase hover:opacity-95 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          <span>NEXT</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* Speaker Notes Drawer (Collapsible & Pedagogically Formatted)   */}
      {/* ============================================================== */}
      {showSpeakerNotes && currentSlide.speakerNotes && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span className="font-mono text-xs font-bold text-amber-900 uppercase tracking-wider">
                Speaker & Lecture Guide • Slide {currentSlide.slideNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSpeakerNotes(false)}
              className="text-amber-800 hover:text-amber-950 font-mono text-xs font-bold"
            >
              Hide Notes
            </button>
          </div>
          <p className="font-sans text-xs sm:text-sm text-amber-950 leading-relaxed">
            {currentSlide.speakerNotes}
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* Slide Overview Grid Modal (Triggered by 'G' or Grid Icon)      */}
      {/* ============================================================== */}
      {showGridModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-5xl max-h-[85vh] bg-[#121216] border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl overflow-hidden text-white">
            {/* Grid Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <Grid className="w-5 h-5 text-[#E05A2B]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                  Slide Deck Overview ({totalSlides} Slides)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGridModal(false)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Items */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-1">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    goToSlide(idx);
                    setShowGridModal(false);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                    idx === activeSlideIndex
                      ? 'border-[#E05A2B] bg-gradient-to-br from-[#1c1410] to-[#121215] shadow-lg ring-2 ring-[#E05A2B]/40'
                      : 'border-stone-800 bg-stone-900/60 hover:border-stone-600 hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span className="font-bold text-[#D99B00]">SLIDE {s.slideNumber}</span>
                    <span className="text-[10px] uppercase truncate max-w-[120px]">
                      {s.conceptBadge || 'CONCEPT'}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-base uppercase text-stone-100 group-hover:text-white line-clamp-2">
                    {s.title}
                  </h4>

                  <p className="font-sans text-xs text-stone-400 line-clamp-2">
                    {s.subtitle || (s.bulletPoints && s.bulletPoints[0]) || ''}
                  </p>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono font-bold text-[#E05A2B]">
                    <span>{(s.bulletPoints || []).length} key takeaways</span>
                    <span>SELECT →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
