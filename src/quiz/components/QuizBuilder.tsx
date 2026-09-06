import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  ClipboardCopy,
  FileUp,
  ArrowRight,
  AlertCircle,
  FileText,
  Trash2,
  Loader2,
  Sliders,
} from 'lucide-react';
import {
  CreationMethod,
  DifficultyLevel,
  EducationLevel,
  QuestionType,
  QuizSettings,
  SubjectCategory,
} from '../types';
import { extractTextFromFile } from '../utils/pdfExtractor';

interface QuizBuilderProps {
  creationMethod: CreationMethod;
  onMethodChange: (method: CreationMethod) => void;
  onGenerateQuiz: (params: {
    creationMethod: CreationMethod;
    topic: string;
    text: string;
    fileName: string;
    fileText: string;
    settings: QuizSettings;
  }) => Promise<void>;
  isGenerating: boolean;
  topicInput: string;
  setTopicInput: (val: string) => void;
  selectedSubject: SubjectCategory;
  setSelectedSubject: (val: SubjectCategory) => void;
}

const LOADING_STEPS = [
  'BUILDING YOUR QUIZ...',
  'READING YOUR MATERIAL...',
  'CHOOSING THE QUESTIONS...',
  'CHECKING THE ANSWERS...',
  'READY.',
];

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  creationMethod,
  onMethodChange,
  onGenerateQuiz,
  isGenerating,
  topicInput,
  setTopicInput,
  selectedSubject,
  setSelectedSubject,
}) => {
  // Input states
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    text: string;
    pageCount?: number;
  } | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings states
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('high_school');

  // Cycle through loading steps during generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Handle PDF / Text file upload
  const handleFileUpload = async (file: File) => {
    setValidationError(null);
    setIsExtractingPdf(true);
    try {
      const result = await extractTextFromFile(file);
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        text: result.text,
        pageCount: result.pageCount,
      });
    } catch (err: any) {
      setValidationError(err?.message || 'Could not extract text from this file. Please ensure it contains readable text or try pasting your notes directly.');
      setUploadedFile(null);
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateClick = () => {
    setValidationError(null);

    // Validate
    if (creationMethod === 'topic') {
      if (!topicInput.trim()) {
        setValidationError('Please enter a topic to quiz (e.g., "The Kingdom of Mali" or "Photosynthesis").');
        return;
      }
    } else if (creationMethod === 'text') {
      if (!textInput.trim() || textInput.trim().length < 15) {
        setValidationError('Please paste sufficient notes or text (at least 15 characters) to generate questions from.');
        return;
      }
    } else if (creationMethod === 'pdf') {
      if (!uploadedFile || !uploadedFile.text) {
        setValidationError('Please upload a PDF or document before generating.');
        return;
      }
    }

    const settings: QuizSettings = {
      questionCount,
      difficulty,
      questionType,
      educationLevel,
      subject: selectedSubject,
    };

    onGenerateQuiz({
      creationMethod,
      topic: topicInput,
      text: textInput,
      fileName: uploadedFile?.name || '',
      fileText: uploadedFile?.text || '',
      settings,
    });
  };

  // Sample quick texts for the Text mode
  const handleLoadSampleText = () => {
    setTextInput(
      `The Kingdom of Kush was an ancient civilization located in Nubia along the Nile Valley (modern-day Sudan). Kush was famous for its rich gold deposits, formidable archers known throughout the ancient Mediterranean, and vast iron-smelting industry centered at the royal city of Meroë. Kushite rulers even conquered and ruled Egypt as its 25th Dynasty (the Black Pharaohs) under kings such as Piye and Taharqa. The civilization built more than 200 distinct steep-sided royal pyramids at Meroë, outnumbering those in Egypt, and developed their own unique written script known as Meroitic.`
    );
    setSelectedSubject('History');
    setValidationError(null);
  };

  const subjectsList: SubjectCategory[] = [
    'General',
    'History',
    'Geography',
    'Science',
    'Mathematics',
    'Literature',
    'Languages',
    'Social Studies',
    'Other',
  ];

  return (
    <section id="quiz-builder" className="py-8 sm:py-12 border-b border-stone-200/80">
      {/* Section Title */}
      <div className="text-center md:text-left mb-8 pb-6 border-b border-stone-200/80">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
          SECTION 03 • INTERACTIVE ENGINE
        </span>
        <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none break-words">
          WHAT ARE WE QUIZZING?
        </h2>
        <p className="text-base sm:text-lg text-stone-600 mt-2 max-w-3xl font-normal">
          Select your knowledge source and configure your preferences below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Knowledge Source Tabs & Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Method Selectors / Rounded Pill Tabs */}
          <div className="flex bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E0D8C5] shadow-xs gap-1.5">
            <button
              onClick={() => {
                onMethodChange('topic');
                setValidationError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMethod === 'topic'
                  ? 'bg-[#E05A2B] text-white shadow-sm scale-101'
                  : 'bg-transparent text-[#292929] hover:bg-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>1. TOPIC</span>
            </button>

            <button
              onClick={() => {
                onMethodChange('text');
                setValidationError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMethod === 'text'
                  ? 'bg-[#E05A2B] text-white shadow-sm scale-101'
                  : 'bg-transparent text-[#292929] hover:bg-white'
              }`}
            >
              <ClipboardCopy className="w-4 h-4" />
              <span>2. TEXT</span>
            </button>

            <button
              onClick={() => {
                onMethodChange('pdf');
                setValidationError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMethod === 'pdf'
                  ? 'bg-[#E05A2B] text-white shadow-sm scale-101'
                  : 'bg-transparent text-[#292929] hover:bg-white'
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>3. PDF</span>
            </button>
          </div>

          {/* Dynamic Input Panels */}
          <div className="bg-white rounded-[2rem] border border-[#E6E0D5] shadow-[0_10px_30px_-10px_rgba(41,41,41,0.05)] p-6 sm:p-8 min-h-[340px] flex flex-col justify-between">
            {/* METHOD 1: TOPIC */}
            {creationMethod === 'topic' && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="topic-input" className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929]">
                      ENTER TOPIC OR PROMPT
                    </label>
                    <span className="font-mono-code text-[11px] font-bold text-[#736E65]">ANY SUBJECT</span>
                  </div>

                  <input
                    id="topic-input"
                    type="text"
                    value={topicInput}
                    onChange={(e) => {
                      setTopicInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="e.g. The Kingdom of Mali, Quantum Physics, African Wildlife..."
                    className="w-full bg-[#FAF7F2] border border-[#E0D8C5] rounded-xl p-4 font-display font-bold text-base sm:text-lg text-[#292929] placeholder:text-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#E05A2B] transition-all"
                    disabled={isGenerating}
                  />
                </div>

                {/* Inspiration chips */}
                <div className="pt-4 border-t border-[#292929]/10">
                  <span className="font-mono-code text-xs font-bold uppercase text-[#5E5950] block mb-2.5">
                    POPULAR EDUCATIONAL TOPICS:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Kingdom of Kush & Nubia', sub: 'History' as SubjectCategory },
                      { name: 'African Great Lakes Ecology', sub: 'Geography' as SubjectCategory },
                      { name: 'Plate Tectonics & Rift Valleys', sub: 'Geography' as SubjectCategory },
                      { name: 'M-Pesa & Mobile Finance', sub: 'Social Studies' as SubjectCategory },
                      { name: 'Chinua Achebe’s Novels', sub: 'Literature' as SubjectCategory },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setTopicInput(item.name);
                          setSelectedSubject(item.sub);
                          setValidationError(null);
                        }}
                        className="text-xs font-mono-code font-bold bg-[#FAF7F2] hover:bg-[#E05A2B] hover:text-white px-3 py-1.5 rounded-full border border-[#E0D8C5] transition-all cursor-pointer"
                      >
                        + {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 2: TEXT */}
            {creationMethod === 'text' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="text-input" className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929]">
                      PASTE STUDY NOTES, ARTICLES OR EXCERPTS
                    </label>
                    <button
                      onClick={handleLoadSampleText}
                      className="font-mono-code text-xs text-[#E05A2B] hover:underline font-bold cursor-pointer"
                    >
                      Paste Sample Notes
                    </button>
                  </div>

                  <textarea
                    id="text-input"
                    rows={7}
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Paste notes, textbook paragraphs, research papers, or syllabus summaries here..."
                    className="w-full bg-[#FAF7F2] border border-[#E0D8C5] rounded-xl p-4 font-mono-code text-xs sm:text-sm text-[#292929] placeholder:text-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#E05A2B] resize-y"
                    disabled={isGenerating}
                  ></textarea>
                </div>

                <div className="flex items-center justify-between text-xs font-mono-code text-[#5E5950] pt-2 border-t border-[#292929]/10">
                  <span>CHARACTERS: {textInput.length}</span>
                  <span>EST. WORDS: {textInput.trim() ? textInput.trim().split(/\s+/).length : 0}</span>
                </div>
              </div>
            )}

            {/* METHOD 3: PDF / FILE */}
            {creationMethod === 'pdf' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929]">
                      UPLOAD PDF OR EDUCATIONAL DOCUMENT
                    </label>
                    <span className="font-mono-code text-[11px] font-bold text-[#736E65]">PDF, TXT, MD</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileInputChange}
                    accept=".pdf,.txt,.md,.doc"
                    className="hidden"
                    disabled={isGenerating || isExtractingPdf}
                  />

                  {!uploadedFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                        isDragOver ? 'bg-[#FAF0EB] border-[#E05A2B]' : 'bg-[#FAF7F2] border-[#E0D8C5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      {isExtractingPdf ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#E05A2B] animate-spin" />
                          <span className="font-mono-code text-xs font-bold uppercase text-[#292929]">
                            READING & EXTRACTING DOCUMENT TEXT...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#E05A2B] flex items-center justify-center mb-3 shadow-xs">
                            <FileUp className="w-6 h-6" />
                          </div>
                          <p className="font-display font-black text-base sm:text-lg text-[#292929] uppercase">
                            CLICK TO UPLOAD OR DRAG & DROP
                          </p>
                          <p className="font-mono-code text-xs text-[#5E5950] mt-1">
                            Supports PDF documents, lecture slides, study notes
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E0D8C5] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-[#E05A2B] text-white flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="font-mono-code text-sm font-bold text-[#292929] truncate">
                            {uploadedFile.name}
                          </div>
                          <div className="font-mono-code text-xs text-[#5E5950] flex items-center gap-2">
                            <span>{uploadedFile.size}</span>
                            {uploadedFile.pageCount && <span>• {uploadedFile.pageCount} Pages</span>}
                            <span>• {uploadedFile.text.length} Characters extracted</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-2 rounded-xl text-[#292929] hover:bg-[#E05A2B] hover:text-white border border-[#E0D8C5] transition-colors ml-3 cursor-pointer shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs font-mono-code text-[#5E5950] pt-2 border-t border-[#292929]/10">
                  <span>Questions are strictly generated from the extracted text without outside hallucinations.</span>
                </div>
              </div>
            )}

            {/* Validation Error Message */}
            {validationError && (
              <div className="mt-4 p-3.5 bg-[#FFEBE6] border border-[#E05A2B] rounded-xl text-[#292929] text-xs font-mono-code flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#E05A2B] shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selectable Quiz Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] rounded-[2rem] border border-[#E6E0D5] shadow-[0_10px_30px_-10px_rgba(41,41,41,0.05)] p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-[#292929]/10 pb-3.5">
              <span className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-[#292929] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#E05A2B]" />
                QUIZ SETTINGS
              </span>
              <span className="font-mono-code text-[11px] text-[#5E5950] font-bold">CUSTOMIZE</span>
            </div>

            {/* 1. NUMBER OF QUESTIONS */}
            <div>
              <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] block mb-2">
                NUMBER OF QUESTIONS
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`py-2.5 rounded-xl font-display font-black text-sm sm:text-base border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-[#292929] text-[#F5F0E6] border-[#292929] shadow-xs'
                        : 'bg-white text-[#292929] border-[#E0D8C5] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. DIFFICULTY */}
            <div>
              <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] block mb-2">
                DIFFICULTY LEVEL
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy' as DifficultyLevel, label: 'EASY' },
                  { id: 'medium' as DifficultyLevel, label: 'MEDIUM' },
                  { id: 'hard' as DifficultyLevel, label: 'HARD' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDifficulty(item.id)}
                    className={`py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase border transition-all cursor-pointer ${
                      difficulty === item.id
                        ? 'bg-[#E05A2B] text-white border-[#E05A2B] shadow-xs'
                        : 'bg-white text-[#292929] border-[#E0D8C5] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. QUESTION TYPE */}
            <div>
              <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] block mb-2">
                QUESTION FORMAT
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'multiple_choice' as QuestionType, label: 'MULTIPLE CHOICE' },
                  { id: 'true_false' as QuestionType, label: 'TRUE / FALSE' },
                  { id: 'mixed' as QuestionType, label: 'MIXED' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuestionType(item.id)}
                    className={`py-2 px-1 text-center font-mono-code font-bold text-xs uppercase rounded-xl border transition-all cursor-pointer ${
                      questionType === item.id
                        ? 'bg-[#292929] text-[#F5F0E6] border-[#292929] shadow-xs'
                        : 'bg-white text-[#292929] border-[#E0D8C5] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. EDUCATION LEVEL */}
            <div>
              <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] block mb-2">
                TARGET AUDIENCE / LEVEL
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'primary' as EducationLevel, label: 'PRIMARY SCHOOL' },
                  { id: 'high_school' as EducationLevel, label: 'HIGH SCHOOL' },
                  { id: 'university' as EducationLevel, label: 'UNIVERSITY' },
                  { id: 'general' as EducationLevel, label: 'GENERAL KNOWLEDGE' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEducationLevel(item.id)}
                    className={`py-2 px-2.5 text-left font-mono-code font-bold text-xs uppercase rounded-xl border transition-all cursor-pointer truncate ${
                      educationLevel === item.id
                        ? 'bg-[#292929] text-[#F5F0E6] border-[#292929] shadow-xs'
                        : 'bg-white text-[#292929] border-[#E0D8C5] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. SUBJECT CATEGORY */}
            <div>
              <label className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#292929] block mb-2">
                SUBJECT CATEGORY
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {subjectsList.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`py-1.5 px-2 text-center font-mono-code text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer truncate ${
                      selectedSubject === subj
                        ? 'bg-[#E05A2B] text-white border-[#E05A2B]'
                        : 'bg-white text-[#292929] border-[#E0D8C5] hover:bg-[#F5F0E6]'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: THE BIG GENERATE BUTTON & GENERATING ANIMATED STATE */}
      <div className="mt-10">
        {!isGenerating ? (
          <button
            onClick={handleGenerateClick}
            className="w-full py-6 md:py-7 bg-[#E05A2B] hover:bg-[#CC4F24] text-white font-display font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight rounded-full shadow-xl hover:shadow-2xl hover:scale-101 transition-all flex items-center justify-center gap-4 cursor-pointer group"
          >
            <span>GENERATE QUIZ</span>
            <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
          </button>
        ) : (
          <div className="w-full py-8 md:py-12 bg-[#292929] text-[#F5F0E6] rounded-[2rem] shadow-xl p-6 flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#E05A2B] animate-spin" />
              <span className="font-display font-black text-xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white transition-all duration-300">
                {LOADING_STEPS[loadingStepIndex]}
              </span>
            </div>

            {/* Stepper Dots / Stage Indicators */}
            <div className="flex items-center gap-2 mt-2">
              {LOADING_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === loadingStepIndex
                      ? 'w-8 bg-[#E05A2B]'
                      : idx < loadingStepIndex
                      ? 'w-4 bg-white/60'
                      : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="font-mono-code text-xs sm:text-sm text-[#A39E93] text-center max-w-lg mt-1">
              Creating your quiz, putting your knowledge to the test.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
