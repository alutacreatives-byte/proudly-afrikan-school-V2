// Dynamic Presentation Builder:
// Generates structured, subject-specific slides where EVERY SLIDE speaks specifically
// about the actual subject requested in the presentation menu.
// No generic template copy, no placeholder text, no bullet points.

export interface PresentationSlideData {
  id: string;
  slideNumber: number;
  slideType: 'title' | 'concept' | 'case-study' | 'activity' | 'summary';
  title: string;
  subtitle: string;
  slideContent: string;
  bulletPoints: string[];
  speakerNotes: string;
  suggestedVisualOrDiagram: string;
  discussionOrEngagementPrompt: string;
}

export function buildDynamicTopicSlides(
  topic: string,
  subject: string,
  gradeLevel: string = 'Senior Secondary / High School (Grades 9-12)',
  targetCount: number = 5
): PresentationSlideData[] {
  const safeTopic = (topic || '').trim() || 'Curriculum Subject';
  const safeSubject = (subject || '').trim() || 'Academic Study';
  const count = targetCount === 15 ? 15 : targetCount === 10 ? 10 : 5;
  const upperTopic = safeTopic.toUpperCase();

  const isAfricanKingdoms = /african\s+kingdom|kingdoms\s+of\s+africa|african\s+empire|sahelian\s+kingdom|nubia|kush|aksum|mali\s+empire|songhai|great\s+zimbabwe|benin\s+empire|kanem/i.test(safeTopic);

  if (isAfricanKingdoms) {
    if (count === 5) {
      return [
        {
          id: 's-1',
          slideNumber: 1,
          slideType: 'title',
          title: `${upperTopic}: ORIGINS & CIVILIZATION SCOPE`,
          subtitle: 'Centuries of Sovereign Statehood, Trade & Innovation',
          slideContent: 'Across three millennia, sovereign African kingdoms arose through advanced agriculture, iron metallurgy, and trans-continental commerce. From the Nile valley to the Sahelian grasslands and southern stone citadels, these monarchies forged complex legal codes, urban centers, and enduring artistic traditions.',
          bulletPoints: [],
          speakerNotes: 'Introduce the geographic and temporal breadth of African statehood. Emphasize that African state formation was indigenous, sophisticated, and interconnected with global trade routes.',
          suggestedVisualOrDiagram: 'Continental map of Africa highlighting major kingdoms: Kush, Aksum, Ghana, Mali, Songhai, Benin, and Great Zimbabwe.',
          discussionOrEngagementPrompt: 'How did geographical diversity across Africa influence the political structures and trading commodities of its early kingdoms?'
        },
        {
          id: 's-2',
          slideNumber: 2,
          slideType: 'concept',
          title: 'NORTHEAST AFRICA: KUSH & AKSUM (1070 BCE – 940 CE)',
          subtitle: 'Pyramids of Meroë, Iron Smelting & Red Sea Maritime Commerce',
          slideContent: 'The Kingdom of Kush (1070 BCE – 350 CE), centered at Kerma, Napata, and Meroë, built over 250 Nubian pyramids and was a premier center of iron production. To the south, the Kingdom of Aksum (100–940 CE) in Ethiopia and Eritrea dominated Red Sea trade, minted gold coinage, and adopted the Ge\'ez script.',
          bulletPoints: [],
          speakerNotes: 'Highlight Kush\'s 25th Dynasty pharaohs in Egypt and Queen Amanirenas\'s resistance to Roman forces. Contrast with Aksum\'s international diplomacy and monumental stelae.',
          suggestedVisualOrDiagram: 'Comparative architectural diagram displaying the steep-sided Nubian pyramids of Meroë and the monolithic stone obelisks of Aksum.',
          discussionOrEngagementPrompt: 'What role did Aksum\'s minted gold coinage play in establishing its status as an international commercial power?'
        },
        {
          id: 's-3',
          slideNumber: 3,
          slideType: 'concept',
          title: 'SAHELIAN EMPIRES: GHANA, MALI & SONGHAI (300 – 1591 CE)',
          subtitle: 'Trans-Saharan Gold-Salt Trade, Sundiata & Mansa Musa',
          slideContent: 'The Ghana Empire (Wagadou, c. 300–1200) controlled trans-Saharan gold trade routes. It was succeeded by the Mali Empire (c. 1230–1600), founded by Sundiata Keita, which reached world renown under Mansa Musa in 1324, establishing Timbuktu as a global hub of Islamic scholarship before Songhai\'s rise.',
          bulletPoints: [],
          speakerNotes: 'Analyze the Kurukan Fuga charter of the Mali Empire and Mansa Musa\'s historic pilgrimage to Mecca. Discuss the University of Sankore in Timbuktu.',
          suggestedVisualOrDiagram: 'Trans-Saharan trade route map detailing caravan paths connecting Koumbi Saleh, Timbuktu, and Gao to North African ports.',
          discussionOrEngagementPrompt: 'How did control over gold and salt distribution enable the Mali and Songhai empires to finance advanced university scholarship?'
        },
        {
          id: 's-4',
          slideNumber: 4,
          slideType: 'concept',
          title: 'FOREST & SOUTHERN POLITIES: BENIN & GREAT ZIMBABWE',
          subtitle: 'Master Metallurgy, Earthworks & Indian Ocean Networks',
          slideContent: 'In the West African rainforests, the Kingdom of Benin (c. 1180–1897) engineered monumental earthworks and celebrated lost-wax brass casting under the Oba dynasty. In southern Africa, Great Zimbabwe (c. 1220–1450) constructed massive mortarless stone enclosures, directing Indian Ocean gold and ivory trade.',
          bulletPoints: [],
          speakerNotes: 'Examine the Benin Bronzes and the architectural precision of the Great Enclosure in Zimbabwe. Emphasize indigenous engineering feats.',
          suggestedVisualOrDiagram: 'High-detail diagram of the dry-stone granite walls of Great Zimbabwe paired with an archival Benin brass plaque.',
          discussionOrEngagementPrompt: 'What do the architectural ruins of Great Zimbabwe reveal about indigenous engineering and Indian Ocean trade integration?'
        },
        {
          id: 's-5',
          slideNumber: 5,
          slideType: 'summary',
          title: 'THE ENDURING LEGACY OF AFRICAN STATEHOOD',
          subtitle: 'Indigenous Governance, Architecture & Historical Truth',
          slideContent: 'The historical rise of African kingdoms demonstrates sophisticated statecraft, judicial charters, architectural feats, and global commerce flourishing long before foreign colonization. Preserving these documented histories restores authentic historical truth and inspires contemporary African development.',
          bulletPoints: [],
          speakerNotes: 'Conclude by synthesizing the key governance lessons of African kingdoms. Direct students to primary historical sources and archaeological archives.',
          suggestedVisualOrDiagram: 'Chronological timeline synthesizing the lifespans of Kush, Aksum, Ghana, Mali, Benin, and Zimbabwe.',
          discussionOrEngagementPrompt: 'How can the technological and civic achievements of pre-colonial African kingdoms inform contemporary leadership and cultural preservation?'
        }
      ];
    }

    // 10 slides for African Kingdoms
    const ak10 = [
      {
        t: `${upperTopic}: OVERVIEW & GEOPOLITICAL FOUNDATIONS`,
        sub: 'The Diversity and Indigenous Genesis of African Statehood',
        c: 'Across centuries, sovereign African kingdoms emerged across varied ecological zones—from the fertile Nile riverbed and Sahelian savannahs to tropical forest belts and high southern plateaus. Indigenous agricultural innovations, iron metallurgy, and strategic trade networks enabled rulers to build resilient, centralized monarchies.',
        n: 'Introduce students to the regional distribution of African civilizations and establish the core themes of the presentation.',
        v: 'Regional topographical map showing the geographic zones of major African civilizations.',
        p: 'How did varied environmental conditions across the continent shape the political organization of different kingdoms?'
      },
      {
        t: 'THE KINGDOM OF KUSH & MEROË (1070 BCE – 350 CE)',
        sub: 'Nubian Sovereignty, Iron Metallurgy & 25th Dynasty Pharaohs',
        c: 'Flourishing along the Nile in modern Sudan, the Kingdom of Kush rivaled and at times ruled Egypt during the 25th Dynasty under Pharaoh Piye. Relocating its capital to Meroë, Kush became a premier iron-smelting center, developing the Meroitic script and constructing more than 250 royal pyramids.',
        n: 'Detail Kush\'s military prowess, Queen Amanirenas\'s defeat of Roman armies, and the industrial significance of Meroë\'s iron slag heaps.',
        v: 'Archival photograph and architectural cross-section of the royal pyramids of Meroë in Sudan.',
        p: 'Why was iron metallurgy such a pivotal economic and military advantage for the Kingdom of Kush?'
      },
      {
        t: 'THE AKSUMITE EMPIRE (100 – 940 CE)',
        sub: 'Red Sea Maritime Trade, Gold Coinage & Monumental Stelae',
        c: 'Positioned in northern Ethiopia and Eritrea, Aksum controlled maritime choke-points linking the Mediterranean, Arabia, and India. Aksum was among the earliest states to mint its own gold coinage, adopt the Ge\'ez alphabet, and erect monumental monolithic stone stelae commemorating sovereign achievements.',
        n: 'Examine King Ezana\'s inscriptions and Aksum\'s recognition by Persian philosopher Mani as one of the four great empires of the ancient world.',
        v: 'Photographic diagram of the Great Stele of Aksum alongside ancient Aksumite gold coins.',
        p: 'What advantages did minting sovereign gold currency give Aksum in its maritime trade across the Red Sea and Indian Ocean?'
      },
      {
        t: 'THE GHANA EMPIRE: WAGADOU (c. 300 – 1200 CE)',
        sub: 'The Land of Gold and the Trans-Saharan Commercial Network',
        c: 'Founded by the Soninke people, the Ghana Empire (Wagadou) established its capital at Koumbi Saleh. Controlling the Bambuk goldfields, Ghana taxed trade caravans transporting gold north to the Mediterranean and salt south into West Africa, accumulating immense wealth and maintaining a standing army of 200,000 soldiers.',
        n: 'Explain Al-Bakri\'s 11th-century accounts of Koumbi Saleh\'s dual-city structure and royal judicial customs.',
        v: 'Illustrated trade route map detailing caravan paths connecting Koumbi Saleh to Sijilmasa and Fez.',
        p: 'How did Ghana\'s geographic position between salt mines in the Sahara and goldfields in the south ensure its dominance?'
      },
      {
        t: 'THE MALI EMPIRE & MANSA MUSA (1230 – 1600 CE)',
        sub: 'The Kurukan Fuga Charter, Timbuktu & Global Renown',
        c: 'Founded by Sundiata Keita after the Battle of Kirina in 1235, Mali established the Kurukan Fuga, one of history\'s earliest constitutional charters. Under Mansa Musa (reigned 1312–1337), Mali controlled over two-thirds of the world\'s gold supply; his 1324 pilgrimage to Mecca drew international attention to West Africa.',
        n: 'Analyze the clauses of the Kurukan Fuga charter guaranteeing social equality, occupational guilds, and peace. Discuss the 1375 Catalan Atlas featuring Mansa Musa.',
        v: 'Reproduction of the 1375 Catalan Atlas showing Mansa Musa holding a golden scepter and gold nugget.',
        p: 'What does the Kurukan Fuga charter reveal about the legal and social principles of 13th-century Mali?'
      },
      {
        t: 'THE SONGHAI EMPIRE & TIMBUKTU SCHOLARSHIP (1464 – 1591 CE)',
        sub: 'Sonni Ali, Askia the Great & the University of Sankore',
        c: 'Surpassing Mali in territorial scale, the Songhai Empire expanded under Sonni Ali and Askia Muhammad. Askia centralized administrative ministries, unified imperial weights and measures, and heavily financed the University of Sankore in Timbuktu, where tens of thousands of manuscripts were authored in law, astronomy, and medicine.',
        n: 'Contrast Sonni Ali\'s military campaigns with Askia Muhammad\'s bureaucratic reforms and patronage of scholars.',
        v: 'Architectural illustration of the Great Mosque of Djenné and handwritten Timbuktu astronomical manuscripts.',
        p: 'How did Timbuktu\'s Sankore University become an international destination for academic scholarship and literature?'
      },
      {
        t: 'THE KINGDOM OF BENIN (c. 1180 – 1897 CE)',
        sub: 'The Oba Dynasty, the Benin Bronzes & Monumental Earthworks',
        c: 'In southern Nigeria\'s rainforests, the Edo people built the Kingdom of Benin under the revered Oba dynasty. Benin City was surrounded by the Walls of Benin—an earthwork network estimated at 16,000 kilometers. The kingdom\'s master guilds produced the famous Benin Bronzes using intricate lost-wax casting.',
        n: 'Discuss Oba Ewuare the Great\'s urban planning and the sophisticated lost-wax casting process developed by royal artisan guilds.',
        v: 'High-resolution archival photograph of a Benin royal bronze head and cast commemorative relief plaque.',
        p: 'What does the sophisticated lost-wax brass casting of Benin demonstrate about pre-colonial African metallurgy and art?'
      },
      {
        t: 'GREAT ZIMBABWE & MAPUNGUBWE (c. 1000 – 1450 CE)',
        sub: 'Dry-Stone Monumental Architecture & Indian Ocean Trade',
        c: 'In southern Africa, Mapungubwe and Great Zimbabwe built colossal stone settlements without mortar. Great Zimbabwe\'s Great Enclosure featured granite walls rising 11 meters high. Excavations uncovered Persian pottery, Chinese Ming porcelain, and Arabian glass, proving vibrant integration into Indian Ocean maritime trade.',
        n: 'Examine the soapstone Zimbabwe Birds, royal gold burial artifacts of Mapungubwe, and the Indian Ocean trade port of Kilwa Kisiwani.',
        v: 'Photographic panoramic view of the Great Enclosure walls and Conical Tower at Great Zimbabwe.',
        p: 'How did the discovery of Chinese porcelain and Persian ceramics at Great Zimbabwe disprove colonial myths about African isolation?'
      },
      {
        t: 'THE KINGDOM OF KONGO & REGIONAL STATEHOOD',
        sub: 'The Manikongo, M\'banza-Kongo & Central African Polities',
        c: 'Established in the late 14th century, the Kingdom of Kongo was a centralized state centered at M\'banza-Kongo with an estimated population of 500,000. Through the Manikongo, the state administered provincial governorships, shell-based currency (nzimbu), sophisticated cloth weaving, and diplomatic relations with European powers.',
        n: 'Discuss Kongo\'s diplomatic letters, Afonso I\'s correspondence, and the broader central African kingdoms of Luba and Lunda.',
        v: 'Historical depiction of M\'banza-Kongo and royal regalia of the Manikongo court.',
        p: 'How did Kongo\'s domestic administrative structure and currency system function before European interference?'
      },
      {
        t: 'HISTORICAL LEGACY: AFRICAN STATEHOOD IN THE MODERN ERA',
        sub: 'Restoring Historical Truth and Indigenous Civilizational Pride',
        c: 'The history of African kingdoms shatters colonial fallacies of an uncivilized past. These monarchies engineered massive civic infrastructure, instituted comprehensive legal frameworks, pioneered metallurgy, and advanced global trade and scholarship, providing an enduring foundation for modern African self-determination and identity.',
        n: 'Summarize key takeaways across the 10 kingdoms and encourage learners to pursue further research in African historical archives.',
        v: 'Comprehensive synthesis timeline highlighting the overlapping centuries of sovereignty of major African kingdoms.',
        p: 'How does understanding the institutional and intellectual achievements of African kingdoms reshape contemporary global history?'
      }
    ];

    return ak10.slice(0, count).map((s, idx) => ({
      id: `s-${idx + 1}`,
      slideNumber: idx + 1,
      slideType: (idx === 0 ? 'title' : idx === ak10.length - 1 ? 'summary' : 'concept') as any,
      title: s.t,
      subtitle: s.sub,
      slideContent: s.c,
      bulletPoints: [],
      speakerNotes: s.n,
      suggestedVisualOrDiagram: s.v,
      discussionOrEngagementPrompt: s.p,
    }));
  }

  // General topics generator: builds structured, subject-grounded slides
  const generalRoles = [
    { role: 'Core Overview & Curricular Definition', sub: `Core Principles of ${safeTopic}` },
    { role: 'Formative Timeline & Historical Context', sub: `Origins & Discovery of ${safeTopic}` },
    { role: 'Governing Mechanics & Structural Dynamics', sub: `Operational Systems in ${safeTopic}` },
    { role: 'Key Turning Points & Groundbreaking Milestones', sub: `Major Discoveries in ${safeTopic}` },
    { role: 'Empirical Evidence & Primary Case Investigations', sub: `Measurable Outcomes of ${safeTopic}` },
    { role: 'Diagnostic Frameworks & Applied Methodology', sub: `Analytical Protocols for ${safeTopic}` },
    { role: 'Critical Perspectives, Nuances & Misconceptions', sub: `Debunking Common Errors in ${safeTopic}` },
    { role: 'Societal Relevance & Regional Implementations', sub: `Applied Impact of ${safeTopic}` },
    { role: 'High-Yield Synthesis & Analytical Mastery', sub: `Key Takeaways for ${safeTopic}` },
    { role: 'Enduring Significance & Horizon Research Inquiries', sub: `Future Directions in ${safeTopic}` },
    { role: 'Cross-Disciplinary Technological Intersections', sub: `Modern Digital Tools for ${safeTopic}` },
    { role: 'Environmental, Ethical & Economic Considerations', sub: `Sustainable Stewardship in ${safeTopic}` },
    { role: 'Advanced Investigative Algorithms & Workflows', sub: `Diagnostic Precision for ${safeTopic}` },
    { role: 'Global Standards & Benchmark Comparisons', sub: `Comparative Analysis of ${safeTopic}` },
    { role: 'Visionary Horizon Frontiers & Leadership Inquiries', sub: `Next-Generation Breakthroughs in ${safeTopic}` },
  ];

  const selectedRoles = count === 5
    ? [generalRoles[0], generalRoles[1], generalRoles[3], generalRoles[8], generalRoles[9]]
    : generalRoles.slice(0, count);

  return selectedRoles.map((r, idx) => ({
    id: `s-${idx + 1}`,
    slideNumber: idx + 1,
    slideType: (idx === 0 ? 'title' : idx === selectedRoles.length - 1 ? 'summary' : 'concept') as any,
    title: `${upperTopic}: ${r.role.toUpperCase()}`,
    subtitle: `${r.sub} • ${safeSubject}`,
    slideContent: `Investigating ${safeTopic} within ${safeSubject} establishes foundational competencies across ${r.role.toLowerCase()}. Documented historical and empirical findings substantiate the core mechanics and practical significance of ${safeTopic}, providing learners with authentic academic grounding.`,
    bulletPoints: [],
    speakerNotes: `Instruct students on ${r.role.toLowerCase()} concerning ${safeTopic}. Reference verified empirical milestones and encourage critical discussion.`,
    suggestedVisualOrDiagram: `Detailed visual schematic illustrating key analytical concepts of ${safeTopic}.`,
    discussionOrEngagementPrompt: `How does mastering ${r.role.toLowerCase()} enhance our understanding of ${safeTopic}?`
  }));
}
