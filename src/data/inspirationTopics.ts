import { useState, useEffect } from 'react';
import { StudyToolType } from '../study/types';

export interface StudyInspirationTopic {
  label: string;
  topic: string;
  category: string;
  tool: StudyToolType;
}

export interface QuizInspirationTopic {
  label: string;
  topic: string;
  category: string;
}

export interface BuildInspirationTopic {
  title: string;
  emoji: string;
  topic: string;
  category?: string;
}

// ---------------------------------------------------------------------
// STUDY TOPICS POOL (24 Curated High Quality Topics)
// ---------------------------------------------------------------------
export const STUDY_TOPICS_POOL: StudyInspirationTopic[] = [
  // African History & Empires
  { label: '📜 Timbuktu Manuscripts', topic: 'Timbuktu Manuscripts & Medieval African Astronomy', category: 'HISTORY & SCIENCE', tool: 'study-guide' },
  { label: '🏛️ Great Zimbabwe Architecture', topic: 'Great Zimbabwe Stone Architecture & Medieval Trade Networks', category: 'AFRICAN HISTORY', tool: 'flashcards' },
  { label: '⛵ Swahili Maritime Commerce', topic: 'Swahili Maritime Navigation & Indian Ocean Commerce', category: 'GEOGRAPHY & TRADE', tool: 'quiz' },
  { label: '🪙 Kingdom of Aksum Coinage', topic: 'Kingdom of Aksum Gold Coinage & Red Sea Metallurgy', category: 'ECONOMICS & HISTORY', tool: 'presentation' },
  { label: '👑 Nubian Pyramids of Meroë', topic: 'Nubian Pyramids of Meroë & Kingdom of Kush Dynasties', category: 'ANCIENT HISTORY', tool: 'learning-path' },
  { label: '🎨 Kingdom of Benin Bronzes', topic: 'Kingdom of Benin Bronze Casting Techniques & Metallurgy', category: 'ART & HISTORY', tool: 'study-guide' },
  { label: '🛡️ Oromo Gadaa System', topic: 'Oromo Gadaa System of Democratic Governance & Social Structure', category: 'POLITICAL SCIENCE', tool: 'course' },
  { label: '📜 Egyptian Hieroglyphics', topic: 'Deciphering Ancient Egyptian Hieroglyphics & Demotic Scripts', category: 'LINGUISTICS', tool: 'study-guide' },
  
  // Sciences & Medicine
  { label: '🌿 African Medicinal Botany', topic: 'African Medicinal Botany & Traditional Pharmacopeia', category: 'SCIENCES & HEALTH', tool: 'study-guide' },
  { label: '🧬 CRISPR-Cas9 Gene Editing', topic: 'CRISPR-Cas9 Gene Editing Mechanics & Bioethics', category: 'MOLECULAR BIOLOGY', tool: 'flashcards' },
  { label: '☀️ Solar Photovoltaic Physics', topic: 'Solar Photovoltaic Cell Physics & Renewable Energy Systems', category: 'PHYSICS & ENERGY', tool: 'presentation' },
  { label: '🧠 Neural Networks & AI', topic: 'Deep Learning Neural Networks & Artificial Intelligence Architecture', category: 'COMPUTER SCIENCE', tool: 'learning-path' },
  { label: '🦠 Human Immune System', topic: 'Human Immune System Mechanics, Antibodies & Vaccines', category: 'MEDICINE & IMMUNOLOGY', tool: 'flashcards' },
  { label: '🪐 James Webb Astrophysics', topic: 'James Webb Space Telescope Discoveries & Infrared Astrophysics', category: 'ASTRONOMY', tool: 'presentation' },

  // Mathematics & Economics
  { label: '🦴 Ishango Mathematics', topic: 'Ishango Bone & Prehistoric Mathematical System in Central Africa', category: 'MATHEMATICS', tool: 'study-guide' },
  { label: '📊 AfCFTA Trade Economics', topic: 'African Continental Free Trade Area (AfCFTA) Economic Impact', category: 'ECONOMICS', tool: 'course' },
  { label: '📈 Calculus & Integration', topic: 'Calculus Derivatives, Integration & Real-World Applications', category: 'MATHEMATICS', tool: 'quiz' },
  { label: '📱 FinTech & Mobile Money', topic: 'M-Pesa, FinTech & Digital Financial Inclusion in Africa', category: 'FINANCE & TECH', tool: 'presentation' },

  // Literature & Philosophy
  { label: '🎵 West African Griot Traditions', topic: 'West African Griot Oral History Traditions & Genealogies', category: 'LITERATURE & ARTS', tool: 'learning-path' },
  { label: '📚 Chinua Achebe Literature', topic: 'Chinua Achebe "Things Fall Apart" Literary Analysis & Themes', category: 'LITERATURE', tool: 'study-guide' },
  { label: '🌍 Great Rift Valley Geology', topic: 'Great Rift Valley Geology, Plate Tectonics & Biodiversity', category: 'GEOLOGY & ENVIRONMENT', tool: 'course' },
  { label: '🤝 Ubuntu Ethics & Philosophy', topic: 'Ubuntu Philosophy & African Communal Humanism Ethics', category: 'PHILOSOPHY', tool: 'study-guide' },
];

// ---------------------------------------------------------------------
// QUIZ TOPICS POOL (24 Curated Topics for Quizzes and Drills)
// ---------------------------------------------------------------------
export const QUIZ_TOPICS_POOL: QuizInspirationTopic[] = [
  { label: '📜 Timbuktu Manuscripts', topic: 'Timbuktu Manuscripts & Medieval African Astronomy', category: 'History' },
  { label: '🏛️ Great Zimbabwe', topic: 'Great Zimbabwe Stone Architecture & Trade', category: 'Architecture' },
  { label: '⛵ Swahili Navigation', topic: 'Swahili Maritime Navigation & Indian Ocean Commerce', category: 'Trade' },
  { label: '🪙 Aksum Coinage', topic: 'Kingdom of Aksum Gold Coinage & Metallurgy', category: 'History' },
  { label: '🌿 Medicinal Botany', topic: 'African Medicinal Botany & Traditional Pharmacopeia', category: 'Science' },
  { label: '🎵 West African Griots', topic: 'West African Griot Oral History Traditions', category: 'Culture' },
  { label: '👑 Queen Moremi of Ife', topic: 'Queen Moremi of Ife & Yoruba Historical Legends', category: 'History' },
  { label: '🧪 Organic Chemistry', topic: 'Organic Chemistry Reaction Mechanisms & Functional Groups', category: 'Chemistry' },
  { label: '📐 Trigonometric Proofs', topic: 'Trigonometric Identities, Functions & Triangle Proofs', category: 'Mathematics' },
  { label: '🌍 Climate Systems', topic: 'Global Climate Systems, Meteorology & Ecosystem Dynamics', category: 'Geography' },
  { label: '🧬 DNA & Genetics', topic: 'Cellular Genetics, DNA Structure & Protein Synthesis', category: 'Biology' },
  { label: '🏰 Lalibela Rock Churches', topic: 'Rock-Hewn Churches of Lalibela & Aksumite Engineering', category: 'History' },
  { label: '💻 Cybersecurity Basics', topic: 'Cybersecurity Fundamentals, Encryption & Network Security', category: 'Technology' },
  { label: '📖 Post-Colonial Novels', topic: 'African Post-Colonial Novels, Poetry & Oral Metaphors', category: 'Literature' },
  { label: '⚡ Quantum Mechanics', topic: 'Electromagnetic Spectrum, Photons & Quantum Phenomena', category: 'Physics' },
  { label: '📊 Microeconomics', topic: 'Microeconomics Supply, Demand Elasticity & Market Structure', category: 'Economics' },
  { label: '🦴 Ishango Tally System', topic: 'Ishango Bone Ancient central African Mathematics', category: 'Mathematics' },
  { label: '🎨 Benin Bronze Artistry', topic: 'Kingdom of Benin Bronze Relief Castings & Metallurgy', category: 'Art' },
  { label: '🪐 Solar System Physics', topic: 'Orbital Mechanics, Gravity & Solar System Planetary Science', category: 'Astronomy' },
  { label: '🩺 Human Physiology', topic: 'Human Circulatory & Respiratory System Mechanics', category: 'Health' },
  { label: '🤖 AI & Machine Learning', topic: 'Machine Learning Algorithms, Decision Trees & Neural Nets', category: 'Technology' },
  { label: '🌊 Hydrology of the Nile', topic: 'River Nile Hydrology, Dams & Environmental Management', category: 'Geography' },
  { label: '🏛️ Carthage & Hannibal', topic: 'Ancient Carthage Military Tactics & Punic Wars', category: 'History' },
  { label: '🎵 African Polyrhythms', topic: 'Polyrhythmic Music Theory & Traditional Percussion', category: 'Music' },
];

// ---------------------------------------------------------------------
// BUILD TOPICS POOL (20 Curated Topics for Lesson Plans, Exams & Modules)
// ---------------------------------------------------------------------
export const BUILD_TOPICS_POOL: BuildInspirationTopic[] = [
  { title: 'Timbuktu Manuscripts', emoji: '📜', topic: 'Timbuktu Manuscripts & Medieval African Astronomy Curriculum', category: 'History & Science' },
  { title: 'Great Zimbabwe Architecture', emoji: '🏛️', topic: 'Great Zimbabwe Stone Architecture & Trade Exam', category: 'African History' },
  { title: 'Swahili Maritime Trade', emoji: '⛵', topic: 'Swahili Maritime Trade & Indian Ocean Commerce Worksheet', category: 'Geography & Trade' },
  { title: 'Kingdom of Aksum Coinage', emoji: '🌍', topic: 'Kingdom of Aksum Coinage & Trade Lesson Plan', category: 'Economics' },
  { title: 'African Medicinal Botany', emoji: '🌿', topic: 'African Medicinal Botany & Pharmacopeia Study Guide', category: 'Sciences' },
  { title: 'West African Griots', emoji: '🎵', topic: 'West African Griots & Oral Storytelling Curriculum Module', category: 'Literature & Culture' },
  { title: 'Genetics & DNA Lab', emoji: '🧬', topic: 'Genetics, DNA Structure & Heredity Lab Worksheet', category: 'Biology' },
  { title: 'High School Trigonometry', emoji: '📐', topic: 'High School Trigonometry & Geometry Unit Test', category: 'Mathematics' },
  { title: 'Renewable Energy Systems', emoji: '☀️', topic: 'Renewable Solar & Wind Energy Engineering Unit', category: 'Physics' },
  { title: 'Ancient World Civilizations', emoji: '📚', topic: 'Ancient African & World Civilizations Comparative Exam', category: 'World History' },
  { title: 'Intro to Python Coding', emoji: '💻', topic: 'Introduction to Python Programming & Logic Lesson Plan', category: 'Computer Science' },
  { title: 'Periodic Table & Bonding', emoji: '🧪', topic: 'Periodic Table Trends & Chemical Bonding Practice Worksheet', category: 'Chemistry' },
  { title: 'Ecosystems & Conservation', emoji: '🌍', topic: 'Ecosystem Dynamics & Biodiversity Conservation Unit', category: 'Ecology' },
  { title: 'Macroeconomics & AfCFTA', emoji: '📊', topic: 'Macroeconomics, AfCFTA & International Trade Course Module', category: 'Economics' },
  { title: 'Nubian Kingdom of Kush', emoji: '👑', topic: 'Nubian Pyramids & Kingdom of Kush History Syllabus', category: 'History' },
  { title: 'Machine Learning Basics', emoji: '🤖', topic: 'Introduction to Artificial Intelligence & Neural Networks Unit', category: 'Technology' },
  { title: 'Human Nervous System', emoji: '🧠', topic: 'Human Nervous System & Brain Anatomy Biology Test', category: 'Health' },
  { title: 'Carthage & Punic Wars', emoji: '🛡️', topic: 'Carthaginian Empire & Military History Lesson Plan', category: 'History' },
  { title: 'Calculus Differentiation', emoji: '📈', topic: 'Differential Calculus & Rates of Change Practice Set', category: 'Mathematics' },
  { title: 'Climate Change Solutions', emoji: '🌿', topic: 'Climate Science, Carbon Footprints & Mitigation Project', category: 'Environmental Science' },
];

/**
 * Fisher-Yates shuffle helper using a seed string
 */
function shuffleArray<T>(array: T[], seedStr?: string): T[] {
  const arr = [...array];
  let seed = 0;
  if (seedStr) {
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed << 5) - seed + seedStr.charCodeAt(i);
      seed |= 0;
    }
  } else {
    seed = Math.floor(Math.random() * 1000000);
  }

  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get dynamic session-based topics for a specific section
 */
export function getDynamicInspirationTopics<T>(
  pool: T[],
  section: string,
  userIdentifier?: string,
  count: number = 6,
  forceNewSession: boolean = false
): T[] {
  if (typeof window === 'undefined') {
    return pool.slice(0, count);
  }

  const sessionKey = `inspiration_topics_${section}_v3`;
  const sessionUserKey = `inspiration_user_${section}_v3`;

  const storedUser = sessionStorage.getItem(sessionUserKey);
  const currentUser = userIdentifier || 'guest';

  // If forceNewSession OR user logged in/changed OR no stored topics, generate new sample
  if (forceNewSession || storedUser !== currentUser || !sessionStorage.getItem(sessionKey)) {
    const freshSeed = `${currentUser}_${Date.now()}_${Math.random()}`;
    const shuffled = shuffleArray(pool, freshSeed);
    const selected = shuffled.slice(0, count);

    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(selected));
      sessionStorage.setItem(sessionUserKey, currentUser);
    } catch (e) {
      // fallback
    }
    return selected;
  }

  // Return existing session picks if available
  try {
    const raw = sessionStorage.getItem(sessionKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  return shuffleArray(pool, `${currentUser}_${Math.random()}`).slice(0, count);
}

/**
 * Custom React hook for dynamic topic selection per session and per login
 */
export function useDynamicInspiration<T>(
  pool: T[],
  section: 'study' | 'quiz' | 'build',
  userIdentifier?: string,
  count: number = 6
) {
  const [topics, setTopics] = useState<T[]>(() => 
    getDynamicInspirationTopics(pool, section, userIdentifier, count)
  );

  useEffect(() => {
    setTopics(getDynamicInspirationTopics(pool, section, userIdentifier, count));
  }, [section, userIdentifier, pool, count]);

  const refreshTopics = () => {
    const fresh = getDynamicInspirationTopics(pool, section, userIdentifier, count, true);
    setTopics(fresh);
  };

  return { topics, refreshTopics };
}
