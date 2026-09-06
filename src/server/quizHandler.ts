import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";


dotenv.config();




// Generous body parsing for text & study document content



// Lazy/safe initialization of Gemini AI
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please ensure your API key is set in AI Studio Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check

/**
 * Robust generation helper with automatic retry and model fallback
 * to handle transient 503 (high demand) and 429 errors gracefully.
 */
async function generateQuizContent(ai: GoogleGenAI, prompt: string) {
  // Candidate models in order of priority (start with 3.1-flash-lite and 3.7-flash for fastest, most reliable generation)
  const modelCandidates = ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"];
  
  let lastError: any = null;

  for (const model of modelCandidates) {
    // Try up to 2 attempts per model with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Attempting quiz generation with model: ${model} (attempt ${attempt})`);
        
        const config: any = {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: {
                type: Type.STRING,
                description: "A punchy, bold title for the quiz.",
              },
              quizDescription: {
                type: Type.STRING,
                description: "A short 1-sentence summary of what this quiz tests.",
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "Either 'multiple_choice' or 'true_false'",
                    },
                    question: {
                      type: Type.STRING,
                      description: "The question or statement prompt.",
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Array of choice strings. 4 for multiple choice, ['True', 'False'] for true/false.",
                    },
                    correctAnswer: {
                      type: Type.STRING,
                      description: "The exact matching correct string from the options array.",
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Concise educational explanation.",
                    },
                  },
                  required: ["type", "question", "options", "correctAnswer", "explanation"],
                },
              },
            },
            required: ["quizTitle", "questions"],
          },
        };

        if (model === "gemini-3.7-flash") {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        if (response.text && response.text.trim().length > 0) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Generation with ${model} (attempt ${attempt}) failed:`, errMsg);

        // Check if error is transient (503 high demand, 429 rate limit, 500 server error)
        const isTransient = /503|high demand|unavailable|429|resource exhausted|500/i.test(errMsg);
        if (isTransient && attempt < 2) {
          // Brief exponential wait before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate quiz after trying all available models.");
}

// Quiz generation endpoint

export function registerQuizRoutes(app: express.Express): void {
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const {
      creationMethod,
      topic,
      text,
      fileName,
      fileText,
      settings,
    } = req.body;

    const questionCount = Math.min(Math.max(Number(settings?.questionCount) || 5, 3), 30);
    const difficulty = settings?.difficulty || "medium";
    const questionType = settings?.questionType || "multiple_choice";
    const educationLevel = settings?.educationLevel || "general";
    const subject = settings?.subject || "General";

    // Validate inputs
    let sourceContent = "";
    let contextTitle = "";

    if (creationMethod === "topic") {
      if (!topic || !topic.trim()) {
        return res.status(400).json({ error: "Please enter a topic to generate your quiz." });
      }
      sourceContent = topic.trim();
      contextTitle = topic.trim();
    } else if (creationMethod === "text") {
      if (!text || !text.trim() || text.trim().length < 15) {
        return res.status(400).json({ error: "Please paste sufficient study material or notes (at least 15 characters)." });
      }
      sourceContent = text.trim();
      contextTitle = "Pasted Study Material & Notes";
    } else if (creationMethod === "pdf") {
      if (!fileText || !fileText.trim()) {
        return res.status(400).json({ error: "No readable text was found in the uploaded document. Please check the file and try again." });
      }
      sourceContent = fileText.trim();
      contextTitle = fileName ? `Document: ${fileName}` : "Uploaded Educational Document";
    } else {
      return res.status(400).json({ error: "Invalid quiz creation method specified." });
    }

    const ai = getGeminiClient();

    const promptInstructions = `
You are the master question architect for "PROUDLY AFRIKAN QUIZ", an educational platform dedicated to intellectual rigor, active recall, and cultural confidence.

TASK:
Generate a complete, high-quality, structured interactive quiz with EXACTLY ${questionCount} questions based on the provided source.

CREATION CONFIGURATION:
- Method: ${creationMethod.toUpperCase()} (${creationMethod === 'topic' ? 'Generate authoritative, comprehensive educational questions about this topic' : 'Generate questions strictly based on the supplied source material without hallucinating outside facts'})
- Subject: ${subject}
- Target Education Level: ${educationLevel} (${educationLevel === 'primary' ? 'Primary / Elementary School level' : educationLevel === 'high_school' ? 'High / Secondary School level' : educationLevel === 'university' ? 'University / Academic level' : 'General Knowledge & Curious Learners'})
- Target Difficulty: ${difficulty.toUpperCase()} (${difficulty === 'easy' ? 'Foundational concepts, clear distinguishing choices' : difficulty === 'medium' ? 'Nuanced understanding, thoughtful plausible distractors' : 'Rigorous analytical questions testing deep mastery with clever distractors'})
- Question Type Format: ${questionType.toUpperCase()} (${questionType === 'multiple_choice' ? 'All Multiple Choice with exactly 4 options' : questionType === 'true_false' ? 'All True / False statements with exactly 2 options ["True", "False"]' : 'A balanced mix of Multiple Choice (4 options) and True/False (2 options)'})

SOURCE MATERIAL:
"""
${sourceContent.slice(0, 45000)}
"""

RIGOROUS QUESTION REQUIREMENTS:
1. Grounding & Accuracy: For text and PDF modes, questions MUST test understanding of the actual supplied text. For topic mode, ensure facts are historically and scientifically accurate.
2. Grammar & Clarity: Every question must be grammatically pristine, engaging, and clear.
3. No Obvious Answers: Distractors (wrong answers) MUST be plausible and related to the context—never silly or obvious from wording alone.
4. Single Correct Answer: There must be exactly ONE clearly correct answer. Avoid "all of the above" or "none of the above".
5. Options Formatting:
   - For multiple choice: Provide exactly 4 options.
   - For true/false: Provide exactly 2 options: ["True", "False"].
   - The 'correctAnswer' field MUST be an exact string match to one of the choices in 'options'.
6. Illuminating Explanations: Provide a concise, clear 1-2 sentence explanation detailing WHY the correct answer is right and the key insight behind it.
7. Quiz Title: Generate a concise, bold title (max 6 words).

Respond strictly with valid JSON conforming to the schema.
`;

    const { text: rawText } = await generateQuizContent(ai, promptInstructions);

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, rawText);
      return res.status(500).json({ error: "Unable to parse the generated quiz structure. Please try generating again." });
    }

    if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
      return res.status(500).json({ error: "The AI did not produce questions for this request. Please try adding more detail or choosing a different subject." });
    }

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateBalancedTargetSequence(count: number, slotsCount = 4): number[] {
  if (count <= 0) return [];
  const pool: number[] = [];
  const fullSets = Math.floor(count / slotsCount);
  const remainder = count % slotsCount;

  for (let i = 0; i < fullSets; i++) {
    pool.push(...shuffleArray([0, 1, 2, 3].slice(0, slotsCount)));
  }

  if (remainder > 0) {
    const partial = shuffleArray([0, 1, 2, 3].slice(0, slotsCount)).slice(0, remainder);
    pool.push(...partial);
  }

  let sequence = shuffleArray(pool);

  // De-clustering pass: avoid 3 identical slots in a row (e.g. A, A, A)
  for (let i = 2; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1] && sequence[i] === sequence[i - 2]) {
      for (let j = 0; j < sequence.length; j++) {
        if (
          sequence[j] !== sequence[i] &&
          (j < 1 || sequence[j - 1] !== sequence[i]) &&
          (j > sequence.length - 2 || sequence[j + 1] !== sequence[i])
        ) {
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
          break;
        }
      }
    }
  }

  return sequence;
}

// Format, randomize and sanitize questions with stable IDs and distributed correct answer slots (A, B, C, D)
    const mcQuestionsCount = parsedData.questions.filter((q: any) => q.type !== 'true_false').length;
    const targetSlots = generateBalancedTargetSequence(mcQuestionsCount, 4);
    let mcSlotIndex = 0;

    const formattedQuestions = parsedData.questions.map((q: any, idx: number) => {
      const qType: 'multiple_choice' | 'true_false' = q.type === 'true_false' ? 'true_false' : 'multiple_choice';
      const rawOptions = Array.isArray(q.options) ? q.options.map((opt: any) => String(opt).trim()) : [];
      let correctVal = String(q.correctAnswer || '').trim();

      if (qType === 'true_false') {
        const isTrue = /true|yes/i.test(correctVal);
        return {
          id: `q_${Date.now()}_${idx + 1}`,
          type: qType,
          question: String(q.question || `Question ${idx + 1}`).trim(),
          options: ["True", "False"],
          correctAnswer: isTrue ? "True" : "False",
          explanation: String(q.explanation || "This question assesses core understanding from the provided source.").trim(),
        };
      }

      // Multiple Choice: Separate correct answer from distractors
      // If correctVal was not provided or empty, fallback to first option
      if (!correctVal && rawOptions.length > 0) {
        correctVal = rawOptions[0];
      }

      let distractors = rawOptions.filter((opt: string) => opt !== correctVal && opt.length > 0);
      distractors = Array.from(new Set(distractors));

      const fallbackDistractors = [
        "Historical alternative factor",
        "Geographical boundary condition",
        "Economic secondary metric",
        "Cultural antecedent perspective",
      ];
      let fb = 0;
      while (distractors.length < 3) {
        const item = fallbackDistractors[fb % fallbackDistractors.length];
        if (!distractors.includes(item) && item !== correctVal) {
          distractors.push(item);
        }
        fb++;
      }

      if (distractors.length > 3) {
        distractors = distractors.slice(0, 3);
      }

      // Randomly shuffle the 3 distractors
      const shuffledDistractors = shuffleArray(distractors);

      // Assign target slot from the balanced sequence
      const targetSlot = targetSlots[mcSlotIndex] ?? Math.floor(Math.random() * 4);
      mcSlotIndex++;

      // Assemble 4 choices with correct answer placed exactly at targetSlot
      const finalOptions = [...shuffledDistractors];
      finalOptions.splice(targetSlot, 0, correctVal);

      return {
        id: `q_${Date.now()}_${idx + 1}`,
        type: qType,
        question: String(q.question || `Question ${idx + 1}`).trim(),
        options: finalOptions,
        correctAnswer: correctVal,
        explanation: String(q.explanation || "This question assesses core understanding from the provided source.").trim(),
      };
    });

    const generatedQuiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: parsedData.quizTitle || (creationMethod === "topic" ? topic : "Custom Generated Quiz"),
      description: parsedData.quizDescription || `An interactive ${formattedQuestions.length}-question assessment created with Proudly Afrikan Quiz.`,
      topicOrSource: contextTitle,
      creationMethod,
      settings: {
        questionCount: formattedQuestions.length,
        difficulty,
        questionType,
        educationLevel,
        subject,
      },
      createdAt: new Date().toISOString(),
      questions: formattedQuestions,
    };

    return res.json({ quiz: generatedQuiz });
  } catch (err: any) {
    console.error("Error generating quiz:", err);
    
    // Provide user-friendly message for high-demand / quota errors
    let clientMessage = err?.message || "An unexpected error occurred while generating the quiz.";
    if (/503|high demand|unavailable/i.test(clientMessage)) {
      clientMessage = "The AI service is currently experiencing high demand. Please click 'Generate Quiz' again in a few seconds.";
    } else if (/429|resource exhausted|quota/i.test(clientMessage)) {
      clientMessage = "Rate limit reached. Please wait a brief moment before generating another quiz.";
    }

    return res.status(500).json({
      error: clientMessage,
    });
  }
});


}
