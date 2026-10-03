export function buildDynamicTopicSlides(topic: string, subject: string, gradeLevel: string = 'General', count: number = 5): any[] {
  const slides = [];
  for (let i = 1; i <= count; i++) {
    slides.push({
      id: `slide-${i}`,
      title: i === 1 ? `Introduction to ${topic}` : i === count ? `Summary & Future Outlook` : `${topic} - Core Pillar ${i}`,
      subtitle: `${subject} • ${gradeLevel}`,
      content: `In-depth exploration of ${topic} within the context of ${subject}. Key principles, historical perspective, and transformative impact.`,
      bullets: [
        `Foundational concepts of ${topic}`,
        `Practical applications in ${subject}`,
        `Key analytical frameworks & historical context`
      ]
    });
  }
  return slides;
}
