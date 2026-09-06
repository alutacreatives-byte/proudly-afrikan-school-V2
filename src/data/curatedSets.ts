import { StudySet } from '../types';

export const CURATED_SETS: StudySet[] = [
  {
    id: 'mansa-musa-empire',
    title: 'Mansa Musa & The Mali Empire (1235–1670 CE)',
    description: 'Explore the trade routes, gold distribution, University of Sankore in Timbuktu, and legal systems of West Africa.',
    subject: 'African History & Civilization',
    gradeLevel: 'Secondary',
    tags: ['West Africa', 'Mali', 'Timbuktu', 'Trade', 'Gold'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    author: 'Proudly Afrikan Academic Collective',
    favorite: true,
    cards: [
      {
        id: 'card-mm-1',
        front: 'Who was Mansa Musa and during what period did he rule the Mali Empire?',
        back: 'Mansa Musa (Musa I) ruled Mali from 1312 to 1337 CE. Under his reign, Mali became one of the wealthiest empires in human history, controlling trans-Saharan trade routes for gold and salt.',
        africanContext: 'His famous 1324 pilgrimage to Mecca passed through Cairo, distributing so much gold that it adjusted currency valuations in the Mediterranean for over a decade.',
        hint: 'Ruled in the 14th century, famous for his 1324 hajj.'
      },
      {
        id: 'card-mm-2',
        front: 'What was the intellectual role of the University of Sankore in Timbuktu?',
        back: 'Sankore was a premier global center of learning housing over 25,000 students and hundreds of thousands of handwritten manuscripts covering astronomy, mathematics, medicine, jurisprudence, and poetry.',
        africanContext: 'Scholars like Ahmed Baba of Timbuktu wrote extensively on international law, ethics, and logic, proving West Africa was a hub of written scholarship centuries before colonization.',
        hint: 'One of the oldest universities in the world, renowned for its private libraries.'
      },
      {
        id: 'card-mm-3',
        front: 'What was the Kouroukan Fouga (Charter of the Mande)?',
        back: 'Proclaimed around 1235 CE after the Battle of Kirina by Sundiata Keita, it is recognized as one of the world\'s earliest oral constitutions guaranteeing human rights, women\'s roles, peace covenants, and labor protection.',
        africanContext: 'UNESCO added the Mande Charter to the Intangible Cultural Heritage list in 2009 for its pioneering principles of restorative justice.',
        hint: 'Ancient constitutional charter created by Sundiata Keita.'
      },
      {
        id: 'card-mm-4',
        front: 'How did the trans-Saharan trade network operate between the Sahel and North Africa?',
        back: 'Gold from Bambuk and Bure, kola nuts, and ivory moved north, while rock salt from Taghaza, glass beads, dates, and manufactured textiles were traded south using camel caravans.',
        africanContext: 'Trade centers like Djenne, Gao, and Walata flourished through mutual currency exchanges like cowrie shells and gold mithqals.',
        hint: 'Caravans of thousands of dromedaries exchanging gold for rock salt.'
      }
    ],
    sections: [
      {
        title: 'Geopolitical Hegemony of Mande Rule',
        summary: 'Mali succeeded the Ghana (Wagadou) Empire by expanding east toward Gao and west to the Atlantic Ocean coast.',
        keyPoints: [
          'Sundiata Keita unified the 12 clans into the Mali federation at Kirina (1235).',
          'Timbuktu and Djenne developed as dual hubs of architecture and Islamic jurisprudence.',
          'The Djinguereber Mosque was designed by Andalusian poet-architect Abu Ishaq al-Sahili.'
        ],
        africanConnection: 'The mud-brick Sudano-Sahelian architecture remains an engineering marvel resilient to arid climates.',
        mnemonic: 'M-A-L-I: Mansa Musa, Abu Ishaq architecture, Learning at Sankore, Kirina battle unification.'
      }
    ]
  },
  {
    id: 'afcfta-economics',
    title: 'AfCFTA & Pan-African Economic Integration',
    description: 'Master the principles of the African Continental Free Trade Area, intra-African value chains, and the Pan-African Payment and Settlement System (PAPSS).',
    subject: 'Pan-African Economics',
    gradeLevel: 'Undergraduate',
    tags: ['Trade', 'AfCFTA', 'Economics', 'PAPSS', 'Industrialization'],
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
    author: 'African Union Curriculum Project',
    favorite: true,
    cards: [
      {
        id: 'card-afc-1',
        front: 'What is the primary objective of the African Continental Free Trade Area (AfCFTA)?',
        back: 'To create a single continental market for goods and services with free movement of business persons and investments, uniting 1.4 billion people with a collective GDP exceeding $3.4 trillion.',
        africanContext: 'It aims to raise intra-African trade from ~15% to over 50% by eliminating tariffs on 90% of non-sensitive goods.',
        hint: 'World\'s largest free trade area by number of participating countries.'
      },
      {
        id: 'card-afc-2',
        front: 'What is PAPSS (Pan-African Payment and Settlement System)?',
        back: 'A centralized financial market infrastructure developed by Afreximbank and the AU that enables instantaneous cross-border payments in local African currencies without converting through the US Dollar or Euro.',
        africanContext: 'Saves the continent an estimated $5 billion annually in foreign exchange transaction fees, empowering local manufacturers.',
        hint: 'Enables direct currency settlement (e.g. Naira to Kenyan Shilling).'
      },
      {
        id: 'card-afc-3',
        front: 'What are Rules of Origin within the AfCFTA context?',
        back: 'Criteria needed to determine the national source of a product, ensuring goods traded duty-free are genuinely manufactured or substantially transformed within African member states.',
        africanContext: 'Prevents third-party non-African goods from being transshipped into member states without local value-addition.',
        hint: 'Defines whether a product counts as "Made in Africa".'
      }
    ],
    sections: [
      {
        title: 'Core Pillars of Regional Economic Communities (RECs)',
        summary: 'AfCFTA builds upon existing regional blocs including ECOWAS, SADC, EAC, COMESA, and ECCAS.',
        keyPoints: [
          'Gradual tariff reduction schedules over 5–10 years.',
          'Harmonization of customs declarations and sanitary standards.',
          'Development of regional automotive, textile, and pharmaceutical manufacturing corridors.'
        ],
        africanConnection: 'Pioneered under the Abuja Treaty of 1991 to establish an African Economic Community.',
        mnemonic: 'T-R-A-D-E: Tariffs slashed, Rules of origin, Afreximbank PAPSS, Dispute resolution, Economic corridors.'
      }
    ]
  },
  {
    id: 'rift-valley-geology-ecology',
    title: 'East African Rift System & Great Lakes Ecosystems',
    description: 'Geological mechanics of the diverging Somalian and Nubian tectonic plates, volcanic belts, and endemic biodiversity in Lakes Victoria, Tanganyika, and Malawi.',
    subject: 'Earth Science & Geography',
    gradeLevel: 'Secondary',
    tags: ['Geology', 'East Africa', 'Rift Valley', 'Great Lakes', 'Ecology'],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
    author: 'Nairobi Earth Science Institute',
    favorite: false,
    cards: [
      {
        id: 'card-rift-1',
        front: 'What tectonic process causes the East African Rift System (EARS)?',
        back: 'Divergent plate boundary action where the African continent is splitting into two: the Nubian Plate (west) and the Somalian Plate (east), driven by a thermal mantle plume beneath the Afar Triple Junction.',
        africanContext: 'In millions of years, eastern Africa will separate completely from the mainland, forming a new oceanic basin.',
        hint: 'Continental rifting creating a future ocean.'
      },
      {
        id: 'card-rift-2',
        front: 'Why is Lake Tanganyika biologically unique among the world\'s freshwater bodies?',
        back: 'It is the second deepest (1,470m) and second oldest freshwater lake globally, hosting over 250 species of endemic cichlid fish that evolved via rapid adaptive radiation.',
        africanContext: 'Bordered by Burundi, DR Congo, Tanzania, and Zambia, supporting millions of artisanal fishers and endemic ecosystems.',
        hint: 'Second deepest lake in the world with hundreds of endemic cichlid species.'
      },
      {
        id: 'card-rift-3',
        front: 'How is geothermal energy harnessed within the Kenyan Rift Valley?',
        back: 'High enthalpy steam trapped in volcanic fissures (like Olkaria near Lake Naivasha) is piped directly into turbines, providing over 45% of Kenya\'s baseload electricity with near-zero carbon emissions.',
        africanContext: 'Kenya is the largest geothermal energy producer in Africa and ranked among the top 10 globally.',
        hint: 'Olkaria geothermal field powering clean electricity.'
      }
    ],
    sections: [
      {
        title: 'Geothermal and Mineral Potential',
        summary: 'Volcanic hotspots in the Western and Eastern rifts yield colossal geothermal reserves and rich volcanic soils for coffee and tea agriculture.',
        keyPoints: [
          'Afar depression sits at the triple junction of the Red Sea, Gulf of Aden, and East African rifts.',
          'Mount Kilimanjaro, Mount Kenya, and Mount Nyiragongo are classic rift-associated volcanoes.',
          'Soda lakes like Lake Natron and Lake Nakuru support massive flamingo populations feeding on spirulina algae.'
        ],
        africanConnection: 'The cradle of human origins where fossils like Lucy (Australopithecus afarensis) and Turkana Boy were discovered.'
      }
    ]
  },
  {
    id: 'african-literature-achebe-wa-thiongo',
    title: 'African Post-Colonial Literature: Achebe, Ngũgĩ & Adichie',
    description: 'Themes of cultural reclamation, language in African literature, decolonization of the mind, and modern diaspora storytelling.',
    subject: 'African Literature',
    gradeLevel: 'Secondary',
    tags: ['Literature', 'Things Fall Apart', 'Achebe', 'Ngugi', 'Adichie'],
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-02-18T14:00:00Z',
    author: 'Pan-African Writers Bureau',
    favorite: false,
    cards: [
      {
        id: 'card-lit-1',
        front: 'What was Chinua Achebe\'s primary critique of Joseph Conrad\'s "Heart of Darkness"?',
        back: 'In his seminal 1975 lecture "An Image of Africa", Achebe argued Conrad was a thoroughgoing racist who reduced Africa to a dehumanized backdrop and Africans to non-linguistic savages to highlight European existential crisis.',
        africanContext: 'Achebe wrote "Things Fall Apart" (1958) specifically to depict Igbo society with complex morality, poetry, law, and philosophy prior to British colonial intrusion.',
        hint: 'Critique centered on the dehumanization of Africans as a literary foil.'
      },
      {
        id: 'card-lit-2',
        front: 'What is Ngũgĩ wa Thiong\'o\'s core argument in "Decolonising the Mind" (1986)?',
        back: 'Language carries cultural memory and identity. Imperial languages subjugate indigenous minds; therefore, African writers should write in African mother tongues (like Gĩkũyũ, Kiswahili, Yoruba, Zulu) to truly emancipate culture.',
        africanContext: 'Ngũgĩ abandoned writing novels in English after 1977, authoring classics like "Caitaani mũtharaba-inĩ" (Devil on the Cross) in Gĩkũyũ.',
        hint: 'The revolutionary role of African languages in literature.'
      },
      {
        id: 'card-lit-3',
        front: 'What is Chimamanda Ngozi Adichie\'s thesis in "The Danger of a Single Story"?',
        back: 'Single stories create stereotypes that are not necessarily false, but incomplete. Presenting Africa solely through lenses of catastrophe, poverty, and wildlife robs people of dignity and human complexity.',
        africanContext: 'Delivered in 2009, it remains one of the most viewed TED talks globally and a foundation of modern media literacy across African universities.',
        hint: 'Why multiple perspectives are essential to avoid flattened stereotypes.'
      }
    ]
  }
];
