import { 
  Atom, 
  Cpu, 
  Globe, 
  BookOpen, 
  TrendingUp, 
  HeartPulse, 
  Scale, 
  Palette, 
  Lightbulb, 
  HelpCircle, 
  Award, 
  Crown,
  Layers,
  LucideIcon
} from 'lucide-react';
import { StudySet } from '../types';

export interface SubSubject {
  id: string;
  name: string;
  description?: string;
}

export interface BroadSubjectArea {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: LucideIcon;
  subSubjects: string[];
}

export const BROAD_SUBJECT_AREAS: BroadSubjectArea[] = [
  {
    id: 'math-science',
    name: 'Mathematics & Science',
    shortName: 'Math & Science',
    tagline: 'Pure & applied mathematics, physics, chemistry, biology, calculus & scientific inquiry.',
    icon: Atom,
    subSubjects: [
      'Mathematics',
      'Algebra & Geometry',
      'Calculus & Analysis',
      'Statistics & Probability',
      'Physics',
      'Chemistry',
      'Biology & Life Sciences',
      'Environmental Science',
      'Astronomy'
    ]
  },
  {
    id: 'tech-cs',
    name: 'Technology & Computer Science',
    shortName: 'Tech & CS',
    tagline: 'Programming, artificial intelligence, algorithms, data systems & cyber architecture.',
    icon: Cpu,
    subSubjects: [
      'Computer Science',
      'Programming & Software',
      'Artificial Intelligence & ML',
      'Data Science & Analytics',
      'Web & Mobile Development',
      'Cyber Security & Networks',
      'Cloud & DevOps',
      'Robotics'
    ]
  },
  {
    id: 'history-geography',
    name: 'History & Geography',
    shortName: 'History & Geo',
    tagline: 'World civilizations, global history, human geography, earth systems & geopolitical dynamics.',
    icon: Globe,
    subSubjects: [
      'World History',
      'Ancient Civilizations',
      'Modern & Contemporary History',
      'Physical Geography',
      'Human Geography & Demographics',
      'Geopolitics & International History',
      'Cartography & Earth Sciences'
    ]
  },
  {
    id: 'languages-literature',
    name: 'Languages & Literature',
    shortName: 'Languages & Lit',
    tagline: 'World literature, linguistic mastery, creative writing, rhetoric & global languages.',
    icon: BookOpen,
    subSubjects: [
      'World Literature & Classics',
      'English Language & Grammar',
      'French Language',
      'Spanish Language',
      'Arabic Language',
      'Linguistics & Phonetics',
      'Creative Writing & Rhetoric',
      'Poetry & Drama'
    ]
  },
  {
    id: 'business-economics',
    name: 'Business & Economics',
    shortName: 'Business & Econ',
    tagline: 'Macroeconomics, finance, entrepreneurship, global trade, management & marketing.',
    icon: TrendingUp,
    subSubjects: [
      'Macro & Micro Economics',
      'Finance & Banking',
      'Accounting & Auditing',
      'Entrepreneurship & Startups',
      'Marketing & Digital Strategy',
      'Leadership & Operations',
      'Global Commerce & Trade'
    ]
  },
  {
    id: 'health-medicine',
    name: 'Health & Medicine',
    shortName: 'Health & Medicine',
    tagline: 'Anatomy, physiology, pathology, public health, nursing, pharmacology & clinical science.',
    icon: HeartPulse,
    subSubjects: [
      'Human Anatomy & Physiology',
      'Clinical Medicine & Pathology',
      'Public Health & Epidemiology',
      'Pharmacology & Therapeutics',
      'Nursing & Patient Care',
      'Nutrition & Fitness',
      'Psychology & Mental Health'
    ]
  },
  {
    id: 'law-social-sciences',
    name: 'Law & Social Sciences',
    shortName: 'Law & Social Sci',
    tagline: 'Constitutional law, jurisprudence, sociology, political systems, diplomacy & anthropology.',
    icon: Scale,
    subSubjects: [
      'Constitutional & Public Law',
      'International Law & Human Rights',
      'Criminal Justice & Jurisprudence',
      'Sociology & Social Theory',
      'Political Science & Governance',
      'International Relations & Diplomacy',
      'Anthropology'
    ]
  },
  {
    id: 'arts-design',
    name: 'Arts & Design',
    shortName: 'Arts & Design',
    tagline: 'Visual arts, graphic design, music theory, architecture, photography & media production.',
    icon: Palette,
    subSubjects: [
      'Art History & Movements',
      'Graphic & Visual Design',
      'UI/UX & Product Design',
      'Music Theory & Composition',
      'Architecture & Spatial Design',
      'Film, Cinema & Media Arts',
      'Photography'
    ]
  },
  {
    id: 'religion-philosophy',
    name: 'Religion & Philosophy',
    shortName: 'Religion & Phil',
    tagline: 'Ethics, epistemology, logic, world religions, classical thought & ancient wisdom traditions.',
    icon: Lightbulb,
    subSubjects: [
      'Ethics & Moral Philosophy',
      'Logic & Critical Reasoning',
      'Epistemology & Metaphysics',
      'World Religions & Comparative Theology',
      'Classical & Eastern Philosophy',
      'Philosophy of Mind & Science'
    ]
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    shortName: 'General Knowledge',
    tagline: 'Global civics, monumental inventions, scientific breakthroughs & interdisciplinary facts.',
    icon: HelpCircle,
    subSubjects: [
      'Current Affairs & Global Civics',
      'World Inventions & Discoveries',
      'Everyday Science & Natural World',
      'Global Trivia & Milestones',
      'Critical Thinking & Problem Solving'
    ]
  },
  {
    id: 'exam-prep',
    name: 'Exam Preparation',
    shortName: 'Exam Prep',
    tagline: 'Standardized test prep, high school exit exams, university entrance & board certifications.',
    icon: Award,
    subSubjects: [
      'SAT & ACT Preparation',
      'Cambridge IGCSE & A-Levels',
      'WAEC & WASSCE Prep',
      'South African Matric / NSC',
      'GRE & GMAT Preparation',
      'Advanced Placement (AP)',
      'Exam Strategies & Timed Recall'
    ]
  },
  {
    id: 'african-knowledge',
    name: 'African Knowledge',
    shortName: 'African Knowledge',
    tagline: 'African history, geography, languages, culture, proverbs, leaders, icons, and Biblical wisdom.',
    icon: Crown,
    subSubjects: [
      'African History',
      'African Geography',
      'African Culture',
      'African Languages',
      'African Proverbs',
      'African Leaders & Icons',
      'Bible & Wisdom'
    ]
  }
];

export const AFRICAN_KNOWLEDGE_SUB_SUBJECTS = [
  'African History',
  'African Geography',
  'African Culture',
  'African Languages',
  'African Proverbs',
  'African Leaders & Icons',
  'Bible & Wisdom'
];

/**
 * Checks if a study set belongs to a specific broad subject area
 */
export function setBelongsToBroadArea(set: StudySet, broadAreaName: string): boolean {
  if (!set) return false;
  const targetArea = broadAreaName.trim().toUpperCase();

  if (targetArea === 'ALL SUBJECTS') return true;

  const setCat = (set.category || '').toUpperCase();
  const setTitle = (set.title || '').toUpperCase();
  const setDesc = (set.description || '').toUpperCase();
  const setTags = (set.concepts || []).flatMap(c => c.tags || []).map(t => t.toUpperCase());

  // African Knowledge matching
  if (targetArea === 'AFRICAN KNOWLEDGE') {
    const africanKeywords = [
      'AFRICAN',
      'AFRICA',
      'MALI',
      'SONGHAI',
      'ZIMBABWE',
      'AKSUM',
      'SWAHILI',
      'YORUBA',
      'IGBO',
      'ZULU',
      'XHOSA',
      'AMHARIC',
      'PROVERB',
      'BIBLE',
      'WISDOM',
      'MANDELA',
      'SANKORE',
      'TIMBUKTU',
      'CONGO'
    ];
    if (setCat.includes('AFRICAN') || setCat.includes('BIBLE') || setCat.includes('WISDOM')) return true;
    return africanKeywords.some(kw => setTitle.includes(kw) || setCat.includes(kw) || setTags.includes(kw));
  }

  // Math & Science
  if (targetArea === 'MATHEMATICS & SCIENCE' || targetArea === 'MATH & SCIENCE') {
    if (setCat.includes('MATH') || setCat.includes('SCIENCE') || setCat.includes('PHYSIC') || setCat.includes('CHEM') || setCat.includes('BIO') || setCat.includes('CALCULUS')) return true;
    const kw = ['MATH', 'CALCULUS', 'ALGEBRA', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'EQUATION', 'DERIVATIVE', 'GEOMETRY', 'STATISTICS', 'ASTRONOMY'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Technology & Computer Science
  if (targetArea === 'TECHNOLOGY & COMPUTER SCIENCE' || targetArea === 'TECH & CS') {
    if (setCat.includes('TECH') || setCat.includes('COMPUTER') || setCat.includes('CODE') || setCat.includes('SOFTWARE') || setCat.includes('AI')) return true;
    const kw = ['PROGRAMMING', 'ALGORITHM', 'COMPUTER SCIENCE', 'PYTHON', 'CYBER', 'DATA STRUCTURE', 'ROBOTICS', 'SOFTWARE', 'NEURAL NETWORK', 'FINTECH'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // History & Geography
  if (targetArea === 'HISTORY & GEOGRAPHY' || targetArea === 'HISTORY & GEO') {
    if (setCat.includes('HISTORY') || setCat.includes('GEOGRAPHY') || setCat.includes('CIVILIZATION')) return true;
    const kw = ['HISTORY', 'GEOGRAPHY', 'EMPIRE', 'ANCIENT', 'KINGDOM', 'RIFT VALLEY', 'BIOME', 'MAP', 'CIVILIZATION'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Languages & Literature
  if (targetArea === 'LANGUAGES & LITERATURE' || targetArea === 'LANGUAGES & LIT') {
    if (setCat.includes('LANGUAGE') || setCat.includes('LITERATURE') || setCat.includes('POETRY') || setCat.includes('GRAMMAR')) return true;
    const kw = ['LITERATURE', 'LANGUAGE', 'WRITING', 'ACHEBE', 'NOVEL', 'POETRY', 'LINGUISTIC', 'SWAHILI'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Business & Economics
  if (targetArea === 'BUSINESS & ECONOMICS' || targetArea === 'BUSINESS & ECON') {
    if (setCat.includes('BUSINESS') || setCat.includes('ECONOMIC') || setCat.includes('FINANCE') || setCat.includes('ACCOUNTING')) return true;
    const kw = ['ECONOMICS', 'BUSINESS', 'FINANCE', 'MARKET', 'ACCOUNTING', 'ENTREPRENEUR', 'TRADE', 'MONETARY', 'BANKING'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Health & Medicine
  if (targetArea === 'HEALTH & MEDICINE') {
    if (setCat.includes('HEALTH') || setCat.includes('MEDICINE') || setCat.includes('ANATOMY') || setCat.includes('NURSING')) return true;
    const kw = ['HEALTH', 'MEDICINE', 'ANATOMY', 'PHYSIOLOGY', 'EPIDEMIOLOGY', 'DISEASE', 'PHARMACOLOGY', 'NUTRITION', 'PSYCHOLOGY'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Law & Social Sciences
  if (targetArea === 'LAW & SOCIAL SCIENCES' || targetArea === 'LAW & SOCIAL SCI') {
    if (setCat.includes('LAW') || setCat.includes('SOCIOLOGY') || setCat.includes('POLITIC') || setCat.includes('JUSTICE')) return true;
    const kw = ['LAW', 'CONSTITUTION', 'JUSTICE', 'SOCIOLOGY', 'POLITICAL', 'RIGHTS', 'GOVERNANCE', 'DIPLOMACY'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Arts & Design
  if (targetArea === 'ARTS & DESIGN') {
    if (setCat.includes('ART') || setCat.includes('DESIGN') || setCat.includes('MUSIC') || setCat.includes('ARCHITECTURE')) return true;
    const kw = ['ART', 'DESIGN', 'MUSIC', 'ARCHITECTURE', 'PHOTOGRAPHY', 'CINEMA', 'FILM'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Religion & Philosophy
  if (targetArea === 'RELIGION & PHILOSOPHY' || targetArea === 'RELIGION & PHIL') {
    if (setCat.includes('RELIGION') || setCat.includes('PHILOSOPHY') || setCat.includes('ETHIC') || setCat.includes('THEOLOGY')) return true;
    const kw = ['PHILOSOPHY', 'ETHICS', 'RELIGION', 'THEOLOGY', 'EPISTEMOLOGY', 'LOGIC', 'MORAL', 'BIBLE'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // Exam Preparation
  if (targetArea === 'EXAM PREPARATION' || targetArea === 'EXAM PREP') {
    if (setCat.includes('EXAM') || setCat.includes('TEST') || setCat.includes('SAT') || setCat.includes('WAEC') || setCat.includes('MATRIC')) return true;
    const kw = ['EXAM', 'TEST', 'SAT', 'ACT', 'WAEC', 'WASSCE', 'MATRIC', 'CAMBRIDGE', 'IGCSE', 'GMAT', 'GRE'];
    return kw.some(k => setTitle.includes(k) || setCat.includes(k) || setTags.includes(k));
  }

  // General Knowledge
  if (targetArea === 'GENERAL KNOWLEDGE' || targetArea === 'GENERAL') {
    if (setCat.includes('GENERAL') || setCat.includes('TRIVIA') || setCat.includes('KNOWLEDGE')) return true;
    return true; // fallback for uncategorized
  }

  // Direct substring match
  return setCat.includes(targetArea) || setTitle.includes(targetArea);
}

/**
 * Checks if a study set matches a sub-subject within a broad area
 */
export function setMatchesSubSubject(set: StudySet, subSubject: string): boolean {
  if (!set || !subSubject) return false;
  const sub = subSubject.trim().toUpperCase();
  const setCat = (set.category || '').toUpperCase();
  const setTitle = (set.title || '').toUpperCase();
  const setDesc = (set.description || '').toUpperCase();
  const setTags = (set.concepts || []).flatMap(c => c.tags || []).map(t => t.toUpperCase());

  if (setCat.includes(sub) || setTitle.includes(sub) || setDesc.includes(sub)) return true;
  if (setTags.some(t => t.includes(sub) || sub.includes(t))) return true;

  // Specific aliases
  if (sub === 'AFRICAN HISTORY' && (setCat.includes('HISTORY') || setTitle.includes('KINGDOM') || setTitle.includes('MUSA') || setTitle.includes('ZIMBABWE'))) return true;
  if (sub === 'AFRICAN GEOGRAPHY' && (setCat.includes('GEOGRAPHY') || setTitle.includes('RIFT') || setTitle.includes('CONGO'))) return true;
  if (sub === 'AFRICAN LANGUAGES' && (setCat.includes('LANGUAGE') || setTitle.includes('SWAHILI') || setTitle.includes('YORUBA'))) return true;
  if (sub === 'AFRICAN CULTURE' && (setCat.includes('CULTURE') || setTitle.includes('TRADITION') || setTitle.includes('ART'))) return true;
  if (sub === 'AFRICAN PROVERBS' && (setCat.includes('PROVERB') || setTitle.includes('PROVERB') || setTitle.includes('WISDOM'))) return true;
  if (sub === 'AFRICAN LEADERS & ICONS' && (setCat.includes('LEADER') || setTitle.includes('LEADER') || setTitle.includes('MANDELA') || setTitle.includes('MUSA') || setTitle.includes('ASKIA'))) return true;
  if (sub === 'BIBLE & WISDOM' && (setCat.includes('BIBLE') || setCat.includes('WISDOM') || setTitle.includes('BIBLE') || setTitle.includes('SOLOMON'))) return true;

  return false;
}
