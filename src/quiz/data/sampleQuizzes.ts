import { Quiz } from '../types';

export const SAMPLE_TOPICS = [
  {
    title: 'The Kingdom of Mali & Mansa Musa',
    category: 'History',
    level: 'High School',
    prompt: 'The medieval Kingdom of Mali, Mansa Musa’s legendary 1324 pilgrimage to Mecca, Timbuktu’s Sankore University, and trans-Saharan trade routes.',
  },
  {
    title: 'The Great Rift Valley Geography',
    category: 'Geography',
    level: 'General Knowledge',
    prompt: 'Geological formation of the Great Rift Valley across Eastern Africa, tectonic plate movements, Lake Victoria, Lake Tanganyika, and biodiversity.',
  },
  {
    title: 'African Literature: Chinua Achebe & Ngũgĩ',
    category: 'Literature',
    level: 'University',
    prompt: 'Pioneering African literature: Chinua Achebe’s Things Fall Apart, Ngũgĩ wa Thiong’o’s Decolonising the Mind, oral traditions, and post-colonial themes.',
  },
  {
    title: 'Solar & Renewable Energy In Africa',
    category: 'Science',
    level: 'General Knowledge',
    prompt: 'Renewable energy transformations across Africa: Morocco’s Noor Solar Complex, Kenya’s Olkaria geothermal fields, off-grid solar tech, and green industrialization.',
  },
  {
    title: 'Ancient Engineering: Great Zimbabwe & Nubian Pyramids',
    category: 'History',
    level: 'High School',
    prompt: 'Dry-stone architecture of Great Zimbabwe, the Kingdom of Kush, Meroë iron smelting, and Nubian pyramids along the Nile.',
  },
  {
    title: 'Fintech & Mobile Money Innovation (M-Pesa)',
    category: 'Social Studies',
    level: 'University',
    prompt: 'The emergence of mobile money in Africa (M-Pesa), leapfrogging traditional banking, financial inclusion in Kenya, Nigeria, and continental fintech ecosystems.',
  },
];

export const DEMO_SAMPLE_QUIZ: Quiz = {
  id: 'sample_mali_kingdom',
  title: 'The Kingdom of Mali & Mansa Musa',
  description: 'Test your knowledge on West Africa’s golden empire, trade crossroads, and cultural capitals.',
  topicOrSource: 'The Kingdom of Mali',
  creationMethod: 'topic',
  settings: {
    questionCount: 5,
    difficulty: 'medium',
    questionType: 'multiple_choice',
    educationLevel: 'high_school',
    subject: 'History',
  },
  createdAt: new Date().toISOString(),
  questions: [
    {
      id: 'q_demo_1',
      type: 'multiple_choice',
      question: 'Which legendary 14th-century ruler of Mali is widely regarded as one of the wealthiest individuals in human history?',
      options: ['Sundiata Keita', 'Mansa Musa', 'Askia Muhammad', 'Sunni Ali'],
      correctAnswer: 'Mansa Musa',
      explanation: 'Mansa Musa reigned over the Mali Empire from 1312 to 1337, renowned for his vast gold reserves and famous 1324 pilgrimage across Cairo to Mecca.',
    },
    {
      id: 'q_demo_2',
      type: 'multiple_choice',
      question: 'Which city in the Mali Empire became an internationally celebrated center of Islamic scholarship, astronomy, and book production?',
      options: ['Gao', 'Djenné', 'Niani', 'Timbuktu'],
      correctAnswer: 'Timbuktu',
      explanation: 'Timbuktu housed the prestigious University of Sankore and hundreds of thousands of handwritten scientific, religious, and legal manuscripts.',
    },
    {
      id: 'q_demo_3',
      type: 'multiple_choice',
      question: 'Who was the celebrated founder of the Mali Empire, immortalized in the famous West African epic tradition?',
      options: ['Sundiata Keita', 'Mansa Sulayman', 'Osei Tutu', 'Shaka Zulu'],
      correctAnswer: 'Sundiata Keita',
      explanation: 'Known as the Lion King of Mali, Sundiata Keita united the Mandinka clans and defeated Sumanguru Kante at the Battle of Kirina in 1235.',
    },
    {
      id: 'q_demo_4',
      type: 'multiple_choice',
      question: 'What were the two primary commodities that formed the economic backbone of trans-Saharan trade for the Mali Empire?',
      options: ['Silk and Spices', 'Iron and Timber', 'Gold and Salt', 'Copper and Glass'],
      correctAnswer: 'Gold and Salt',
      explanation: 'Gold from southern forest regions like Bambuk and salt mined in the Sahara (such as Taghaza) were exchanged pound for pound, generating immense imperial wealth.',
    },
    {
      id: 'q_demo_5',
      type: 'multiple_choice',
      question: 'The renowned Great Mosque of Djenné in Mali is recognized as the world’s largest building made of which traditional architectural material?',
      options: ['Carved granite', 'Sun-baked earth (Adobe / Banco)', 'Kiln-fired brick', 'Dry sandstone'],
      correctAnswer: 'Sun-baked earth (Adobe / Banco)',
      explanation: 'The Great Mosque of Djenné is a masterpiece of Sudano-Sahelian adobe architecture, replastered annually by the entire community in a vibrant festival.',
    },
  ],
};
