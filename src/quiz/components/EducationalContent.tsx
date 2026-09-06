import React, { useState } from 'react';
import {
  ChevronDown,
  GraduationCap,
  Users,
  Compass,
  BookMarked,
  Layers,
  Sliders,
  Sparkles,
  CheckCircle,
  Award,
  ArrowRight,
} from 'lucide-react';

export const EducationalContent: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      step: '01',
      badge: 'INPUT & SOURCE',
      icon: Layers,
      title: 'CHOOSE YOUR SOURCE',
      desc: 'Type a topic, paste study notes or articles, or drop in a course PDF document.',
    },
    {
      step: '02',
      badge: 'PREFERENCES',
      icon: Sliders,
      title: 'SET PREFERENCES',
      desc: 'Select question quantity, difficulty, question format, and education level.',
    },
    {
      step: '03',
      badge: 'AI GENERATION',
      icon: Sparkles,
      title: 'GENERATE QUIZ',
      desc: 'Gemini analyses the source and creates questions with explanations.',
    },
    {
      step: '04',
      badge: 'ASSESSMENT',
      icon: CheckCircle,
      title: 'TEST YOURSELF',
      desc: 'Take the single-question interactive assessment with instant feedback.',
    },
    {
      step: '05',
      badge: 'RESULTS & REVIEW',
      icon: Award,
      title: 'SEE YOUR SCORE',
      desc: 'Review mistakes, share your quiz, or try again.',
    },
  ];

  const personas = [
    {
      title: 'STUDENTS',
      role: 'Self-Testing & Exam Prep',
      desc: 'Convert textbook chapters and lecture notes into active recall quizzes to study 3x faster.',
      icon: GraduationCap,
    },
    {
      title: 'TEACHERS & EDUCATORS',
      role: 'Classroom Assessments',
      desc: 'Generate customized pop quizzes and curriculum checks tailored for any grade level in seconds.',
      icon: BookMarked,
    },
    {
      title: 'TUTORS & COACHES',
      role: 'Targeted Remediation',
      desc: 'Quickly assess student gaps across specific topics and provide instant detailed explanations.',
      icon: Users,
    },
    {
      title: 'CURIOUS MINDS',
      role: 'Lifelong Learning',
      desc: 'Explore African history, literature, scientific discoveries, or global general knowledge.',
      icon: Compass,
    },
  ];

  const faqs = [
    {
      question: 'What is an AI quiz generator?',
      answer:
        'An AI quiz generator is an intelligent educational tool that analyzes source materials (such as topics, text notes, or PDF documents) and automatically produces rigorous, accurate assessment questions, answer choices, and explanatory notes for rapid self-testing.',
    },
    {
      question: 'Can I create a quiz from a PDF?',
      answer:
        'Yes. Proudly Afrikan Quiz extracts readable text directly from your uploaded PDF or textbook files in the browser and sends the verified content to the AI engine to generate questions grounded strictly in your document.',
    },
    {
      question: 'Can I create a quiz from my notes?',
      answer:
        'Yes. Use the "Paste It" mode to input lecture notes, syllabus summaries, research papers, or web articles. The generator will extract key concepts and form balanced multiple-choice or true/false questions.',
    },
    {
      question: 'Can I choose the difficulty?',
      answer:
        'Yes. You can select between Easy (foundational definitions and clear options), Medium (nuanced conceptual questions), and Hard (deep analytical questions with plausible distractors).',
    },
    {
      question: 'Can I create multiple-choice questions?',
      answer:
        'Yes. You can choose Multiple Choice (4 choices with one correct answer), True / False statements (2 options), or Mixed mode which blends both formats for variety.',
    },
    {
      question: 'Is Proudly Afrikan Quiz free?',
      answer:
        'Yes, Proudly Afrikan Quiz is 100% free and open for students, teachers, and lifelong learners everywhere with no account requirement or hidden barriers.',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* SECTION: WHAT IS PROUDLY AFRIKAN QUIZ */}
      <section className="py-8 sm:py-12 border-b border-stone-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block">
              PLATFORM OVERVIEW
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#161616] leading-none">
              WHAT IS PROUDLY AFRIKAN QUIZ?
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-5 text-stone-600 text-base sm:text-lg md:text-xl leading-relaxed font-normal">
            <p>
              <strong className="text-[#161616] font-bold">Proudly Afrikan Quiz</strong> is a high-speed, editorial-grade AI assessment engine engineered to turn any subject, textbook excerpt, or course document into an active learning experience.
            </p>
            <p>
              It represents the vanguard of the future <strong className="text-[#161616] font-bold">Proudly Afrikan Education</strong> platform — creating tools that celebrate intellectual rigor, modern African culture, and universal knowledge accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: HOW IT WORKS */}
      <section id="how-it-works" className="py-8 sm:py-12 border-b border-stone-200/80">
        <div className="mb-10 pb-6 border-b border-stone-200/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
              THE WORKFLOW
            </span>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-[#161616] leading-[0.9]">
              HOW IT<br />
              <span className="text-[#E05A2B]">WORKS</span>
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            5 frictionless steps from raw curiosity to tested mastery.
          </p>
        </div>

        {/* Responsive Grid: 5 elevated soft cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full">
          {steps.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.step}
                className="bg-white rounded-[1.75rem] border border-stone-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all box-border min-h-[300px] group"
              >
                <div>
                  {/* Top Step + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-xl sm:text-2xl text-stone-400">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-1 bg-[#FAF0EB] text-[#E05A2B] border border-[#F0D5C9] rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#161616] text-[#E05A2B] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#E05A2B] group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display font-black text-lg sm:text-xl text-[#161616] uppercase tracking-tight leading-snug">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-sm text-stone-600 leading-relaxed font-normal mt-2.5">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-5 border-t border-stone-200 flex items-center justify-between text-xs font-mono font-bold text-[#161616]">
                  <span className="group-hover:text-[#E05A2B] transition-colors">STEP {item.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E05A2B] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: WHO IS IT FOR? */}
      <section className="py-8 sm:py-12 border-b border-stone-200/80">
        <div className="mb-10 pb-6 border-b border-stone-200/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E05A2B] block mb-1">
              TARGET AUDIENCE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
              WHO IS IT FOR?
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-stone-600 max-w-sm">
            Built for learners, educators, and institutions across the continent and the world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-[1.75rem] border border-stone-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#161616] text-[#E05A2B] flex items-center justify-center mb-5 group-hover:bg-[#E05A2B] group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-[#161616] uppercase mb-1 leading-tight">
                    {item.title}
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#E05A2B] block mb-3">
                    {item.role}
                  </span>
                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: FAQ */}
      <section id="faq" className="py-8 sm:py-12 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E05A2B] block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight text-[#161616] leading-none">
            EVERYTHING YOU NEED TO KNOW
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg md:text-xl text-[#161616] cursor-pointer hover:text-[#E05A2B] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-[#E05A2B] text-white rotate-180 border-[#E05A2B]' : 'bg-[#FAF7F0] text-[#161616]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-0 border-t border-stone-200">
                    <p className="text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed mt-4 font-normal">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

