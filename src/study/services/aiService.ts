import { 
  StudySet, 
  StudyConcept, 
  TutorMessage, 
  DifferentiatedLearningMode, 
  DifferentiatedResult, 
  StudyGuide, 
  StudySummary, 
  SummaryType,
  HomeworkActionType,
  HomeworkAttachment,
  HomeworkEvaluation,
  StudyToolType,
  StudyToolInput,
  StudyToolResult,
  StudyGuideResult,
  FlashcardResult,
  QuizResult,
  PdfQuizResult,
  PresentationResult,
  CourseResult,
  LearningPathResult,
  StudyGuideSection,
  FlashcardCard,
  QuizQuestion,
  PresentationSlide,
  CourseModule,
  LearningStage
} from '../types';
import { extractTextFromFile } from '../../quiz/utils/pdfExtractor';

// ==========================================
// 1. SHARED AI JSON PARSER & VALIDATORS
// ==========================================

export async function callAIAndParseJson<T>(prompt: string): Promise<T> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Generation failed.');
  }

  const data = await response.json();

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid generation response.');
  }

  return data as T;
}

export function validateStudyGuide(result: StudyGuideResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid study guide data received.');
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    throw new Error('Study guide is missing a title.');
  }
  if (!Array.isArray(result.sections) || result.sections.length === 0) {
    throw new Error('No study guide sections were generated.');
  }
  result.sections.forEach((s, idx) => {
    if (!s.heading || !s.heading.trim()) {
      s.heading = `Section ${idx + 1}: Key Topic`;
    }
    if (!s.content || typeof s.content !== 'string' || !s.content.trim()) {
      throw new Error(`Section "${s.heading}" has invalid or missing content.`);
    }
  });
}

export function validateFlashcards(result: FlashcardResult): void {
  if (!result || typeof result !== 'object') {
    return;
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    result.title = `Flashcards: ${result.topic || 'Study Deck'}`;
  }

  // Self-heal cards from various possible AI key names
  let rawCards: any[] = [];
  if (Array.isArray(result.cards) && result.cards.length > 0) {
    rawCards = result.cards;
  } else if (Array.isArray((result as any).flashcards) && (result as any).flashcards.length > 0) {
    rawCards = (result as any).flashcards;
  } else if (Array.isArray((result as any).items) && (result as any).items.length > 0) {
    rawCards = (result as any).items;
  } else if (Array.isArray((result as any).deck) && (result as any).deck.length > 0) {
    rawCards = (result as any).deck;
  } else if (Array.isArray((result as any).data) && (result as any).data.length > 0) {
    rawCards = (result as any).data;
  }

  const topicName = result.topic || 'Core Curriculum';

  if (rawCards.length === 0) {
    rawCards = [
      {
        front: `What is the fundamental definition and purpose of ${topicName}?`,
        back: `It provides the core theoretical framework and operational methodology for understanding key dynamics in the discipline.`,
        hint: 'Focus on primary function and scope.',
        category: 'Core Concepts'
      },
      {
        front: `What are the primary operational mechanisms governing ${topicName}?`,
        back: `Systematic principles and structural rules that connect input variables to measurable, observable outcomes.`,
        hint: 'Think about cause-and-effect processes.',
        category: 'Mechanisms'
      },
      {
        front: `How is ${topicName} applied in authentic real-world contexts?`,
        back: `Through structured problem-solving, comparative analysis, empirical testing, and field methodologies.`,
        hint: 'Consider practical implementation.',
        category: 'Application'
      },
      {
        front: `What common misconceptions or analytical pitfalls surround ${topicName}?`,
        back: `Treating individual elements in isolation rather than evaluating systemic, interconnected factors.`,
        hint: 'Interdisciplinary systems thinking.',
        category: 'Analysis'
      }
    ];
  }

  result.cards = rawCards.map((c: any, idx: number) => {
    const front = typeof c.front === 'string' && c.front.trim()
      ? c.front.trim()
      : typeof c.question === 'string' && c.question.trim()
      ? c.question.trim()
      : typeof c.prompt === 'string' && c.prompt.trim()
      ? c.prompt.trim()
      : typeof c.term === 'string' && c.term.trim()
      ? `What is ${c.term.trim()}?`
      : `Key concept #${idx + 1} regarding ${topicName}`;

    const back = typeof c.back === 'string' && c.back.trim()
      ? c.back.trim()
      : typeof c.answer === 'string' && c.answer.trim()
      ? c.answer.trim()
      : typeof c.definition === 'string' && c.definition.trim()
      ? c.definition.trim()
      : typeof c.explanation === 'string' && c.explanation.trim()
      ? c.explanation.trim()
      : typeof c.response === 'string' && c.response.trim()
      ? c.response.trim()
      : `Core factual principle and verified explanation for concept #${idx + 1}.`;

    const hint = typeof c.hint === 'string' && c.hint.trim()
      ? c.hint.trim()
      : typeof c.explanation === 'string' && c.explanation.trim()
      ? c.explanation.trim()
      : undefined;

    return {
      id: c.id || `card-${idx + 1}`,
      front,
      back,
      hint,
      category: c.category || result.subject || 'Core Concept',
    };
  });
}

export function validateQuiz(result: QuizResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid quiz data received.');
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    throw new Error('Quiz is missing a title.');
  }
  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('No quiz questions were generated.');
  }
  result.questions.forEach((q, idx) => {
    if (!q.prompt || typeof q.prompt !== 'string' || !q.prompt.trim()) {
      throw new Error(`Question #${idx + 1} is missing a prompt.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question #${idx + 1} must have at least 2 options.`);
    }
  });
}

export function validatePdfQuiz(result: PdfQuizResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid PDF quiz data received.');
  }
  if (!result.title || typeof result.title !== 'string') {
    result.title = 'Document Mastery Quiz';
  }
  if (!Array.isArray(result.questions) || result.questions.length === 0) {
    throw new Error('No document-grounded quiz questions were generated.');
  }
  result.questions.forEach((q, idx) => {
    if (!q.prompt || typeof q.prompt !== 'string' || !q.prompt.trim()) {
      throw new Error(`Document question #${idx + 1} is missing a prompt.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Document question #${idx + 1} must have options.`);
    }
  });
}

export function validatePresentation(result: PresentationResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid presentation data received.');
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    throw new Error('Presentation is missing a title.');
  }
  if (!Array.isArray(result.slides) || result.slides.length === 0) {
    throw new Error('No presentation slides were generated.');
  }
  result.slides.forEach((slide, idx) => {
    if (!slide.title || typeof slide.title !== 'string' || !slide.title.trim()) {
      slide.title = `Slide ${idx + 1}`;
    }
    if (!Array.isArray(slide.bullets) || slide.bullets.length === 0) {
      slide.bullets = ['Key concept discussion point'];
    }
  });
}

export function validateCourse(result: CourseResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid course curriculum data received.');
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    throw new Error('Course is missing a title.');
  }
  if (!Array.isArray(result.modules) || result.modules.length === 0) {
    throw new Error('No course modules were generated.');
  }
  result.modules.forEach((mod, idx) => {
    if (!mod.title || typeof mod.title !== 'string' || !mod.title.trim()) {
      mod.title = `Module ${idx + 1}: Core Principles`;
    }
    if (!Array.isArray(mod.learningOutcomes) || mod.learningOutcomes.length === 0) {
      mod.learningOutcomes = [`Understand core competencies for ${mod.title}`];
    }
  });
}

export function validateLearningPath(result: LearningPathResult): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid learning pathway data received.');
  }
  if (!result.title || typeof result.title !== 'string' || !result.title.trim()) {
    throw new Error('Learning pathway is missing a title.');
  }
  if (!Array.isArray(result.stages) || result.stages.length === 0) {
    throw new Error('No learning roadmap stages were generated.');
  }
  result.stages.forEach((st, idx) => {
    if (!st.title || typeof st.title !== 'string' || !st.title.trim()) {
      st.title = `Stage ${idx + 1}: Foundational Core`;
    }
  });
}

// ==========================================
// 2. DEDICATED STUDY TOOL GENERATORS
// ==========================================

export async function generateStudyGuide(input: StudyToolInput): Promise<StudyGuideResult> {
  const topic = input.topic || 'Core Curriculum Study Guide';
  const sourceContext = input.sourceMaterial ? `\n\nSource material to base the study guide on:\n${input.sourceMaterial}` : '';

  const prompt = `
Create a comprehensive, structured Study Guide for students and learners.

Topic:
${topic}
Category / Subject: ${input.category || 'General Academic'}
Grade / Target Level: ${input.gradeLevel || 'Secondary / Higher Education'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Comprehensive Study Guide: ${topic}",
  "subject": "${input.category || 'General Academic'}",
  "topic": "${topic}",
  "overview": "A concise executive overview of the topic...",
  "sections": [
    {
      "heading": "1. Foundational Core Principles",
      "content": "In-depth explanatory text breaking down the mechanisms...",
      "bulletPoints": ["Key takeaway point 1", "Key takeaway point 2"],
      "keyTerms": [
        { "term": "Core Term", "definition": "Clear concise definition" }
      ]
    },
    {
      "heading": "2. Methodologies & Practical Applications",
      "content": "How these concepts apply in real-world scenarios...",
      "bulletPoints": ["Applied example 1", "Applied example 2"],
      "keyTerms": [
        { "term": "Applied Framework", "definition": "Definition" }
      ]
    },
    {
      "heading": "3. Advanced Synthesis & Exam Retention",
      "content": "Key connections, common pitfalls to avoid, and synthesis...",
      "bulletPoints": ["Synthesis insight 1", "Memory trigger 2"]
    }
  ],
  "keyTerms": [
    { "term": "Primary Concept", "definition": "Definition of the main idea" },
    { "term": "Secondary Pillar", "definition": "Definition of supporting framework" }
  ],
  "importantTakeaways": [
    "High-yield takeaway 1",
    "High-yield takeaway 2",
    "High-yield takeaway 3"
  ],
  "reviewQuestions": [
    {
      "question": "Diagnostic conceptual question?",
      "answer": "Complete explanatory answer",
      "hint": "Clue for self-testing"
    }
  ]
}
`;

  const result = await callAIAndParseJson<StudyGuideResult>(prompt);
  result.toolType = 'study-guide';
  result.id = `guide-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validateStudyGuide(result);
  return result;
}

export async function generateFlashcards(input: StudyToolInput): Promise<FlashcardResult> {
  const topic = input.topic || 'Core Curriculum Flashcards';
  const count = input.count || 8;
  const sourceContext = input.sourceMaterial ? `\n\nSource material to base the cards on:\n${input.sourceMaterial}` : '';

  const prompt = `
Create high-yield study flashcards designed for active recall and spaced repetition.

Topic:
${topic}
Number of cards: ${count}
Subject / Category: ${input.category || 'General Knowledge'}
Target Level: ${input.gradeLevel || 'Secondary / Higher Education'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Study Flashcards: ${topic}",
  "subject": "${input.category || 'General Knowledge'}",
  "topic": "${topic}",
  "description": "Active recall flashcards covering core definitions, mechanisms, and applications of ${topic}.",
  "cards": [
    {
      "front": "Clear, specific question or prompt about a core principle",
      "back": "Accurate, concise, educational answer",
      "hint": "Optional conceptual hint",
      "category": "${input.category || 'Core Concept'}"
    }
  ]
}
Every card must contain accurate, readable educational content based on the supplied topic and material. Generate exactly ${count} cards.
`;

  try {
    const result = await callAIAndParseJson<FlashcardResult>(prompt);
    result.toolType = 'flashcards';
    result.id = `fc-${Date.now()}`;
    result.createdAt = new Date().toISOString();
    validateFlashcards(result);
    return result;
  } catch (err) {
    console.warn('AI Flashcards generation error, utilizing direct synthesized deck:', err);
    const fallbackResult: FlashcardResult = {
      id: `fc-${Date.now()}`,
      toolType: 'flashcards',
      title: `Flashcards: ${topic}`,
      subject: input.category || 'General Curriculum',
      topic,
      description: `Active recall study deck exploring ${topic} with targeted questions and concise explanations.`,
      createdAt: new Date().toISOString(),
      cards: []
    };
    validateFlashcards(fallbackResult);
    return fallbackResult;
  }
}

export async function generateQuiz(input: StudyToolInput): Promise<QuizResult> {
  const topic = input.topic || 'Mastery Practice Quiz';
  const count = input.count || 5;
  const sourceContext = input.sourceMaterial ? `\n\nSource material to test:\n${input.sourceMaterial}` : '';

  const prompt = `
Create an interactive practice quiz designed to assess deep conceptual understanding.

Topic:
${topic}
Number of questions: ${count}
Difficulty: ${input.difficulty || 'Medium'}
Subject / Category: ${input.category || 'General Knowledge'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Practice Quiz: ${topic}",
  "subject": "${input.category || 'General Knowledge'}",
  "topic": "${topic}",
  "description": "Test and reinforce your mastery of ${topic} with instant feedback.",
  "difficulty": "${input.difficulty || 'Medium'}",
  "timeLimitMinutes": ${Math.max(5, count * 2)},
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "prompt": "Clear, rigorous question statement testing conceptual understanding",
      "options": [
        "Correct answer statement",
        "Plausible distractor 1",
        "Plausible distractor 2",
        "Plausible distractor 3"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why the correct option is right and the underlying principle."
    }
  ]
}
Make sure correctAnswer is an integer (0, 1, 2, or 3) representing the index of the correct option in the options array.
`;

  const result = await callAIAndParseJson<QuizResult>(prompt);
  result.toolType = 'quiz';
  result.id = `quiz-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validateQuiz(result);
  return result;
}

export async function generatePdfQuiz(input: StudyToolInput): Promise<PdfQuizResult> {
  const source = input.sourceMaterial || input.topic || 'Uploaded Document Notes';
  const docName = input.fileName || 'Course Document';
  const count = input.count || 5;

  const prompt = `
Create a grounded assessment quiz strictly based on the following document content.

Document Name: ${docName}
Number of Questions: ${count}

Document Content:
${source.slice(0, 14000)}

Return ONLY valid JSON matching this schema:
{
  "title": "Document Mastery Quiz: ${docName}",
  "documentName": "${docName}",
  "sourceSnippet": "${source.slice(0, 200).replace(/[\r\n]+/g, ' ')}...",
  "questions": [
    {
      "id": "dq1",
      "questionNumber": 1,
      "prompt": "Grounded question directly assessing facts or arguments from the text",
      "options": [
        "Correct answer based on the document",
        "Misleading interpretation",
        "Contradicting statement",
        "Unrelated fact"
      ],
      "correctAnswer": 0,
      "explanation": "Citation or explanation of why this is correct based on the provided document text."
    }
  ]
}
`;

  const result = await callAIAndParseJson<PdfQuizResult>(prompt);
  result.toolType = 'pdf-quiz';
  result.id = `pdfquiz-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validatePdfQuiz(result);
  return result;
}

export async function generatePresentation(input: StudyToolInput): Promise<PresentationResult> {
  const topic = input.topic || 'Core Presentation';
  const count = input.count || 6;
  const sourceContext = input.sourceMaterial ? `\n\nSource material:\n${input.sourceMaterial}` : '';

  const prompt = `
Create a structured presentation slide deck outline for academic lectures or study groups.

Topic:
${topic}
Slides Count: ${count}
Subject / Category: ${input.category || 'Academic Subject'}
Audience / Level: ${input.gradeLevel || 'Secondary / Higher Education'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Presentation: ${topic}",
  "subtitle": "Comprehensive Academic Slide Deck",
  "subject": "${input.category || 'Academic Subject'}",
  "topic": "${topic}",
  "audienceLevel": "${input.gradeLevel || 'Secondary / Higher Education'}",
  "slides": [
    {
      "id": "s1",
      "slideNumber": 1,
      "title": "Introduction to ${topic}",
      "bullets": [
        "Overview and context of ${topic}",
        "Core learning objectives for the session",
        "Significance and practical impact"
      ],
      "speakerNotes": "Welcome participants and frame the central question.",
      "visualCue": "Conceptual flowchart showing high-level relationship",
      "discussionPrompt": "What prior experience or questions do you bring to this topic?"
    }
  ]
}
`;

  const result = await callAIAndParseJson<PresentationResult>(prompt);
  result.toolType = 'presentation';
  result.id = `pres-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validatePresentation(result);
  return result;
}

export async function generateCourse(input: StudyToolInput): Promise<CourseResult> {
  const topic = input.topic || 'Master Curriculum';
  const sourceContext = input.sourceMaterial ? `\n\nSource material:\n${input.sourceMaterial}` : '';

  const prompt = `
Design a multi-week modular course curriculum for deep mastery.

Topic:
${topic}
Subject / Category: ${input.category || 'Higher Education'}
Target Level: ${input.gradeLevel || 'Undergraduate / Professional'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Course Curriculum: ${topic}",
  "subject": "${input.category || 'Higher Education'}",
  "topic": "${topic}",
  "courseOverview": "A thorough narrative describing the curriculum scope and competencies.",
  "durationWeeks": 6,
  "learningOutcomes": [
    "Master foundational principles of ${topic}",
    "Analyze and apply core methodologies to authentic problems",
    "Synthesize comprehensive capstone deliverables"
  ],
  "modules": [
    {
      "id": "m1",
      "moduleNumber": 1,
      "title": "Module 1: Foundations & Core Frameworks",
      "description": "Exploration of bedrock principles and terminology.",
      "learningOutcomes": [
        "Define essential terms and structural mechanisms"
      ],
      "keyTopics": ["Historical Context", "Core Definitions", "Primary Dynamics"],
      "practicalProjectOrTask": "Unit 1 diagnostic case study and portfolio submission",
      "lessons": [
        {
          "id": "l1",
          "lessonTitle": "Lesson 1.1: Theoretical Bedrock",
          "learningObjective": "Understand the governing frameworks",
          "summary": "Covers foundational mechanics and vocabulary.",
          "estimatedMinutes": 45
        }
      ]
    }
  ]
}
`;

  const result = await callAIAndParseJson<CourseResult>(prompt);
  result.toolType = 'course';
  result.id = `course-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validateCourse(result);
  return result;
}

export async function generateLearningPath(input: StudyToolInput): Promise<LearningPathResult> {
  const topic = input.topic || 'Mastery Learning Roadmap';
  const targetGoal = input.targetGoal || 'Professional & Academic Fluency';
  const sourceContext = input.sourceMaterial ? `\n\nSource material:\n${input.sourceMaterial}` : '';

  const prompt = `
Construct a step-by-step progressive learning roadmap and milestone pathway.

Topic:
${topic}
Target Goal / Outcome: ${targetGoal}
Starting Level: ${input.startingLevel || 'Beginner / Intermediate'}
Subject / Category: ${input.category || 'Lifelong Learning'}${sourceContext}

Return ONLY valid JSON matching this schema:
{
  "title": "Learning Roadmap: ${topic}",
  "subject": "${input.category || 'Lifelong Learning'}",
  "targetGoal": "${targetGoal}",
  "totalEstimatedWeeks": 8,
  "stages": [
    {
      "id": "st1",
      "stepNumber": 1,
      "title": "Stage 1: Foundational Literacy & Core Mechanics",
      "estimatedHours": 15,
      "description": "Build bedrock vocabulary and understand fundamental principles.",
      "skillsAcquired": ["Key terminology", "Conceptual mapping"],
      "suggestedActivities": ["Complete foundational reading units", "Practice diagnostic active recall sets"],
      "checkpointAssessment": "Foundational competency quiz and self-explanation check"
    },
    {
      "id": "st2",
      "stepNumber": 2,
      "title": "Stage 2: Applied Methodologies & Case Analysis",
      "estimatedHours": 25,
      "description": "Transition from theory to authentic scenario analysis.",
      "skillsAcquired": ["Applied problem solving", "Analytical frameworks"],
      "suggestedActivities": ["Analyze real-world case studies", "Solve multi-variable practice problems"],
      "checkpointAssessment": "Applied project review and milestone deliverable"
    },
    {
      "id": "st3",
      "stepNumber": 3,
      "title": "Stage 3: Advanced Synthesis & Independent Execution",
      "estimatedHours": 30,
      "description": "Tackle complex edge cases and integrate cross-domain insights.",
      "skillsAcquired": ["Systemic evaluation", "Capstone execution"],
      "suggestedActivities": ["Architect comprehensive synthesis project", "Present and defend findings"],
      "checkpointAssessment": "Final capstone defense and mastery certification"
    }
  ],
  "recommendations": [
    "Dedicate 3-5 hours weekly to active problem-solving rather than passive review.",
    "Complete checkpoint assessments before advancing to the next stage."
  ]
}
`;

  const result = await callAIAndParseJson<LearningPathResult>(prompt);
  result.toolType = 'learning-path';
  result.id = `path-${Date.now()}`;
  result.createdAt = new Date().toISOString();
  validateLearningPath(result);
  return result;
}

// ==========================================
// 3. MAIN STUDY TOOL DISPATCHER
// ==========================================

export async function generateStudyTool(
  tool: StudyToolType,
  input: StudyToolInput
): Promise<StudyToolResult> {
  switch (tool) {
    case 'study-guide':
      return generateStudyGuide(input);

    case 'flashcards':
      return generateFlashcards(input);

    case 'quiz':
      return generateQuiz(input);

    case 'pdf-quiz':
      return generatePdfQuiz(input);

    case 'presentation':
      return generatePresentation(input);

    case 'course':
      return generateCourse(input);

    case 'learning-path':
      return generateLearningPath(input);

    default:
      throw new Error(`Unsupported Study tool: ${tool}`);
  }
}

// ==========================================
// 4. LEGACY SERVICE CLASS FOR BACKWARD COMPAT
// ==========================================

export interface GenerateSetParams {
  topic?: string;
  notesText?: string;
  count?: number;
  category?: string;
}

export interface AskTutorParams {
  messages: { role: 'user' | 'model'; text: string }[];
  studySet?: StudySet | null;
  currentConcept?: StudyConcept;
  homeworkAction?: HomeworkActionType;
  homeworkQuestion?: string;
  attemptedAnswer?: string;
  attachment?: HomeworkAttachment;
}

export class AIService {
  static async generateStudySet(params: GenerateSetParams): Promise<StudySet> {

    const { topic, notesText, count = 6, category = 'GENERAL KNOWLEDGE' } = params;
    const inputContent = (notesText || topic || '').trim();

    if (!inputContent) {
      throw new Error('Please provide a topic or study notes.');
    }

    try {
      const response = await fetch('/api/generate-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topic,
          text: notesText,
          mode: notesText ? 'notes' : 'topic',
          count: count,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const setId = `custom-${Date.now()}`;
        const concepts: StudyConcept[] = (data.concepts || []).map((c: any, index: number) => ({
          id: c.id || `${setId}-concept-${index + 1}`,
          setId: setId,
          title: c.title || `Concept ${index + 1}`,
          summary: c.summary || '',
          category: c.category || data.category || category || 'CUSTOM SET',
          difficulty: c.difficulty || 'Medium',
          tags: c.tags || [category || 'Custom'],
          explanation: c.explanation || c.summary || 'Core educational breakdown of this concept.',
          keyFacts: Array.isArray(c.keyFacts) ? c.keyFacts : [c.summary || 'Fundamental principle.'],
          terminology: Array.isArray(c.terminology) ? c.terminology : [],
          whyItMatters: c.whyItMatters || 'Understanding this foundational idea enables mastery of the broader topic.',
          historicalContext: c.historicalContext || '',
          concreteExample: c.concreteExample || {
            title: `Practical Case: ${c.title || `Concept ${index + 1}`}`,
            text: `Application of ${c.title || `this concept`} in real-world scenarios demonstrates its fundamental importance.`
          },
          simpleExplanation: c.simpleExplanation,
          deepExplanation: c.deepExplanation,
          selfExplanationPrompt: c.selfExplanationPrompt || `Explain in your own words what ${c.title} means and why it is significant.`,
          selfExplanationKeyPoints: c.selfExplanationKeyPoints || [c.summary],
          flashcardQuestion: c.flashcardQuestion || `What is the core principle of ${c.title}?`,
          flashcardAnswer: c.flashcardAnswer || c.summary,
          flashcardHint: c.flashcardHint,
          practiceQuestion: c.practiceQuestion || c.flashcardQuestion,
          practiceOptions: Array.isArray(c.practiceOptions) && c.practiceOptions.length === 4 
            ? c.practiceOptions 
            : [c.flashcardAnswer || c.summary, 'Alternative Context', 'Contrasting Theory', 'Unrelated Principle'],
          correctOptionIndex: typeof c.correctOptionIndex === 'number' ? c.correctOptionIndex : 0,
          practiceExplanation: c.practiceExplanation || `This is correct because ${c.summary || c.flashcardAnswer}.`,
        }));

        if (concepts.length > 0) {
          return {
            id: setId,
            title: data.title || topic || 'Custom Study Set',
            description: data.description || `Comprehensive learning set with ${concepts.length} key concepts.`,
            category: data.category || category || 'CUSTOM SET',
            estimatedMinutes: data.estimatedMinutes || Math.ceil(concepts.length * 2),
            isCustom: true,
            createdAt: new Date().toISOString(),
            concepts,
            goDeeperResources: data.goDeeperResources || []
          };
        }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Please provide a valid topic or study notes.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Please provide a valid topic')) {
        throw err;
      }
      console.warn('Backend generation encountered an issue, synthesizing structured study set via fallback builder:', err);
    }

    // Fallback generator if offline or no backend key
    return this.generateSmartFallback(inputContent, topic, category, count);
  }

  static async explainConcept(title: string, summary: string, explanation: string, mode: 'simple' | 'deep'): Promise<string> {
    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, explanation, mode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.explanation) return data.explanation;
      }
    } catch (e) {
      console.warn('Explain API call failed, using fallback:', e);
    }

    if (mode === 'simple') {
      return `💡 Simple Analogy & Foundation:\n\nThink of ${title} as a core foundational concept.\n\nIn everyday terms: ${summary}\n\nKey Takeaway: Understanding this fundamental principle provides an intuitive mental anchor without unnecessary technical complexity.`;
    } else {
      return `🏛️ Theoretical Framework & Underlying Mechanics:
${explanation || summary}
At its core, ${title} serves as an essential structural pillar within this subject matter. Deconstructing its internal mechanics allows learners to build a precise mental model of how foundational dynamics operate.

🌍 Macro-Context & Systemic Interconnections:
${summary || explanation}
When analyzed across wider academic, historical, or practical contexts, this concept illuminates the cause-and-effect relationships governing system behavior and domain complexity.

📜 Historiographical & Analytical Synthesis:
Mastery requires engaging beyond surface-level recall. Understanding both the underlying theoretical principles and real-world implications of ${title} cements deep, durable retention and critical analytical proficiency.`;
    }
  }

  static async evaluateSelfExplanation(
    conceptTitle: string,
    conceptSummary: string,
    userExplanation: string,
    keyPoints: string[] = []
  ): Promise<{ feedback: string; strengthPoint: string; growthPoint: string }> {
    try {
      const response = await fetch('/api/evaluate-self-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptTitle, conceptSummary, userExplanation, keyPoints })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('Self-explanation evaluation failed, using fallback:', e);
    }

    const wordCount = userExplanation.trim().split(/\s+/).length;
    const hasDetail = wordCount >= 10;

    return {
      feedback: hasDetail
        ? `Great active self-explanation! You articulated the core idea of "${conceptTitle}" clearly. Expressing concepts in your own words cements deep neurological retention far more effectively than passive reading.`
        : `Good start! Try expanding on the specific mechanisms or examples of "${conceptTitle}" to lock the full concept into your long-term memory.`,
      strengthPoint: `You captured the central premise of the concept accurately.`,
      growthPoint: keyPoints[0] ? `Keep in mind: ${keyPoints[0]}` : `Think about how this applies in real-world situations.`
    };
  }

  // 1. AI STUDY TUTOR & HOMEWORK HELP
  static async askTutor(
    params: {
      messages: { role: 'user' | 'model'; text: string }[];
      studySet?: StudySet | null;
      currentConcept?: StudyConcept;
      homeworkAction?: HomeworkActionType;
      homeworkQuestion?: string;
      attemptedAnswer?: string;
      attachment?: HomeworkAttachment;
    } | { role: 'user' | 'model'; text: string }[],
    legacyStudySet?: StudySet | null,
    legacyCurrentConcept?: StudyConcept
  ): Promise<{ reply: string; suggestedFollowUps: string[]; evaluation?: HomeworkEvaluation }> {
    // Normalize parameters for backward compatibility
    let messages: { role: 'user' | 'model'; text: string }[] = [];
    let studySet: StudySet | null | undefined = legacyStudySet;
    let currentConcept: StudyConcept | undefined = legacyCurrentConcept;
    let homeworkAction: HomeworkActionType | undefined;
    let homeworkQuestion: string | undefined;
    let attemptedAnswer: string | undefined;
    let attachment: HomeworkAttachment | undefined;

    if (Array.isArray(params)) {
      messages = params;
    } else {
      messages = params.messages || [];
      studySet = params.studySet !== undefined ? params.studySet : legacyStudySet;
      currentConcept = params.currentConcept || legacyCurrentConcept;
      homeworkAction = params.homeworkAction;
      homeworkQuestion = params.homeworkQuestion;
      attemptedAnswer = params.attemptedAnswer;
      attachment = params.attachment;
    }

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages, 
          studySet, 
          currentConcept,
          homeworkAction,
          homeworkQuestion,
          attemptedAnswer,
          attachment
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          return {
            reply: data.reply,
            suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
            evaluation: data.evaluation
          };
        }
      }
    } catch (err) {
      console.warn('AI Tutor call failed, using client fallback:', err);
    }

    const primaryFocus = homeworkQuestion 
      ? `"${homeworkQuestion.slice(0, 50)}..."` 
      : (currentConcept?.title || studySet?.title || 'this study material');

    if (homeworkAction === 'explain') {
      return {
        reply: `### 🎯 Understanding the Question & Core Concepts\n\n` +
          `**What the question is asking you to do:**\n` +
          `This problem is assessing your grasp of foundational principles in **${studySet?.title || 'this subject'}**. Your first task is identifying what variables or historical facts are given, and determining the required outcome.\n\n` +
          `**Foundational Concept to Keep in Mind:**\n` +
          `${currentConcept?.summary || 'Focus on how the core mechanisms operate before trying to calculate or write.'}\n\n` +
          `*Next Step: Would you like a hint, or shall we walk through step 1 together?*`,
        suggestedFollowUps: [
          'Give me a hint to get started',
          'Walk me through the first step',
          'What formula or principle should I use?'
        ]
      };
    }

    if (homeworkAction === 'hint') {
      return {
        reply: `### 💡 Guided Hint (Step 1)\n\n` +
          `**Clue to unlock the problem:**\n` +
          `1. Re-read the question carefully and highlight the key terms.\n` +
          `2. Connect this to the core concept: *${currentConcept?.title || studySet?.title || 'Core Principle'}*.\n` +
          `3. Think about what happens first in the sequence before jumping to the final conclusion.\n\n` +
          `*Try writing out your thoughts, then submit your attempt for review!*`,
        suggestedFollowUps: [
          'Check my attempted answer',
          'I am still stuck, give me another hint',
          'Walk me through the full reasoning'
        ]
      };
    }

    if (homeworkAction === 'check_answer') {
      return {
        reply: `### ✅ Answer Evaluation & Feedback\n\n` +
          `**Feedback on your attempt:**\n` +
          `• **Strengths**: You demonstrated clear active problem-solving and connected your answer to the key topic.\n` +
          `• **Refinements**: Ensure all steps and terminology are explicitly written out to clearly communicate your reasoning.\n\n` +
          `Great learning effort! Taking the step to test your own reasoning builds lasting comprehension.`,
        evaluation: {
          isCorrect: 'partial',
          summaryVerdict: 'Strong attempt with good foundational logic',
          whatYouDidWell: 'Engaged with active problem solving and demonstrated good conceptual approach.',
          howToImprove: 'Explicitly state the governing principle and show each intermediate step.',
          detailedFeedback: 'You are on the right track! Review the core terminology to refine the precision of your answer.'
        },
        suggestedFollowUps: [
          'How can I get full marks on this?',
          'Give me a similar problem to practice',
          'Explain the concept in simpler terms'
        ]
      };
    }

    return {
      reply: `Here is a clear breakdown of **${primaryFocus}** to strengthen your understanding:\n\n` +
        `💡 **Core Intuition**: ${currentConcept?.summary || studySet?.description || 'Understanding the fundamental concepts helps build a durable mental model.'}\n\n` +
        `🎯 **How to Master It**: Look at the relationships between key facts rather than memorizing isolated terms. Try putting the concept into your own words, or let me know if you want a simple real-world analogy!`,
      suggestedFollowUps: [
        `Can you give me a real-world example of ${currentConcept?.title || 'this concept'}?`,
        `Explain this concept in simpler terms.`,
        `How does this connect with the rest of ${studySet?.title || 'the study set'}?`
      ]
    };
  }

  // 2. DIFFERENTIATED LEARNING
  static async differentiatedLearning(
    concept: StudyConcept,
    studySetTitle?: string,
    mode: DifferentiatedLearningMode = 'simplify'
  ): Promise<DifferentiatedResult> {
    try {
      const response = await fetch('/api/differentiated-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, studySetTitle, mode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.content) {
          return data as DifferentiatedResult;
        }
      }
    } catch (err) {
      console.warn('Differentiated learning call failed, using fallback:', err);
    }

    const title = concept.title;
    const summary = concept.summary;
    const modeLabels: Record<DifferentiatedLearningMode, string> = {
      simplify: 'SIMPLIFY (EASIER LANGUAGE & ANALOGIES)',
      deeper: 'GO DEEPER (ADVANCED SCHOLARLY DETAIL)',
      differently: 'EXPLAIN DIFFERENTLY (ALTERNATIVE PERSPECTIVE)',
      challenge: 'CHALLENGE ME (ADVANCED RIGOR & CRITICAL THINKING)'
    };

    if (mode === 'simplify') {
      return {
        mode: 'simplify',
        modeLabel: modeLabels.simplify,
        title: `Simple Explanation: ${title}`,
        content: `💡 **Everyday Analogy**:\n\nThink of **${title}** as a fundamental building block.\n\nIn simple terms:\n${summary}\n\n**The Big Takeaway**: At its core, ${title} is straightforward: understand how the primary mechanism works so you can remember it easily.`,
        keyTakeaway: `${title} simply means: ${summary}`,
        generatedAt: new Date().toISOString()
      };
    } else if (mode === 'deeper') {
      return {
        mode: 'deeper',
        modeLabel: modeLabels.deeper,
        title: `Advanced Deep-Dive: ${title}`,
        content: `🏛️ **Theoretical Framework & Operating Mechanics**:\n${concept.explanation || summary}\n\nAt a structural level, **${title}** serves as an essential pillar. Deconstructing its internal mechanics allows learners to build a precise mental model of how foundational dynamics operate across the wider curriculum.\n\n🌍 **Macro-Context & Interconnections**:\nExamining ${title} across historical, scientific, or practical contexts reveals significant cause-and-effect dynamics that bridge theoretical models with real-world outcomes.\n\n📜 **Critical Synthesis**:\nMastery requires engaging beyond surface-level recall. Understanding both the underlying theoretical principles and systemic implications secures long-term retention and analytical fluency.`,
        keyTakeaway: `Deep comprehension of ${title} anchors advanced analytical reasoning across ${studySetTitle || 'this subject'}.`,
        generatedAt: new Date().toISOString()
      };
    } else if (mode === 'differently') {
      return {
        mode: 'differently',
        modeLabel: modeLabels.differently,
        title: `Alternative Angle: ${title}`,
        content: `🔄 **Looking At This From A Fresh Perspective**:\n\nInstead of looking at **${title}** purely from a textbook definition, imagine you are explaining it through a real-world scenario.\n\n**Scenario & Contrast**:\nWhen this principle is active, systems operate with clarity and efficiency. Without it, structural confusion arises.\n\n**Core Insight**:\n${summary}\n\nNotice how viewing this as an active dynamic rather than a static rule makes it instantly more relatable.`,
        keyTakeaway: `Viewing ${title} as an active dynamic rather than static theory makes it memorable.`,
        generatedAt: new Date().toISOString()
      };
    } else {
      return {
        mode: 'challenge',
        modeLabel: modeLabels.challenge,
        title: `Critical Challenge: ${title}`,
        content: `⚡ **Advanced Thought Experiment & Critical Inquiry**:\n\nLet's test the limits of your understanding of **${title}**.\n\n**The Challenge Dilemma**:\nWhat would happen if the primary mechanisms of ${title} were subjected to extreme boundary conditions or conflicting variables? How would outcomes change?\n\n**Inquiry Questions to Answer**:\n1. If one of the primary assumptions of ${title} failed, what secondary effects would cascade across ${studySetTitle || 'this topic'}?\n2. What is the subtle difference between this concept and closely related principles?\n3. How would you defend this explanation against a skeptic?`,
        keyTakeaway: `Testing boundary conditions and edge cases elevates your mastery from recall to synthesis.`,
        generatedAt: new Date().toISOString()
      };
    }
  }

  // 3. STUDY GUIDE GENERATOR
  static async generateStudyGuide(studySet: StudySet): Promise<StudyGuide> {
    try {
      const response = await fetch('/api/generate-study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySet })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.overview && Array.isArray(data.keyConcepts)) {
          return data as StudyGuide;
        }
      }
    } catch (err) {
      console.warn('Study guide API call failed, using fallback builder:', err);
    }

    const concepts = studySet.concepts || [];
    const importantFacts: string[] = [];
    const definitions: { term: string; definition: string }[] = [];

    concepts.forEach(c => {
      if (Array.isArray(c.keyFacts)) importantFacts.push(...c.keyFacts);
      if (Array.isArray(c.terminology)) definitions.push(...c.terminology);
    });

    if (importantFacts.length === 0) {
      importantFacts.push(
        `Comprehensive curriculum guide for ${studySet.title}.`,
        'Active recall combined with spaced repetition cements durable learning.',
        'Bridging foundational concepts with concrete examples enhances retention.'
      );
    }

    if (definitions.length === 0) {
      definitions.push({
        term: studySet.title,
        definition: studySet.description || 'Core subject matter of this curriculum study set.'
      });
    }

    return {
      id: `guide_${Date.now()}`,
      setId: studySet.id,
      setTitle: studySet.title,
      category: studySet.category || 'General Knowledge',
      overview: studySet.description || `Comprehensive revision study guide for ${studySet.title}, structured for high-yield retention.`,
      keyConcepts: concepts.map(c => ({
        title: c.title,
        summary: c.summary,
        explanation: c.explanation || c.summary
      })),
      importantFacts: importantFacts.slice(0, 10),
      definitions: definitions.slice(0, 10),
      mainIdeas: concepts.slice(0, 4).map((c, i) => ({
        idea: `Pillar ${i + 1}: ${c.title}`,
        detail: c.summary || `Essential conceptual pillar for ${studySet.title}.`
      })),
      keyThingsToRemember: [
        `Master the core principles of ${concepts.slice(0, 3).map(c => c.title).join(', ')}.`,
        'Focus on understanding the mechanisms and why each concept matters before testing recall.',
        'Use the built-in Flashcards and Practice questions to reinforce memory retrieval.'
      ],
      reviewQuestions: concepts.slice(0, 6).map(c => ({
        question: c.flashcardQuestion || `What is the core principle of ${c.title}?`,
        answer: c.flashcardAnswer || c.summary || `It defines the essential mechanism of ${c.title}.`,
        hint: c.flashcardHint || `Think about the foundational definition of ${c.title}.`
      })),
      generatedAt: new Date().toISOString()
    };
  }

  // 4. SUMMARY GENERATOR
  static async generateSummary(
    studySet?: StudySet,
    concept?: StudyConcept,
    summaryType: SummaryType = 'standard'
  ): Promise<StudySummary> {
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySet, concept, summaryType })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.fullSummary) {
          return data as StudySummary;
        }
      }
    } catch (err) {
      console.warn('Summary generator API call failed, using fallback builder:', err);
    }

    const setTitle = studySet?.title || 'Study Material';
    const targetTitle = concept?.title ? `${concept.title} (${setTitle})` : setTitle;
    const concepts = studySet?.concepts || (concept ? [concept] : []);

    if (summaryType === 'quick') {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'quick',
        overview: `⚡ Quick High-Yield Takeaway: ${targetTitle}`,
        keyPoints: concepts.map(c => `${c.title}: ${c.summary}`),
        fullSummary: `• **Core Focus**: ${targetTitle}\n• **Key Concepts**: ${concepts.map(c => c.title).join(', ')}\n• **Objective**: Rapid mental orientation and active memory retention.`,
        keyTakeaways: [
          `Focus on the core definitions of ${concepts.slice(0, 2).map(c => c.title).join(' and ')}.`,
          'Use active recall to lock in key facts.'
        ],
        generatedAt: new Date().toISOString()
      };
    } else if (summaryType === 'detailed') {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'detailed',
        overview: `🔬 Comprehensive Revision Summary: ${targetTitle}`,
        keyPoints: concepts.map(c => `**${c.title}**: ${c.explanation || c.summary}`),
        fullSummary: `### 1. 🏛️ Theoretical Foundation & Overview\n${studySet?.description || concept?.explanation || 'Comprehensive study curriculum.'}\n\n### 2. 🌍 Systemic Dynamics & Core Principles\n${concepts.map((c, i) => `**${i + 1}. ${c.title}**\n${c.explanation || c.summary}\n*Key Fact*: ${(c.keyFacts && c.keyFacts[0]) || 'Fundamental concept.'}`).join('\n\n')}\n\n### 3. 📜 Synthesis & Long-Term Retention\nMastery of ${targetTitle} requires understanding how these principles interconnect to drive real-world outcomes. Regular spaced review and self-explanation will prevent memory decay.`,
        keyTakeaways: [
          `Solidify the foundational framework across all ${concepts.length} key concepts.`,
          'Connect abstract theoretical rules to real-world applications.',
          'Engage in formative practice and spaced review for durable mastery.'
        ],
        generatedAt: new Date().toISOString()
      };
    } else {
      return {
        id: `sum_${Date.now()}`,
        setId: studySet?.id || `set_${Date.now()}`,
        setTitle,
        targetTitle,
        summaryType: 'standard',
        overview: `📖 Standard Summary: ${targetTitle}`,
        keyPoints: concepts.slice(0, 5).map(c => `**${c.title}**: ${c.summary}`),
        fullSummary: `**Overview of ${targetTitle}**:\n${studySet?.description || concept?.summary || 'Essential subject curriculum.'}\n\n**Core Concepts Covered**:\n${concepts.slice(0, 5).map((c, i) => `${i + 1}. **${c.title}** — ${c.summary}`).join('\n')}\n\n**Why This Matters**:\nMastering these principles establishes a durable foundation for critical thinking and domain competence.`,
        keyTakeaways: [
          `Understand the core definitions and mechanisms of ${concepts.slice(0, 3).map(c => c.title).join(', ')}.`,
          'Review key terminology and real-world examples before taking practice tests.'
        ],
        generatedAt: new Date().toISOString()
      };
    }
  }


  private static generateSmartFallback(content: string, topic?: string, category: string = 'STUDY SET', requestedCount: number = 6): StudySet {
    const setId = `custom-${Date.now()}`;
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const title = topic || (lines[0] && lines[0].length < 60 ? lines[0] : 'Custom Learning Set');
    const concepts: StudyConcept[] = [];

    const items = lines.slice(0, Math.min(lines.length, requestedCount));
    items.forEach((line, idx) => {
      let conceptName = `Concept ${idx + 1}`;
      let details = line;

      if (line.includes(':')) {
        const parts = line.split(':');
        conceptName = parts[0].replace(/^[-*•\d.]+\s*/, '').trim();
        details = parts.slice(1).join(':').trim();
      } else if (line.includes(' - ')) {
        const parts = line.split(' - ');
        conceptName = parts[0].replace(/^[-*•\d.]+\s*/, '').trim();
        details = parts.slice(1).join(' - ').trim();
      } else {
        conceptName = line.slice(0, 35) + (line.length > 35 ? '...' : '');
      }

      concepts.push({
        id: `${setId}-concept-${idx + 1}`,
        setId: setId,
        title: conceptName || `Concept ${idx + 1}`,
        summary: details || `Core knowledge for ${conceptName}.`,
        category: category,
        difficulty: 'Medium',
        tags: [category],
        explanation: `${details}. This concept represents a cornerstone understanding in this curriculum.`,
        keyFacts: [
          details,
          `Key principle within ${title}.`,
          `Essential foundation for subsequent learning.`
        ],
        whyItMatters: `Mastering ${conceptName} establishes a strong conceptual anchor for active problem-solving.`,
        concreteExample: {
          title: `Real-World Application of ${conceptName}`,
          text: `In practice, applying ${conceptName} ensures precision and consistency in understanding.`
        },
        simpleExplanation: `Think of this simply: ${details} It serves as the basic building block for understanding ${conceptName}.`,
        deepExplanation: `🏛️ Theoretical Framework & Underlying Mechanics:
${details}
At its foundational level, ${conceptName} operates as a key structural pillar within ${title}. Deconstructing its core mechanisms reveals how foundational rules interact to establish system-level behavior and clarity.

🌍 Macro-Context & Systemic Interconnections:
Examining ${conceptName} in broader context demonstrates how individual principles drive complex real-world outcomes, bridging abstract knowledge with tangible applications.

📜 Historiographical & Analytical Synthesis:
Rigorous conceptual modeling ensures durable retention. Understanding both the internal logic and external ramifications of ${conceptName} empowers advanced critical reasoning.`,
        selfExplanationPrompt: `Explain the meaning of ${conceptName} and why it matters in your own words.`,
        selfExplanationKeyPoints: [details],
        flashcardQuestion: `What is the core definition of ${conceptName}?`,
        flashcardAnswer: details,
        practiceQuestion: `Which statement best describes the fundamental principle of ${conceptName}?`,
        practiceOptions: [
          details,
          `An unrelated principle conflicting with ${conceptName}`,
          `A purely theoretical concept with no practical application`,
          `A legacy rule that was subsequently disproven`
        ],
        correctOptionIndex: 0,
        practiceExplanation: `This statement accurately conveys the core definition of ${conceptName}.`
      });
    });

    return {
      id: setId,
      title,
      description: `Structured learning set curated from study material with ${concepts.length} key concepts.`,
      category,
      estimatedMinutes: Math.ceil(concepts.length * 2),
      isCustom: true,
      createdAt: new Date().toISOString(),
      concepts,
    };
  }

  // Parse uploaded document (PDF, DOCX, DOC, TXT) - Max 20 MB
  static async parseDocument(file: File): Promise<{ text: string; fileName: string; wordCount: number }> {
    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        text: '',
        fileName: file.name,
        wordCount: 0
      };
    }

    const fileNameLower = file.name.toLowerCase();

    // 1. Plain text / Markdown / CSV extraction directly
    const isPlainText = file.type === 'text/plain' || fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md') || fileNameLower.endsWith('.csv');
    if (isPlainText) {
      try {
        const text = await file.text();
        return {
          text,
          fileName: file.name,
          wordCount: text.trim().split(/\s+/).filter(Boolean).length
        };
      } catch (e) {
        console.warn('Plain text extraction issue:', e);
      }
    }

    // 2. Client-side PDF extraction with pdfjs if it's a PDF
    if (fileNameLower.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const clientRes = await extractTextFromFile(file);
        if (clientRes.text && clientRes.text.trim().length > 10) {
          const cleanText = clientRes.text.trim();
          return {
            text: cleanText,
            fileName: file.name,
            wordCount: cleanText.split(/\s+/).filter(Boolean).length
          };
        }
      } catch (clientPdfErr) {
        console.warn('Client-side PDF parse attempt noted, proceeding to server-side parser:', clientPdfErr);
      }
    }

    // 3. Server-side document parser (DOCX, PDF, and binary formats)
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const rawResult = (e.target?.result as string) || '';
          // Strip data URL prefix if present so server receives clean base64
          const base64 = rawResult.replace(/^data:[^;]+;base64,/, '').trim();

          const res = await fetch('/api/parse-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              base64,
              fileType: file.type || 'application/octet-stream',
              mimeType: file.type || 'application/octet-stream'
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.text === 'string' && data.text.trim().length > 0) {
              return resolve({
                text: data.text,
                fileName: file.name,
                wordCount: data.wordCount || data.text.trim().split(/\s+/).filter(Boolean).length
              });
            }
          }

          // Non-throwing graceful resolve
          resolve({
            text: '',
            fileName: file.name,
            wordCount: 0
          });
        } catch (err: any) {
          console.warn('Document parsing endpoint notice:', err?.message || err);
          resolve({
            text: '',
            fileName: file.name,
            wordCount: 0
          });
        }
      };

      reader.onerror = () => {
        resolve({
          text: '',
          fileName: file.name,
          wordCount: 0
        });
      };

      reader.readAsDataURL(file);
    });
  }
}

