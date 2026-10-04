import { jsPDF } from 'jspdf';
import type {
  StudyGuideResult,
  CourseResult,
  QuizResult,
  PdfQuizResult,
  FlashcardResult,
  LearningPathResult,
  FocusQuestResult,
  TutorChatResult,
  EssayGraderResult,
} from '../study/types';

/**
 * Triggers a browser download for a Blob
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface DocumentMeta {
  brand: string;
  subject: string;
  documentType: string;
  toolUsed: string;
  combinedHeading: string; // e.g. "Proudly Afrikan | Metaphysics | Quiz Assessment"
  filenameBase: string;    // e.g. "Proudly-Afrikan-Metaphysics-Quiz-Assessment"
}

/**
 * Strips any unwanted "AI" mentions from titles, headers, footers, and content
 * Per Rule 6: Remove all user-facing references to "AI" from PDF and DOC/DOCX content
 */
export function removeAiReferences(text: string): string {
  if (!text) return '';
  return text
    .replace(/Proudly\s+Afrikan\s+AI\s+Study\s+Platform/gi, 'Proudly Afrikan Study Platform')
    .replace(/Proudly\s+Afrikan\s+AI\s+Study/gi, 'Proudly Afrikan Study')
    .replace(/Proudly\s+Afrikan\s+AI/gi, 'Proudly Afrikan')
    .replace(/\b(?:AI|A\.I\.)[-–—\s]*generated\b/gi, '')
    .replace(/\b(?:AI|A\.I\.)[-–—\s]*powered\b/gi, '')
    .replace(/\b(?:AI|A\.I\.)\b/g, '')
    .replace(/\b(?:artificial\s+intelligence)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Converts a string into PascalCase words joined by hyphens for clean, professional filenames.
 * e.g. "Metaphysics Quiz Assessment" -> "Metaphysics-Quiz-Assessment"
 * e.g. "African History & Philosophy" -> "African-History-And-Philosophy"
 */
export function toPascalHyphenated(text: string): string {
  if (!text) return 'Study-Resource';
  const cleaned = text
    .replace(/&/g, ' And ')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Study-Resource';

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

/**
 * Cleans a subject string, removing duplicate document type or brand words
 */
export function cleanSubjectForMeta(rawSubject: string, docType: string): string {
  let s = (rawSubject || '').trim();
  s = removeAiReferences(s);
  s = s.replace(/^proudly[\s\-_]+afrikan[\s\-_]*/i, '');

  // Remove file extensions if someone uploaded a file name (e.g. "Metaphysics_Notes.pdf")
  s = s.replace(/\.(pdf|docx?|txt|md|csv)$/i, '');
  s = s.replace(/[_\-]+/g, ' ');

  // If generic filename like "download", "document", "export", etc.
  if (/^(?:download|document|export|file|temp|data|afrikan-resource|study-guide|practice-quiz)$/i.test(s)) {
    return '';
  }

  // Remove trailing document type words from subject to avoid redundancy
  const docTypeWords = docType.split(/\s+/).filter(Boolean);
  for (const w of docTypeWords) {
    const reg = new RegExp(`\\b${w}\\b`, 'gi');
    s = s.replace(reg, ' ');
  }
  s = s.replace(/\s{2,}/g, ' ').trim();
  s = s.replace(/^[-–—:\s|]+|[-–—:\s|]+$/g, '').trim();

  return s;
}

/**
 * Dynamically resolves document heading and content-based filename
 * Format: "Proudly Afrikan | [Actual Subject] | [Actual Tool or Document Type]"
 * Filename: "Proudly-Afrikan-[Subject]-[Tool-or-Document-Type].[ext]"
 */
export function resolveDocumentMeta(options: {
  subject?: string;
  topic?: string;
  title?: string;
  filename?: string;
  documentType?: string;
  toolUsed?: string;
}): DocumentMeta {
  const brand = 'Proudly Afrikan';
  const docType = options.documentType || options.toolUsed || 'Study Resource';

  const rawCandidate =
    options.subject ||
    options.topic ||
    options.title ||
    options.filename ||
    '';

  const cleanedSubject = cleanSubjectForMeta(rawCandidate, docType);
  const fallbackSubject = 'General Studies';
  const subjectFinal = cleanedSubject || fallbackSubject;

  const subjectWords = subjectFinal
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Heading format: Proudly Afrikan | [Actual Subject] | [Actual Tool or Document Type]
  const combinedHeading = `${brand} | ${subjectWords} | ${docType}`;

  // Filename format: Proudly-Afrikan-[Subject]-[Tool-or-Document-Type]
  const hyphenatedSubject = toPascalHyphenated(subjectWords);
  const hyphenatedTool = toPascalHyphenated(docType);
  const filenameBase = `Proudly-Afrikan-${hyphenatedSubject}-${hyphenatedTool}`;

  return {
    brand,
    subject: subjectWords,
    documentType: docType,
    toolUsed: docType,
    combinedHeading,
    filenameBase,
  };
}

export interface PdfSection {
  heading?: string;
  content?: string;
  bulletPoints?: string[];
  callout?: string;
}

/**
 * Downloads a structured .docx file (Microsoft Word compatible HTML)
 * Strictly applies minimum 16px body text and proper document heading and footer
 */
export function downloadDocFile(
  filename: string,
  title: string,
  htmlBody: string,
  meta?: Partial<DocumentMeta>
) {
  const resolvedMeta = resolveDocumentMeta({
    filename,
    title,
    subject: meta?.subject,
    documentType: meta?.documentType,
    toolUsed: meta?.toolUsed,
  });

  // Always use .docx format per Rule 1: Proudly-Afrikan-[Subject]-[Tool-or-Document-Type].docx
  const cleanFilename = `${resolvedMeta.filenameBase}.docx`;

  const displayTitle = removeAiReferences(title || resolvedMeta.subject);

  const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(resolvedMeta.combinedHeading)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1f2937;
      padding: 30pt;
    }
    p, li, div, span, td, th, ol, ul, table, pre, blockquote {
      font-size: 16px !important;
      line-height: 1.6;
    }
    .doc-heading-frame {
      background-color: #faf5f8;
      border: 1.5pt solid #f3d1e4;
      border-left: 5pt solid #D92B8A;
      padding: 12pt 16pt;
      margin-bottom: 20pt;
      border-radius: 4pt;
    }
    .doc-heading-title {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 18px !important;
      font-weight: 800;
      color: #D92B8A;
      margin: 0;
      letter-spacing: 0.4pt;
    }
    h1 {
      font-size: 26px !important;
      color: #111827;
      font-weight: 800;
      border-bottom: 2.5pt solid #D92B8A;
      padding-bottom: 8pt;
      margin-top: 8pt;
      margin-bottom: 16pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    h2 {
      font-size: 22px !important;
      color: #D92B8A;
      font-weight: 700;
      margin-top: 22pt;
      margin-bottom: 8pt;
      text-transform: uppercase;
      border-bottom: 1pt solid #f3e8ef;
      padding-bottom: 4pt;
    }
    h3 {
      font-size: 18px !important;
      color: #111827;
      font-weight: 600;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    p {
      margin: 6pt 0 10pt 0;
    }
    ul, ol {
      margin: 6pt 0 10pt 24pt;
    }
    li {
      margin-bottom: 6pt;
    }
    .box {
      border: 1pt solid #e5e7eb;
      background-color: #f9fafb;
      padding: 14pt;
      margin: 12pt 0;
      border-radius: 6pt;
      font-size: 16px !important;
    }
    .answer-key {
      background-color: #f0fdf4;
      border: 1pt solid #bbf7d0;
      padding: 10pt 14pt;
      border-radius: 6pt;
      margin-top: 8pt;
      color: #166534;
      font-size: 16px !important;
    }
    .footer {
      margin-top: 36pt;
      padding-top: 14pt;
      border-top: 1pt solid #e5e7eb;
      font-size: 16px !important;
      color: #6b7280;
      text-align: center;
    }
    .footer a {
      color: #2563eb;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="doc-heading-frame">
    <p class="doc-heading-title">${escapeHtml(resolvedMeta.combinedHeading)}</p>
  </div>
  ${displayTitle && displayTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase() && !htmlBody.includes(`>${escapeHtml(displayTitle)}<`) ? `<h1>${escapeHtml(displayTitle)}</h1>` : ''}
  ${htmlBody}
  <div class="footer">
    Proudly Afrikan Study Platform • <a href="http://www.proudlyafrikan.com" target="_blank" style="color: #2563eb; text-decoration: underline;">www.proudlyafrikan.com</a> • Page 1 of 1
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, cleanFilename);
}

/**
 * Renders and triggers the browser print dialog for the current document/resource.
 */
export function printDocumentHtml(
  title: string,
  htmlBody: string,
  meta?: Partial<DocumentMeta>
) {
  const resolvedMeta = resolveDocumentMeta({
    title,
    subject: meta?.subject,
    documentType: meta?.documentType,
    toolUsed: meta?.toolUsed,
  });

  const displayTitle = removeAiReferences(title || resolvedMeta.subject);

  let container = document.getElementById('proudly-afrikan-print-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'proudly-afrikan-print-container';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <div class="print-document-container" style="font-size: 16px; line-height: 1.6; color: #1f2937; padding: 24pt;">
      <div class="doc-heading-frame" style="background-color: #faf5f8; border: 1.5pt solid #f3d1e4; border-left: 5pt solid #D92B8A; padding: 12pt 16pt; margin-bottom: 20pt; border-radius: 4pt;">
        <p class="doc-heading-title" style="font-size: 18px; font-weight: 800; color: #D92B8A; margin: 0;">${escapeHtml(resolvedMeta.combinedHeading)}</p>
      </div>
      ${displayTitle && displayTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase() && !htmlBody.includes(`>${escapeHtml(displayTitle)}<`) ? `<h1 style="font-size: 26px; font-weight: 800; color: #111827; border-bottom: 2pt solid #D92B8A; padding-bottom: 8pt; margin-bottom: 16pt;">${escapeHtml(displayTitle)}</h1>` : ''}
      <div class="print-doc-body" style="font-size: 16px;">
        ${htmlBody}
      </div>
      <div class="footer" style="margin-top: 36pt; padding-top: 14pt; border-top: 1pt solid #e5e7eb; font-size: 16px; color: #6b7280; text-align: center;">
        Proudly Afrikan Study Platform • <a href="http://www.proudlyafrikan.com" target="_blank" style="color: #2563eb; text-decoration: underline;">www.proudlyafrikan.com</a> • Page 1 of 1
      </div>
    </div>
  `;

  const originalTitle = document.title;
  if (displayTitle) {
    document.title = `${displayTitle} - Proudly Afrikan`;
  }

  document.body.classList.add('is-printing-document');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove('is-printing-document');
    document.title = originalTitle;
    if (container) {
      container.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  try {
    window.focus();
    window.print();
  } catch (err) {
    console.error('Failed to trigger window.print():', err);
  }

  setTimeout(cleanup, 2500);
}

/**
 * Standardized PDF footer across all PDF pages:
 * Proudly Afrikan Study Platform • www.proudlyafrikan.com • Page X of Y
 * with www.proudlyafrikan.com as a clickable hyperlink to http://www.proudlyafrikan.com
 */
function renderPdfFooter(doc: jsPDF) {
  const totalPages = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const part1 = 'Proudly Afrikan Study Platform • ';
    const urlText = 'www.proudlyafrikan.com';
    const part3 = ` • Page ${i} of ${totalPages}`;

    const w1 = doc.getTextWidth(part1);
    const wUrl = doc.getTextWidth(urlText);
    const w3 = doc.getTextWidth(part3);
    const totalW = w1 + wUrl + w3;

    const startX = (pageWidth - totalW) / 2;
    const footerY = pageHeight - 20;

    // Part 1: Platform name
    doc.setTextColor(130, 130, 130);
    doc.text(part1, startX, footerY);

    // Part 2: Clickable link to website
    doc.setTextColor(37, 99, 235);
    doc.textWithLink(urlText, startX + w1, footerY, { url: 'http://www.proudlyafrikan.com' });
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(startX + w1, footerY + 1.5, startX + w1 + wUrl, footerY + 1.5);

    // Part 3: Page count
    doc.setTextColor(130, 130, 130);
    doc.text(part3, startX + w1 + wUrl, footerY);
  }
}

/**
 * Downloads a formatted PDF using jsPDF
 * Rule 1: Filename: Proudly-Afrikan-[Subject]-[Tool-or-Document-Type].pdf
 * Rule 2: Heading: Proudly Afrikan | [Actual Subject] | [Actual Tool or Document Type]
 * Rule 3: ONLY tool content, no unrelated/generator metadata
 * Rule 4: Exact sequence preserved
 * Rule 5: Minimum 16px body text font size (12pt in PDF)
 * Rule 6: No AI references
 * Rule 7: Footer: Proudly Afrikan Study Platform • www.proudlyafrikan.com • Page X of Y
 * Rule 8: Tool accuracy
 */
export function downloadPdfFile(
  filename: string,
  title: string,
  sections: PdfSection[],
  meta?: Partial<DocumentMeta>
) {
  const resolvedMeta = resolveDocumentMeta({
    filename,
    title,
    subject: meta?.subject,
    documentType: meta?.documentType,
    toolUsed: meta?.toolUsed,
  });
  const cleanFilename = `${resolvedMeta.filenameBase}.pdf`;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  doc.setProperties({
    title: resolvedMeta.combinedHeading,
    subject: `${resolvedMeta.subject} - ${resolvedMeta.documentType}`,
    author: 'Proudly Afrikan Study Platform',
    creator: 'Proudly Afrikan Study Platform',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 26) {
      doc.addPage();
      y = margin;
    }
  };

  // Top Document Heading: "Proudly Afrikan | [Actual Subject] | [Actual Tool or Document Type]"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 43, 138); // #D92B8A
  const headingText = resolvedMeta.combinedHeading;
  const splitHeading = doc.splitTextToSize(headingText, contentWidth);
  doc.text(splitHeading, margin, y + 14);
  y += splitHeading.length * 18 + 8;

  // Accent Line under heading
  doc.setDrawColor(217, 43, 138); // #D92B8A
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 18;

  // Document specific title (if distinct from combined heading)
  const cleanTitle = removeAiReferences(title || '').trim();
  if (cleanTitle && cleanTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(22, 22, 22);
    const splitTitle = doc.splitTextToSize(cleanTitle.toUpperCase(), contentWidth);
    doc.text(splitTitle, margin, y + 14);
    y += splitTitle.length * 22 + 10;
  }

  // Sections in exact sequence (Minimum 16px = 12pt font size for body text)
  for (const sec of sections) {
    if (sec.heading) {
      checkPageBreak(46);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14); // Section headings proportionally larger
      doc.setTextColor(217, 43, 138);
      const cleanHeading = removeAiReferences(sec.heading);
      const splitHeading = doc.splitTextToSize(cleanHeading.toUpperCase(), contentWidth);
      doc.text(splitHeading, margin, y + 12);
      y += splitHeading.length * 18 + 8;
    }

    if (sec.content) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12); // MINIMUM 16px body font size
      doc.setTextColor(30, 30, 30);
      const cleanContent = removeAiReferences(sec.content);
      const splitContent = doc.splitTextToSize(cleanContent, contentWidth);
      checkPageBreak(splitContent.length * 18 + 8);
      doc.text(splitContent, margin, y + 12);
      y += splitContent.length * 18 + 8;
    }

    if (sec.bulletPoints && sec.bulletPoints.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12); // MINIMUM 16px body font size
      doc.setTextColor(40, 40, 40);
      for (const bp of sec.bulletPoints) {
        const cleanBp = removeAiReferences(bp);
        const splitBp = doc.splitTextToSize(`•  ${cleanBp}`, contentWidth - 14);
        checkPageBreak(splitBp.length * 18 + 6);
        doc.text(splitBp, margin + 14, y + 12);
        y += splitBp.length * 18 + 6;
      }
      y += 6;
    }

    if (sec.callout) {
      const cleanCallout = removeAiReferences(sec.callout);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12); // MINIMUM 16px body font size
      const splitCallout = doc.splitTextToSize(cleanCallout, contentWidth - 20);
      const boxHeight = splitCallout.length * 18 + 20;
      checkPageBreak(boxHeight + 10);
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.75);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'FD');
      doc.setTextColor(50, 50, 50);
      doc.text(splitCallout, margin + 10, y + 16);
      y += boxHeight + 10;
    }
  }

  // Standardized footer with clickable website hyperlink and page numbers
  renderPdfFooter(doc);

  doc.save(cleanFilename);
}

// ----------------------------------------------------------------------
// Specific Typed Exporters (STUDY, QUIZ, BUILD)
// ----------------------------------------------------------------------

export function exportStudyGuide(guide: StudyGuideResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: guide.subject || guide.topic || guide.title,
    documentType: 'Study Notes',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (guide.overview) {
      html += `<h2>Executive Overview</h2><p>${escapeHtml(guide.overview)}</p>`;
    }
    if (guide.sections && guide.sections.length > 0) {
      guide.sections.forEach((sec, idx) => {
        html += `<h2>Section ${idx + 1}: ${escapeHtml(sec.heading)}</h2>`;
        if (sec.content) html += `<p>${escapeHtml(sec.content)}</p>`;
        if (sec.bulletPoints && sec.bulletPoints.length > 0) {
          html += `<ul>${sec.bulletPoints.map((bp) => `<li>${escapeHtml(bp)}</li>`).join('')}</ul>`;
        }
      });
    }
    if (guide.importantTakeaways && guide.importantTakeaways.length > 0) {
      html += `<h2>Key Takeaways & Exam Reminders</h2><ul>${guide.importantTakeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
    }
    if (guide.keyTerms && guide.keyTerms.length > 0) {
      html += `<h2>Key Terms & Definitions</h2><ul>${guide.keyTerms.map((kt) => `<li><strong>${escapeHtml(kt.term)}</strong>: ${escapeHtml(kt.definition)}</li>`).join('')}</ul>`;
    }
    if (guide.reviewQuestions && guide.reviewQuestions.length > 0) {
      html += `<h2>Active Recall & Review Questions</h2>`;
      guide.reviewQuestions.forEach((q, idx) => {
        html += `<div class="box"><p><strong>Q${idx + 1}:</strong> ${escapeHtml(q.question)}</p>`;
        if (q.hint) html += `<p><em>Hint: ${escapeHtml(q.hint)}</em></p>`;
        html += `<div class="answer-key"><strong>Answer:</strong> ${escapeHtml(q.answer)}</div></div>`;
      });
    }
    if (format === 'print') {
      printDocumentHtml(guide.title, html, meta);
    } else {
      downloadDocFile(filename, guide.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (guide.overview) {
      sections.push({ heading: 'Executive Overview', content: guide.overview });
    }
    if (guide.sections && guide.sections.length > 0) {
      guide.sections.forEach((sec, idx) => {
        sections.push({
          heading: `Section ${idx + 1}: ${sec.heading}`,
          content: sec.content,
          bulletPoints: sec.bulletPoints,
        });
      });
    }
    if (guide.importantTakeaways && guide.importantTakeaways.length > 0) {
      sections.push({
        heading: 'Key Takeaways',
        bulletPoints: guide.importantTakeaways,
      });
    }
    if (guide.keyTerms && guide.keyTerms.length > 0) {
      sections.push({
        heading: 'Key Terms & Definitions',
        bulletPoints: guide.keyTerms.map((k) => `${k.term}: ${k.definition}`),
      });
    }
    if (guide.reviewQuestions && guide.reviewQuestions.length > 0) {
      sections.push({ heading: 'Active Recall & Review Questions' });
      guide.reviewQuestions.forEach((q, idx) => {
        sections.push({
          content: `Q${idx + 1}: ${q.question}`,
          callout: `Answer: ${q.answer}${q.hint ? ` (Hint: ${q.hint})` : ''}`,
        });
      });
    }
    downloadPdfFile(filename, guide.title, sections, meta);
  }
}

export function exportCourse(course: CourseResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: course.subject || course.topic || course.title,
    documentType: 'Course Curriculum',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (course.courseOverview) {
      html += `<h2>Course Overview</h2><p>${escapeHtml(course.courseOverview)}</p>`;
    }
    if (course.learningOutcomes && course.learningOutcomes.length > 0) {
      html += `<h2>Overall Learning Outcomes</h2><ul>${course.learningOutcomes.map((lo) => `<li>${escapeHtml(lo)}</li>`).join('')}</ul>`;
    }
    if (course.modules && course.modules.length > 0) {
      course.modules.forEach((mod) => {
        html += `<h2>Module ${mod.moduleNumber}: ${escapeHtml(mod.title)}</h2>`;
        if (mod.description) html += `<p>${escapeHtml(mod.description)}</p>`;
        if (mod.learningOutcomes && mod.learningOutcomes.length > 0) {
          html += `<h3>Module Outcomes:</h3><ul>${mod.learningOutcomes.map((lo) => `<li>${escapeHtml(lo)}</li>`).join('')}</ul>`;
        }
        if (mod.keyTopics && mod.keyTopics.length > 0) {
          html += `<h3>Key Topics:</h3><ul>${mod.keyTopics.map((kt) => `<li>${escapeHtml(kt)}</li>`).join('')}</ul>`;
        }
        if (mod.lessons && mod.lessons.length > 0) {
          html += `<h3>Structured Lessons:</h3>`;
          mod.lessons.forEach((les, lIdx) => {
            html += `<div class="box"><p><strong>Lesson ${lIdx + 1}: ${escapeHtml(les.lessonTitle)}</strong> (${les.estimatedMinutes || 45} mins)</p><p>${escapeHtml(les.summary)}</p><p><em>Objective: ${escapeHtml(les.learningObjective)}</em></p></div>`;
          });
        }
        if (mod.practicalProjectOrTask) {
          html += `<div class="box"><strong>Practical Project / Assignment:</strong><p>${escapeHtml(mod.practicalProjectOrTask)}</p></div>`;
        }
      });
    }
    if (format === 'print') {
      printDocumentHtml(course.title, html, meta);
    } else {
      downloadDocFile(filename, course.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (course.courseOverview) {
      sections.push({ heading: 'Course Overview', content: course.courseOverview });
    }
    if (course.learningOutcomes && course.learningOutcomes.length > 0) {
      sections.push({ heading: 'Overall Learning Outcomes', bulletPoints: course.learningOutcomes });
    }
    if (course.modules && course.modules.length > 0) {
      course.modules.forEach((mod) => {
        sections.push({
          heading: `Module ${mod.moduleNumber}: ${mod.title}`,
          content: mod.description,
          bulletPoints: mod.keyTopics,
          callout: mod.practicalProjectOrTask ? `Assignment: ${mod.practicalProjectOrTask}` : undefined,
        });
        if (mod.lessons && mod.lessons.length > 0) {
          sections.push({
            content: `Lessons in Module ${mod.moduleNumber}:`,
            bulletPoints: mod.lessons.map((les) => `${les.lessonTitle} (${les.estimatedMinutes || 45}m): ${les.learningObjective}`),
          });
        }
      });
    }
    downloadPdfFile(filename, course.title, sections, meta);
  }
}

export function exportQuiz(quiz: QuizResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: quiz.subject || quiz.topic || quiz.title,
    documentType: 'Quiz Assessment',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (quiz.description) {
      html += `<p>${escapeHtml(quiz.description)}</p>`;
    }
    if (quiz.questions && quiz.questions.length > 0) {
      html += `<h2>Questions (${quiz.questions.length})</h2>`;
      quiz.questions.forEach((q, idx) => {
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
        const promptText = q.prompt || (q as any).question || '';
        html += `<div class="box"><p><strong>Question ${idx + 1}:</strong> ${escapeHtml(promptText)}</p><ol type="A">`;
        (q.options || []).forEach((opt, oIdx) => {
          const isCorrect = oIdx === correctIndex || opt === q.correctAnswer;
          html += `<li style="${isCorrect ? 'font-weight: bold; color: #166534;' : ''}">${escapeHtml(opt)} ${isCorrect ? ' ✓ (Correct)' : ''}</li>`;
        });
        html += `</ol>`;
        if (q.explanation) {
          html += `<div class="answer-key"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>`;
        }
        html += `</div>`;
      });
    }
    if (format === 'print') {
      printDocumentHtml(quiz.title, html, meta);
    } else {
      downloadDocFile(filename, quiz.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (quiz.description) {
      sections.push({ content: quiz.description });
    }
    if (quiz.questions && quiz.questions.length > 0) {
      sections.push({ heading: `Questions & Answer Key (${quiz.questions.length} Items)` });
      quiz.questions.forEach((q, idx) => {
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
        const promptText = q.prompt || (q as any).question || '';
        const optionsText = (q.options || []).map((opt, oIdx) => {
          const isCorrect = oIdx === correctIndex || opt === q.correctAnswer;
          return `[${String.fromCharCode(65 + oIdx)}] ${opt}${isCorrect ? ' (Correct Answer)' : ''}`;
        });
        sections.push({
          content: `Question ${idx + 1}: ${promptText}`,
          bulletPoints: optionsText,
          callout: q.explanation ? `Explanation: ${q.explanation}` : undefined,
        });
      });
    }
    downloadPdfFile(filename, quiz.title, sections, meta);
  }
}

export function exportPdfQuiz(quiz: PdfQuizResult, format: 'doc' | 'pdf' | 'print') {
  const rawSubject = quiz.documentName || quiz.title || 'Document Quiz';
  const meta = resolveDocumentMeta({
    subject: rawSubject,
    documentType: 'Quiz Assessment',
  });
  if (quiz.questions && quiz.questions.length > 0) {
    const adapted: QuizResult = {
      title: quiz.title,
      subject: meta.subject,
      questions: quiz.questions,
    };
    exportQuiz(adapted, format);
  } else {
    const filename = meta.filenameBase;
    if (format === 'print') {
      printDocumentHtml(quiz.title, `<p>${escapeHtml(quiz.sourceSnippet || 'Quiz content')}</p>`, meta);
    } else if (format === 'doc') {
      downloadDocFile(filename, quiz.title, `<p>${escapeHtml(quiz.sourceSnippet || 'Quiz content')}</p>`, meta);
    } else {
      downloadPdfFile(filename, quiz.title, [{ content: quiz.sourceSnippet || 'Quiz content' }], meta);
    }
  }
}

export function exportFlashcards(deck: FlashcardResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: deck.subject || deck.topic || deck.title,
    documentType: 'Study Flashcards',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (deck.description) {
      html += `<p>${escapeHtml(deck.description)}</p>`;
    }
    if (deck.cards && deck.cards.length > 0) {
      html += `<h2>Active Recall Flashcards (${deck.cards.length} Cards)</h2>`;
      deck.cards.forEach((c, idx) => {
        html += `<div class="box"><p><strong>Card ${idx + 1} — Term / Prompt:</strong><br/>${escapeHtml(c.front)}</p><div class="answer-key"><strong>Definition / Answer:</strong><br/>${escapeHtml(c.back)}</div>`;
        if (c.hint) html += `<p><em>Hint: ${escapeHtml(c.hint)}</em></p>`;
        html += `</div>`;
      });
    }
    if (format === 'print') {
      printDocumentHtml(deck.title, html, meta);
    } else {
      downloadDocFile(filename, deck.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (deck.description) {
      sections.push({ content: deck.description });
    }
    if (deck.cards && deck.cards.length > 0) {
      sections.push({ heading: `Flashcards (${deck.cards.length} Cards)` });
      deck.cards.forEach((c, idx) => {
        sections.push({
          content: `Card ${idx + 1}: ${c.front}`,
          callout: `Answer: ${c.back}${c.hint ? ` (Hint: ${c.hint})` : ''}`,
        });
      });
    }
    downloadPdfFile(filename, deck.title, sections, meta);
  }
}

export function exportLearningPath(path: LearningPathResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: path.subject || path.topic || path.title || path.targetGoal,
    documentType: 'Learning Roadmap',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (path.stages && path.stages.length > 0) {
      html += `<h2>Learning Roadmap & Milestones</h2>`;
      path.stages.forEach((st) => {
        html += `<h2>Stage ${st.stepNumber}: ${escapeHtml(st.title)} (${st.estimatedHours || 10}h)</h2><p>${escapeHtml(st.description)}</p>`;
        if (st.skillsAcquired && st.skillsAcquired.length > 0) {
          html += `<h3>Skills Acquired:</h3><ul>${st.skillsAcquired.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`;
        }
        if (st.suggestedActivities && st.suggestedActivities.length > 0) {
          html += `<h3>Suggested Activities:</h3><ul>${st.suggestedActivities.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`;
        }
        if (st.checkpointAssessment) {
          html += `<div class="box"><strong>Checkpoint Assessment:</strong><p>${escapeHtml(st.checkpointAssessment)}</p></div>`;
        }
      });
    }
    if (format === 'print') {
      printDocumentHtml(path.title, html, meta);
    } else {
      downloadDocFile(filename, path.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (path.stages && path.stages.length > 0) {
      path.stages.forEach((st) => {
        sections.push({
          heading: `Stage ${st.stepNumber}: ${st.title} (${st.estimatedHours || 10}h)`,
          content: st.description,
          bulletPoints: st.skillsAcquired,
          callout: st.checkpointAssessment ? `Assessment: ${st.checkpointAssessment}` : undefined,
        });
      });
    }
    downloadPdfFile(filename, path.title, sections, meta);
  }
}

export function exportFocusQuest(quest: FocusQuestResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: quest.subject || quest.topic || quest.title,
    documentType: 'Focus Quest Session',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = `<h2>Topic: ${escapeHtml(quest.topic)}</h2>`;
    html += `<p><strong>Duration:</strong> ${quest.durationMinutes} Minutes</p>`;
    html += `<p><strong>World Environment:</strong> ${escapeHtml(quest.worldType)}</p>`;
    html += `<p><strong>Completed At:</strong> ${new Date(quest.completedAt).toLocaleString()}</p>`;
    if (format === 'print') {
      printDocumentHtml(quest.title, html, meta);
    } else {
      downloadDocFile(filename, quest.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [
      { heading: 'Quest Details', bulletPoints: [`Topic: ${quest.topic}`, `Duration: ${quest.durationMinutes} minutes`, `World Environment: ${quest.worldType}`] }
    ];
    downloadPdfFile(filename, quest.title, sections, meta);
  }
}

export function exportTutorChat(tutor: TutorChatResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: tutor.documentName || tutor.title,
    documentType: 'Tutoring Session',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '<h2>Dialogue History</h2>';
    tutor.messages.forEach((msg) => {
      const isTutor = msg.sender === 'tutor';
      html += `<div class="box" style="${isTutor ? 'background-color: #fdf2f8; border-color: #fbcfe8;' : ''}"><p><strong>${isTutor ? 'Afrikan Study Tutor' : 'Student'}:</strong></p><p>${escapeHtml(msg.text)}</p></div>`;
    });
    if (format === 'print') {
      printDocumentHtml(tutor.title, html, meta);
    } else {
      downloadDocFile(filename, tutor.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [
      {
        heading: 'Dialogue History',
      },
    ];
    tutor.messages.forEach((msg) => {
      const isTutor = msg.sender === 'tutor';
      sections.push({
        heading: isTutor ? 'Afrikan Study Tutor' : 'Student',
        content: msg.text,
      });
    });
    downloadPdfFile(filename, tutor.title, sections, meta);
  }
}

export function exportEssayGrader(essay: EssayGraderResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: essay.subject || essay.topic || essay.title,
    documentType: 'Essay Evaluation',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = `<h2>Score: ${essay.score} / ${essay.maxScore || 100} (${essay.gradeLetter || 'B'})</h2>`;
    html += `<h2>Executive Evaluation</h2><p>${escapeHtml(essay.overviewSummary)}</p>`;
    html += `<h2>Detailed Feedback</h2><p>${escapeHtml(essay.detailedFeedback)}</p>`;
    if (essay.strengths && essay.strengths.length > 0) {
      html += `<h2>Strengths</h2><ul>${essay.strengths.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`;
    }
    if (essay.weaknesses && essay.weaknesses.length > 0) {
      html += `<h2>Areas for Growth</h2><ul>${essay.weaknesses.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}</ul>`;
    }
    if (essay.specificImprovements && essay.specificImprovements.length > 0) {
      html += `<h2>Specific Actionable Improvements</h2>`;
      essay.specificImprovements.forEach((imp) => {
        html += `<div class="box"><p><strong>${escapeHtml(imp.category)}:</strong> ${escapeHtml(imp.suggestion)}</p><p><em>Fix:</em> ${escapeHtml(imp.actionableFix)}</p></div>`;
      });
    }
    if (format === 'print') {
      printDocumentHtml(essay.title, html, meta);
    } else {
      downloadDocFile(filename, essay.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [
      {
        heading: `Evaluation Score: ${essay.score} / ${essay.maxScore || 100} (${essay.gradeLetter || 'B'})`,
        content: essay.overviewSummary,
      },
      {
        heading: 'Detailed Feedback',
        content: essay.detailedFeedback,
      },
      {
        heading: 'Strengths',
        bulletPoints: essay.strengths,
      },
      {
        heading: 'Areas for Growth',
        bulletPoints: essay.weaknesses,
      },
    ];
    downloadPdfFile(filename, essay.title, sections, meta);
  }
}

export function resolveBuildResourceMeta(resource: any): DocumentMeta {
  const toolType = (resource?.toolType || resource?.kind || '').toLowerCase();
  const rawSubject = resource?.subject || resource?.topic || resource?.categoryOrSubject || resource?.title || 'Resource';

  let documentType = 'Study Resource';

  if (toolType.includes('presentation') || toolType.includes('slide') || Array.isArray(resource?.slides)) {
    documentType = 'Interactive Presentation';
  } else if (toolType === 'exam' || toolType.includes('exam')) {
    documentType = 'Exam Assessment';
  } else if (toolType.includes('worksheet')) {
    documentType = 'Classroom Worksheet';
  } else if (toolType.includes('lesson')) {
    documentType = 'Lesson Plan';
  } else if (toolType.includes('quiz')) {
    documentType = 'Quiz Assessment';
  } else if (toolType.includes('notes') || toolType.includes('guide')) {
    documentType = 'Study Notes';
  } else if (toolType.includes('flashcard')) {
    documentType = 'Study Flashcards';
  } else if (toolType.includes('course') || toolType.includes('curriculum') || toolType.includes('syllabus')) {
    documentType = 'Course Curriculum';
  } else if (toolType.includes('mind-map') || toolType.includes('mindmap')) {
    documentType = 'Mind Map Summary';
  } else if (toolType.includes('path') || toolType.includes('roadmap')) {
    documentType = 'Learning Roadmap';
  } else if (toolType.includes('essay') || toolType.includes('grader')) {
    documentType = 'Essay Evaluation';
  } else if (toolType.includes('focus-quest') || toolType.includes('quest')) {
    documentType = 'Focus Quest Session';
  } else if (toolType.includes('tutor')) {
    documentType = 'Tutoring Session';
  } else if (resource?.kindLabel) {
    documentType = resource.kindLabel;
  }

  return resolveDocumentMeta({
    subject: rawSubject,
    documentType,
  });
}

export function exportUnifiedItem(item: any, format: 'doc' | 'pdf' | 'print') {
  const studySet = item.originalStudySet;
  const quiz = item.originalQuiz;
  const buildResource = item.originalBuildResource;
  const anyData = item.data || buildResource?.data || {};
  const toolType = (item.toolType || buildResource?.toolType || item.kind || '').toLowerCase();

  if (studySet && studySet.concepts) {
    const meta = resolveDocumentMeta({
      subject: item.title || item.categoryOrSubject,
      documentType: 'Study Vocabulary & Concepts',
    });
    const filename = meta.filenameBase;
    if (format === 'doc' || format === 'print') {
      let html = '';
      if (studySet.description) html += `<p>${escapeHtml(studySet.description)}</p>`;
      html += `<h2>Concepts & Study Vocabulary</h2>`;
      studySet.concepts.forEach((c: any, idx: number) => {
        html += `<div class="box"><p><strong>${idx + 1}. ${escapeHtml(c.title)}</strong></p><p>${escapeHtml(c.explanation)}</p>`;
        if (c.whyItMatters) html += `<p><em>Why it matters: ${escapeHtml(c.whyItMatters)}</em></p>`;
        if (c.keyFacts && c.keyFacts.length) {
          html += `<ul>${c.keyFacts.map((f: string) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`;
        }
        html += `</div>`;
      });
      if (format === 'print') {
        printDocumentHtml(item.title, html, meta);
      } else {
        downloadDocFile(filename, item.title, html, meta);
      }
    } else {
      const sections: PdfSection[] = [];
      if (studySet.description) {
        sections.push({ content: studySet.description });
      }
      studySet.concepts.forEach((c: any, idx: number) => {
        sections.push({
          heading: `${idx + 1}. ${c.title}`,
          content: c.explanation,
          bulletPoints: c.keyFacts,
          callout: c.whyItMatters ? `Why it matters: ${c.whyItMatters}` : undefined,
        });
      });
      downloadPdfFile(filename, item.title, sections, meta);
    }
    return;
  }

  if (quiz && quiz.questions) {
    const quizResult: QuizResult = {
      title: item.title,
      subject: item.categoryOrSubject || quiz.category || quiz.subject || item.title,
      questions: quiz.questions.map((q: any, i: number) => ({
        id: q.id || String(i),
        prompt: q.question || q.prompt,
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || '',
      })),
    };
    exportQuiz(quizResult, format);
    return;
  }

  // Check if item has structured build resource data
  if (
    item.sections ||
    item.questions ||
    item.activities ||
    item.slides ||
    anyData.slides ||
    toolType === 'presentation' ||
    anyData.activities ||
    anyData.exercises ||
    item.exercises ||
    anyData.phases ||
    anyData.sections ||
    anyData.questions ||
    anyData.rootNode ||
    toolType === 'exam' ||
    toolType === 'lesson-plan' ||
    toolType === 'mind-map'
  ) {
    exportBuildResource({ ...item, ...anyData }, format);
    return;
  }

  // Fallback for generic build resources
  const fallbackMeta = resolveBuildResourceMeta(item);
  if (format === 'doc' || format === 'print') {
    let html = `<h2>${escapeHtml(item.title || fallbackMeta.subject)}</h2>`;
    if (anyData.description) {
      html += `<p>${escapeHtml(anyData.description)}</p>`;
    }
    if (format === 'print') {
      printDocumentHtml(item.title, html, fallbackMeta);
    } else {
      downloadDocFile(fallbackMeta.filenameBase, item.title, html, fallbackMeta);
    }
  } else {
    downloadPdfFile(fallbackMeta.filenameBase, item.title, [
      {
        heading: item.title || fallbackMeta.subject,
        content: anyData.description || 'Saved Study Resource',
      },
    ], fallbackMeta);
  }
}

/**
 * Resolves the worksheet title so that it is strictly the TOPIC / SUBJECT TITLE,
 * removing any redundant prefixes like "Worksheet: ", "Interactive Worksheet: ", etc.
 */
export function getCleanWorksheetTitle(title?: string, topic?: string, subject?: string): string {
  const cleanTopic = (topic || '').trim();
  const cleanSubject = (subject || '').trim();

  let formattedTitle = (title || '').trim();
  if (formattedTitle) {
    formattedTitle = formattedTitle
      .replace(/^(?:Interactive\s+|Mastery\s+|Student\s+|Classroom\s+)?Worksheet\s*[:\-–—]\s*/i, '')
      .replace(/^Worksheet\b\s*[:\-–—]?\s*/i, '')
      .trim();
  }

  const isGeneric = !formattedTitle || /^(?:classroom\s+)?(?:student\s+)?worksheet$/i.test(formattedTitle);

  if (!isGeneric && formattedTitle) {
    return formattedTitle;
  }

  if (cleanTopic && cleanSubject && cleanTopic.toLowerCase() !== cleanSubject.toLowerCase()) {
    if (/^(?:curriculum|general|general\s+science|educational\s+studies|standard)$/i.test(cleanSubject)) {
      return cleanTopic;
    }
    return `${cleanTopic} - ${cleanSubject}`;
  }

  return cleanTopic || cleanSubject || formattedTitle || 'Classroom Study Topic';
}

/**
 * Determines the response type for worksheet activity items
 */
export function getWorksheetResponseType(act: any, item: any): 'long' | 'medium' | 'matching' | 'fill-blank' {
  if (act?.type === 'matching' || Boolean(item?.matchTarget)) {
    return 'matching';
  }

  if (act?.type === 'fill-in-blanks' || act?.type === 'fill-in-the-blank') {
    const promptText = (item?.prompt || '').toLowerCase();
    if (
      (promptText.includes('___') || promptText.includes('blank')) &&
      !promptText.includes('explain') &&
      !promptText.includes('describe') &&
      !promptText.includes('analyze') &&
      !promptText.includes('justify')
    ) {
      return 'fill-blank';
    }
  }

  const combinedText = `${act?.title || ''} ${act?.type || ''} ${act?.instructions || ''} ${item?.prompt || ''} ${item?.completionSpace || ''}`.toLowerCase();

  const isLong =
    act?.type === 'critical-thinking' ||
    act?.type === 'application' ||
    act?.type === 'scenario' ||
    act?.type === 'problem-solving' ||
    act?.type === 'essay' ||
    act?.type === 'reflection' ||
    combinedText.includes('critical thinking') ||
    combinedText.includes('action plan') ||
    combinedText.includes('step-by-step') ||
    combinedText.includes('reflection') ||
    combinedText.includes('synthesiz') ||
    combinedText.includes('scenario') ||
    combinedText.includes('evaluate') ||
    combinedText.includes('analyze') ||
    combinedText.includes('analysis') ||
    combinedText.includes('show all work') ||
    combinedText.includes('working') ||
    combinedText.includes('justify') ||
    combinedText.includes('detailed');

  return isLong ? 'long' : 'medium';
}

/**
 * Downloads a structured DOC file for a Worksheet
 * Strict Rule 5: 16px font size for all body text
 */
function exportWorksheetDoc(resource: any, format: 'doc' | 'print' = 'doc') {
  const cleanTitle = getCleanWorksheetTitle(resource.title, resource.topic, resource.subject);
  const meta = resolveDocumentMeta({
    subject: cleanTitle,
    documentType: 'Classroom Worksheet',
  });
  const filename = meta.filenameBase;
  const activities = resource.activities || resource.exercises || [];

  let html = `<h1 style="font-size: 26px !important; color: #0f172a; text-transform: uppercase; margin: 10pt 0 12pt 0; font-family: 'Segoe UI', Calibri, Arial, sans-serif; letter-spacing: 0.5pt; font-weight: 800;">${escapeHtml(cleanTitle)}</h1>`;

  if (resource.description) {
    html += `<p style="font-size: 16px !important; color: #1e293b; margin-bottom: 18pt; font-weight: bold; background: #fafaf9; padding: 12pt 14pt; border-left: 4pt solid #D92B8A; border-radius: 4pt; line-height: 1.6;">${escapeHtml(resource.description)}</p>`;
  }

  // Student header block
  html += `<table style="width: 100%; border: 1.5pt solid #cbd5e1; background-color: #faf7f0; margin-bottom: 22pt; font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 16px !important; font-weight: bold; border-radius: 6pt;">
    <tr>
      <td style="padding: 10pt 14pt; width: 50%; font-size: 16px !important;">Name: ____________________________________</td>
      <td style="padding: 10pt 14pt; width: 50%; font-size: 16px !important;">Date: ________________________</td>
    </tr>
    <tr>
      <td style="padding: 10pt 14pt; width: 50%; font-size: 16px !important;">Class: ___________________________________</td>
      <td style="padding: 10pt 14pt; width: 50%; font-size: 16px !important;">Score: ________ / ${resource.totalMarks || 40}</td>
    </tr>
  </table>`;

  if (Array.isArray(activities) && activities.length > 0) {
    activities.forEach((act: any, actIdx: number) => {
      html += `<div style="margin-top: 30pt; margin-bottom: 20pt; border-bottom: 2pt solid #0f172a; padding-bottom: 6pt;">
        <h2 style="font-size: 22px !important; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5pt;">
          ${escapeHtml(act.title || `Activity ${actIdx + 1}`)}
        </h2>
      </div>`;

      if (act.instructions) {
        html += `<p style="font-size: 16px !important; font-weight: bold; color: #475569; margin-bottom: 14pt; line-height: 1.6;">${escapeHtml(act.instructions)}</p>`;
      }

      if (Array.isArray(act.wordBank) && act.wordBank.length > 0) {
        html += `<div style="border: 1.5pt dashed #D92B8A; background: #fdf2f8; padding: 10pt 14pt; margin: 12pt 0 18pt 0; font-size: 16px !important; font-weight: bold; color: #9d174d; border-radius: 6pt;">
          <strong>Word Bank:</strong> ${act.wordBank.map((w: string) => escapeHtml(w)).join(' &nbsp;&bull;&nbsp; ')}
        </div>`;
      }

      if (act.scenario) {
        html += `<div style="border: 1.5pt solid #f59e0b; background: #fffbeb; padding: 12pt 14pt; margin: 12pt 0 20pt 0; font-size: 16px !important; color: #1e293b; border-radius: 6pt;">
          <strong style="color: #b45309; text-transform: uppercase;">Practical Scenario:</strong>
          <p style="margin: 4pt 0 0 0; line-height: 1.6; font-size: 16px !important;">${escapeHtml(act.scenario)}</p>
        </div>`;
      }

      const items = act.items || act.questions || [];
      if (Array.isArray(items)) {
        items.forEach((item: any, itemIdx: number) => {
          const respType = getWorksheetResponseType(act, item);
          const itemNum = item.itemNumber || item.number || (itemIdx + 1);

          html += `<div style="margin-top: 18pt; margin-bottom: 26pt;">`;
          html += `<p style="font-size: 16px !important; font-weight: bold; color: #0f172a; margin: 0 0 8pt 0; line-height: 1.6;">
            ${itemNum}. ${escapeHtml(item.prompt || '')}
          </p>`;

          if (respType === 'matching') {
            if (item.matchTarget) {
              html += `<div style="margin: 4pt 0 6pt 16pt; font-size: 16px !important; color: #334155;"><em>${escapeHtml(item.matchTarget)}</em></div>`;
            }
            html += `<div style="margin: 8pt 0 14pt 16pt; font-size: 16px !important; color: #0f172a;">
              <strong>Write Letter: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</strong>
            </div>`;
          } else if (respType === 'fill-blank') {
            html += `<div style="margin: 8pt 0 16pt 16pt; font-size: 16px !important; color: #0f172a;">
              <strong>Your Answer:</strong> ____________________________________________________________
            </div>`;
          } else {
            const isLong = respType === 'long';
            const lineCount = isLong ? 7 : 4;
            const label = isLong
              ? 'Student Extended Response / Working & Analysis:'
              : 'Student Written Response:';

            html += `<div style="margin: 10pt 0 24pt 16pt; border: 1.5pt solid #cbd5e1; background-color: #fafaf9; border-radius: 6pt; padding: 12pt 14pt;">
              <div style="font-size: 16px !important; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10pt; letter-spacing: 0.5pt;">
                ${label}
              </div>
              ${Array.from({ length: lineCount })
                .map(() => `<div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%; min-height: 26pt;"></div>`)
                .join('')}
            </div>`;
          }

          html += `</div>`;
        });
      }
    });
  }

  // Teacher solutions & answer key
  if (Array.isArray(resource.teacherAnswerKey) && resource.teacherAnswerKey.length > 0) {
    html += `<div style="page-break-before: always; margin-top: 40pt; border-top: 3pt double #0f172a; padding-top: 20pt;">
      <h2 style="font-size: 22px !important; color: #b45309; text-transform: uppercase; letter-spacing: 0.5pt; margin-bottom: 14pt;">
        Teacher Solutions & Answer Key
      </h2>`;
    resource.teacherAnswerKey.forEach((k: any) => {
      html += `<h3 style="font-size: 18px !important; color: #92400e; margin-top: 16pt; margin-bottom: 6pt;">${escapeHtml(k.activityTitle || 'Activity Answers')}</h3><ul style="margin: 4pt 0 12pt 20pt;">`;
      (k.answers || []).forEach((ans: string) => {
        html += `<li style="font-size: 16px !important; color: #1e293b; margin-bottom: 4pt;">${escapeHtml(ans)}</li>`;
      });
      html += `</ul>`;
    });
    html += `</div>`;
  }

  if (format === 'print') {
    printDocumentHtml(cleanTitle, html, meta);
  } else {
    downloadDocFile(filename, cleanTitle, html, meta);
  }
}

/**
 * Downloads a structured PDF file for a Worksheet
 * Strict Rule 5: Minimum 16px font size (12pt in PDF) for all body text
 */
function downloadWorksheetPdf(filename: string, resource: any) {
  const cleanTitle = getCleanWorksheetTitle(resource.title, resource.topic, resource.subject);
  const meta = resolveDocumentMeta({
    subject: cleanTitle,
    documentType: 'Classroom Worksheet',
  });
  const cleanFilename = `${meta.filenameBase}.pdf`;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  doc.setProperties({
    title: meta.combinedHeading,
    subject: `${meta.subject} - ${meta.documentType}`,
    author: 'Proudly Afrikan Study Platform',
    creator: 'Proudly Afrikan Study Platform',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 26) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Rule 2 Heading: Proudly Afrikan | [Actual Subject] | Classroom Worksheet
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 43, 138); // #D92B8A
  const headingText = meta.combinedHeading;
  const splitHeading = doc.splitTextToSize(headingText, contentWidth);
  doc.text(splitHeading, margin, y + 14);
  y += splitHeading.length * 18 + 8;

  // Separator line
  doc.setDrawColor(217, 43, 138);
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 18;

  // Title: strictly the TOPIC / SUBJECT TITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  const titleText = cleanTitle.toUpperCase();
  const splitTitle = doc.splitTextToSize(titleText, contentWidth);
  doc.text(splitTitle, margin, y + 14);
  y += splitTitle.length * 22 + 10;

  // Description
  if (resource.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12); // Minimum 16px body font size
    doc.setTextColor(55, 65, 81);
    const splitDesc = doc.splitTextToSize(resource.description, contentWidth - 20);
    const descHeight = splitDesc.length * 18 + 16;
    checkPageBreak(descHeight + 10);
    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, descHeight, 4, 4, 'FD');
    doc.text(splitDesc, margin + 10, y + 15);
    y += descHeight + 14;
  }

  // Student Fill-in Box
  checkPageBreak(58);
  doc.setFillColor(250, 247, 240);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 54, 4, 4, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12); // Minimum 16px body font size
  doc.setTextColor(31, 41, 55);
  doc.text('Name: __________________________________', margin + 12, y + 20);
  doc.text('Date: ________________________', margin + contentWidth / 2 + 10, y + 20);
  doc.text('Class: _________________________________', margin + 12, y + 42);
  doc.text(`Score: ________ / ${resource.totalMarks || 40}`, margin + contentWidth / 2 + 10, y + 42);
  y += 68;

  const activities = resource.activities || resource.exercises || [];
  if (Array.isArray(activities)) {
    activities.forEach((act: any, actIdx: number) => {
      // Activity Heading
      checkPageBreak(54);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      const actTitle = (act.title || `Activity ${actIdx + 1}`).toUpperCase();
      doc.text(actTitle, margin, y + 14);
      y += 20;

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.line(margin, y, margin + contentWidth, y);
      y += 12;

      if (act.instructions) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12); // Minimum 16px body font size
        doc.setTextColor(75, 85, 99);
        const splitActInst = doc.splitTextToSize(act.instructions, contentWidth);
        checkPageBreak(splitActInst.length * 18 + 6);
        doc.text(splitActInst, margin, y + 12);
        y += splitActInst.length * 18 + 10;
      }

      if (Array.isArray(act.wordBank) && act.wordBank.length > 0) {
        const wbText = `Word Bank:  ${act.wordBank.join('   •   ')}`;
        const splitWb = doc.splitTextToSize(wbText, contentWidth - 20);
        const wbHeight = splitWb.length * 18 + 16;
        checkPageBreak(wbHeight + 10);
        doc.setFillColor(253, 242, 248);
        doc.setDrawColor(244, 114, 182);
        doc.setLineWidth(0.8);
        doc.roundedRect(margin, y, contentWidth, wbHeight, 4, 4, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12); // Minimum 16px body font size
        doc.setTextColor(157, 23, 77);
        doc.text(splitWb, margin + 10, y + 15);
        y += wbHeight + 14;
      }

      if (act.scenario) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const splitSc = doc.splitTextToSize(act.scenario, contentWidth - 20);
        const scHeight = splitSc.length * 18 + 26;
        checkPageBreak(scHeight + 10);
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.roundedRect(margin, y, contentWidth, scHeight, 4, 4, 'FD');
        doc.setTextColor(180, 83, 9);
        doc.text('PRACTICAL SCENARIO:', margin + 10, y + 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12); // Minimum 16px body font size
        doc.setTextColor(31, 41, 55);
        doc.text(splitSc, margin + 10, y + 30);
        y += scHeight + 14;
      }

      const items = act.items || act.questions || [];
      if (Array.isArray(items)) {
        items.forEach((item: any, itemIdx: number) => {
          const respType = getWorksheetResponseType(act, item);
          const itemNum = item.itemNumber || item.number || (itemIdx + 1);
          const promptText = `${itemNum}.  ${item.prompt || ''}`;
          const splitPrompt = doc.splitTextToSize(promptText, contentWidth - 16);
          const promptHeight = splitPrompt.length * 18 + 6;

          if (respType === 'matching') {
            const needHeight = promptHeight + (item.matchTarget ? 40 : 26) + 14;
            checkPageBreak(needHeight);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12); // Minimum 16px body font size
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 12);
            y += promptHeight + 4;

            if (item.matchTarget) {
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(12);
              doc.setTextColor(75, 85, 99);
              const splitTarget = doc.splitTextToSize(item.matchTarget, contentWidth - 36);
              doc.text(splitTarget, margin + 20, y + 12);
              y += splitTarget.length * 18 + 6;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(31, 41, 55);
            doc.text('Write Letter: [ _______ ]', margin + 20, y + 14);
            y += 28;
          } else if (respType === 'fill-blank') {
            const needHeight = promptHeight + 42;
            checkPageBreak(needHeight);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12); // Minimum 16px body font size
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 12);
            y += promptHeight + 6;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(75, 85, 99);
            doc.text('Your Answer: ______________________________________________________________', margin + 16, y + 16);
            y += 32;
          } else {
            const isLong = respType === 'long';
            const lineCount = isLong ? 7 : 4;
            const lineSpacing = 24;
            const boxPaddingTop = 26;
            const boxHeight = boxPaddingTop + lineCount * lineSpacing + 10;
            const totalItemHeight = promptHeight + boxHeight + 28;

            checkPageBreak(totalItemHeight);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12); // Minimum 16px body font size
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 12);
            y += promptHeight + 8;

            const boxX = margin + 12;
            const boxW = contentWidth - 12;

            doc.setFillColor(250, 250, 249);
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.8);
            doc.roundedRect(boxX, y, boxW, boxHeight, 4, 4, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12); // Minimum 16px body font size
            doc.setTextColor(100, 116, 139);
            const boxLabel = isLong
              ? 'STUDENT EXTENDED RESPONSE / WORKING & ANALYSIS:'
              : 'STUDENT WRITTEN RESPONSE:';
            doc.text(boxLabel, boxX + 10, y + 16);

            doc.setDrawColor(218, 224, 233);
            doc.setLineWidth(0.6);
            for (let l = 1; l <= lineCount; l++) {
              const lineY = y + boxPaddingTop + l * lineSpacing;
              doc.line(boxX + 10, lineY, boxX + boxW - 10, lineY);
            }

            y += boxHeight + 28;
          }
        });
      }
    });
  }

  // Teacher Solutions & Answer Key
  if (Array.isArray(resource.teacherAnswerKey) && resource.teacherAnswerKey.length > 0) {
    doc.addPage();
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('TEACHER SOLUTIONS & ANSWER KEY', margin, y + 14);
    y += 24;

    doc.setDrawColor(217, 43, 138);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 18;

    resource.teacherAnswerKey.forEach((k: any) => {
      checkPageBreak(46);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(180, 83, 9);
      doc.text(k.activityTitle || 'Activity Answers', margin, y + 12);
      y += 20;

      (k.answers || []).forEach((ans: string) => {
        const splitAns = doc.splitTextToSize(`•  ${ans}`, contentWidth - 16);
        checkPageBreak(splitAns.length * 18 + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12); // Minimum 16px body font size
        doc.setTextColor(31, 41, 55);
        doc.text(splitAns, margin + 12, y + 12);
        y += splitAns.length * 18 + 6;
      });
      y += 12;
    });
  }

  // Standardized footer with clickable website hyperlink and page numbers
  renderPdfFooter(doc);

  doc.save(cleanFilename);
}

/**
 * Downloads a standalone, interactive HTML presentation deck
 */
export function downloadPresentationHtml(rawResource: any) {
  const resource = rawResource?.data ? { ...rawResource.data, ...rawResource } : (rawResource || {});
  const meta = resolveBuildResourceMeta(resource);
  const cleanTitle = resource.title || meta.subject || 'Presentation Deck';
  const slides = Array.isArray(resource.slides) && resource.slides.length > 0
    ? resource.slides
    : (Array.isArray(resource.sections) ? resource.sections.map((sec: any, idx: number) => ({
        id: `s-${idx + 1}`,
        slideNumber: idx + 1,
        slideType: 'concept',
        title: sec.heading || `Slide ${idx + 1}`,
        subtitle: '',
        bulletPoints: typeof sec.content === 'string' ? sec.content.split('\n').filter(Boolean) : [],
        speakerNotes: '',
      })) : []);

  const slidesJson = JSON.stringify(slides);
  const theme = resource.themeOrColorMood || resource.presentationStyle || 'African Earth & Ochre';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cleanTitle)} - Proudly Afrikan Presentation Deck</title>
  <style>
    :root {
      --bg: #18181b;
      --card-bg: #27272a;
      --card-border: #3f3f46;
      --accent: #FF7A00;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-user-select: none;
    }
    header {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #111113;
      border-bottom: 1px solid var(--card-border);
    }
    .brand {
      font-weight: 900;
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .meta-badge {
      font-size: 0.75rem;
      background: #2d261e;
      color: #f59e0b;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-weight: 700;
    }
    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    button.btn {
      background: #3f3f46;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    button.btn:hover { background: #52525b; }
    button.btn-accent { background: var(--accent); color: black; }
    button.btn-accent:hover { opacity: 0.9; }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .slide-canvas {
      width: 100%;
      max-width: 980px;
      min-height: 520px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.5rem;
      padding: 2.5rem 3rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .slide-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    h1.slide-title {
      font-size: 2.2rem;
      font-weight: 900;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }
    h3.slide-subtitle {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 1.75rem;
    }
    ul.bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1.15rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    ul.bullet-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    ul.bullet-list li::before {
      content: '❖';
      color: var(--accent);
      font-size: 0.9rem;
      margin-top: 0.2rem;
      flex-shrink: 0;
    }
    .notes-drawer {
      margin-top: 1.5rem;
      background: #18181b;
      border: 1px dashed #52525b;
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #d4d4d8;
      display: none;
    }
    .notes-drawer.open { display: block; }
    footer {
      padding: 1rem 1.5rem;
      background: #111113;
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .progress-dots {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      overflow-x: auto;
      max-width: 50vw;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      background: #3f3f46;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .dot.active {
      background: var(--accent);
      width: 24px;
      border-radius: 5px;
    }
    .key-hints {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: none;
    }
    @media (min-width: 768px) {
      .key-hints { display: block; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>❖ Proudly Afrikan Build</span>
      <span class="meta-badge">${escapeHtml(theme)}</span>
    </div>
    <div class="header-actions">
      <button class="btn" id="btn-toggle-notes" title="Toggle Presenter Notes (N)">Notes [N]</button>
      <button class="btn btn-accent" id="btn-fullscreen" title="Fullscreen Presentation (F)">Fullscreen [F]</button>
    </div>
  </header>

  <main id="presentation-container">
    <div class="slide-canvas">
      <div>
        <div class="slide-meta">
          <span id="slide-num-indicator">SLIDE 1 OF 1</span>
          <span id="slide-type-indicator">TITLE SLIDE</span>
        </div>
        <h1 class="slide-title" id="slide-title"></h1>
        <h3 class="slide-subtitle" id="slide-subtitle"></h3>
        <ul class="bullet-list" id="slide-bullets"></ul>
      </div>

      <div>
        <div class="notes-drawer" id="notes-drawer">
          <strong style="color: var(--accent); text-transform: uppercase; font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">Presenter Notes:</strong>
          <span id="slide-notes-text"></span>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
      <button class="btn" id="btn-prev">&larr; Previous</button>
      <button class="btn btn-accent" id="btn-next">Next &rarr;</button>
    </div>

    <div class="progress-dots" id="dots-container"></div>

    <div class="key-hints">
      Use <strong>&larr;</strong> <strong>&rarr;</strong> or <strong>Space</strong> to navigate &bull; <strong>N</strong> for Notes &bull; <strong>F</strong> for Fullscreen
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentIndex = 0;
    let notesOpen = false;

    const titleEl = document.getElementById('slide-title');
    const subtitleEl = document.getElementById('slide-subtitle');
    const bulletsEl = document.getElementById('slide-bullets');
    const numIndicatorEl = document.getElementById('slide-num-indicator');
    const typeIndicatorEl = document.getElementById('slide-type-indicator');
    const notesDrawerEl = document.getElementById('notes-drawer');
    const notesTextEl = document.getElementById('slide-notes-text');
    const dotsContainer = document.getElementById('dots-container');

    function renderSlide(index) {
      if (!slides || slides.length === 0) return;
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentIndex = index;

      const slide = slides[index];
      numIndicatorEl.textContent = 'SLIDE ' + (index + 1) + ' OF ' + slides.length;
      typeIndicatorEl.textContent = (slide.slideType || 'SLIDE').toUpperCase();

      titleEl.textContent = slide.title || '';
      if (slide.subtitle) {
        subtitleEl.textContent = slide.subtitle;
        subtitleEl.style.display = 'block';
      } else {
        subtitleEl.style.display = 'none';
      }

      bulletsEl.innerHTML = '';
      const bullets = slide.bulletPoints || slide.bullets || [];
      bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        bulletsEl.appendChild(li);
      });

      notesTextEl.textContent = slide.speakerNotes || 'No speaker notes recorded for this slide.';

      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === currentIndex ? ' active' : '');
        dot.title = 'Jump to slide ' + (i + 1);
        dot.addEventListener('click', () => renderSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    document.getElementById('btn-prev').addEventListener('click', () => renderSlide(currentIndex - 1));
    document.getElementById('btn-next').addEventListener('click', () => renderSlide(currentIndex + 1));

    document.getElementById('btn-toggle-notes').addEventListener('click', () => {
      notesOpen = !notesOpen;
      notesDrawerEl.classList.toggle('open', notesOpen);
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {});
      } else {
        document.exitFullscreen().catch(err => {});
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        renderSlide(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        renderSlide(currentIndex - 1);
      } else if (e.key === 'n' || e.key === 'N') {
        notesOpen = !notesOpen;
        notesDrawerEl.classList.toggle('open', notesOpen);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {});
        } else {
          document.exitFullscreen().catch(err => {});
        }
      }
    });

    renderSlide(0);
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `${meta.filenameBase}-Slide-Deck.html`);
}

/**
 * Exports presentation slides as Word Document (.docx)
 * Strict Rule 3: ONLY slide content, NO Suggested Visual
 * Strict Rule 5: 16px font size for all body text
 */
export function exportPresentationDoc(rawResource: any, format: 'doc' | 'print') {
  const resource = rawResource?.data ? { ...rawResource.data, ...rawResource } : (rawResource || {});
  const meta = resolveBuildResourceMeta(resource);
  const cleanTitle = resource.title || meta.subject || 'Interactive Presentation';
  const slides = Array.isArray(resource.slides) && resource.slides.length > 0
    ? resource.slides
    : (Array.isArray(resource.sections) ? resource.sections.map((sec: any, idx: number) => ({
        id: `s-${idx + 1}`,
        slideNumber: idx + 1,
        title: sec.heading || `Slide ${idx + 1}`,
        subtitle: '',
        slideContent: typeof sec.content === 'string' ? sec.content : '',
        bulletPoints: Array.isArray(sec.bulletPoints) ? sec.bulletPoints : [],
        speakerNotes: '',
      })) : []);

  let html = '';
  if (resource.subtitle || resource.description) {
    html += `<p style="font-size: 16px !important; color: #4b5563; font-weight: bold; margin-bottom: 20pt; line-height: 1.6;">${escapeHtml(resource.subtitle || resource.description)}</p>`;
  }

  slides.forEach((slide: any, idx: number) => {
    const slideNum = slide.slideNumber || idx + 1;
    const bullets = slide.bulletPoints || slide.bullets || [];
    const content = slide.slideContent;
    const notes = slide.speakerNotes;

    html += `
      <div style="page-break-after: always; border: 1.5pt solid #e5e7eb; border-radius: 8pt; padding: 22pt; background-color: #FFFFFF; margin-bottom: 24pt;">
        <div style="font-size: 16px !important; font-weight: 800; color: #E05A2B; text-transform: uppercase; letter-spacing: 0.8pt; margin-bottom: 8pt;">
          Slide ${slideNum} of ${slides.length}
        </div>
        <h2 style="font-size: 22px !important; font-weight: 800; color: #111827; text-transform: uppercase; margin: 0 0 10pt 0;">
          ${escapeHtml(slide.title || `Slide ${slideNum}`)}
        </h2>
        ${slide.subtitle ? `<h3 style="font-size: 18px !important; font-weight: 600; color: #4b5563; margin: 0 0 14pt 0;">${escapeHtml(slide.subtitle)}</h3>` : ''}

        ${content ? `
          <p style="font-size: 16px !important; line-height: 1.6; color: #1f2937; margin: 12pt 0 16pt 0;">
            ${escapeHtml(content)}
          </p>
        ` : ''}

        ${bullets.length > 0 ? `
          <ul style="font-size: 16px !important; line-height: 1.6; color: #1f2937; margin: 12pt 0 16pt 22pt;">
            ${bullets.map((b: string) => `<li style="font-size: 16px !important; margin-bottom: 8pt;">${escapeHtml(b)}</li>`).join('')}
          </ul>
        ` : ''}

        ${notes ? `
          <div style="background-color: #fafaf9; border: 1pt dashed #cbd5e1; border-radius: 6pt; padding: 12pt 14pt; margin-top: 16pt; font-size: 16px !important; color: #334155;">
            <strong>Speaker Notes:</strong> ${escapeHtml(notes)}
          </div>
        ` : ''}
      </div>
    `;
  });

  if (format === 'print') {
    printDocumentHtml(cleanTitle, html, meta);
  } else {
    downloadDocFile(meta.filenameBase, cleanTitle, html, meta);
  }
}

/**
 * Exports presentation slides as PDF
 * Strict Rule 3: ONLY slide content, NO Suggested Visual
 * Strict Rule 5: 16px font size (12pt in PDF) for all body text
 */
export function downloadPresentationPdf(rawResource: any) {
  const resource = rawResource?.data ? { ...rawResource.data, ...rawResource } : (rawResource || {});
  const meta = resolveBuildResourceMeta(resource);
  const cleanTitle = resource.title || meta.subject || 'Interactive Presentation';
  const slides = Array.isArray(resource.slides) && resource.slides.length > 0
    ? resource.slides
    : (Array.isArray(resource.sections) ? resource.sections.map((sec: any, idx: number) => ({
        id: `s-${idx + 1}`,
        slideNumber: idx + 1,
        title: sec.heading || `Slide ${idx + 1}`,
        subtitle: '',
        slideContent: typeof sec.content === 'string' ? sec.content : '',
        bulletPoints: Array.isArray(sec.bulletPoints) ? sec.bulletPoints : [],
        speakerNotes: '',
      })) : []);

  const sections: PdfSection[] = [];
  if (resource.subtitle || resource.description) {
    sections.push({
      heading: 'Presentation Overview',
      content: resource.subtitle || resource.description,
    });
  }

  slides.forEach((slide: any, idx: number) => {
    const slideNum = slide.slideNumber || idx + 1;
    const bullets = slide.bulletPoints || slide.bullets || [];
    const content = slide.slideContent;
    const notes = slide.speakerNotes;

    let slideBody = '';
    if (slide.subtitle) slideBody += `${slide.subtitle}\n\n`;
    if (content) slideBody += `${content}`;

    sections.push({
      heading: `Slide ${slideNum}: ${slide.title || `Slide ${slideNum}`}`,
      content: slideBody.trim() ? slideBody.trim() : undefined,
      bulletPoints: bullets.length > 0 ? bullets : undefined,
      callout: notes ? `Speaker Notes: ${notes}` : undefined,
    });
  });

  downloadPdfFile(meta.filenameBase, cleanTitle, sections, meta);
}

/**
 * Universal Build Resource Exporter
 * Accurately formats Exam, Lesson Plan, Mind Map, Presentation, Worksheet, etc.
 */
export function exportBuildResource(rawResource: any, format: 'doc' | 'pdf' | 'print') {
  const resource = rawResource?.data ? { ...rawResource.data, ...rawResource } : (rawResource || {});
  const meta = resolveBuildResourceMeta(resource);
  const filename = meta.filenameBase;

  const activities = resource.activities || resource.exercises || [];
  const isWorksheet =
    resource.toolType === 'worksheet' ||
    rawResource?.toolType === 'worksheet' ||
    (Array.isArray(activities) && activities.length > 0) ||
    (resource.title && resource.title.toLowerCase().includes('worksheet'));

  if (isWorksheet) {
    const cleanTitle = getCleanWorksheetTitle(
      resource.title,
      resource.topic || rawResource?.topic,
      resource.subject || rawResource?.subject
    );
    const worksheetResource = { ...resource, title: cleanTitle };
    if (format === 'doc') {
      exportWorksheetDoc(worksheetResource, 'doc');
    } else if (format === 'print') {
      exportWorksheetDoc(worksheetResource, 'print');
    } else {
      downloadWorksheetPdf(cleanTitle, worksheetResource);
    }
    return;
  }

  const isPresentation =
    resource.toolType === 'presentation' ||
    rawResource?.toolType === 'presentation' ||
    (Array.isArray(resource.slides) && resource.slides.length > 0) ||
    (resource.title && resource.title.toLowerCase().includes('presentation')) ||
    (resource.title && resource.title.toLowerCase().includes('slide deck'));

  if (isPresentation) {
    if (format === 'doc' || format === 'print') {
      exportPresentationDoc(resource, format);
    } else {
      downloadPresentationPdf(resource);
    }
    return;
  }

  const isLessonPlan =
    resource.toolType === 'lesson-plan' ||
    rawResource?.toolType === 'lesson-plan' ||
    Array.isArray(resource.phases);

  if (isLessonPlan) {
    const phases = resource.phases || resource.sections || [];
    if (format === 'doc' || format === 'print') {
      let html = '';
      if (resource.description) {
        html += `<p style="font-size: 16px !important; font-weight: bold; margin-bottom: 16pt;">${escapeHtml(resource.description)}</p>`;
      }
      phases.forEach((p: any, idx: number) => {
        const title = p.heading || p.title || `Phase ${idx + 1}`;
        html += `<h2>${escapeHtml(title)}${p.duration ? ` (${escapeHtml(p.duration)})` : ''}</h2>`;
        html += `<p style="font-size: 16px !important;">${escapeHtml(p.content || p.description || '')}</p>`;
      });
      if (format === 'print') {
        printDocumentHtml(resource.title, html, meta);
      } else {
        downloadDocFile(filename, resource.title, html, meta);
      }
    } else {
      const sections: PdfSection[] = [];
      if (resource.description) {
        sections.push({ content: resource.description });
      }
      phases.forEach((p: any, idx: number) => {
        const title = p.heading || p.title || `Phase ${idx + 1}`;
        sections.push({
          heading: `${title}${p.duration ? ` (${p.duration})` : ''}`,
          content: p.content || p.description || '',
        });
      });
      downloadPdfFile(filename, resource.title, sections, meta);
    }
    return;
  }

  const isMindMap =
    resource.toolType === 'mind-map' ||
    rawResource?.toolType === 'mind-map' ||
    Boolean(resource.rootNode);

  if (isMindMap && resource.rootNode) {
    const root = resource.rootNode;
    if (format === 'doc' || format === 'print') {
      let html = `<h2>Central Concept: ${escapeHtml(root.title || resource.title)}</h2>`;
      if (root.notes) html += `<p style="font-size: 16px !important;">${escapeHtml(root.notes)}</p>`;
      if (Array.isArray(root.children)) {
        html += `<h2>Concept Hierarchy & Branches</h2>`;
        root.children.forEach((branch: any, bIdx: number) => {
          html += `<div class="box"><h3 style="font-size: 18px !important; color: #D92B8A; margin-top: 0;">${bIdx + 1}. ${escapeHtml(branch.title)}</h3>`;
          if (branch.notes) html += `<p style="font-size: 16px !important;">${escapeHtml(branch.notes)}</p>`;
          if (Array.isArray(branch.children) && branch.children.length > 0) {
            html += `<ul>`;
            branch.children.forEach((sub: any) => {
              html += `<li style="font-size: 16px !important;"><strong>${escapeHtml(sub.title || sub)}</strong>${sub.notes ? `: ${escapeHtml(sub.notes)}` : ''}</li>`;
            });
            html += `</ul>`;
          }
          html += `</div>`;
        });
      }
      if (format === 'print') {
        printDocumentHtml(resource.title, html, meta);
      } else {
        downloadDocFile(filename, resource.title, html, meta);
      }
    } else {
      const sections: PdfSection[] = [
        {
          heading: `Central Concept: ${root.title || resource.title}`,
          content: root.notes || '',
        },
      ];
      if (Array.isArray(root.children)) {
        root.children.forEach((branch: any, bIdx: number) => {
          const subItems = Array.isArray(branch.children)
            ? branch.children.map((sub: any) => `${sub.title || sub}${sub.notes ? `: ${sub.notes}` : ''}`)
            : [];
          sections.push({
            heading: `Branch ${bIdx + 1}: ${branch.title}`,
            content: branch.notes || '',
            bulletPoints: subItems.length > 0 ? subItems : undefined,
          });
        });
      }
      downloadPdfFile(filename, resource.title, sections, meta);
    }
    return;
  }

  // Handle Exam Assessment or general structured resource
  const sectionsList = Array.isArray(resource.sections) ? resource.sections : [];
  const questionsList = Array.isArray(resource.questions) ? resource.questions : [];

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (resource.description) {
      html += `<p style="font-size: 16px !important; margin-bottom: 16pt; font-weight: bold;">${escapeHtml(resource.description)}</p>`;
    }

    // Exam sections with nested questions
    if (sectionsList.length > 0) {
      sectionsList.forEach((sec: any, sIdx: number) => {
        html += `<h2>${escapeHtml(sec.heading || sec.title || `Section ${sIdx + 1}`)}${sec.marks ? ` [${sec.marks} Marks]` : ''}</h2>`;
        if (sec.content) html += `<p style="font-size: 16px !important;">${escapeHtml(sec.content)}</p>`;
        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q: any, qIdx: number) => {
            html += `<div class="box" style="margin-bottom: 20pt;">`;
            html += `<p style="font-size: 16px !important;"><strong>Q${qIdx + 1}: ${escapeHtml(q.question || q.prompt || '')}</strong>${q.marks ? ` (${q.marks} marks)` : ''}</p>`;
            if (Array.isArray(q.options) && q.options.length > 0) {
              html += `<ul>`;
              q.options.forEach((opt: string) => {
                const isCorrect = opt === q.correctAnswer || opt === q.answer;
                html += `<li style="font-size: 16px !important; ${isCorrect ? 'font-weight: bold; color: #166534;' : ''}">${escapeHtml(opt)} ${isCorrect ? ' ✓ (Correct)' : ''}</li>`;
              });
              html += `</ul>`;
            }
            if (q.correctAnswer || q.answer) {
              html += `<div class="answer-key"><strong>Answer:</strong> ${escapeHtml(q.correctAnswer || q.answer)}</div>`;
            }
            if (q.explanation) {
              html += `<p style="font-size: 16px !important; margin-top: 6pt;"><em>Explanation: ${escapeHtml(q.explanation)}</em></p>`;
            }
            html += `</div>`;
          });
        }
      });
    }

    // Standalone questions
    if (questionsList.length > 0) {
      html += `<h2>Questions (${questionsList.length})</h2>`;
      questionsList.forEach((q: any, idx: number) => {
        html += `<div class="box" style="margin-bottom: 20pt;">`;
        html += `<p style="font-size: 16px !important;"><strong>Q${idx + 1}: ${escapeHtml(q.question || q.prompt || '')}</strong>${q.marks ? ` (${q.marks} marks)` : ''}</p>`;
        if (Array.isArray(q.options) && q.options.length > 0) {
          html += `<ul>`;
          q.options.forEach((opt: string) => {
            const isCorrect = opt === q.correctAnswer || opt === q.answer;
            html += `<li style="font-size: 16px !important; ${isCorrect ? 'font-weight: bold; color: #166534;' : ''}">${escapeHtml(opt)} ${isCorrect ? ' ✓ (Correct)' : ''}</li>`;
          });
          html += `</ul>`;
        }
        if (q.correctAnswer || q.answer) {
          html += `<div class="answer-key"><strong>Answer:</strong> ${escapeHtml(q.correctAnswer || q.answer)}</div>`;
        }
        if (q.explanation) {
          html += `<p style="font-size: 16px !important; margin-top: 6pt;"><em>Explanation: ${escapeHtml(q.explanation)}</em></p>`;
        }
        html += `</div>`;
      });
    }

    // Complete answer key memorandum if present
    if (Array.isArray(resource.answerKey) && resource.answerKey.length > 0) {
      html += `<h2>Complete Answer Key & Memorandum</h2><ul>`;
      resource.answerKey.forEach((ans: string) => {
        html += `<li style="font-size: 16px !important;">${escapeHtml(ans)}</li>`;
      });
      html += `</ul>`;
    }

    if (format === 'print') {
      printDocumentHtml(resource.title, html, meta);
    } else {
      downloadDocFile(filename, resource.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (resource.description) {
      sections.push({ content: resource.description });
    }

    if (sectionsList.length > 0) {
      sectionsList.forEach((sec: any, sIdx: number) => {
        sections.push({
          heading: `${sec.heading || sec.title || `Section ${sIdx + 1}`}${sec.marks ? ` [${sec.marks} Marks]` : ''}`,
          content: sec.content,
        });
        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q: any, qIdx: number) => {
            const opts = Array.isArray(q.options)
              ? q.options.map((opt: string) => {
                  const isCorrect = opt === q.correctAnswer || opt === q.answer;
                  return `${opt}${isCorrect ? ' (Correct Answer)' : ''}`;
                })
              : undefined;
            sections.push({
              content: `Q${qIdx + 1}: ${q.question || q.prompt || ''}${q.marks ? ` (${q.marks} marks)` : ''}`,
              bulletPoints: opts,
              callout: q.correctAnswer || q.answer ? `Answer: ${q.correctAnswer || q.answer}${q.explanation ? ` — ${q.explanation}` : ''}` : undefined,
            });
          });
        }
      });
    }

    if (questionsList.length > 0) {
      sections.push({ heading: `Questions (${questionsList.length} Items)` });
      questionsList.forEach((q: any, idx: number) => {
        const opts = Array.isArray(q.options)
          ? q.options.map((opt: string) => {
              const isCorrect = opt === q.correctAnswer || opt === q.answer;
              return `${opt}${isCorrect ? ' (Correct Answer)' : ''}`;
            })
          : undefined;
        sections.push({
          content: `Question ${idx + 1}: ${q.question || q.prompt || ''}${q.marks ? ` (${q.marks} marks)` : ''}`,
          bulletPoints: opts,
          callout: q.correctAnswer || q.answer ? `Answer: ${q.correctAnswer || q.answer}${q.explanation ? ` — ${q.explanation}` : ''}` : undefined,
        });
      });
    }

    if (Array.isArray(resource.answerKey) && resource.answerKey.length > 0) {
      sections.push({
        heading: 'Complete Answer Key & Memorandum',
        bulletPoints: resource.answerKey,
      });
    }

    downloadPdfFile(filename, resource.title, sections, meta);
  }
}

export const exportItem = exportBuildResource;
