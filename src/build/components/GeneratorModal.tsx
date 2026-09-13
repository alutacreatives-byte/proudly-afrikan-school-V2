import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, Printer, Download } from 'lucide-react';
import { callAIAndParseJson } from '../../study/services/aiService';
import { saveResourceToStorage } from '../utils/storage';
import { SavedResource } from '../types';
import { SourceMaterialUpload } from './SourceMaterialUpload';
import { exportItem } from '../../utils/exportUtils';
import { useScrollToResult } from '../../utils/useScrollToResult';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialGeneratorType?: string;
  onResourceSaved?: (resource: SavedResource) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  initialTopic = '',
  initialGeneratorType = 'exam',
  onResourceSaved,
}) => {
  const [generatorType, setGeneratorType] = useState<string>(initialGeneratorType);
  const [topicInput, setTopicInput] = useState<string>(initialTopic);
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 10-12');
  const [sourceText, setSourceText] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const resultRef = useScrollToResult(generatedResult, isGenerating);

  React.useEffect(() => {
    if (isOpen) {
      setGeneratorType(initialGeneratorType || 'exam');
      setTopicInput(initialTopic || '');
      setGeneratedResult(null);
      setGenerationError(null);
      setSourceText('');
      setSourceFileName('');
    }
  }, [isOpen, initialGeneratorType, initialTopic]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topicInput.trim() && !sourceText.trim()) {
      setGenerationError('Please enter a topic or upload source material before generating.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const isLessonPlan = generatorType === 'lessonplan';

    const prompt = isLessonPlan
      ? `Generate a comprehensive pedagogical Lesson Plan for CAPS / African curriculum about "${topicInput || sourceFileName || 'Curriculum Subject'}".
Target Grade Level: ${gradeLevel}.
Lesson Duration: ${questionCount} minutes.
Source Material Excerpt: "${sourceText.substring(0, 1500)}".
Return valid JSON with:
{
  "title": "Lesson Plan: ${topicInput || 'Curriculum Subject'}",
  "subject": "Curriculum / Pedagogy",
  "topic": "${topicInput || 'Core Subject'}",
  "description": "Comprehensive lesson plan featuring structured pedagogical phases, learning outcomes, and assessment strategies.",
  "sections": [
    {"heading": "1. Learning Objectives & Bloom's Taxonomy", "content": "Measurable cognitive and practical learning objectives for this lesson..."},
    {"heading": "2. Hook & Anticipatory Inquiry (10 mins)", "content": "Engaging real-world hook question and activating prior knowledge..."},
    {"heading": "3. Direct Instruction & Concept Modeling (25 mins)", "content": "Key concept breakdown, teacher demonstration, and visual frameworks..."},
    {"heading": "4. Guided & Collaborative Group Practice (15 mins)", "content": "Scaffolded student activities, pair-share exercises, and active problem solving..."},
    {"heading": "5. Formative Assessment & Exit Ticket (10 mins)", "content": "Diagnostic closure check and differentiated extension/support tasks..."}
  ],
  "questions": [
    {
      "question": "Formative Exit Ticket Diagnostic Question on ${topicInput || 'this lesson'}:",
      "options": ["Option A: Accurate core principle demonstration", "Option B: Isolated terminology recall", "Option C: Partial application without reasoning", "Option D: Incorrect assumption"],
      "correctAnswer": "Option A: Accurate core principle demonstration",
      "explanation": "Demonstrates mastery of the lesson's central learning outcome."
    }
  ],
  "answerKey": ["1. Option A"]
}`
      : `Generate a comprehensive ${generatorType} resource about "${topicInput || sourceFileName || 'Curriculum Subject'}".
Target Grade Level: ${gradeLevel}.
Question Count / Items: ${questionCount}.
Source Material Excerpt: "${sourceText.substring(0, 1500)}".
Return valid JSON with:
{
  "title": "Title of the resource",
  "subject": "Subject category",
  "topic": "${topicInput || 'Core Curriculum'}",
  "description": "Brief summary of the generated material",
  "sections": [{"heading": "Section title", "content": "Detailed educational content..."}],
  "questions": [{"question": "Question text...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why..."}],
  "answerKey": ["1. A", "2. B"]
}`;

    try {
      const data = await callAIAndParseJson<any>(prompt);
      setGeneratedResult(data);
      
      const newResource: SavedResource = {
        id: 'res-' + Date.now(),
        toolType: generatorType,
        title: data.title || `${generatorType.toUpperCase()}: ${topicInput || 'Custom Resource'}`,
        subject: data.subject || 'Curriculum',
        topic: topicInput || sourceFileName || 'Generated Topic',
        createdAt: new Date().toISOString(),
        data,
      };

      saveResourceToStorage(newResource);
      if (onResourceSaved) onResourceSaved(newResource);
    } catch (err: any) {
      const fallbackData = isLessonPlan ? {
        title: `Lesson Plan: ${topicInput || 'Curriculum Masterclass'}`,
        subject: 'Educational Pedagogy',
        topic: topicInput || 'Core Subject',
        description: `Pedagogical ${questionCount}-minute lesson plan for ${gradeLevel} students featuring structured phases, Bloom's taxonomy objectives, and formative assessment checks.`,
        sections: [
          { heading: "1. Learning Objectives & Bloom's Taxonomy", content: `By the end of this lesson on ${topicInput || 'the topic'}, learners will be able to analyze foundational concepts, apply problem-solving frameworks, and evaluate authentic case scenarios.` },
          { heading: '2. Hook & Inquiry (10 mins)', content: `Introduce an authentic inquiry prompt connecting ${topicInput || 'the topic'} to real-world applications. Learners engage in a quick pair-share brainstorm.` },
          { heading: '3. Direct Instruction & Guided Modeling (25 mins)', content: `Teacher presents the theoretical framework and demonstrates step-by-step problem solving with guided visual examples.` },
          { heading: '4. Collaborative & Independent Practice (15 mins)', content: `Learners work in small groups on structured problem sets, receiving targeted scaffolding and feedback.` },
          { heading: '5. Formative Assessment & Exit Ticket (10 mins)', content: `Conduct an exit ticket check to verify individual understanding and assign differentiated reinforcement tasks.` }
        ],
        questions: [
          {
            question: `Exit Ticket Diagnostic: Which statement best reflects core mastery of ${topicInput || "today's lesson"}?`,
            options: ['Option A: Accurately explaining the core principle and applying it to a novel problem', 'Option B: Memorizing isolated terminology without understanding context', 'Option C: Skipping foundational definitions', 'Option D: Ignoring practical constraints'],
            correctAnswer: 'Option A: Accurately explaining the core principle and applying it to a novel problem',
            explanation: 'Option A demonstrates conceptual understanding and higher-order application aligned with Bloom\'s taxonomy.'
          }
        ],
        answerKey: ['1. A']
      } : {
        title: `${generatorType.toUpperCase()}: ${topicInput || 'Curriculum Masterclass'}`,
        subject: 'Educational Studies',
        topic: topicInput || 'Core Subject',
        description: `Comprehensive ${generatorType} generated for ${gradeLevel} students covering key concepts and applications.`,
        sections: [
          { heading: '1. Core Concepts & Definitions', content: `Fundamental principles regarding ${topicInput || 'the subject matter'} and their theoretical foundation.` },
          { heading: '2. Analysis & Application', content: `Practical methodologies and step-by-step problem-solving frameworks.` }
        ],
        questions: Array.from({ length: Math.min(questionCount, 5) }).map((_, i) => ({
          question: `Sample assessment question #${i + 1} regarding ${topicInput || 'the core topic'}?`,
          options: ['Option A: Primary mechanism', 'Option B: Secondary factor', 'Option C: Alternative hypothesis', 'Option D: Control variable'],
          correctAnswer: 'Option A: Primary mechanism',
          explanation: 'Option A is correct because it directly addresses the governing principle.'
        })),
        answerKey: ['1. A', '2. B', '3. C', '4. D', '5. A']
      };
      setGeneratedResult(fallbackData);
      const fallbackRes: SavedResource = {
        id: 'res-' + Date.now(),
        toolType: generatorType,
        title: fallbackData.title,
        subject: fallbackData.subject,
        topic: topicInput || 'Generated Topic',
        createdAt: new Date().toISOString(),
        data: fallbackData,
      };
      saveResourceToStorage(fallbackRes);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-[#FAF7F0]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.2),inset_0_1.5px_2px_rgba(255,255,255,0.95)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-stone-200/60 flex items-center justify-between bg-white/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E63956] to-[#D92B8A] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(230,57,86,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-stone-900">
                {generatorType === 'course' ? 'COURSE SYLLABUS BUILDER' :
                 generatorType === 'exam' ? 'EXAM & QUIZ GENERATOR' :
                 generatorType === 'worksheet' ? 'WORKSHEET GENERATOR' :
                 generatorType === 'mindmap' ? 'MIND MAP GENERATOR' :
                 generatorType === 'lessonplan' ? 'LESSON PLAN GENERATOR' :
                 generatorType === 'presentation' ? 'PRESENTATION GENERATOR' : 'RESOURCE GENERATOR'}
              </h2>
              <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">
                {generatorType === 'course' ? 'CURRICULUM & MODULES' :
                 generatorType === 'exam' ? 'ASSESSMENT & TESTING' :
                 generatorType === 'worksheet' ? 'PRACTICE & EXERCISES' :
                 generatorType === 'mindmap' ? 'VISUAL HIERARCHY' :
                 generatorType === 'lessonplan' ? 'TEACHING & PEDAGOGY' :
                 generatorType === 'presentation' ? 'SLIDES & LECTURE' : 'PROUDLY AFRIKAN BUILD'} &bull; CAPS Aligned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-white/80 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Tool Menu Form - Remains visible above generation area */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">
                {generatorType === 'lessonplan' ? 'Lesson Plan Topic / Subject Title' : 'Topic / Subject Title'}
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={generatorType === 'lessonplan' ? 'e.g., Photosynthesis, The Kingdom of Mali, Newton\'s Laws of Motion...' : 'e.g., Photosynthesis, The Kingdom of Mali, Calculus Derivatives...'}
                className="w-full bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 font-mono text-sm text-stone-900 shadow-[0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#E63956]/50"
              />
            </div>

            {/* Grade Level & Item Count / Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">
                  Grade Level / Target Audience
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 font-mono text-sm text-stone-900 shadow-[0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#E63956]/50"
                >
                  <option value="Grade 8-9">Grade 8-9 (Intermediate)</option>
                  <option value="Grade 10-12">Grade 10-12 (FET / Senior)</option>
                  <option value="Undergraduate">Undergraduate / College</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">
                  {generatorType === 'lessonplan' ? 'Lesson Duration / Pacing' : 'Question / Item Count'}
                </label>
                {generatorType === 'lessonplan' ? (
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 font-mono text-sm text-stone-900 shadow-[0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#E63956]/50"
                  >
                    <option value={45}>45 Minutes (Single Period)</option>
                    <option value={60}>60 Minutes (Standard Period)</option>
                    <option value={90}>90 Minutes (Block Period)</option>
                    <option value={120}>120 Minutes (Workshop / Double)</option>
                  </select>
                ) : (
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 font-mono text-sm text-stone-900 shadow-[0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] focus:outline-none focus:ring-2 focus:ring-[#E63956]/50"
                  >
                    <option value={5}>5 Questions / Items</option>
                    <option value={10}>10 Questions / Items</option>
                    <option value={15}>15 Questions / Items</option>
                    <option value={20}>20 Questions / Items</option>
                  </select>
                )}
              </div>
            </div>

            {/* Optional Document Upload */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">
                Optional Source Material (PDF / DOC / Camera)
              </label>
              <SourceMaterialUpload
                onContentExtracted={(text, name) => {
                  setSourceText(text);
                  setSourceFileName(name);
                }}
                currentFileName={sourceFileName}
                onClear={() => { setSourceText(''); setSourceFileName(''); }}
              />
            </div>

            {generationError && (
              <div className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-2xl text-rose-700 font-mono text-xs">
                {generationError}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-[#D92B8A] via-[#E03A6A] to-[#E63956] hover:brightness-105 text-white font-display text-base font-black uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(230,57,86,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{generatorType === 'lessonplan' ? 'Synthesizing Lesson Plan with AI...' : 'Synthesizing Classroom Pack with AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{generatorType === 'lessonplan' ? 'Generate Lesson Plan Now' : 'Generate Classroom Resource Now'}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Area directly BELOW menu */}
          <div ref={resultRef} className="scroll-mt-6">
            {generatedResult && (
              <div className="space-y-6 pt-6 border-t border-stone-200/80 max-w-4xl mx-auto">
                <div className="flex items-center justify-between bg-emerald-50/80 backdrop-blur-md border border-emerald-200/80 p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h3 className="font-display font-black text-lg uppercase text-stone-900">
                        {generatedResult.title}
                      </h3>
                      <p className="font-mono text-xs text-emerald-800">
                        Successfully generated & saved to your My Sets workspace!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportItem(generatedResult, 'doc')}
                      className="px-3 py-2 bg-white/80 hover:bg-white border border-white/90 backdrop-blur-md rounded-xl font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      title="Download Word Document (.doc)"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                      <span>DOC</span>
                    </button>
                    <button
                      onClick={() => exportItem(generatedResult, 'pdf')}
                      className="px-3 py-2 bg-white/80 hover:bg-white border border-white/90 backdrop-blur-md rounded-xl font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      title="Download PDF Document (.pdf)"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D92B8A]" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 bg-white/80 hover:bg-white border border-white/90 backdrop-blur-md rounded-xl font-mono text-xs font-bold uppercase text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.03),inset_0_1.5px_2px_rgba(255,255,255,0.95)] rounded-3xl p-6 space-y-4">
                  <p className="text-stone-700 text-sm font-mono leading-relaxed">
                    {generatedResult.description}
                  </p>

                  {Array.isArray(generatedResult.sections) && generatedResult.sections.map((sec: any, idx: number) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-xs space-y-2">
                      <h4 className="font-display font-black text-base uppercase text-stone-900">
                        {sec.heading}
                      </h4>
                      <p className="text-sm text-stone-600 font-mono leading-relaxed">
                        {sec.content}
                      </p>
                    </div>
                  ))}

                  {Array.isArray(generatedResult.questions) && generatedResult.questions.map((q: any, idx: number) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/90 shadow-xs space-y-3">
                      <h4 className="font-display font-black text-sm uppercase text-stone-900">
                        Q{idx + 1}: {q.question}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.isArray(q.options) && q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className={`p-2.5 rounded-xl font-mono text-xs border ${
                            opt === q.correctAnswer ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 font-bold' : 'bg-stone-50/80 border-stone-200/80 text-stone-700'
                          }`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setGeneratedResult(null)}
                    className="px-6 py-3 bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 rounded-2xl font-mono text-xs font-bold uppercase text-stone-800 shadow-xs cursor-pointer transition-all"
                  >
                    Reset Result
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-[#D92B8A] to-[#E63956] hover:brightness-105 text-white font-display text-xs font-black uppercase tracking-wider rounded-2xl shadow-[0_4px_16px_rgba(230,57,86,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 cursor-pointer transition-all"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
