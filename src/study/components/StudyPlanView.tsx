import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StudyPlanDuration, StudyConcept, AppView, StudySet } from '../types';
import { StorageService } from '../services/storageService';
import { AIService } from '../services/aiService';
import { isTextCorruptedOrUnreadable } from '../utils/textValidation';
import { GlobalNavigationButtons } from './GlobalNavigationButtons';
import { CameraCaptureModal } from './CameraCaptureModal';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  RotateCcw,
  Zap,
  Target,
  CheckCircle2,
  CalendarDays,
  Calendar,
  GraduationCap,
  Search,
  AlertCircle,
  BarChart3,
  Brain,
  ShieldAlert,
  Flame,
  Type,
  ClipboardList,
  Upload,
  Camera,
  Paperclip,
  Trash2,
  Loader2,
  FileText
} from 'lucide-react';

interface StudyPlanViewProps {
  onStartSession: (concepts: StudyConcept[], title: string, durationMinutes: number, targetMode?: AppView) => void;
  onExploreSets: () => void;
  onBack?: () => void;
  onGoHome?: () => void;
  initialInputMethod?: PlannerInputMethod;
}

export type StudyGoal = 'learn_new' | 'exam_prep' | 'improve_weak' | 'spaced_review';
export type ScheduleTarget = 'today' | 'tomorrow' | 'custom_date';
export type PlannerInputMethod = 'type' | 'paste' | 'upload' | 'capture';

export interface PlannerUploadedDoc {
  name: string;
  size: number;
  text: string;
  wordCount?: number;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  onStartSession,
  onExploreSets,
  onBack,
  onGoHome,
  initialInputMethod = 'type',
}) => {
  // Storage data
  const allSets = useMemo(() => StorageService.getAllSets(), []);
  const userStats = useMemo(() => StorageService.getUserStats(), []);
  const performances = useMemo(() => StorageService.getPerformances(), []);
  const conceptsNeedingReview = useMemo(() => StorageService.getConceptsNeedingReview(), []);

  // Extract unique subjects from sets
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allSets.forEach(s => {
      if (s.category) subjects.add(s.category.trim());
    });
    return Array.from(subjects);
  }, [allSets]);

  // --- 1. WHAT: Study Input Method (TYPE IT | PASTE IT | UPLOAD IT | CAPTURE IT) & Subject/Topic ---
  const [inputMethod, setInputMethod] = useState<PlannerInputMethod>(initialInputMethod);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL SUBJECTS');
  const [typedTopic, setTypedTopic] = useState<string>('');
  
  // Pasted Notes State
  const [pastedNotes, setPastedNotes] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');

  // Uploaded Document State
  const [uploadedDoc, setUploadedDoc] = useState<PlannerUploadedDoc | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Captured Camera Photo State (CAPTURE IT)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string>('');
  const [capturedText, setCapturedText] = useState<string>('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [cameraPhotoError, setCameraPhotoError] = useState<string | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic generated set state for custom inputs (topic/notes/doc/photo)
  const [customGeneratedConcepts, setCustomGeneratedConcepts] = useState<StudyConcept[] | null>(null);
  const [isGeneratingCustomPlan, setIsGeneratingCustomPlan] = useState<boolean>(false);
  const [customGenerationError, setCustomGenerationError] = useState<string | null>(null);

  // --- 2. WHY: Learning Goal ---
  const [selectedGoal, setSelectedGoal] = useState<StudyGoal>('exam_prep');

  // --- 3. WHEN: Study Timing / Target Date ---
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget>('today');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [customDate, setCustomDate] = useState<string>(todayStr);

  // --- 4. HOW LONG: Duration (10, 30, 60 minutes) ---
  const [selectedDuration, setSelectedDuration] = useState<StudyPlanDuration>(30);

  // Synchronize initial input method if changed (never auto-open camera on mount)
  useEffect(() => {
    if (initialInputMethod) {
      setInputMethod(initialInputMethod);
    }
  }, [initialInputMethod]);

  // Reset custom generated concepts when user changes input method or text
  useEffect(() => {
    setCustomGeneratedConcepts(null);
    setCustomGenerationError(null);
  }, [inputMethod, typedTopic, pastedNotes, uploadedDoc, capturedImage, capturedText]);

  // Handle document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setDocUploadError('Maximum upload size is 20 MB. Please upload a smaller document.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsParsingDoc(true);
    setDocUploadError(null);

    try {
      const parsed = await AIService.parseDocument(file);
      const isCorrupted = isTextCorruptedOrUnreadable(parsed.text);

      const docData: PlannerUploadedDoc = {
        name: file.name,
        size: file.size,
        text: isCorrupted ? '' : parsed.text,
        wordCount: isCorrupted ? 0 : parsed.wordCount,
      };
      setUploadedDoc(docData);

      if (!customTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setCustomTitle(cleanName);
      }
    } catch (err: any) {
      setDocUploadError('Failed to parse uploaded document. Please try again.');
    } finally {
      setIsParsingDoc(false);
    }
  };

  const handleRemoveUploadedDoc = () => {
    setUploadedDoc(null);
    setDocUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle camera photo capture (CAPTURE IT)
  const handlePhotoCaptured = async (photoBlob: Blob, photoDataUrl: string, fileName: string) => {
    setCapturedImage(photoDataUrl);
    setCapturedFileName(fileName);
    setCameraPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const file = new File([photoBlob], fileName, { type: photoBlob.type || 'image/jpeg' });
      const parsed = await AIService.parseDocument(file);
      const isCorrupted = isTextCorruptedOrUnreadable(parsed.text);
      const cleanText = isCorrupted ? '' : parsed.text;
      setCapturedText(cleanText || 'Transcribed study material ready for analysis and drills.');

      if (!customTitle) {
        setCustomTitle(`Photographed Material • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
    } catch (err: any) {
      console.warn('Photo OCR parsing warning:', err);
      setCapturedText('Photographed study material ready for curriculum generation.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleClearCapturedPhoto = () => {
    setCapturedImage(null);
    setCapturedFileName('');
    setCapturedText('');
    setCameraPhotoError(null);
    if (cameraFileInputRef.current) {
      cameraFileInputRef.current.value = '';
    }
  };

  // Goal configurations
  const studyGoals: {
    id: StudyGoal;
    title: string;
    tagline: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'learn_new',
      title: 'LEARN A NEW TOPIC',
      tagline: 'Foundations & Concept Discovery',
      description: 'Prioritizes unstudied concepts with in-depth explanations, key terminology, and step-by-step recall prompts.',
      icon: BookOpen,
    },
    {
      id: 'exam_prep',
      title: 'EXAM PREPARATION',
      tagline: 'High-Yield Balanced Mastery',
      description: 'Curates representative high-frequency topics, core definitions, and formative test questions with immediate feedback.',
      icon: GraduationCap,
    },
    {
      id: 'improve_weak',
      title: 'IMPROVE WEAK AREAS',
      tagline: 'Target Struggled Concepts',
      description: 'Targets concepts flagged as needing review, previous practice mistakes, and low-confidence flashcard ratings.',
      icon: ShieldAlert,
    },
    {
      id: 'spaced_review',
      title: 'RAPID SPACED REPETITION',
      tagline: 'Long-Term Memory Retention',
      description: 'Optimized active recall queue designed to interrupt forgetting curves and reinforce learned knowledge.',
      icon: RotateCcw,
    },
  ];

  // Duration options: 10 MINUTES | 30 MINUTES | 1 HOUR
  const quickDurations: { 
    min: StudyPlanDuration; 
    label: string; 
    tag: string; 
    description: string;
    breakdown: { learn: number; flashcards: number; practice: number; review: number };
  }[] = [
    { 
      min: 10, 
      label: '10 MINUTES', 
      tag: 'QUICK SPRINT', 
      description: 'High-yield focused session covering active recall on essential concepts and targeted reinforcement.',
      breakdown: { learn: 3, flashcards: 3, practice: 3, review: 1 }
    },
    { 
      min: 30, 
      label: '30 MINUTES', 
      tag: 'STANDARD SESSION', 
      description: 'Balanced multi-topic curriculum session with dedicated conceptual learning, tactile flashcards, and formative practice.',
      breakdown: { learn: 10, flashcards: 8, practice: 8, review: 4 }
    },
    { 
      min: 60, 
      label: '1 HOUR', 
      tag: 'DEEP MASTERY', 
      description: 'Comprehensive curriculum deep-dive progressing through full concept study, testing, and spaced repetition.',
      breakdown: { learn: 20, flashcards: 15, practice: 15, review: 10 }
    },
  ];

  // Calculate subject mastery for active subject
  const currentSubjectMastery = useMemo(() => {
    if (selectedSubject === 'ALL SUBJECTS') {
      const entries = Object.values(userStats.subjectMastery || {}) as { percentage: number; mastered: number; total: number }[];
      if (entries.length === 0) return { percentage: 0, mastered: 0, total: 0 };
      const avg = entries.reduce((acc: number, curr) => acc + (curr.percentage || 0), 0) / entries.length;
      return { percentage: Math.round(avg), mastered: 0, total: 0 };
    }
    const matchingKey = Object.keys(userStats.subjectMastery || {}).find(
      k => k.toUpperCase() === selectedSubject.toUpperCase() ||
           selectedSubject.toUpperCase().includes(k.toUpperCase())
    );
    if (matchingKey && userStats.subjectMastery[matchingKey]) {
      return userStats.subjectMastery[matchingKey];
    }
    return { percentage: 0, mastered: 0, total: 0 };
  }, [selectedSubject, userStats.subjectMastery]);

  // Target count based on duration
  const targetCount = selectedDuration === 10 ? 5 : selectedDuration === 30 ? 10 : 18;

  // --- Strict Concept Curation Logic ---
  const curatedPlan = useMemo(() => {
    // If custom generated concepts are already active (from user's typed topic, notes, or doc)
    if (customGeneratedConcepts && customGeneratedConcepts.length > 0) {
      const activeConcepts = customGeneratedConcepts.slice(0, targetCount);
      const activeTitle = customTitle || (inputMethod === 'paste' ? 'Custom Study Notes' : inputMethod === 'upload' ? (uploadedDoc?.name || 'Custom Document') : inputMethod === 'capture' ? (capturedFileName || 'Captured Study Material') : typedTopic);
      
      const conceptsWithReasons = activeConcepts.map((c, idx) => ({
        concept: c,
        reasonTag: idx === 0 ? 'Core Foundation' : idx % 2 === 0 ? 'Key Mechanism' : 'Reinforcement Concept'
      }));

      return {
        title: `${selectedDuration}-Minute Plan • ${activeTitle}`,
        durationMinutes: selectedDuration,
        concepts: activeConcepts,
        conceptsWithReasons,
        rationale: `Personalized study plan derived strictly from your provided ${inputMethod === 'paste' ? 'study notes' : inputMethod === 'upload' ? 'document' : inputMethod === 'capture' ? 'photographed study material' : 'topic'}. Calibrated for sequential recall, flashcards, and formative checks.`,
        weakCount: 0,
        newCount: activeConcepts.length,
        isCustomSourced: true,
      };
    }

    // 1. Filter existing sets by WHAT
    let candidatePool: StudyConcept[] = [];
    const activeQuery = typedTopic.trim().toLowerCase();

    if (inputMethod === 'type') {
      if (activeQuery) {
        // Strict topic query search across all concepts
        const matchedConcepts = allSets.flatMap(s => s.concepts).filter(c => {
          const titleMatch = c.title.toLowerCase().includes(activeQuery);
          const summaryMatch = c.summary.toLowerCase().includes(activeQuery);
          const tagMatch = Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(activeQuery));
          const catMatch = (c.category || '').toLowerCase().includes(activeQuery);
          return titleMatch || summaryMatch || tagMatch || catMatch;
        });

        if (matchedConcepts.length > 0) {
          candidatePool = matchedConcepts;
        } else {
          // If no existing concept matches the typed topic exactly, filter by selected subject if not ALL
          if (selectedSubject !== 'ALL SUBJECTS') {
            candidatePool = allSets.filter(s => 
              s.category?.toUpperCase() === selectedSubject.toUpperCase() ||
              s.title?.toUpperCase().includes(selectedSubject.toUpperCase())
            ).flatMap(s => s.concepts);
          } else {
            // General pool
            candidatePool = allSets.flatMap(s => s.concepts);
          }
        }
      } else if (selectedSubject === 'ALL SUBJECTS') {
        candidatePool = allSets.flatMap(s => s.concepts);
      } else {
        const matchedSets = allSets.filter(s => 
          s.category?.toUpperCase() === selectedSubject.toUpperCase() ||
          s.title?.toUpperCase().includes(selectedSubject.toUpperCase())
        );
        candidatePool = matchedSets.flatMap(s => s.concepts);
        if (candidatePool.length === 0) {
          candidatePool = allSets.flatMap(s => s.concepts);
        }
      }
    } else {
      // For paste or upload before generation, show ready preview or fallback
      candidatePool = allSets.flatMap(s => s.concepts);
    }

    // 2. Classify candidate concepts by user mastery records
    const weakConcepts: StudyConcept[] = [];
    const unstudiedConcepts: StudyConcept[] = [];
    const inProgressConcepts: StudyConcept[] = [];
    const masteredConcepts: StudyConcept[] = [];

    candidatePool.forEach(c => {
      const perf = performances[c.id];
      if (!perf || perf.totalReviews === 0) {
        unstudiedConcepts.push(c);
      } else if (perf.needsReview || perf.lastRating === 'did_not_know' || perf.lastRating === 'almost' || (perf.practiceTotalCount > 0 && perf.practiceCorrectCount / perf.practiceTotalCount < 0.6)) {
        weakConcepts.push(c);
      } else if (perf.consecutiveConfident >= 2 && !perf.needsReview) {
        masteredConcepts.push(c);
      } else {
        inProgressConcepts.push(c);
      }
    });

    // 3. Select and order concepts according to the selected WHY (Goal)
    let chosenConcepts: { concept: StudyConcept; reasonTag: string }[] = [];

    if (selectedGoal === 'improve_weak') {
      weakConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Needs Reinforcement' }));
      if (chosenConcepts.length < targetCount) {
        inProgressConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'In Progress' }));
      }
      if (chosenConcepts.length < targetCount) {
        unstudiedConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'New Topic' }));
      }
      if (chosenConcepts.length < targetCount) {
        masteredConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Retention Check' }));
      }
    } else if (selectedGoal === 'learn_new') {
      const sortedUnstudied = [...unstudiedConcepts].sort((a, b) => {
        const diffOrder = { Easy: 1, Medium: 2, Advanced: 3 };
        return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
      });
      sortedUnstudied.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'New Foundation' }));
      if (chosenConcepts.length < targetCount) {
        inProgressConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'In Progress' }));
      }
      if (chosenConcepts.length < targetCount) {
        weakConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Review Gap' }));
      }
    } else if (selectedGoal === 'spaced_review') {
      const reviewQueue = conceptsNeedingReview
        .filter(c => candidatePool.some(cand => cand.id === c.id));
      
      reviewQueue.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Spaced Repetition' }));
      if (chosenConcepts.length < targetCount) {
        weakConcepts.filter(w => !chosenConcepts.some(x => x.concept.id === w.id)).forEach(c => {
          chosenConcepts.push({ concept: c, reasonTag: 'Needs Review' });
        });
      }
      if (chosenConcepts.length < targetCount) {
        inProgressConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Active Recall' }));
      }
      if (chosenConcepts.length < targetCount) {
        unstudiedConcepts.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Next Concept' }));
      }
    } else {
      // exam_prep
      const weakSlice = weakConcepts.slice(0, Math.ceil(targetCount * 0.4));
      const unstudiedSlice = unstudiedConcepts.slice(0, Math.ceil(targetCount * 0.4));
      const inProgSlice = inProgressConcepts.slice(0, Math.max(0, targetCount - weakSlice.length - unstudiedSlice.length));
      
      weakSlice.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'High-Yield Weak Area' }));
      unstudiedSlice.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Core Syllabus' }));
      inProgSlice.forEach(c => chosenConcepts.push({ concept: c, reasonTag: 'Formative Practice' }));

      if (chosenConcepts.length < targetCount) {
        candidatePool.forEach(c => {
          if (!chosenConcepts.some(x => x.concept.id === c.id)) {
            chosenConcepts.push({ concept: c, reasonTag: 'Core Concept' });
          }
        });
      }
    }

    const finalConceptsWithReasons = chosenConcepts.slice(0, targetCount);
    const finalConcepts = finalConceptsWithReasons.map(x => x.concept);

    // Dynamic Title & Pedagogical Rationale
    let targetLabel = selectedSubject === 'ALL SUBJECTS' ? 'Curriculum' : selectedSubject;
    if (typedTopic.trim()) {
      targetLabel = typedTopic.trim();
    }

    const goalTitleMap: Record<StudyGoal, string> = {
      learn_new: 'New Topic Acquisition',
      exam_prep: 'Exam Preparation Sprint',
      improve_weak: 'Weak Area Reinforcement',
      spaced_review: 'Spaced Memory Session',
    };

    const title = `${selectedDuration}-Minute ${goalTitleMap[selectedGoal]} • ${targetLabel}`;

    let rationale = '';
    const weakCountInSession = finalConceptsWithReasons.filter(r => r.reasonTag.includes('Weak') || r.reasonTag.includes('Needs')).length;
    const newCountInSession = finalConceptsWithReasons.filter(r => r.reasonTag.includes('New') || r.reasonTag.includes('Syllabus') || r.reasonTag.includes('Foundation')).length;

    if (selectedGoal === 'improve_weak') {
      rationale = `Calibrated for your knowledge gaps: prioritizing ${weakCountInSession} flagged concepts from previous sessions to achieve solid retention before moving ahead.`;
    } else if (selectedGoal === 'learn_new') {
      rationale = `Structured discovery progression: covers ${newCountInSession} unstudied concepts from foundational definitions to concrete applications and formative tests.`;
    } else if (selectedGoal === 'spaced_review') {
      rationale = `Spaced repetition queue: targets memory nodes approaching forgetting thresholds to maximize recall efficiency.`;
    } else {
      rationale = `Exam-oriented synthesis: blends ${weakCountInSession} key reinforcement items with ${newCountInSession} core topics to ensure well-rounded examination readiness.`;
    }

    return {
      title,
      durationMinutes: selectedDuration,
      concepts: finalConcepts,
      conceptsWithReasons: finalConceptsWithReasons,
      rationale,
      weakCount: weakCountInSession,
      newCount: newCountInSession,
      isCustomSourced: false,
    };
  }, [
    inputMethod,
    selectedSubject, 
    typedTopic,
    pastedNotes,
    uploadedDoc,
    customTitle,
    customGeneratedConcepts,
    selectedGoal, 
    selectedDuration, 
    allSets, 
    performances, 
    conceptsNeedingReview,
    targetCount
  ]);

  // Handler to generate concepts from custom input (typed topic, pasted notes, uploaded doc)
  const handleGenerateCustomInputPlan = async () => {
    let contentToStudy = '';
    let topicToStudy = '';

    if (inputMethod === 'type') {
      topicToStudy = typedTopic.trim() || selectedSubject;
      contentToStudy = topicToStudy;
    } else if (inputMethod === 'paste') {
      contentToStudy = pastedNotes.trim();
      topicToStudy = customTitle.trim() || 'Custom Study Notes';
      if (!contentToStudy) {
        setCustomGenerationError('Please paste your study notes or text first.');
        return;
      }
    } else if (inputMethod === 'upload') {
      contentToStudy = uploadedDoc?.text || '';
      topicToStudy = customTitle.trim() || uploadedDoc?.name || 'Custom Document Study';
      if (!uploadedDoc) {
        setDocUploadError('Please upload a document first.');
        return;
      }
    } else if (inputMethod === 'capture') {
      contentToStudy = capturedText.trim() || 'Photographed study material';
      topicToStudy = customTitle.trim() || capturedFileName || 'Captured Study Material';
      if (!capturedImage && !capturedText) {
        setCameraPhotoError('Please photograph your study material first.');
        return;
      }
    }

    setIsGeneratingCustomPlan(true);
    setCustomGenerationError(null);

    try {
      const generatedSet = await AIService.generateStudySet({
        topic: topicToStudy,
        notesText: inputMethod !== 'type' ? contentToStudy : undefined,
        count: targetCount,
        category: selectedSubject !== 'ALL SUBJECTS' ? selectedSubject : 'CUSTOM PLAN',
      });

      if (generatedSet && generatedSet.concepts && generatedSet.concepts.length > 0) {
        // Save set to StorageService so it's persisted in user library as well
        StorageService.saveCustomSet(generatedSet);
        setCustomGeneratedConcepts(generatedSet.concepts);
        if (!customTitle) {
          setCustomTitle(generatedSet.title);
        }
      } else {
        setCustomGenerationError('Unable to generate custom concepts for this input. Please try refining your topic or notes.');
      }
    } catch (err: any) {
      setCustomGenerationError(err?.message || 'Failed to generate study plan from input.');
    } finally {
      setIsGeneratingCustomPlan(false);
    }
  };

  // Formatted date string for display
  const displayTargetDate = useMemo(() => {
    if (scheduleTarget === 'today') {
      return 'Today (' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ')';
    }
    if (scheduleTarget === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return 'Tomorrow (' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ')';
    }
    if (customDate) {
      const parts = customDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return 'Custom Date';
  }, [scheduleTarget, customDate]);

  const activeDurationObj = useMemo(() => {
    return quickDurations.find(q => q.min === selectedDuration) || quickDurations[1];
  }, [selectedDuration, quickDurations]);

  const hasCustomInputPending = useMemo(() => {
    if (customGeneratedConcepts && customGeneratedConcepts.length > 0) return false;
    if (inputMethod === 'paste' && pastedNotes.trim().length > 0) return true;
    if (inputMethod === 'upload' && uploadedDoc) return true;
    if (inputMethod === 'capture' && (capturedText.trim().length > 0 || capturedImage)) return true;
    if (inputMethod === 'type' && typedTopic.trim().length > 2) {
      const existingMatch = allSets.flatMap(s => s.concepts).some(c => 
        c.title.toLowerCase().includes(typedTopic.trim().toLowerCase()) ||
        (c.category || '').toLowerCase().includes(typedTopic.trim().toLowerCase())
      );
      return !existingMatch;
    }
    return false;
  }, [inputMethod, pastedNotes, uploadedDoc, capturedText, capturedImage, typedTopic, customGeneratedConcepts, allSets]);

  return (
    <div id="study-plan-view-root" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Global Navigation: Always show both BACK and HOME */}
      <div className="flex items-center justify-between">
        <GlobalNavigationButtons onBack={onBack} onGoHome={onGoHome} />
        <span className="font-mono text-xs font-bold text-stone-500 uppercase">
          STUDY PLANNER
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-[#D92B8A] rounded-full border border-pink-200 font-mono text-xs font-bold uppercase">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>STUDY PLANNER • WHAT → WHY → WHEN → HOW LONG</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-4xl text-stone-900 tracking-tight uppercase">
          STUDY PLANNER
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-2xl">
          Provide what you want to study using <strong className="font-bold text-stone-900">Type It</strong>, <strong className="font-bold text-stone-900">Paste It</strong>, <strong className="font-bold text-stone-900">Upload It</strong>, or <strong className="font-bold text-stone-900">Capture It</strong>. Your plan connects directly into the <strong className="font-bold text-stone-800">Learn → Flashcards → Practice → Review</strong> workflow.
        </p>
      </div>

      {/* =========================================================
          STEP 1: WHAT DO YOU WANT TO STUDY? (TYPE IT | PASTE IT | UPLOAD IT | CAPTURE IT)
          ========================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
              1
            </span>
            <h2 className="font-display font-black text-base sm:text-lg text-stone-900 uppercase">
              WHAT DO YOU WANT TO STUDY?
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
            4 INPUT OPTIONS
          </span>
        </div>

        {/* 4 Study-Input Option Tabs: TYPE IT | PASTE IT | UPLOAD IT | CAPTURE IT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100/80 p-1.5 rounded-2xl">
          <button
            type="button"
            id="planner-tab-type"
            onClick={() => setInputMethod('type')}
            className={`py-3 px-2 sm:px-3 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              inputMethod === 'type'
                ? 'bg-white text-stone-950 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <Type className={`w-4 h-4 shrink-0 ${inputMethod === 'type' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
            <span>TYPE IT</span>
          </button>

          <button
            type="button"
            id="planner-tab-paste"
            onClick={() => setInputMethod('paste')}
            className={`py-3 px-2 sm:px-3 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              inputMethod === 'paste'
                ? 'bg-white text-stone-950 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <ClipboardList className={`w-4 h-4 shrink-0 ${inputMethod === 'paste' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
            <span>PASTE IT</span>
          </button>

          <button
            type="button"
            id="planner-tab-upload"
            onClick={() => setInputMethod('upload')}
            className={`py-3 px-2 sm:px-3 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              inputMethod === 'upload'
                ? 'bg-white text-stone-950 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <Upload className={`w-4 h-4 shrink-0 ${inputMethod === 'upload' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
            <span>UPLOAD IT</span>
          </button>

          <button
            type="button"
            id="planner-tab-capture"
            onClick={() => {
              setInputMethod('capture');
              if (!capturedImage) {
                setIsCameraModalOpen(true);
              }
            }}
            className={`py-3 px-2 sm:px-3 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              inputMethod === 'capture'
                ? 'bg-white text-stone-950 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <Camera className={`w-4 h-4 shrink-0 ${inputMethod === 'capture' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
            <span>CAPTURE IT</span>
          </button>
        </div>

        {/* TAB 1: TYPE IT */}
        {inputMethod === 'type' && (
          <div className="space-y-4 pt-1">
            {/* Direct Topic Input */}
            <div className="space-y-1.5">
              <label htmlFor="planner-topic-input" className="font-mono text-xs font-bold text-stone-700 uppercase flex items-center justify-between">
                <span>Enter Specific Topic, Concept or Subject:</span>
                {typedTopic && (
                  <span className="text-[#D92B8A] font-bold">Strict Target Active</span>
                )}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="planner-topic-input"
                  type="text"
                  value={typedTopic}
                  onChange={(e) => setTypedTopic(e.target.value)}
                  placeholder="e.g. African Kingdoms, Calculus Derivatives, Photosynthesis, Organic Chemistry..."
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] focus:border-transparent transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Subject Selector Pills */}
            <div className="space-y-2.5">
              <label className="font-mono text-xs font-bold text-stone-600 uppercase block">
                Or Select From Curriculum Subject Areas:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  id="subject-pill-all"
                  onClick={() => {
                    setSelectedSubject('ALL SUBJECTS');
                    setTypedTopic('');
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                    selectedSubject === 'ALL SUBJECTS' && !typedTopic
                      ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-pink-200 hover:bg-pink-50/50'
                  }`}
                >
                  ALL SUBJECTS (CURRICULUM WIDE)
                </button>

                {availableSubjects.map(sub => {
                  const isSelected = selectedSubject === sub && !typedTopic;
                  const mastery = userStats.subjectMastery?.[sub]?.percentage ?? 0;
                  return (
                    <button
                      key={sub}
                      type="button"
                      id={`subject-pill-${sub.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setTypedTopic('');
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#D92B8A] text-white border-[#D92B8A] shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-pink-200 hover:bg-pink-50/50'
                      }`}
                    >
                      <span>{sub}</span>
                      {mastery > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-700'
                        }`}>
                          {mastery}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE IT */}
        {inputMethod === 'paste' && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="planner-custom-title" className="font-mono text-xs font-bold text-stone-700 uppercase block">
                Study Topic / Title (Optional):
              </label>
              <input
                id="planner-custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Cellular Respiration Notes"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] transition-all placeholder:text-stone-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="planner-notes-input" className="font-mono text-xs font-bold text-stone-700 uppercase">
                  Paste Study Notes, Transcript, or Document Text:
                </label>
                <span className="font-mono text-xs text-stone-500">
                  {pastedNotes.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                id="planner-notes-input"
                rows={5}
                value={pastedNotes}
                onChange={(e) => setPastedNotes(e.target.value)}
                placeholder="Paste your study text, lecture notes, textbook summary, or revision sheet here..."
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] transition-all placeholder:text-stone-400 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD IT */}
        {inputMethod === 'upload' && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="planner-doc-title" className="font-mono text-xs font-bold text-stone-700 uppercase block">
                Study Topic / Title (Optional):
              </label>
              <input
                id="planner-doc-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Midterm Study Document"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] transition-all placeholder:text-stone-400"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              className="hidden"
              id="planner-file-upload-input"
            />

            {!uploadedDoc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-stone-50/70 hover:bg-pink-50/30 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 text-[#D92B8A] flex items-center justify-center">
                  {isParsingDoc ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <p className="font-display font-black text-sm text-stone-900 uppercase">
                    {isParsingDoc ? 'PARSING DOCUMENT...' : 'CLICK TO UPLOAD STUDY DOCUMENT'}
                  </p>
                  <p className="text-xs text-stone-500 font-mono">
                    PDF, Word (.docx), TXT, Markdown (Max 20 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-pink-50/60 border border-pink-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#D92B8A] text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-stone-900 truncate">
                      {uploadedDoc.name}
                    </h4>
                    <p className="font-mono text-xs text-stone-600">
                      {Math.max(1, Math.round(uploadedDoc.size / 1024))} KB &bull; {uploadedDoc.wordCount || 0} words extracted
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveUploadedDoc}
                  className="p-2 text-stone-500 hover:text-red-600 transition-colors"
                  title="Remove uploaded document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {docUploadError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{docUploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CAPTURE IT */}
        {inputMethod === 'capture' && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="planner-capture-title" className="font-mono text-xs font-bold text-stone-700 uppercase block">
                Study Topic / Title (Optional):
              </label>
              <input
                id="planner-capture-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Physics Thermodynamics Homework & Diagrams"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] transition-all placeholder:text-stone-400"
              />
            </div>

            <input
              type="file"
              ref={cameraFileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = (ev.target?.result as string) || '';
                  handlePhotoCaptured(file, dataUrl, file.name || 'study-camera-photo.jpg');
                };
                reader.readAsDataURL(file);
              }}
              accept="image/*"
              capture="environment"
              className="hidden"
              id="planner-camera-file-input"
            />

            {!capturedImage ? (
              <div className="border-2 border-dashed border-stone-300 hover:border-[#D92B8A] bg-stone-50/70 hover:bg-pink-50/30 rounded-3xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-[#D92B8A] flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md">
                  <p className="font-display font-black text-sm text-stone-900 uppercase">
                    PHOTOGRAPH HOMEWORK, TEXTBOOK, EQUATIONS OR WORKSHEETS
                  </p>
                  <p className="text-xs text-stone-500 font-mono">
                    Point your device camera at study pages, handwritten notes, science diagrams, or problem sets
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
                  <button
                    type="button"
                    id="open-camera-viewfinder-btn"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full sm:w-auto py-3 px-6 rounded-full bg-[#E63956] hover:bg-[#D32F4C] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Device Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraFileInputRef.current?.click()}
                    className="w-full sm:w-auto py-3 px-5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Choose / Upload Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-pink-50/50 border border-pink-200 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pink-200/60 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={capturedImage}
                      alt="Captured study photo"
                      className="w-14 h-14 rounded-2xl object-cover border border-pink-200 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#E63956] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                          CAMERA CAPTURED
                        </span>
                        {isProcessingPhoto && (
                          <span className="flex items-center gap-1 font-mono text-xs text-[#E63956] font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Transcribing...
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-stone-900 truncate mt-0.5">
                        {capturedFileName || 'Study Photograph'}
                      </h4>
                      <p className="font-mono text-[11px] text-stone-600">
                        {capturedText ? `${capturedText.split(/\s+/).filter(Boolean).length} words digitized • Ready for study synthesis` : 'Processing optical transcription...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-mono text-xs font-bold text-stone-800 transition-colors cursor-pointer"
                    >
                      Retake Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCapturedPhoto}
                      className="p-2 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove captured photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Transcribed Study Content Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                    <span className="font-bold uppercase">Transcribed Content & Formulas:</span>
                    <span>{capturedText.length} characters</span>
                  </div>
                  <textarea
                    rows={4}
                    value={capturedText}
                    onChange={(e) => setCapturedText(e.target.value)}
                    placeholder="Transcribed notes, homework questions, equations, or diagrams will appear here. You can also edit or add context..."
                    className="w-full p-3.5 bg-white border border-pink-200 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#D92B8A] transition-all leading-relaxed"
                  />
                </div>
              </div>
            )}

            {cameraPhotoError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraPhotoError}</span>
              </div>
            )}
          </div>
        )}

        {/* Generate / Transform Custom Plan Trigger if custom text or file provided */}
        {hasCustomInputPending && (
          <div className="pt-2">
            <button
              type="button"
              id="generate-custom-plan-btn"
              onClick={handleGenerateCustomInputPlan}
              disabled={isGeneratingCustomPlan}
              className="w-full py-3.5 px-6 bg-[#18181B] hover:bg-stone-900 disabled:opacity-60 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isGeneratingCustomPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D92B8A]" />
                  <span>Generating Study Plan From Your Input...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D92B8A]" />
                  <span>Curate Study Plan for this Specific {inputMethod === 'type' ? 'Topic' : inputMethod === 'paste' ? 'Notes' : inputMethod === 'upload' ? 'Document' : 'Captured Material'} →</span>
                </>
              )}
            </button>
          </div>
        )}

        {customGenerationError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{customGenerationError}</span>
          </div>
        )}

        {/* Active Target Status Confirmation Bar */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-stone-700 truncate">
            <Brain className="w-4 h-4 text-[#D92B8A] shrink-0" />
            <span className="font-bold uppercase truncate">
              {inputMethod === 'paste' 
                ? `Source: Pasted Notes (${pastedNotes.trim().split(/\s+/).filter(Boolean).length} words)` 
                : inputMethod === 'upload' 
                ? `Source: ${uploadedDoc ? uploadedDoc.name : 'No file uploaded'}` 
                : inputMethod === 'capture'
                ? `Source: Camera Photo (${capturedFileName || 'Captured Material'})`
                : typedTopic 
                ? `Strict Topic: "${typedTopic}"` 
                : `Subject: ${selectedSubject}`}
            </span>
          </div>
          <span className="font-bold text-[#D92B8A] shrink-0">
            {curatedPlan.isCustomSourced ? '100% Custom Input' : `Mastery: ${currentSubjectMastery.percentage}%`}
          </span>
        </div>
      </div>

      {/* =========================================================
          STEP 2: WHY ARE YOU STUDYING? (Learning Goal)
          ========================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
              2
            </span>
            <h2 className="font-display font-black text-base sm:text-lg text-stone-900 uppercase">
              WHY ARE YOU STUDYING?
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
            LEARNING GOAL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {studyGoals.map(goal => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                type="button"
                id={`goal-opt-${goal.id}`}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 sm:p-5 border text-left rounded-3xl transition-all flex flex-col justify-between space-y-3 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-pink-50/40 border-[#D92B8A] ring-2 ring-[#D92B8A]/30 shadow-md'
                    : 'bg-white border-stone-200 hover:border-pink-300 hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D92B8A]' : 'text-stone-500'}`} />
                      <h3 className="font-display font-black text-sm text-stone-900 uppercase tracking-tight">
                        {goal.title}
                      </h3>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#D92B8A] uppercase block">
                      {goal.tagline}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#D92B8A] bg-[#D92B8A]' : 'border-stone-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>

                <p className="text-xs text-stone-600 font-normal leading-relaxed">
                  {goal.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          STEP 3: WHEN DO YOU WANT TO STUDY? (Timing / Schedule)
          ========================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
              3
            </span>
            <h2 className="font-display font-black text-base sm:text-lg text-stone-900 uppercase">
              WHEN DO YOU WANT TO STUDY?
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase">
            SCHEDULE & TIMING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Today */}
          <button
            type="button"
            id="schedule-opt-today"
            onClick={() => setScheduleTarget('today')}
            className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
              scheduleTarget === 'today'
                ? 'bg-pink-50/40 border-[#D92B8A] ring-2 ring-[#D92B8A]/30'
                : 'bg-white border-stone-200 hover:border-pink-200 hover:bg-stone-50'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${scheduleTarget === 'today' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
                <span className="font-display font-bold text-sm text-stone-900 uppercase">
                  TODAY / NOW
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                Immediate Study Slot
              </p>
            </div>
            {scheduleTarget === 'today' && <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />}
          </button>

          {/* Tomorrow */}
          <button
            type="button"
            id="schedule-opt-tomorrow"
            onClick={() => setScheduleTarget('tomorrow')}
            className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
              scheduleTarget === 'tomorrow'
                ? 'bg-pink-50/40 border-[#D92B8A] ring-2 ring-[#D92B8A]/30'
                : 'bg-white border-stone-200 hover:border-pink-200 hover:bg-stone-50'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CalendarDays className={`w-4 h-4 ${scheduleTarget === 'tomorrow' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
                <span className="font-display font-bold text-sm text-stone-900 uppercase">
                  TOMORROW
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                Planned for Tomorrow
              </p>
            </div>
            {scheduleTarget === 'tomorrow' && <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />}
          </button>

          {/* Custom Date */}
          <div
            onClick={() => setScheduleTarget('custom_date')}
            className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              scheduleTarget === 'custom_date'
                ? 'bg-pink-50/40 border-[#D92B8A] ring-2 ring-[#D92B8A]/30'
                : 'bg-white border-stone-200 hover:border-pink-200 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${scheduleTarget === 'custom_date' ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
                <span className="font-display font-bold text-sm text-stone-900 uppercase">
                  CHOSEN DATE
                </span>
              </div>
              {scheduleTarget === 'custom_date' && <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />}
            </div>
            <input
              id="custom-date-picker"
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setScheduleTarget('custom_date');
              }}
              className="w-full text-xs font-mono p-1 bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#D92B8A]"
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          STEP 4: HOW LONG DO YOU HAVE? (10 / 30 / 60 Minutes)
          ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
              4
            </span>
            <span className="text-xs font-mono font-bold text-[#D92B8A] uppercase tracking-widest block">
              HOW LONG DO YOU HAVE? • SELECT STUDY DURATION
            </span>
          </div>
          <span className="font-mono text-xs text-stone-500 font-bold">
            3 OPTIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickDurations.map(d => {
            const isSelected = selectedDuration === d.min;
            return (
              <button
                key={d.min}
                type="button"
                id={`duration-opt-${d.min}`}
                onClick={() => setSelectedDuration(d.min)}
                className={`p-6 border text-left transition-all rounded-3xl flex flex-col justify-between space-y-4 shadow-sm cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#D92B8A] ring-2 ring-[#D92B8A]/30 shadow-md'
                    : 'bg-white border-stone-200 hover:border-pink-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-pink-50 text-[#D92B8A] border-pink-200' 
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {d.tag}
                    </span>
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-[#D92B8A]' : 'text-stone-400'}`} />
                  </div>
                  <h3 className="font-display font-black text-xl text-stone-900 pt-1">
                    {d.label}
                  </h3>
                </div>

                <p className="text-sm text-stone-600 leading-relaxed font-normal">
                  {d.description}
                </p>

                {/* Mini phase distribution */}
                <div className="pt-2 border-t border-stone-100 grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                  <div className="bg-stone-50 rounded-lg p-1">
                    <span className="text-stone-400 block">Lrn</span>
                    <span className="font-bold text-stone-800">{d.breakdown.learn}m</span>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-1">
                    <span className="text-stone-400 block">Flash</span>
                    <span className="font-bold text-stone-800">{d.breakdown.flashcards}m</span>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-1">
                    <span className="text-stone-400 block">Prac</span>
                    <span className="font-bold text-stone-800">{d.breakdown.practice}m</span>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-1">
                    <span className="text-stone-400 block">Rev</span>
                    <span className="font-bold text-stone-800">{d.breakdown.review}m</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          4-STEP WORKFLOW VISUAL GUIDE
          ========================================================= */}
      <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <span className="font-mono text-xs font-bold text-stone-700 uppercase tracking-wider">
            STUDY WORKFLOW PIPELINE
          </span>
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px] sm:text-xs text-[#D92B8A] font-bold uppercase">
            <span>LEARN</span>
            <span className="text-stone-300">→</span>
            <span>FLASHCARDS</span>
            <span className="text-stone-300">→</span>
            <span>PRACTICE</span>
            <span className="text-stone-300">→</span>
            <span>REVIEW</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-[#D92B8A] shrink-0" />
                  <span className="font-display font-black text-xs text-stone-900 uppercase tracking-tight whitespace-nowrap">
                    1. LEARN
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold text-[#D92B8A] bg-pink-50 border border-pink-200/80 px-2 py-0.5 rounded-full">
                  ~{activeDurationObj.breakdown.learn} MIN
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Read concepts and explain them in your own words.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className="w-4 h-4 text-[#D92B8A] shrink-0" />
                  <span className="font-display font-black text-xs text-stone-900 uppercase tracking-tight whitespace-nowrap">
                    2. FLASHCARDS
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold text-[#D92B8A] bg-pink-50 border border-pink-200/80 px-2 py-0.5 rounded-full">
                  ~{activeDurationObj.breakdown.flashcards} MIN
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Active recall flips with 4-tier confidence ratings.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#D92B8A]" />
                  <span className="font-display font-black text-xs text-stone-900 uppercase tracking-tight whitespace-nowrap">
                    3. PRACTICE
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold text-[#D92B8A] bg-pink-50 border border-pink-200/80 px-2 py-0.5 rounded-full">
                  ~{activeDurationObj.breakdown.practice} MIN
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Formative questions with immediate explanations.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <RotateCcw className="w-4 h-4 text-[#D92B8A]" />
                  <span className="font-display font-black text-xs text-stone-900 uppercase tracking-tight whitespace-nowrap">
                    4. REVIEW
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold text-[#D92B8A] bg-pink-50 border border-pink-200/80 px-2 py-0.5 rounded-full">
                  ~{activeDurationObj.breakdown.review} MIN
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Spaced repetition queue reinforces weak memory nodes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          GENERATED PERSONALISED PLAN SUMMARY BOX
          ========================================================= */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#D92B8A] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalised Study Plan</span>
              <span>&bull;</span>
              <span className="text-stone-600">{displayTargetDate}</span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-stone-900">
              {curatedPlan.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-3 py-1 bg-pink-50 border border-pink-200 uppercase rounded-full text-[#D92B8A]">
              {curatedPlan.concepts.length} Concepts
            </span>
            <span className="font-mono text-xs font-bold px-3 py-1 bg-stone-100 border border-stone-200 uppercase rounded-full text-stone-800">
              {selectedDuration} Mins
            </span>
          </div>
        </div>

        {/* Pedagogical Rationale & Mastery Context */}
        <div className="p-4 bg-pink-50/50 border border-pink-200/80 rounded-2xl space-y-2">
          <span className="font-mono text-xs font-bold text-[#D92B8A] uppercase flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mastery Calibration & Pedagogical Rationale</span>
          </span>
          <p className="text-sm text-stone-700 leading-relaxed font-normal">
            {curatedPlan.rationale}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-stone-600">
            <span>&bull; <strong>{curatedPlan.weakCount}</strong> Needs Review Items</span>
            <span>&bull; <strong>{curatedPlan.newCount}</strong> Core Learning Concepts</span>
            <span>&bull; Target Scope: <strong>{typedTopic ? `"${typedTopic}"` : selectedSubject}</strong></span>
          </div>
        </div>

        {/* Launch Actions */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-stone-500">
            <Target className="w-4 h-4 text-[#D92B8A] shrink-0" />
            <span>Connects directly to Learn → Flashcards → Practice → Review.</span>
          </div>

          <button
            type="button"
            id="start-planned-session-btn"
            onClick={() => onStartSession(curatedPlan.concepts, curatedPlan.title, selectedDuration, 'study')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#D92B8A] hover:bg-[#c02479] text-white font-display text-xs sm:text-sm font-bold uppercase rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Start {selectedDuration}-Min Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Live Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
