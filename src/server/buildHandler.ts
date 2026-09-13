import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';


dotenv.config();






// Initialize GoogleGenAI with mandatory headers
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient Gemini generator that handles model selection and fallback
async function generateJsonWithGemini(prompt: string, temperature = 0.4) {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Use gemini-3.8-flash per guidelines, fallback to gemini-3.1-flash-lite and gemini-2.5-flash
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature,
        },
      });

      if (response && response.text) {
        let cleaned = response.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      console.warn(`Gemini generation with ${model} encountered an issue:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model generation attempts failed');
}

// Health Check

export function registerBuildRoutes(app: express.Express): void {
// 1. Exam Generator Endpoint
app.post('/api/generate/exam', async (req, res) => {
  const {
    subject,
    topic,
    gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
    difficulty = 'Intermediate',
    questionCount = 10,
    durationMinutes = 60,
    questionTypes = ['multiple-choice', 'short-answer', 'problem-solving'],
    totalMarks = 50,
    instructions = '',
    sourceMaterial = '',
    institutionHeader = 'Proudly Afrikan Examination Board',
  } = req.body;

  try {
    const prompt = `You are an expert curriculum designer and senior examiner for the Proudly Afrikan Education ecosystem.
Generate a rigorous, authentic, and beautifully structured examination paper.
Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Difficulty: ${difficulty}
Target Duration: ${durationMinutes} minutes
Target Total Marks: ${totalMarks} marks
Target Number of Questions: ${questionCount}
Question Types to include: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : questionTypes}
Specific Teacher Instructions: ${instructions || 'None specified'}
Source Material provided: ${sourceMaterial ? sourceMaterial.slice(0, 4000) : 'None (use comprehensive subject domain mastery)'}

Return a valid JSON object matching this schema:
{
  "id": "exam-${Date.now()}",
  "title": "Comprehensive Examination: ${topic}",
  "institutionHeader": "${institutionHeader}",
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "difficulty": "${difficulty}",
  "durationMinutes": ${Number(durationMinutes) || 60},
  "totalMarks": ${Number(totalMarks) || 50},
  "generalInstructions": ["Array of 4-5 clear exam instructions"],
  "sections": [
    {
      "id": "sec-1",
      "title": "Section A: ...",
      "instructions": "Section directions",
      "totalMarks": 20,
      "questions": [
        {
          "id": "q1",
          "questionNumber": 1,
          "type": "multiple-choice",
          "prompt": "Question text...",
          "marks": 2,
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "correctAnswer": "A) ...",
          "markingGuidance": "Detailed marking criteria and rubric steps",
          "rubricCriteria": ["Criteria 1", "Criteria 2"]
        }
      ]
    }
  ],
  "overallMarkingNotes": "Moderation notes and grading scale",
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizeExam(parsed, subject, topic, gradeLevel, difficulty, durationMinutes, totalMarks, institutionHeader);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating exam (using fallback):', error?.message || error);
    const fallback = generateFallbackExam(subject, topic, gradeLevel, difficulty, durationMinutes, totalMarks, institutionHeader);
    const normalized = normalizeExam(fallback, subject, topic, gradeLevel, difficulty, durationMinutes, totalMarks, institutionHeader);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 2. Worksheet Generator Endpoint
app.post('/api/generate/worksheet', async (req, res) => {
  const {
    subject,
    topic,
    gradeLevel = 'Junior Secondary / Middle School (Grades 6-8)',
    difficulty = 'Intermediate',
    learningObjectives = [],
    activityTypes = ['matching', 'fill-in-blanks', 'structured-questions', 'critical-thinking'],
    sourceMaterial = '',
    additionalInstructions = '',
  } = req.body;

  try {
    const prompt = `You are a master educator crafting a printable, highly engaging classroom worksheet for Proudly Afrikan Build.
Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Difficulty: ${difficulty}
Activity Types: ${Array.isArray(activityTypes) ? activityTypes.join(', ') : activityTypes}
Learning Objectives: ${Array.isArray(learningObjectives) ? learningObjectives.join('; ') : learningObjectives}
Teacher Custom Notes: ${additionalInstructions || 'None'}
Source Material: ${sourceMaterial ? sourceMaterial.slice(0, 4000) : 'None'}

Return a valid JSON object matching this schema:
{
  "id": "ws-${Date.now()}",
  "title": "Interactive Worksheet: ${topic}",
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "difficulty": "${difficulty}",
  "totalMarks": 30,
  "estimatedDurationMinutes": 45,
  "instructions": "Answer all questions in sequence and show your reasoning.",
  "teacherNotes": "Scoring rubric and teacher facilitation guidance",
  "sections": [
    {
      "id": "sec-1",
      "title": "Section 1: ...",
      "instructions": "Directions for students...",
      "marks": 10,
      "items": [
        {
          "id": "i1",
          "prompt": "Question or prompt...",
          "expectedAnswer": "Complete solution and answer key"
        }
      ]
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizeWorksheet(parsed, subject, topic, gradeLevel, difficulty);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating worksheet (using fallback):', error?.message || error);
    const fallback = generateFallbackWorksheet(subject, topic, gradeLevel, difficulty);
    const normalized = normalizeWorksheet(fallback, subject, topic, gradeLevel, difficulty);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 3. Lesson Plan Generator Endpoint
app.post('/api/generate/lesson-plan', async (req, res) => {
  const {
    subject,
    topic,
    gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
    durationMinutes = 60,
    learningObjectives = [],
    keyConcepts = '',
    assessmentApproach = '',
    requiredResources = '',
    sourceMaterial = '',
  } = req.body;

  try {
    const prompt = `You are a pedagogical expert crafting an exceptional, structured Lesson Plan for the Proudly Afrikan Build platform.
Subject: ${subject}
Topic: ${topic}
Grade / Learning Level: ${gradeLevel}
Duration: ${durationMinutes} minutes
Objectives provided: ${Array.isArray(learningObjectives) ? learningObjectives.join('; ') : learningObjectives}
Key Concepts: ${keyConcepts || 'Infer based on topic'}
Assessment Approach: ${assessmentApproach || 'Formative observation + Exit ticket'}
Required Resources: ${requiredResources || 'Standard classroom + digital/visual aids'}
Source Material: ${sourceMaterial ? sourceMaterial.slice(0, 4000) : 'None'}

Return a valid JSON object matching this schema:
{
  "id": "lp-${Date.now()}",
  "title": "Lesson Plan: ${topic}",
  "subject": "${subject}",
  "topic": "${topic}",
  "gradeLevel": "${gradeLevel}",
  "durationMinutes": ${Number(durationMinutes) || 60},
  "objectives": ["Learners will explain...", "Learners will calculate..."],
  "materialsNeeded": ["Classroom whiteboard", "Student handouts", "Visual slides"],
  "phases": [
    {
      "phase": "Hook & Introduction",
      "durationMinutes": 10,
      "teacherActivity": "Engaging real-world hook and inquiry question...",
      "studentActivity": "Pair-share and brainstorm observations..."
    }
  ],
  "assessmentStrategy": "Formative checks during group exercises and exit ticket at closure.",
  "differentiation": {
    "support": "Tiered scaffolding hints and peer pairs.",
    "extension": "Independent analytical inquiry task."
  },
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizeLessonPlan(parsed, subject, topic, gradeLevel, Number(durationMinutes) || 60);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating lesson plan (using fallback):', error?.message || error);
    const fallback = generateFallbackLessonPlan(subject, topic, gradeLevel, Number(durationMinutes) || 60);
    const normalized = normalizeLessonPlan(fallback, subject, topic, gradeLevel, Number(durationMinutes) || 60);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 4. PDF -> Quiz Generator Endpoint
app.post('/api/generate/pdf-quiz', async (req, res) => {
  const {
    sourceDocName = 'Uploaded_Document.pdf',
    extractedText = '',
    totalQuestions = 8,
    difficulty = 'Intermediate',
    questionType = 'multiple-choice',
    gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
  } = req.body;

  if (!extractedText || extractedText.trim().length < 20) {
    return res.status(400).json({ error: 'Extracted PDF text is required to generate a grounded quiz.' });
  }

  try {
    const prompt = `You are a document comprehension AI for Proudly Afrikan Build.
CRITICAL MANDATE: Ground EVERY SINGLE question strictly in the provided document text below. DO NOT invent facts not present in the document.
Source Document Name: ${sourceDocName}
Learning Level: ${gradeLevel}
Target Difficulty: ${difficulty}
Target Questions Count: ${totalQuestions}
Question Type: ${questionType}

DOCUMENT CONTENT:
"""
${extractedText.slice(0, 12000)}
"""

Return a valid JSON object matching this schema:
{
  "id": "pdf-quiz-${Date.now()}",
  "title": "Quiz: Knowledge Assessment on ${sourceDocName.replace(/\.[^/.]+$/, '')}",
  "sourceDocumentName": "${sourceDocName}",
  "sourceDocName": "${sourceDocName}",
  "gradeLevel": "${gradeLevel}",
  "difficulty": "${difficulty}",
  "totalQuestions": ${Number(totalQuestions) || 8},
  "questions": [
    {
      "id": "pq-1",
      "number": 1,
      "question": "Clear grounded question text...",
      "type": "multiple-choice",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A) ...",
      "explanation": "Detailed explanation grounded in the text.",
      "sourceReferenceQuote": "Direct quote from the document supporting this answer."
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.2);
    if (parsed) {
      const normalized = normalizePdfQuiz(parsed, sourceDocName, gradeLevel, difficulty);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating PDF Quiz (using fallback):', error?.message || error);
    const fallback = generateFallbackPdfQuiz(sourceDocName, extractedText || 'Document content', totalQuestions, difficulty, gradeLevel);
    const normalized = normalizePdfQuiz(fallback, sourceDocName, gradeLevel, difficulty);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 5. PDF -> Study Pack Generator Endpoint
app.post('/api/generate/pdf-studypack', async (req, res) => {
  const {
    sourceDocName = 'Uploaded_Document.pdf',
    extractedText = '',
    gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
  } = req.body;

  if (!extractedText || extractedText.trim().length < 20) {
    return res.status(400).json({ error: 'Extracted PDF text is required to generate a study pack.' });
  }

  try {
    const prompt = `You are a learning architect for Proudly Afrikan Build.
Transform the following PDF text into a structured, high-yield Study Pack suitable for studying and review in the Proudly Afrikan Study ecosystem.
Ground all concepts strictly in the document text.

Source Document: ${sourceDocName}
Target Grade Level: ${gradeLevel}

DOCUMENT CONTENT:
"""
${extractedText.slice(0, 12000)}
"""

Return a valid JSON object matching this schema:
{
  "id": "sp-${Date.now()}",
  "title": "Study Pack: ${sourceDocName.replace(/\.[^/.]+$/, '')}",
  "sourceDocumentName": "${sourceDocName}",
  "sourceDocName": "${sourceDocName}",
  "overview": "Comprehensive structured synopsis of the source document",
  "documentOverview": "Comprehensive structured synopsis of the source document",
  "gradeLevel": "${gradeLevel}",
  "highYieldTakeaways": ["High-yield takeaway 1", "High-yield takeaway 2", "High-yield takeaway 3"],
  "highYieldRevisionPoints": ["High-yield takeaway 1", "High-yield takeaway 2", "High-yield takeaway 3"],
  "essentialGlossary": [
    { "term": "Key Term", "definition": "Precise definition", "context": "Document context" }
  ],
  "selfCheckQuestions": [
    { "question": "Self test question", "answer": "Model answer", "hint": "Hint" }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.3);
    if (parsed) {
      const normalized = normalizePdfStudyPack(parsed, sourceDocName, gradeLevel);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating PDF Study Pack (using fallback):', error?.message || error);
    const fallback = generateFallbackStudyPack(sourceDocName, extractedText || 'Sample text', gradeLevel);
    const normalized = normalizePdfStudyPack(fallback, sourceDocName, gradeLevel);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 6. Presentation Generator Endpoint
app.post('/api/generate/presentation', async (req, res) => {
  const {
    subject,
    topic,
    audienceLevel = 'Senior Secondary / High School (Grades 9-12)',
    slidesCount = 6,
    presentationStyle = 'Educational Lecture & Discussion',
    keyPoints = '',
    learningObjectives = [],
    sourceMaterial = '',
  } = req.body;

  try {
    const prompt = `You are a master presentation designer crafting an educational slide deck for Proudly Afrikan Build.
Subject: ${subject}
Topic: ${topic}
Audience / Learning Level: ${audienceLevel}
Total Slides: ${slidesCount}
Presentation Style: ${presentationStyle}
Key Points: ${keyPoints || 'Core principles of the topic'}
Learning Objectives: ${Array.isArray(learningObjectives) ? learningObjectives.join('; ') : learningObjectives}
Source Material: ${sourceMaterial ? sourceMaterial.slice(0, 4000) : 'None'}

Return a valid JSON object matching this schema:
{
  "id": "pres-${Date.now()}",
  "title": "Presentation: ${topic}",
  "subtitle": "Subtitle describing the presentation theme",
  "subject": "${subject}",
  "topic": "${topic}",
  "targetAudience": "${audienceLevel}",
  "gradeLevel": "${audienceLevel}",
  "themeOrColorMood": "${presentationStyle}",
  "slidesCount": ${Number(slidesCount) || 6},
  "slides": [
    {
      "id": "s-1",
      "slideNumber": 1,
      "title": "Slide Title",
      "subtitle": "Slide Subtitle",
      "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "speakerNotes": "Comprehensive notes for the speaker...",
      "suggestedVisualOrDiagram": "Visual diagram description",
      "discussionOrEngagementPrompt": "Interactive question for audience"
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizePresentation(parsed, subject, topic, audienceLevel);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating presentation (using fallback):', error?.message || error);
    const fallback = generateFallbackPresentation(subject, topic, audienceLevel, slidesCount, presentationStyle);
    const normalized = normalizePresentation(fallback, subject, topic, audienceLevel);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 7. Course Builder Generator Endpoint
app.post('/api/generate/course', async (req, res) => {
  const {
    title = '',
    topic = '',
    subject = 'General Education',
    gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
    targetAudience = '',
    description = '',
    courseObjectives = [],
    modulesCount,
    moduleCount = 4,
    courseDuration = '8 Weeks (Standard)',
    pedagogicalStyle = 'Project-Based & Practical',
    assessmentStrategy = 'Capstone Project + Quizzes',
    prerequisites = '',
    customFocus = '',
    sourceMaterial = '',
  } = req.body;

  const actualTopic = topic || title || subject;
  const actualModuleCount = Number(modulesCount || moduleCount) || 4;
  const actualAudience = targetAudience || gradeLevel;

  try {
    const prompt = `You are an academic dean and master curriculum architect on Proudly Afrikan Build.
Design a complete, modular, deeply structured Course Syllabus and Curriculum.

Subject: ${subject}
Course Title / Topic: ${actualTopic}
Target Audience / Grade Level: ${actualAudience}
Course Duration & Format: ${courseDuration}
Pedagogical Methodology: ${pedagogicalStyle}
Assessment Strategy: ${assessmentStrategy}
Prerequisites: ${prerequisites || 'Basic foundational knowledge'}
Specific Pedagogical Focus / African Context: ${customFocus || 'Highlight relevant African case studies, local contexts, and applied practical outcomes where appropriate.'}
Desired Number of Modules: ${actualModuleCount}
Source Notes / Curriculum Base: ${sourceMaterial ? sourceMaterial.slice(0, 12000) : 'Synthesize from comprehensive academic curriculum standards'}

Return a valid JSON object matching this schema:
{
  "id": "course-${Date.now()}",
  "title": "${actualTopic}",
  "subject": "${subject}",
  "targetAudience": "${actualAudience}",
  "courseOverview": "A comprehensive 2-3 paragraph academic overview of this course, its purpose, and its transformational learning journey...",
  "totalWeeksOrHours": "${courseDuration}",
  "pedagogicalStyle": "${pedagogicalStyle}",
  "assessmentStrategy": "${assessmentStrategy}",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "learningOutcomes": [
    "High-level competency 1",
    "High-level competency 2",
    "High-level competency 3",
    "High-level competency 4"
  ],
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module 1 Title",
      "description": "Comprehensive module description and core themes...",
      "estimatedHours": 10,
      "keyTopics": ["Topic 1.1", "Topic 1.2", "Topic 1.3"],
      "learningOutcomes": ["Outcome 1", "Outcome 2"],
      "practicalProjectOrTask": "Hands-on application exercise or lab for this module",
      "lessons": [
        {
          "lessonTitle": "Lesson 1: Specific Topic",
          "learningObjective": "Clear behavioral objective",
          "recommendedActivity": "Interactive guided seminar or coding/analysis challenge"
        }
      ]
    }
  ],
  "capstoneProject": "Comprehensive final project or integrative capstone requiring student synthesis across all modules.",
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizeCourse(parsed, subject, actualTopic, actualAudience);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating course (using fallback):', error?.message || error);
    const fallback = generateFallbackCourse(actualTopic, subject, actualAudience, description);
    const normalized = normalizeCourse(fallback, subject, actualTopic, actualAudience);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

// 8. Learning Path Builder Generator Endpoint
app.post('/api/generate/learning-path', async (req, res) => {
  const {
    title = '',
    subject,
    targetGoal = '',
    estimatedWeeks = 24,
    sourceMaterial = '',
  } = req.body;

  try {
    const prompt = `You are a learning path strategist for Proudly Afrikan Build.
Design a structured multi-stage progression Learning Path (e.g., Beginner -> Intermediate -> Advanced -> Mastery).
Subject: ${subject}
Learning Path Name / Skill: ${title || subject}
Target Career / Educational Goal: ${targetGoal || 'Mastery and professional capability'}
Source Material Provided: ${sourceMaterial ? sourceMaterial.slice(0, 12000) : 'None (use comprehensive developmental trajectory)'}

Return a valid JSON object matching this schema:
{
  "id": "lp-${Date.now()}",
  "title": "${title || 'Learning Path Progression'}",
  "subject": "${subject}",
  "targetGoal": "${targetGoal || 'Comprehensive Mastery'}",
  "estimatedTotalWeeks": ${Number(estimatedWeeks) || 24},
  "milestones": [
    {
      "milestoneNumber": 1,
      "phaseName": "Phase 1: Foundations",
      "targetWeeks": "6 Weeks",
      "keyObjectives": ["Competency 1", "Competency 2"],
      "milestoneProject": "Milestone capstone project"
    }
  ],
  "createdAt": "${new Date().toISOString()}"
}`;

    const parsed = await generateJsonWithGemini(prompt, 0.4);
    if (parsed) {
      const normalized = normalizeLearningPath(parsed, subject, title, targetGoal);
      return res.json({ success: true, data: normalized });
    }
    throw new Error('Gemini returned empty response');
  } catch (error: any) {
    console.error('Error generating learning path (using fallback):', error?.message || error);
    const fallback = generateFallbackLearningPath(title, subject, targetGoal);
    const normalized = normalizeLearningPath(fallback, subject, title, targetGoal);
    return res.json({
      success: true,
      fallbackUsed: true,
      data: normalized,
    });
  }
});

  // 9. Mind Map Generator Endpoint
  app.post(['/api/generate-mind-map', '/api/generate/mind-map'], async (req, res) => {
    const {
      topic = '',
      subject = 'Sciences & STEM',
      gradeLevel = 'Senior Secondary / High School (Grades 9-12)',
      sourceMaterial = '',
      sourceFileName = '',
    } = req.body;

    const trimmedTopic = String(topic || '').trim();
    if (!trimmedTopic) {
      return res.status(400).json({ error: 'Topic is required for mind map generation' });
    }

    try {
      const prompt = `You are a curriculum visualizer and conceptual mapping expert for the Proudly Afrikan Education ecosystem.
Generate a structured, rigorous, authentic, and beautiful hierarchical Mind Map for students and educators.
Subject: ${subject}
Topic: ${trimmedTopic}
Grade Level: ${gradeLevel}
Source Material: ${sourceMaterial ? sourceMaterial.slice(0, 10000) : 'None provided (use comprehensive domain expertise)'}

Return a valid JSON object matching this schema:
{
  "summary": "2-3 sentence conceptual executive summary of ${trimmedTopic} explaining its core principles, African context, and significance.",
  "rootNode": {
    "id": "root-node",
    "label": "${trimmedTopic}",
    "notes": "Central topic and core scope",
    "children": [
      {
        "id": "branch-1",
        "label": "First Major Concept / Pillar",
        "notes": "Pedagogical explanation of this pillar",
        "children": [
          {
            "id": "leaf-1a",
            "label": "Subtopic / Component / Term",
            "notes": "Detailed description or application in African context"
          },
          {
            "id": "leaf-1b",
            "label": "Subtopic / Component / Principle",
            "notes": "Underlying mechanism or formula"
          },
          {
            "id": "leaf-1c",
            "label": "Case Study / Example",
            "notes": "Concrete real-world example"
          }
        ]
      },
      {
        "id": "branch-2",
        "label": "Second Major Concept / Pillar",
        "notes": "Pedagogical explanation of this pillar",
        "children": [
          {
            "id": "leaf-2a",
            "label": "Subtopic / Component",
            "notes": "Detailed description"
          },
          {
            "id": "leaf-2b",
            "label": "Subtopic / Component",
            "notes": "Detailed description"
          }
        ]
      },
      {
        "id": "branch-3",
        "label": "Real-World Applications & Impact",
        "notes": "Industrial, ecological, or societal relevance across Africa and globally",
        "children": [
          {
            "id": "leaf-3a",
            "label": "Regional Case Studies & Implementations",
            "notes": "Key projects and practical implementations"
          },
          {
            "id": "leaf-3b",
            "label": "Socioeconomic & Environmental Impact",
            "notes": "Direct effects on communities and development"
          }
        ]
      },
      {
        "id": "branch-4",
        "label": "Challenges, Innovations & Future Directions",
        "notes": "Critical thinking, identified bottlenecks, and future research",
        "children": [
          {
            "id": "leaf-4a",
            "label": "Key Constraints & Bottlenecks",
            "notes": "Critical technical or logistical hurdles"
          },
          {
            "id": "leaf-4b",
            "label": "Emerging Innovations & Solutions",
            "notes": "Modern solutions and strategic advancements"
          }
        ]
      }
    ]
  }
}`;

      const parsed = await generateJsonWithGemini(prompt, 0.4);
      if (parsed) {
        const normalized = normalizeMindMap(parsed, trimmedTopic, subject, gradeLevel, sourceFileName);
        return res.json({
          success: true,
          rootNode: normalized.rootNode,
          summary: normalized.summary,
          data: normalized,
        });
      }
      throw new Error('Gemini returned empty response');
    } catch (error: any) {
      console.error('Error generating mind map (using fallback):', error?.message || error);
      const fallback = generateFallbackMindMap(trimmedTopic, subject, gradeLevel, sourceMaterial, sourceFileName);
      const normalized = normalizeMindMap(fallback, trimmedTopic, subject, gradeLevel, sourceFileName);
      return res.json({
        success: true,
        fallbackUsed: true,
        rootNode: normalized.rootNode,
        summary: normalized.summary,
        data: normalized,
      });
    }
  });
}

// Normalizer Functions
function normalizeWorksheet(data: any, subject: string, topic: string, gradeLevel: string, difficulty: string) {
  const sections = Array.isArray(data.sections) && data.sections.length > 0
    ? data.sections
    : Array.isArray(data.activities) && data.activities.length > 0
    ? data.activities.map((act: any, idx: number) => ({
        id: act.id || `sec-${idx + 1}`,
        title: act.title || `Section ${idx + 1}: ${act.type || 'Practice'}`,
        instructions: act.instructions || 'Complete the following inquiries.',
        marks: Number(act.points) || 10,
        items: (act.items || []).map((item: any, iIdx: number) => ({
          id: item.id || `i-${iIdx + 1}`,
          prompt: item.prompt || item.question || `Exercise ${iIdx + 1}`,
          expectedAnswer: item.expectedAnswer || item.answerKey || item.explanation || 'Detailed answer in teacher key',
        })),
      }))
    : [
        {
          id: 'sec-1',
          title: 'Section A: Conceptual Inquiry',
          instructions: 'Answer all questions clearly.',
          marks: 10,
          items: [{ id: 'i-1', prompt: `Explain the fundamental concept of ${topic || subject}.`, expectedAnswer: 'Accurate definition with supporting explanation.' }],
        }
      ];

  const totalMarks = Number(data.totalMarks) || sections.reduce((acc: number, s: any) => acc + (Number(s.marks) || 10), 0);
  const estimatedDurationMinutes = Number(data.estimatedDurationMinutes || data.estimatedCompletionTimeMinutes || 45);

  return {
    ...data,
    id: data.id || `ws-${Date.now()}`,
    title: data.title || `Interactive Worksheet: ${topic || subject}`,
    subject: data.subject || subject || 'General Science',
    topic: data.topic || topic || 'Core Study Unit',
    gradeLevel: data.gradeLevel || gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)',
    difficulty: data.difficulty || difficulty || 'Intermediate',
    totalMarks,
    estimatedDurationMinutes,
    estimatedCompletionTimeMinutes: estimatedDurationMinutes,
    instructions: data.instructions || 'Answer all sections carefully and show your working where applicable.',
    teacherNotes: data.teacherNotes || data.teacherSolutionsNote || 'Facilitate active peer review and emphasize conceptual rationale.',
    sections,
    activities: data.activities || sections,
  };
}

function normalizeLessonPlan(data: any, subject: string, topic: string, gradeLevel: string, durationMinutes: number) {
  let objectives: string[] = [];
  if (Array.isArray(data.objectives) && data.objectives.length > 0) {
    objectives = data.objectives.map((o: any) => typeof o === 'string' ? o : o.cognitive || JSON.stringify(o));
  } else if (Array.isArray(data.learningObjectives) && data.learningObjectives.length > 0) {
    objectives = data.learningObjectives.map((o: any) => {
      if (typeof o === 'string') return o;
      if (o.cognitive) return `${o.cognitive}${o.affectiveOrPractical ? ` (${o.affectiveOrPractical})` : ''}`;
      return JSON.stringify(o);
    });
  } else {
    objectives = [
      `Learners will explain foundational principles of ${topic || subject}.`,
      `Learners will apply contextual problem solving to key scenarios in ${topic || subject}.`,
    ];
  }

  const materialsNeeded: string[] = Array.isArray(data.materialsNeeded) && data.materialsNeeded.length > 0
    ? data.materialsNeeded
    : Array.isArray(data.requiredResourcesAndMaterials) && data.requiredResourcesAndMaterials.length > 0
    ? data.requiredResourcesAndMaterials
    : ['Whiteboard & markers', 'Student worksheet handouts', 'Visual presentation slides'];

  const phases = (Array.isArray(data.phases) ? data.phases : []).map((p: any, idx: number) => ({
    phase: p.phase || p.phaseName || `Phase ${idx + 1}`,
    phaseName: p.phaseName || p.phase || `Phase ${idx + 1}`,
    durationMinutes: Number(p.durationMinutes) || 15,
    teacherActivity: p.teacherActivity || p.teacherActions || 'Introduce concept and guide inquiry.',
    teacherActions: p.teacherActions || p.teacherActivity || 'Introduce concept and guide inquiry.',
    studentActivity: p.studentActivity || p.learnerActions || 'Engage in active problem solving and discussion.',
    learnerActions: p.learnerActions || p.studentActivity || 'Engage in active problem solving and discussion.',
    keyQuestionsOrCheckpoints: p.keyQuestionsOrCheckpoints || [],
    materialsNeeded: p.materialsNeeded || [],
  }));

  let assessmentStrategy = '';
  if (typeof data.assessmentStrategy === 'string') {
    assessmentStrategy = data.assessmentStrategy;
  } else if (data.assessmentStrategy && typeof data.assessmentStrategy === 'object') {
    assessmentStrategy = [
      data.assessmentStrategy.formative ? `Formative: ${data.assessmentStrategy.formative}` : '',
      data.assessmentStrategy.summativeOrExitTicket ? `Summative: ${data.assessmentStrategy.summativeOrExitTicket}` : '',
    ].filter(Boolean).join(' • ');
  } else {
    assessmentStrategy = 'Formative checks during guided group practice and exit ticket evaluating core objective.';
  }

  const diffObj = data.differentiation || {};
  const differentiation = {
    support: typeof diffObj.support === 'string' ? diffObj.support : diffObj.supportForStrugglingLearners || 'Tiered scaffolding hints and peer pair guidance.',
    extension: typeof diffObj.extension === 'string' ? diffObj.extension : diffObj.extensionForAdvancedLearners || 'Open-ended research exploration and challenge tasks.',
    supportForStrugglingLearners: diffObj.supportForStrugglingLearners || diffObj.support || 'Tiered scaffolding hints and peer pair guidance.',
    extensionForAdvancedLearners: diffObj.extensionForAdvancedLearners || diffObj.extension || 'Open-ended research exploration and challenge tasks.',
  };

  return {
    ...data,
    id: data.id || `lp-${Date.now()}`,
    title: data.title || `Lesson Plan: ${topic || subject}`,
    subject: data.subject || subject || 'General Education',
    topic: data.topic || topic || 'Core Lesson',
    gradeLevel: data.gradeLevel || gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    durationMinutes: Number(data.durationMinutes || durationMinutes) || 60,
    objectives,
    learningObjectives: objectives,
    materialsNeeded,
    phases,
    assessmentStrategy,
    differentiation,
  };
}

function normalizeCourse(data: any, subject: string, title: string, gradeLevel: string) {
  const durationWeeks = Number(data.durationWeeks) || Math.max(4, Math.ceil((Number(data.totalEstimatedHours) || 36) / 3)) || 12;
  const courseOverview = data.courseOverview || data.description || `Comprehensive ${title || subject} curriculum designed for deep conceptual mastery and practical application.`;

  const learningOutcomes = Array.isArray(data.learningOutcomes) && data.learningOutcomes.length > 0
    ? data.learningOutcomes
    : Array.isArray(data.courseObjectives) && data.courseObjectives.length > 0
    ? data.courseObjectives
    : [
        `Master foundational principles and analytical frameworks of ${title || subject}.`,
        `Apply theoretical models to real-world scenarios and critical inquiry problems.`,
        `Synthesize integrated solutions ready for academic and professional advancement.`
      ];

  const rawModules = Array.isArray(data.modules) && data.modules.length > 0 ? data.modules : [
    {
      moduleNumber: 1,
      title: 'Foundational Principles & Core Concepts',
      description: `Introduction to the essential paradigms and core structures of ${title || subject}.`,
      learningOutcomes: [`Understand core terminology and foundational mechanics of ${title || subject}.`],
      keyTopics: ['Core Definitions', 'Historical Context', 'Fundamental Models'],
    },
    {
      moduleNumber: 2,
      title: 'Applied Methodologies & Practical Analysis',
      description: `Hands-on inquiry, case studies, and systemic applications in ${title || subject}.`,
      learningOutcomes: [`Apply analysis techniques to solve intermediate challenges in ${title || subject}.`],
      keyTopics: ['Methods & Frameworks', 'Case Studies', 'Comparative Analysis'],
    },
    {
      moduleNumber: 3,
      title: 'Advanced Synthesis & Capstone Applications',
      description: `Advanced problem sets, cross-disciplinary integration, and project execution.`,
      learningOutcomes: [`Synthesize complex solutions and present defensible conclusions.`],
      keyTopics: ['Advanced Topics', 'Integrative Project', 'Evaluation & Review'],
    }
  ];

  const modules = rawModules.map((mod: any, mIdx: number) => {
    const modNumber = Number(mod.moduleNumber) || mIdx + 1;
    const modTitle = mod.title || `Module ${modNumber}: Core Concepts`;
    const modDesc = mod.description || mod.overview || `In-depth exploration of core module competencies for ${modTitle}.`;

    const modOutcomes = Array.isArray(mod.learningOutcomes) && mod.learningOutcomes.length > 0
      ? mod.learningOutcomes
      : Array.isArray(mod.lessons) && mod.lessons.length > 0
      ? mod.lessons.map((l: any) => l.learningObjective || l.title || 'Master module objective')
      : [`Master the fundamental principles covered in ${modTitle}.`];

    const modTopics = Array.isArray(mod.keyTopics) && mod.keyTopics.length > 0
      ? mod.keyTopics
      : Array.isArray(mod.lessons) && mod.lessons.length > 0
      ? mod.lessons.map((l: any) => l.lessonTitle || l.title || 'Key topic')
      : ['Fundamental Concepts', 'Applied Analysis', 'Key Principles'];

    return {
      id: mod.id || `mod-${modNumber}`,
      moduleNumber: modNumber,
      title: modTitle,
      description: modDesc,
      overview: modDesc,
      estimatedHours: Number(mod.estimatedHours) || 8,
      learningOutcomes: modOutcomes,
      keyTopics: modTopics,
      practicalProjectOrTask: mod.practicalProjectOrTask || mod.project || `Hands-on analytical project for Module ${modNumber}`,
      lessons: Array.isArray(mod.lessons) ? mod.lessons : []
    };
  });

  return {
    ...data,
    id: data.id || `course-${Date.now()}`,
    title: data.title || title || `${subject} Master Curriculum`,
    subject: data.subject || subject || 'Higher Education',
    topic: data.topic || title || subject || 'Core Curriculum',
    gradeLevel: data.gradeLevel || gradeLevel || 'Tertiary / Undergraduate',
    targetAudience: data.targetAudience || 'Students, educators, and lifelong learners',
    courseOverview,
    description: courseOverview,
    durationWeeks,
    totalWeeksOrHours: data.totalWeeksOrHours || `${durationWeeks} Weeks (${data.totalEstimatedHours || durationWeeks * 3} Hours)`,
    totalEstimatedHours: Number(data.totalEstimatedHours) || durationWeeks * 3,
    pedagogicalStyle: data.pedagogicalStyle || 'Project-Based & Practical',
    assessmentStrategy: data.assessmentStrategy || 'Capstone Project + Quizzes',
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : (data.prerequisites ? [data.prerequisites] : ['Foundational introductory literacy']),
    capstoneProject: data.capstoneProject || `Capstone defense and practical application portfolio for ${title || subject}.`,
    learningOutcomes,
    courseObjectives: learningOutcomes,
    modules,
    toolType: 'course',
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function normalizeLearningPath(data: any, subject: string, title: string, targetGoal: string) {
  let estimatedTotalWeeks = Number(data.estimatedTotalWeeks);
  if (!estimatedTotalWeeks && typeof data.totalEstimatedDuration === 'string') {
    const match = data.totalEstimatedDuration.match(/\d+/);
    if (match) estimatedTotalWeeks = parseInt(match[0], 10);
  }
  if (!estimatedTotalWeeks) estimatedTotalWeeks = 24;

  const rawMilestones = Array.isArray(data.milestones) && data.milestones.length > 0
    ? data.milestones
    : Array.isArray(data.stages) && data.stages.length > 0
    ? data.stages
    : [
        {
          stepNumber: 1,
          milestoneNumber: 1,
          title: 'Stage 1: Core Foundations & Frameworks',
          phaseName: 'Stage 1: Core Foundations & Frameworks',
          estimatedHours: 20,
          description: `Establish bedrock conceptual knowledge and essential terminology in ${title || subject}.`,
          skillsAcquired: [`Core theoretical models of ${title || subject}`, 'Vocabulary and structural foundations'],
          suggestedActivities: ['Read foundational unit guides', 'Complete diagnostic practice sets'],
          checkpointAssessment: 'Foundational concept validation quiz and portfolio submission'
        },
        {
          stepNumber: 2,
          milestoneNumber: 2,
          title: 'Stage 2: Intermediate Application & Problem Solving',
          phaseName: 'Stage 2: Intermediate Application & Problem Solving',
          estimatedHours: 35,
          description: `Transition from passive understanding to active implementation and case analysis.`,
          skillsAcquired: ['Applied methodologies', 'Analytical problem solving', 'Comparative case review'],
          suggestedActivities: ['Work through guided case studies', 'Build intermediate practice exercises'],
          checkpointAssessment: 'Intermediate applied assessment and practical case solution'
        },
        {
          stepNumber: 3,
          milestoneNumber: 3,
          title: 'Stage 3: Advanced Mastery & Independent Synthesis',
          phaseName: 'Stage 3: Advanced Mastery & Independent Synthesis',
          estimatedHours: 45,
          description: `Tackle complex multi-variable challenges, edge cases, and integrated projects.`,
          skillsAcquired: ['Advanced synthesis', 'Independent project execution', 'Systemic evaluation'],
          suggestedActivities: ['Architect end-to-end capstone project', 'Peer review and defend findings'],
          checkpointAssessment: 'Comprehensive capstone defense and mastery certification'
        }
      ];

  const milestones = rawMilestones.map((st: any, idx: number) => {
    const stepNum = Number(st.stepNumber || st.milestoneNumber || st.stageNumber) || idx + 1;
    const msTitle = st.title || st.phaseName || st.tier || `Milestone ${stepNum}: Competency Unit`;
    const estHours = Number(st.estimatedHours) || (st.targetWeeks ? parseInt(st.targetWeeks, 10) * 10 : 20);
    const skills = Array.isArray(st.skillsAcquired) && st.skillsAcquired.length > 0
      ? st.skillsAcquired
      : Array.isArray(st.keyObjectives) && st.keyObjectives.length > 0
      ? st.keyObjectives
      : Array.isArray(st.keyCompetenciesToMaster) && st.keyCompetenciesToMaster.length > 0
      ? st.keyCompetenciesToMaster
      : [`Master essential competencies in ${title || subject}`];

    const desc = st.description || (Array.isArray(st.keyObjectives) ? st.keyObjectives.join('. ') : `Structured milestone focused on mastering ${msTitle}.`);
    const checkpoint = st.checkpointAssessment || st.milestoneProject || st.milestoneProjectOrAssessment || 'Milestone project checkpoint evaluation';

    return {
      id: st.id || `ms-${stepNum}`,
      stepNumber: stepNum,
      milestoneNumber: stepNum,
      title: msTitle,
      phaseName: msTitle,
      estimatedHours: estHours,
      targetWeeks: st.targetWeeks || `${Math.max(2, Math.ceil(estHours / 10))} Weeks`,
      description: desc,
      skillsAcquired: skills,
      keyObjectives: skills,
      suggestedActivities: Array.isArray(st.suggestedActivities) ? st.suggestedActivities : ['Complete module readings', 'Practice application exercises'],
      checkpointAssessment: checkpoint,
      milestoneProject: checkpoint,
    };
  });

  return {
    ...data,
    id: data.id || `lp-${Date.now()}`,
    title: data.title || title || `${subject} Career & Learning Pathway`,
    subject: data.subject || subject || 'Specialized Education',
    targetGoal: data.targetGoal || data.targetCareerOrEducationalGoal || targetGoal || 'Comprehensive Professional Competence',
    targetCareerOrEducationalGoal: data.targetCareerOrEducationalGoal || data.targetGoal || targetGoal || 'Comprehensive Professional Competence',
    startingLevel: data.startingLevel || 'Beginner / Intermediate',
    targetLevel: data.targetLevel || 'Advanced Fluency / Professional Mastery',
    totalEstimatedWeeks: estimatedTotalWeeks,
    estimatedTotalWeeks,
    totalEstimatedDuration: `${estimatedTotalWeeks} Weeks`,
    milestones,
    stages: milestones,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [
      'Maintain weekly consistent practice and revision habits.',
      'Document learnings in a personal portfolio after completing each milestone checkpoint.'
    ],
    toolType: 'learning-path',
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function normalizePdfQuiz(data: any, sourceDocName: string, gradeLevel: string, difficulty: string) {
  const sourceName = data.sourceDocumentName || data.sourceDocName || sourceDocName || 'Uploaded Document';
  const questions = (Array.isArray(data.questions) ? data.questions : []).map((q: any, idx: number) => ({
    id: q.id || `pq-${idx + 1}`,
    number: q.number || q.questionNumber || idx + 1,
    questionNumber: q.questionNumber || q.number || idx + 1,
    question: q.question || q.prompt || `Question ${idx + 1}`,
    prompt: q.prompt || q.question || `Question ${idx + 1}`,
    type: q.type || 'multiple-choice',
    options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'A'),
    explanation: q.explanation || 'Refer to source document for full context.',
    sourceReferenceQuote: q.sourceReferenceQuote || 'Extracted from source material.',
  }));

  return {
    ...data,
    id: data.id || `pdf-quiz-${Date.now()}`,
    title: data.title || `Quiz: Assessment on ${sourceName.replace(/\.[^/.]+$/, '')}`,
    sourceDocumentName: sourceName,
    sourceDocName: sourceName,
    gradeLevel: data.gradeLevel || gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    difficulty: data.difficulty || difficulty || 'Intermediate',
    totalQuestions: questions.length,
    questions,
  };
}

function normalizePdfStudyPack(data: any, sourceDocName: string, gradeLevel: string) {
  const sourceName = data.sourceDocumentName || data.sourceDocName || sourceDocName || 'Uploaded Document';
  const overview = data.overview || data.documentOverview || 'Structured synthesis of source document.';
  const highYieldTakeaways = Array.isArray(data.highYieldTakeaways) && data.highYieldTakeaways.length > 0
    ? data.highYieldTakeaways
    : Array.isArray(data.highYieldRevisionPoints) && data.highYieldRevisionPoints.length > 0
    ? data.highYieldRevisionPoints
    : ['Comprehensive conceptual grounding', 'Key theoretical equations and relationships', 'Practical case study applications'];

  return {
    ...data,
    id: data.id || `sp-${Date.now()}`,
    title: data.title || `Study Pack: ${sourceName.replace(/\.[^/.]+$/, '')}`,
    sourceDocumentName: sourceName,
    sourceDocName: sourceName,
    overview,
    documentOverview: overview,
    gradeLevel: data.gradeLevel || gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    highYieldTakeaways,
    highYieldRevisionPoints: highYieldTakeaways,
    essentialGlossary: Array.isArray(data.essentialGlossary) ? data.essentialGlossary : (Array.isArray(data.glossary) ? data.glossary : []),
    selfCheckQuestions: Array.isArray(data.selfCheckQuestions) ? data.selfCheckQuestions : (Array.isArray(data.practiceQuestions) ? data.practiceQuestions : []),
  };
}

function normalizePresentation(data: any, subject: string, topic: string, audienceLevel: string) {
  const rawSlides = Array.isArray(data.slides) && data.slides.length > 0 ? data.slides : [
    {
      slideNumber: 1,
      title: `Introduction to ${topic || subject}`,
      bulletPoints: [`Overview and significance of ${topic || subject}`, 'Core learning objectives', 'Key historical and practical contexts'],
      speakerNotes: `Welcome everyone. Today we will explore ${topic || subject}, analyzing its core mechanisms and real-world relevance.`
    },
    {
      slideNumber: 2,
      title: 'Core Principles & Mechanisms',
      bulletPoints: ['Foundational frameworks and structural rules', 'Critical dynamics and equations/relationships', 'Common misconceptions and clarifications'],
      speakerNotes: 'Focus on explaining the underlying mechanisms that make these principles work.'
    },
    {
      slideNumber: 3,
      title: 'Applied Scenarios & Summary',
      bulletPoints: ['Real-world case studies and demonstrations', 'Synthesizing takeaways for mastery', 'Next steps and recommended inquiries'],
      speakerNotes: 'Invite questions and encourage participants to apply the concept to their own projects.'
    }
  ];

  const slides = rawSlides.map((s: any, idx: number) => {
    const rawBullets = Array.isArray(s.bullets) && s.bullets.length > 0
      ? s.bullets
      : Array.isArray(s.bulletPoints) && s.bulletPoints.length > 0
      ? s.bulletPoints
      : [`Core analytical foundation of ${topic || subject}`, `Key mechanisms and practical examples`, `Summary takeaway and discussion question`];

    return {
      id: s.id || `s-${idx + 1}`,
      slideNumber: Number(s.slideNumber) || idx + 1,
      slideType: s.slideType || (idx === 0 ? 'title' : 'content'),
      title: s.title || `Slide ${idx + 1}: ${topic || subject}`,
      subtitle: s.subtitle || '',
      bullets: rawBullets,
      bulletPoints: rawBullets,
      suggestedVisualOrDiagram: s.suggestedVisualOrDiagram || s.visualCue || 'Conceptual breakdown diagram',
      visualCue: s.visualCue || s.suggestedVisualOrDiagram || 'Conceptual breakdown diagram',
      discussionOrEngagementPrompt: s.discussionOrEngagementPrompt || 'What are the main implications of this concept?',
      speakerNotes: s.speakerNotes || 'Provide concrete examples and invite student engagement.',
    };
  });

  return {
    ...data,
    id: data.id || `pres-${Date.now()}`,
    title: data.title || `Presentation: ${topic || subject}`,
    subtitle: data.subtitle || 'Educational Presentation Deck',
    subject: data.subject || subject || 'Academic Subject',
    topic: data.topic || topic || 'Core Topic',
    audienceLevel: data.audienceLevel || data.targetAudience || audienceLevel || 'Senior Secondary / High School (Grades 9-12)',
    targetAudience: data.targetAudience || data.audienceLevel || audienceLevel || 'Senior Secondary / High School (Grades 9-12)',
    gradeLevel: data.gradeLevel || data.audienceLevel || audienceLevel || 'Senior Secondary / High School (Grades 9-12)',
    themeOrColorMood: data.themeOrColorMood || data.presentationStyle || 'High Contrast Academic & Dynamic',
    slidesCount: slides.length,
    slides,
    toolType: 'presentation',
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function normalizeExam(data: any, subject: string, topic: string, gradeLevel: string, difficulty: string, durationMinutes: number, totalMarks: number, institutionHeader: string) {
  const sections = (Array.isArray(data.sections) ? data.sections : []).map((sec: any, sIdx: number) => ({
    id: sec.id || `sec-${sIdx + 1}`,
    title: sec.title || `Section ${sIdx + 1}`,
    instructions: sec.instructions || 'Answer all questions in this section.',
    totalMarks: Number(sec.totalMarks || sec.marks) || 20,
    marks: Number(sec.marks || sec.totalMarks) || 20,
    questions: (Array.isArray(sec.questions) ? sec.questions : []).map((q: any, qIdx: number) => ({
      id: q.id || `q-${sIdx + 1}-${qIdx + 1}`,
      questionNumber: q.questionNumber || qIdx + 1,
      type: q.type || 'multiple-choice',
      prompt: q.prompt || q.question || 'Question prompt text',
      marks: Number(q.marks) || 2,
      options: Array.isArray(q.options) ? q.options : (q.type === 'multiple-choice' ? ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'] : undefined),
      correctAnswer: q.correctAnswer || 'A) Option 1',
      markingGuidance: q.markingGuidance || 'Award full marks for clear conceptual justification.',
      rubricCriteria: q.rubricCriteria || [],
    })),
  }));

  return {
    ...data,
    id: data.id || `exam-${Date.now()}`,
    title: data.title || `Examination: ${topic || subject}`,
    institutionHeader: data.institutionHeader || institutionHeader || 'Proudly Afrikan Examination Board',
    subject: data.subject || subject || 'General Assessment',
    topic: data.topic || topic || 'Core Curriculum',
    gradeLevel: data.gradeLevel || gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    difficulty: data.difficulty || difficulty || 'Intermediate',
    durationMinutes: Number(data.durationMinutes || durationMinutes) || 60,
    totalMarks: Number(data.totalMarks || totalMarks) || 50,
    generalInstructions: Array.isArray(data.generalInstructions) ? data.generalInstructions : ['Read all questions carefully.', 'Answer all sections.'],
    sections,
    overallMarkingNotes: data.overallMarkingNotes || 'Moderation scale: 75%+ Distinction, 60-74% Credit, 50-59% Pass.',
  };
}
// Fallback Generators to ensure instant resilience
function generateFallbackExam(subject: string, topic: string, gradeLevel: string, difficulty: string, duration: number, marks: number, header: string) {
  return {
    id: `exam-${Date.now()}`,
    title: `${topic || subject} Comprehensive Assessment Examination`,
    institutionHeader: header || 'Proudly Afrikan Examination Board',
    subject: subject || 'General Science',
    topic: topic || 'Foundational Principles',
    gradeLevel: gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    difficulty: difficulty || 'Intermediate',
    durationMinutes: Number(duration) || 60,
    totalMarks: Number(marks) || 50,
    generalInstructions: [
      'Read all questions carefully before attempting solutions.',
      'Answer all questions in Section A and Section B.',
      'Show clear, structured intermediate steps for all calculation problems.',
      'Write in dark blue or black ink with legible notation.',
    ],
    sections: [
      {
        id: 'sec-1',
        title: 'Section A: Conceptual Understanding & Multiple Choice',
        instructions: 'Select the best option for each question. (2 marks each)',
        totalMarks: 10,
        questions: [
          {
            id: 'q1',
            questionNumber: 1,
            type: 'multiple-choice',
            prompt: `Which foundational principle is most critical when analyzing fundamental systems in ${topic || subject}?`,
            marks: 2,
            options: [
              'A) Systemic Conservation of Energy and Equilibrium',
              'B) Arbitrary Unverified Observation',
              'C) Discontinuous Non-linear Variance without Boundary Conditions',
              'D) Static Unresponsive Parameters'
            ],
            correctAnswer: 'A) Systemic Conservation of Energy and Equilibrium',
            markingGuidance: 'Award 2 marks for option A. Award 0 for incorrect selections.',
          },
          {
            id: 'q2',
            questionNumber: 2,
            type: 'multiple-choice',
            prompt: `In the context of ${topic || subject}, what is the primary role of empirical verification?`,
            marks: 2,
            options: [
              'A) To confirm hypothetical models against reproducible experimental data',
              'B) To eliminate theoretical discourse',
              'C) To replace mathematical formalism entirely',
              'D) To restrict inquiry to qualitative speculation'
            ],
            correctAnswer: 'A) To confirm hypothetical models against reproducible experimental data',
            markingGuidance: 'Award 2 marks for option A.',
          }
        ]
      },
      {
        id: 'sec-2',
        title: 'Section B: Structured Analytical Inquiries',
        instructions: 'Provide complete written solutions with equations and logical deductions.',
        totalMarks: 40,
        questions: [
          {
            id: 'q3',
            questionNumber: 3,
            type: 'problem-solving',
            prompt: `Define the core governing laws of ${topic || subject}. State three distinct conditions under which these laws apply and one limitation.`,
            marks: 10,
            markingGuidance: 'Award 4 marks for precise definition, 3 marks for three valid conditions, and 3 marks for well-reasoned limitation.',
          },
          {
            id: 'q4',
            questionNumber: 4,
            type: 'essay',
            prompt: `Critically analyze a contemporary practical application of ${topic || subject} in modern African technological or economic development. Provide concrete examples.`,
            marks: 15,
            markingGuidance: 'Award up to 5 marks for context, 5 marks for technical accuracy of mechanisms, and 5 marks for evaluation of socio-economic impact.',
          }
        ]
      }
    ],
    overallMarkingNotes: 'Score conversion: 75%+ Distinction, 60-74% Credit, 50-59% Pass. Reward analytical clarity.',
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackWorksheet(subject: string, topic: string, gradeLevel: string, difficulty: string) {
  return {
    id: `ws-${Date.now()}`,
    title: `Mastery Worksheet: ${topic || subject}`,
    subject: subject || 'General Science',
    topic: topic || 'Core Subject Exploration',
    gradeLevel: gradeLevel || 'Junior Secondary / Middle School (Grades 6-8)',
    difficulty: difficulty || 'Intermediate',
    learningObjectives: [
      `Understand key foundational terminology related to ${topic || subject}.`,
      `Apply problem-solving methods to structured exercises in ${topic || subject}.`,
      `Evaluate real-world scenarios using principles learned in this unit.`
    ],
    estimatedCompletionTimeMinutes: 45,
    studentHeaderFields: { name: true, date: true, score: true, class: true },
    introductionOrOverview: `This interactive worksheet is designed to reinforce your grasp of ${topic || subject}. Work through the activities in sequence and verify your reasoning with your instructor.`,
    activities: [
      {
        id: 'act-1',
        activityNumber: 1,
        type: 'matching',
        title: 'Activity 1: Vocabulary & Concept Correlation',
        instructions: 'Match each term in the left column with its corresponding definition.',
        items: [
          {
            id: 'i1',
            prompt: `1. Core Hypothesis (${topic || subject})`,
            answerKey: 'A testable, falsifiable proposition explaining observed phenomena.',
            explanation: 'Forms the baseline of scientific and analytical inquiry.',
          },
          {
            id: 'i2',
            prompt: '2. Systematic Methodology',
            answerKey: 'A standardized, reproducible protocol for investigating parameters.',
            explanation: 'Ensures consistency across varied trials.',
          }
        ],
        points: 10,
      },
      {
        id: 'act-2',
        activityNumber: 2,
        type: 'fill-in-blanks',
        title: 'Activity 2: Guided Concept Exploration',
        instructions: 'Complete the sentences using appropriate technical terminology.',
        items: [
          {
            id: 'i3',
            prompt: `In the study of ${topic || subject}, the primary variable that is deliberately manipulated is called the ________ variable, while the measured outcome is the ________ variable.`,
            answerKey: 'independent, dependent',
            explanation: 'Fundamental experimental design terminology.',
          }
        ],
        points: 10,
      }
    ],
    teacherSolutionsNote: 'Ensure students articulate their rationale for open-ended questions rather than only matching keywords.',
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackLessonPlan(subject: string, topic: string, gradeLevel: string, duration: number) {
  return {
    id: `lp-${Date.now()}`,
    title: `Lesson Plan: ${topic || subject}`,
    subject: subject || 'General Education',
    topic: topic || 'Core Topic Overview',
    gradeLevel: gradeLevel || 'Senior Secondary / High School (Grades 9-12)',
    durationMinutes: Number(duration) || 60,
    curriculumStandardsOrTheme: 'Curricular standard alignment for mastery and inquiry-based learning',
    learningObjectives: [
      {
        cognitive: `Learners will define and synthesize the key principles of ${topic || subject}.`,
        affectiveOrPractical: `Learners will collaborate in peer pairs to solve applied challenges relating to ${topic || subject}.`,
      }
    ],
    keyVocabulary: [
      { term: 'Foundational Concept', definition: 'The primary underlying principle of the subject.' },
      { term: 'System Dynamics', definition: 'The interaction of interdependent components within the domain.' }
    ],
    requiredResourcesAndMaterials: [
      'Classroom whiteboard & markers',
      'Student interactive activity handouts',
      'Visual diagram slides / projector'
    ],
    phases: [
      {
        phaseName: 'Hook & Introduction',
        durationMinutes: 10,
        teacherActions: `Present an engaging real-world riddle or striking visual phenomena illustrating ${topic || subject}.`,
        learnerActions: 'Brainstorm in pairs for 2 minutes, then share initial observations with whole class.',
        keyQuestionsOrCheckpoints: ['What causes this pattern?', 'How does this connect to our previous unit?'],
        materialsNeeded: ['Visual Hook slide'],
      },
      {
        phaseName: 'Direct Instruction / Content',
        durationMinutes: 20,
        teacherActions: `Deliver structured breakdown of ${topic || subject}, modeling step-by-step problem decomposition.`,
        learnerActions: 'Take active Cornell notes and highlight critical equations/definitions.',
        keyQuestionsOrCheckpoints: ['Why does this rule apply?', 'Can anyone predict the next step?'],
        materialsNeeded: ['Whiteboard & lesson notes'],
      },
      {
        phaseName: 'Guided Practice & Exploration',
        durationMinutes: 15,
        teacherActions: 'Facilitate small-group investigation around 2 practice scenarios.',
        learnerActions: 'Work collaboratively on worksheet problems, comparing approaches.',
        keyQuestionsOrCheckpoints: ['Did both partners arrive at the same outcome?'],
        materialsNeeded: ['Guided practice cards'],
      },
      {
        phaseName: 'Closure & Exit Assessment',
        durationMinutes: 5,
        teacherActions: 'Distribute 1-minute exit ticket checking understanding of the main objective.',
        learnerActions: 'Write and hand in exit ticket response before leaving.',
        keyQuestionsOrCheckpoints: ['100% exit ticket collection rate'],
        materialsNeeded: ['Exit tickets'],
      }
    ],
    assessmentStrategy: {
      formative: 'Continuous observation during guided group practice and quick verbal polling.',
      summativeOrExitTicket: 'Exit ticket evaluating core objective mastery.'
    },
    differentiation: {
      supportForStrugglingLearners: 'Provide structured graphic organizers and step-by-step formula guides.',
      extensionForAdvancedLearners: 'Provide advanced inquiry challenge problem with non-standard parameters.',
      multilingualOrContextualAdaptation: 'Incorporate local terminology and real-life community examples.'
    },
    reflectionNotes: 'Assess which phase required more time and adjust pacing accordingly.',
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackPdfQuiz(docName: string, text: string, count: number, difficulty: string, level: string) {
  const cleanName = docName.replace(/\.[^/.]+$/, '');
  return {
    id: `pdf-quiz-${Date.now()}`,
    title: `Grounded Quiz: ${cleanName}`,
    sourceDocName: docName,
    sourceDocSummary: `Extracted assessment generated directly from the uploaded source document: "${docName}".`,
    gradeLevel: level || 'Senior Secondary / High School (Grades 9-12)',
    difficulty: difficulty || 'Intermediate',
    totalQuestions: Number(count) || 6,
    afrikanQuizCompatibilityTag: 'PROUDLY_AFRIKAN_QUIZ_COMPLIANT_V1',
    questions: [
      {
        id: 'pq-1',
        number: 1,
        question: `Based on the provided document "${docName}", what is the primary focus or theme discussed?`,
        type: 'multiple-choice',
        options: [
          `A) The core principles and analytical findings presented in ${cleanName}`,
          'B) An unrelated historical fiction narrative',
          'C) Purely speculative assumptions unsupported by the text',
          'D) A general glossary without thematic focus'
        ],
        correctAnswer: `A) The core principles and analytical findings presented in ${cleanName}`,
        explanation: 'Directly supported by the introductory overview of the uploaded text.',
        sourceReferenceQuote: text.slice(0, 150) + '...',
      },
      {
        id: 'pq-2',
        number: 2,
        question: 'According to the source document, which statement is factually accurate?',
        type: 'multiple-choice',
        options: [
          'A) The text establishes documented evidence and structured analysis',
          'B) The document contradicts its own primary premise',
          'C) No conclusions are drawn in the material',
          'D) All data points are left unspecified'
        ],
        correctAnswer: 'A) The text establishes documented evidence and structured analysis',
        explanation: 'Supported by the content structure within the provided source.',
        sourceReferenceQuote: text.slice(100, 250) + '...',
      }
    ],
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackStudyPack(docName: string, text: string, level: string) {
  const cleanName = docName.replace(/\.[^/.]+$/, '');
  return {
    id: `sp-${Date.now()}`,
    title: `Study Pack: ${cleanName}`,
    sourceDocName: docName,
    documentOverview: `Structured high-yield revision and concept pack synthesised directly from ${docName}.`,
    gradeLevel: level || 'Senior Secondary / High School (Grades 9-12)',
    keyConcepts: [
      {
        id: 'c1',
        conceptName: `Core Thesis of ${cleanName}`,
        summary: 'Primary conceptual pillar established in the document.',
        inDepthExplanation: text.slice(0, 400) || 'Comprehensive discussion extracted from the document body.',
        realWorldExampleOrApplication: 'Direct application in academic revision and practical problem-solving.',
      }
    ],
    essentialGlossary: [
      {
        term: 'Key Terminology',
        definition: 'Specialized vocabulary extracted from the text.',
        context: 'Used throughout key chapters of the uploaded document.',
      }
    ],
    highYieldRevisionPoints: [
      `Review the primary frameworks discussed in ${cleanName}.`,
      'Focus on the relationship between causes, mechanisms, and documented outcomes.',
      'Test your recall on the core formulas or definitions.'
    ],
    selfCheckQuestions: [
      {
        question: `What are the three most critical takeaways from ${cleanName}?`,
        answer: 'Refer to the central arguments outlined in the document overview section.',
        hint: 'Look at the introductory and concluding summaries.',
      }
    ],
    activeRecallActivities: [
      'Summarize the core concept in your own words without looking at the text.',
      'Explain the key mechanism to a study partner in under 2 minutes.'
    ],
    afrikanStudyCompatibilityTag: 'PROUDLY_AFRIKAN_STUDY_COMPLIANT_V1',
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackPresentation(subject: string, topic: string, audience: string, count: number, style: string) {
  return {
    id: `pres-${Date.now()}`,
    title: `${topic || subject}: Master Presentation`,
    subtitle: 'Educational Lecture & Visual Concept Deck',
    subject: subject || 'General Education',
    topic: topic || 'Core Topic',
    targetAudience: audience || 'Senior Secondary / High School (Grades 9-12)',
    presentationStyle: style || 'Educational Lecture & Discussion',
    learningObjectives: [
      `Gain a clear understanding of the foundational principles of ${topic || subject}.`,
      'Analyze practical case studies and real-world implementations.',
      'Synthesize key insights for applied practice.'
    ],
    slidesCount: Number(count) || 6,
    slides: [
      {
        id: 's-1',
        slideNumber: 1,
        slideType: 'title',
        title: `${topic || subject}`,
        subtitle: 'Foundations, Frameworks & Practical Applications',
        bulletPoints: [
          'Proudly Afrikan Build Educational Series',
          `Target Level: ${audience}`,
          'Interactive Lecture & Discussion Framework'
        ],
        speakerNotes: 'Welcome the audience and frame today\'s session around clear, actionable educational outcomes.',
        suggestedVisualOrDiagram: 'Striking high-contrast title card with African ochre geometric vector accents.',
      },
      {
        id: 's-2',
        slideNumber: 2,
        slideType: 'content',
        title: 'Core Principles & Fundamentals',
        subtitle: 'The Building Blocks of the Subject',
        bulletPoints: [
          `Understanding the historical and theoretical genesis of ${topic || subject}.`,
          'Key terminology and operational definitions.',
          'Standard frameworks utilized by researchers and practitioners.',
          'Common misconceptions and critical clarifications.'
        ],
        speakerNotes: 'Pause here to ensure all students grasp the core definitions before moving to complex models.',
        suggestedVisualOrDiagram: 'Conceptual diagram illustrating the 3 foundational pillars.',
        discussionOrEngagementPrompt: 'What is one example of this concept that you have encountered in everyday life?'
      },
      {
        id: 's-3',
        slideNumber: 3,
        slideType: 'summary',
        title: 'Key Takeaways & Synthesis',
        subtitle: 'Summary and Next Steps',
        bulletPoints: [
          'Mastery requires understanding foundational mechanics first.',
          'Always connect theoretical models to empirical evidence.',
          'Continue to the structured practice exercises.'
        ],
        speakerNotes: 'Summarize key points and open the floor for final student reflections.',
        suggestedVisualOrDiagram: 'Summary visual checklist.',
      }
    ],
    conclusionTakeaway: `Mastery in ${topic || subject} opens new horizons for intellectual growth and practical innovation.`,
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackCourse(title: string, subject: string, level: string, desc: string) {
  const courseTitle = title || `${subject} Comprehensive Curriculum`;
  return {
    id: `course-${Date.now()}`,
    title: courseTitle,
    subtitle: 'Sequenced Multi-Module Academic Course',
    subject: subject || 'General Education',
    gradeLevel: level || 'Tertiary / Undergraduate',
    description: desc || `A comprehensive curriculum designed to take students from foundational concepts to advanced mastery in ${subject}.`,
    prerequisites: ['Foundational secondary school literacy and STEM / Humanities background.'],
    courseObjectives: [
      `Analyze core principles and historical developments in ${subject}.`,
      'Apply analytical and experimental methods to domain-specific problems.',
      'Produce an independent capstone project demonstrating mastery.'
    ],
    targetAudience: level || 'Tertiary / Undergraduate',
    totalEstimatedHours: 36,
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'Module 1: Foundations & Theoretical Baselines',
        overview: 'Introduction to key terminology, governing laws, and historical context.',
        estimatedHours: 12,
        lessons: [
          {
            id: 'l1-1',
            title: 'Lesson 1.1: Historical Origins & Core Principles',
            estimatedMinutes: 60,
            summary: 'Understanding the genesis and fundamental axioms of the field.',
            keyLearningOutcomes: ['Define key terms', 'Trace historical evolution'],
            deliveryFormat: 'Lecture',
          },
          {
            id: 'l1-2',
            title: 'Lesson 1.2: Methodologies & Analytical Frameworks',
            estimatedMinutes: 90,
            summary: 'Survey of modern research methods and quantitative techniques.',
            keyLearningOutcomes: ['Formulate research questions', 'Select appropriate models'],
            deliveryFormat: 'Discussion',
          }
        ]
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'Module 2: Practical Applications & Case Studies',
        overview: 'Hands-on problem solving and evaluation of real-world scenarios.',
        estimatedHours: 14,
        lessons: [
          {
            id: 'l2-1',
            title: 'Lesson 2.1: Case Study Analysis',
            estimatedMinutes: 90,
            summary: 'In-depth review of successful regional and global implementations.',
            keyLearningOutcomes: ['Evaluate trade-offs', 'Design mitigation strategies'],
            deliveryFormat: 'Case Study',
          }
        ]
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'Module 3: Advanced Synthesis & Capstone Defense',
        overview: 'Final project execution, peer review, and defense.',
        estimatedHours: 10,
        lessons: [
          {
            id: 'l3-1',
            title: 'Lesson 3.1: Capstone Project Planning & Defense',
            estimatedMinutes: 120,
            summary: 'Developing and presenting an original solution to a complex domain problem.',
            keyLearningOutcomes: ['Synthesize multi-module knowledge', 'Present findings professionally'],
            deliveryFormat: 'Assessment',
          }
        ]
      }
    ],
    assessmentAndGradingOutline: 'Continuous Assignments (40%), Mid-term Evaluation (25%), Final Capstone Project (35%).',
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackLearningPath(title: string, subject: string, goal: string) {
  const pathTitle = title || `${subject} Progression Pathway`;
  return {
    id: `lp-${Date.now()}`,
    title: pathTitle,
    subject: subject || 'General Education',
    targetCareerOrEducationalGoal: goal || 'Professional Proficiency & Mastery',
    totalEstimatedDuration: '24 Weeks (4 Structured Stages)',
    overallDescription: `A progressive learning path guiding students through four distinct tiers of capability in ${subject}.`,
    learningOutcomes: [
      'Master core baseline principles with high theoretical fidelity.',
      'Develop intermediate practical problem-solving capabilities.',
      'Execute advanced projects requiring multi-variable analysis.',
      'Demonstrate mastery through an independent capstone defense.'
    ],
    stages: [
      {
        id: 'st-1',
        stageNumber: 1,
        tier: 'Foundation / Beginner',
        title: 'Stage 1: Core Fundamentals & Literacy',
        description: 'Establish foundational principles, terminology, and standard mental models.',
        estimatedWeeks: 6,
        keyCompetenciesToMaster: [
          'Basic vocabulary and definitions',
          'Standard calculation and reasoning techniques',
          'Independent study habits and note-taking frameworks'
        ],
        recommendedModulesOrTopics: ['Foundational Concepts', 'Introduction to Analysis'],
        milestoneProjectOrAssessment: 'Complete a comprehensive foundational diagnostic exam and portfolio review.',
        prerequisitesBeforeEntry: ['Enthusiasm for learning and basic secondary school background.'],
      },
      {
        id: 'st-2',
        stageNumber: 2,
        tier: 'Intermediate / Practitioner',
        title: 'Stage 2: Guided Practice & Methodological Rigor',
        description: 'Expand analytical depth and tackle real-world case studies.',
        estimatedWeeks: 6,
        keyCompetenciesToMaster: [
          'Multi-step problem decomposition',
          'Application of formulas in non-trivial contexts',
          'Peer collaboration and structured critique'
        ],
        recommendedModulesOrTopics: ['Intermediate Problem Solving', 'Case Analysis'],
        milestoneProjectOrAssessment: 'Deliver a structured case study analysis with empirical backing.',
        prerequisitesBeforeEntry: ['Successful completion of Stage 1.'],
      },
      {
        id: 'st-3',
        stageNumber: 3,
        tier: 'Advanced / Specialist',
        title: 'Stage 3: Complex Systems & Advanced Design',
        description: 'Tackle high-difficulty scenarios, optimization, and real-world system design.',
        estimatedWeeks: 6,
        keyCompetenciesToMaster: [
          'Advanced modeling and simulation',
          'Critical evaluation of competing methodologies',
          'Autonomous research and documentation'
        ],
        recommendedModulesOrTopics: ['Advanced Systems Theory', 'Design & Optimization'],
        milestoneProjectOrAssessment: 'Design and simulate an advanced domain solution.',
        prerequisitesBeforeEntry: ['Successful completion of Stage 2.'],
      },
      {
        id: 'st-4',
        stageNumber: 4,
        tier: 'Mastery & Capstone',
        title: 'Stage 4: Mastery, Synthesis & Capstone Defense',
        description: 'Produce original work, master mentorship, and complete certification standards.',
        estimatedWeeks: 6,
        keyCompetenciesToMaster: [
          'End-to-end project leadership',
          'Professional oral and written defense',
          'Pedagogical mentorship of earlier-stage peers'
        ],
        recommendedModulesOrTopics: ['Capstone Synthesis', 'Professional Leadership'],
        milestoneProjectOrAssessment: 'Defend comprehensive capstone before an expert academic review panel.',
        prerequisitesBeforeEntry: ['Stages 1 through 3.'],
      }
    ],
    certificationOrExitMilestone: 'Proudly Afrikan Certified Practitioner Credential and Capstone Portfolio Showcase.',
    createdAt: new Date().toISOString(),
  };
}

function sanitizeMindMapNode(rawNode: any, defaultLabel: string, depth = 0): any {
  if (!rawNode || typeof rawNode !== 'object') {
    return {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: defaultLabel,
    };
  }

  const label = typeof rawNode.label === 'string' && rawNode.label.trim()
    ? rawNode.label.trim()
    : defaultLabel;

  const id = typeof rawNode.id === 'string' && rawNode.id.trim()
    ? rawNode.id.trim()
    : `node-${depth}-${Math.random().toString(36).substring(2, 6)}`;

  const node: any = { id, label };

  if (rawNode.notes && typeof rawNode.notes === 'string') {
    node.notes = rawNode.notes.trim();
  }

  if (Array.isArray(rawNode.children) && rawNode.children.length > 0) {
    node.children = rawNode.children.map((child: any, idx: number) =>
      sanitizeMindMapNode(child, `Concept ${idx + 1}`, depth + 1)
    );
  }

  return node;
}

function normalizeMindMap(data: any, topic: string, subject: string, gradeLevel: string, sourceFileName?: string) {
  const cleanTopic = topic || 'Educational Domain';
  const summary = typeof data?.summary === 'string' && data.summary.trim()
    ? data.summary.trim()
    : `Comprehensive hierarchical breakdown of ${cleanTopic} across key concepts, mechanisms, applications, and critical analysis.`;

  let rootNode = data?.rootNode;
  if (!rootNode && data?.children) {
    rootNode = {
      id: 'root-node',
      label: cleanTopic,
      notes: `Central subject domain for ${cleanTopic}`,
      children: data.children,
    };
  }

  const sanitizedRoot = sanitizeMindMapNode(rootNode, cleanTopic, 0);

  return {
    id: `mm-${Date.now()}`,
    title: cleanTopic,
    subject,
    topic: cleanTopic,
    gradeLevel,
    rootNode: sanitizedRoot,
    summary,
    sourceDocName: sourceFileName || undefined,
    createdAt: new Date().toISOString(),
    toolType: 'mind-map' as const,
  };
}

function generateFallbackMindMap(topic: string, subject: string, gradeLevel: string, _sourceMaterial?: string, _sourceFileName?: string) {
  const cleanTopic = (topic || 'Core Subject').trim();
  return {
    summary: `Structured hierarchical conceptual breakdown for ${cleanTopic} across theoretical foundations, systemic mechanisms, regional African applications, and forward-looking strategic challenges.`,
    rootNode: {
      id: 'root-node',
      label: cleanTopic,
      notes: `Core structured conceptual domain for ${cleanTopic} (${subject}, ${gradeLevel}).`,
      children: [
        {
          id: 'branch-1',
          label: 'Theoretical Foundations & Definitions',
          notes: 'Core theoretical, definitional, and historical principles.',
          children: [
            {
              id: 'leaf-1a',
              label: 'Essential Terminology & Key Vocabulary',
              notes: 'Fundamental terms, symbols, and standard notations required for conceptual mastery.'
            },
            {
              id: 'leaf-1b',
              label: 'Core Governing Laws & Mechanisms',
              notes: 'Fundamental mechanics, primary equations, and structural relationships.'
            },
            {
              id: 'leaf-1c',
              label: 'Historical Evolution & Scientific Benchmarks',
              notes: 'Key milestones, foundational experiments, and historical breakthroughs.'
            }
          ]
        },
        {
          id: 'branch-2',
          label: 'Systemic Methodologies & Frameworks',
          notes: 'Functional structures, analytical models, and operational paradigms.',
          children: [
            {
              id: 'leaf-2a',
              label: 'Structural Classification & Taxonomy',
              notes: 'Systematic classification and functional subdivisions within the domain.'
            },
            {
              id: 'leaf-2b',
              label: 'Experimental & Diagnostic Procedures',
              notes: 'Standardized protocols, measurement techniques, and problem-solving workflows.'
            },
            {
              id: 'leaf-2c',
              label: 'Quantitative Modeling & Performance Metrics',
              notes: 'Critical formulas, evaluation metrics, and comparative assessment benchmarks.'
            }
          ]
        },
        {
          id: 'branch-3',
          label: 'Real-World Applications in Africa & Beyond',
          notes: 'Practical industrial, technological, and socioeconomic use cases across the African continent.',
          children: [
            {
              id: 'leaf-3a',
              label: 'Regional Infrastructure & Case Studies',
              notes: 'Leading infrastructure, public sector deployments, and enterprise case studies.'
            },
            {
              id: 'leaf-3b',
              label: 'Socioeconomic & Ecological Impact',
              notes: 'Direct contribution to community empowerment, sustainability, and regional industrial growth.'
            },
            {
              id: 'leaf-3c',
              label: 'Cross-Disciplinary Technological Synergy',
              notes: 'Integration with adjacent engineering, agricultural, health, and data science frontiers.'
            }
          ]
        },
        {
          id: 'branch-4',
          label: 'Challenges, Innovations & Strategic Outlook',
          notes: 'Identified bottlenecks, contemporary innovations, and strategic developmental horizons.',
          children: [
            {
              id: 'leaf-4a',
              label: 'Key Constraints & Structural Roadblocks',
              notes: 'Critical financial, technological, and infrastructural hurdles to navigate.'
            },
            {
              id: 'leaf-4b',
              label: 'Emerging Indigenous & Global Innovations',
              notes: 'Pioneering African and international technologies transforming implementation.'
            },
            {
              id: 'leaf-4c',
              label: 'Future Research & Policy Horizons',
              notes: 'Upcoming frontiers, educational curricula reform, and strategic long-term vision.'
            }
          ]
        }
      ]
    }
  };
}

