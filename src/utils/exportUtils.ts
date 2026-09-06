import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { StudySet, Flashcard } from '../types';

export function exportSetToPDF(set: StudySet) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(217, 43, 138); // #D92B8A
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROUDLY AFRIKAN SCHOOL', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Study Guide & Revision Kit', 150, 15);

  // Set Info
  doc.setTextColor(22, 22, 22);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(set.title, 14, 35);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`Subject: ${set.subject} | Level: ${set.gradeLevel} | Total Cards: ${set.cards.length}`, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const splitDesc = doc.splitTextToSize(set.description, 180);
  doc.text(splitDesc, 14, 49);

  let y = 60;

  // Flashcards Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 43, 138);
  doc.text('FLASHCARDS & CORE CONCEPTS', 14, y);
  y += 6;

  const cardList: Flashcard[] = (set.cards && set.cards.length > 0)
    ? set.cards
    : ((set as any).concepts || []).map((c: any) => ({
        id: c.id,
        front: c.title,
        back: c.summary,
        africanContext: c.whyItMatters || c.historicalContext,
      }));

  cardList.forEach((card, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Card Box
    doc.setFillColor(250, 247, 240); // #FAF7F0
    doc.setDrawColor(220, 215, 200);
    doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 22, 22);
    doc.text(`Card ${index + 1}: ${card.front}`, 18, y + 7, { maxWidth: 174 });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const splitBack = doc.splitTextToSize(`Answer: ${card.back}`, 174);
    doc.text(splitBack, 18, y + 14);

    if (card.africanContext) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(180, 75, 40);
      doc.text(`African Context: ${card.africanContext.slice(0, 110)}...`, 18, y + 27, { maxWidth: 174 });
    }

    y += 36;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Proudly Afrikan School • Liberating Minds Through Knowledge', 14, 290);

  doc.save(`${set.title.replace(/[^a-zA-Z0-9]/g, '_')}_Study_Kit.pdf`);
}

export function exportSetToPPTX(set: StudySet) {
  const pptx = new pptxgen();

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: 'FAF7F0' };

  titleSlide.addText('PROUDLY AFRIKAN SCHOOL', {
    x: 0.8,
    y: 1.0,
    fontSize: 16,
    color: 'D92B8A',
    bold: true,
    fontFace: 'Arial'
  });

  titleSlide.addText(set.title, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    fontSize: 28,
    color: '161616',
    bold: true,
    fontFace: 'Arial'
  });

  const cardList: Flashcard[] = (set.cards && set.cards.length > 0)
    ? set.cards
    : ((set as any).concepts || []).map((c: any) => ({
        id: c.id,
        front: c.title,
        back: c.summary,
        africanContext: c.whyItMatters || c.historicalContext,
      }));

  titleSlide.addText(`${set.subject || 'Academic'} • ${set.gradeLevel || 'Secondary'} Level • ${cardList.length} Revision Cards\n${set.description || ''}`, {
    x: 0.8,
    y: 3.2,
    w: 8.4,
    fontSize: 14,
    color: '444444',
    fontFace: 'Arial'
  });

  // Card Slides
  cardList.forEach((card, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FAF7F0' };

    // Slide Header
    slide.addText(`Card ${idx + 1} of ${cardList.length} • ${set.title}`, {
      x: 0.8,
      y: 0.5,
      fontSize: 11,
      color: '888888',
      bold: true
    });

    // Question Box
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.0,
      w: 8.4,
      h: 1.8,
      fill: { color: 'FFFFFF' },
      line: { color: 'D92B8A', width: 2 }
    });

    slide.addText(card.front, {
      x: 1.0,
      y: 1.2,
      w: 8.0,
      h: 1.4,
      fontSize: 18,
      bold: true,
      color: '161616',
      align: 'center',
      valign: 'middle'
    });

    // Answer Box
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 3.1,
      w: 8.4,
      h: 2.2,
      fill: { color: 'FAF4EC' },
      line: { color: 'E59500', width: 1.5 }
    });

    slide.addText(card.back, {
      x: 1.0,
      y: 3.3,
      w: 8.0,
      h: 1.8,
      fontSize: 14,
      color: '222222',
      align: 'center',
      valign: 'middle'
    });

    if (card.africanContext) {
      slide.addText(`African Perspective: ${card.africanContext}`, {
        x: 0.8,
        y: 5.5,
        w: 8.4,
        fontSize: 10,
        color: 'C84B31',
        italic: true
      });
    }
  });

  pptx.writeFile({ fileName: `${set.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx` });
}
