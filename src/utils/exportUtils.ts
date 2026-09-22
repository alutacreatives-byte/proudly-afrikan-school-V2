import { jsPDF } from 'jspdf';
import type {
  StudyGuideResult,
  CourseResult,
  QuizResult,
  PdfQuizResult,
  FlashcardResult,
  LearningPathResult,
  PresentationResult,
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

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'document';
}

export interface DocumentMeta {
  brand: string;
  subject: string;
  documentType: string;
  toolUsed: string;
  combinedHeading: string; // e.g. "Proudly Afrikan | Metaphysics Quiz Assessment | Quiz Tool"
  filenameBase: string;    // e.g. "Proudly-Afrikan-Metaphysics-Quiz-Assessment"
}

/**
 * Strips any unwanted "AI" mentions from titles, headers, footers, and metadata
 */
export function removeAiReferences(text: string): string {
  if (!text) return '';
  return text
    .replace(/Proudly\s+Afrikan\s+AI\s+Study\s+Platform/gi, 'Proudly Afrikan Study Platform')
    .replace(/Proudly\s+Afrikan\s+AI\s+Study/gi, 'Proudly Afrikan Study')
    .replace(/Proudly\s+Afrikan\s+AI/gi, 'Proudly Afrikan')
    .replace(/\bAI\b/g, '')
    .replace(/\bA\.I\.\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Converts a string into PascalCase words joined by hyphens for clean, professional filenames.
 * e.g. "Metaphysics Quiz Assessment" -> "Metaphysics-Quiz-Assessment"
 * e.g. "African History & Philosophy" -> "African-History-And-Philosophy"
 */
export function toPascalHyphenated(text: string): string {
  if (!text) return 'Study-Document';
  const cleaned = text
    .replace(/&/g, ' And ')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Study-Document';

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
 * Format: "Proudly Afrikan | [Subject] [Document Type] | [Tool Used]"
 * Filename: "Proudly-Afrikan-[Subject]-[Document-Type].[ext]"
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
  const docType = options.documentType || 'Study Resource';
  const toolName = options.toolUsed || 'Study Tool';

  const rawCandidate =
    options.subject ||
    options.topic ||
    options.title ||
    options.filename ||
    '';

  const cleanedSubject = cleanSubjectForMeta(rawCandidate, docType);
  const fallbackSubject = 'Metaphysics';
  const subjectFinal = cleanedSubject || fallbackSubject;

  const subjectWords = subjectFinal
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const subjectAndDocType = `${subjectWords} ${docType}`.trim();
  const combinedHeading = `${brand} | ${subjectAndDocType} | ${toolName}`;

  const hyphenatedContent = toPascalHyphenated(subjectAndDocType);
  const filenameBase = `Proudly-Afrikan-${hyphenatedContent}`;

  return {
    brand,
    subject: subjectWords,
    documentType: docType,
    toolUsed: toolName,
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
 * Downloads a structured .doc file (Microsoft Word compatible HTML)
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

  const ext = filename && filename.toLowerCase().endsWith('.docx') ? 'docx' : 'doc';
  const cleanFilename = `${resolvedMeta.filenameBase}.${ext}`;

  const displayTitle = removeAiReferences(title || resolvedMeta.subject);

  const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(resolvedMeta.combinedHeading)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      padding: 30pt;
    }
    .doc-heading-frame {
      background-color: #faf5f8;
      border: 1.5pt solid #f3d1e4;
      border-left: 5pt solid #D92B8A;
      padding: 10pt 14pt;
      margin-bottom: 18pt;
      border-radius: 4pt;
    }
    .doc-heading-title {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 12pt;
      font-weight: 800;
      color: #D92B8A;
      margin: 0;
      letter-spacing: 0.4pt;
      text-transform: uppercase;
    }
    h1 {
      font-size: 20pt;
      color: #111827;
      font-weight: 800;
      border-bottom: 2.5pt solid #D92B8A;
      padding-bottom: 8pt;
      margin-top: 6pt;
      margin-bottom: 14pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    h2 {
      font-size: 14pt;
      color: #D92B8A;
      font-weight: 700;
      margin-top: 18pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
      border-bottom: 1pt solid #f3e8ef;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 12pt;
      color: #111827;
      font-weight: 600;
      margin-top: 12pt;
      margin-bottom: 4pt;
    }
    p {
      margin: 4pt 0 8pt 0;
    }
    ul, ol {
      margin: 4pt 0 8pt 20pt;
    }
    li {
      margin-bottom: 4pt;
    }
    .badge {
      display: inline-block;
      padding: 2pt 8pt;
      background-color: #fce8f3;
      border: 1pt solid #f5c2dc;
      border-radius: 4pt;
      font-size: 9pt;
      font-weight: bold;
      color: #d92b8a;
      margin-right: 6pt;
    }
    .box {
      border: 1pt solid #e5e7eb;
      background-color: #f9fafb;
      padding: 10pt;
      margin: 8pt 0;
      border-radius: 6pt;
    }
    .answer-key {
      background-color: #f0fdf4;
      border: 1pt solid #bbf7d0;
      padding: 8pt 10pt;
      border-radius: 6pt;
      margin-top: 6pt;
      color: #166534;
    }
    .footer {
      margin-top: 30pt;
      padding-top: 10pt;
      border-top: 1pt solid #e5e7eb;
      font-size: 9pt;
      color: #9ca3af;
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
  ${displayTitle && displayTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase() ? `<h1>${escapeHtml(displayTitle)}</h1>` : ''}
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
 * Preserves the document content, headings, formatting, and page layout.
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

  // Retrieve or dynamically create the dedicated print container
  let container = document.getElementById('proudly-afrikan-print-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'proudly-afrikan-print-container';
    document.body.appendChild(container);
  }

  // Populate formatted document with heading, content, and Proudly Afrikan footer
  container.innerHTML = `
    <div class="print-document-container">
      <div class="doc-heading-frame">
        <p class="doc-heading-title">${escapeHtml(resolvedMeta.combinedHeading)}</p>
      </div>
      ${displayTitle && displayTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase() ? `<h1 class="print-doc-h1">${escapeHtml(displayTitle)}</h1>` : ''}
      <div class="print-doc-body">
        ${htmlBody}
      </div>
      <div class="footer">
        Proudly Afrikan Study Platform • <a href="http://www.proudlyafrikan.com" target="_blank" style="color: #2563eb; text-decoration: underline;">www.proudlyafrikan.com</a> • Page 1 of 1
      </div>
    </div>
  `;

  // Preserve original title and set document title for clean print preview header
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

  // Register cleanup on afterprint
  window.addEventListener('afterprint', cleanup, { once: true });

  // Direct synchronous invocation guarantees browser print dialog opens without delay
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.error('Failed to trigger window.print():', err);
  }

  // Safety fallback cleanup in case afterprint does not fire in some browsers or cancellation
  setTimeout(cleanup, 2500);
}

/**
 * Renders the standardized footer across all PDF pages:
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
    doc.setFontSize(8);

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
    doc.setTextColor(140, 140, 140);
    doc.text(part1, startX, footerY);

    // Part 2: Clickable link to website
    doc.setTextColor(37, 99, 235);
    doc.textWithLink(urlText, startX + w1, footerY, { url: 'http://www.proudlyafrikan.com' });
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(startX + w1, footerY + 1.5, startX + w1 + wUrl, footerY + 1.5);

    // Part 3: Page count
    doc.setTextColor(140, 140, 140);
    doc.text(part3, startX + w1 + wUrl, footerY);
  }
}

/**
 * Downloads a formatted PDF using jsPDF
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
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // Top Document Heading: e.g. "Proudly Afrikan | Metaphysics Quiz Assessment | Quiz Tool"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(217, 43, 138); // #D92B8A
  const headingText = resolvedMeta.combinedHeading;
  const splitHeading = doc.splitTextToSize(headingText, contentWidth);
  doc.text(splitHeading, margin, y + 10);
  y += splitHeading.length * 14 + 6;

  // Accent Line under heading
  doc.setDrawColor(217, 43, 138); // #D92B8A
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  // Document specific title (if distinct from combined heading)
  const cleanTitle = removeAiReferences(title || '').trim();
  if (cleanTitle && cleanTitle.toUpperCase() !== resolvedMeta.combinedHeading.toUpperCase()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(22, 22, 22);
    const splitTitle = doc.splitTextToSize(cleanTitle.toUpperCase(), contentWidth);
    doc.text(splitTitle, margin, y + 12);
    y += splitTitle.length * 17 + 8;
  }

  // Sections
  for (const sec of sections) {
    if (sec.heading) {
      checkPageBreak(34);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(217, 43, 138);
      const cleanHeading = removeAiReferences(sec.heading);
      const splitHeading = doc.splitTextToSize(cleanHeading.toUpperCase(), contentWidth);
      doc.text(splitHeading, margin, y + 10);
      y += splitHeading.length * 14 + 6;
    }

    if (sec.content) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 40);
      const cleanContent = removeAiReferences(sec.content);
      const splitContent = doc.splitTextToSize(cleanContent, contentWidth);
      checkPageBreak(splitContent.length * 13 + 6);
      doc.text(splitContent, margin, y + 9);
      y += splitContent.length * 13 + 6;
    }

    if (sec.bulletPoints && sec.bulletPoints.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      for (const bp of sec.bulletPoints) {
        const cleanBp = removeAiReferences(bp);
        const splitBp = doc.splitTextToSize(`•  ${cleanBp}`, contentWidth - 12);
        checkPageBreak(splitBp.length * 13 + 4);
        doc.text(splitBp, margin + 12, y + 9);
        y += splitBp.length * 13 + 4;
      }
      y += 4;
    }

    if (sec.callout) {
      const cleanCallout = removeAiReferences(sec.callout);
      const splitCallout = doc.splitTextToSize(cleanCallout, contentWidth - 16);
      const boxHeight = splitCallout.length * 12 + 14;
      checkPageBreak(boxHeight + 8);
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 75, 75);
      doc.text(splitCallout, margin + 8, y + 12);
      y += boxHeight + 8;
    }
  }

  // Standardized footer with clickable website hyperlink and page numbers
  renderPdfFooter(doc);

  doc.save(cleanFilename);
}

// ----------------------------------------------------------------------
// Specific Typed Exporters
// ----------------------------------------------------------------------

export function exportStudyGuide(guide: StudyGuideResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: guide.subject || guide.topic || guide.title,
    documentType: 'Study Guide',
    toolUsed: 'Study Guide Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (guide.subject) {
      html += `<p><span class="badge">${escapeHtml(guide.subject)}</span></p>`;
    }
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
    if (guide.subject) {
      sections.push({ content: `Subject: ${guide.subject}` });
    }
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
    toolUsed: 'Course Curriculum Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (course.subject) {
      html += `<p><span class="badge">${escapeHtml(course.subject)}</span> <span class="badge">${course.durationWeeks || 4} Weeks</span></p>`;
    }
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
    if (course.subject) {
      sections.push({ content: `Subject: ${course.subject} | Duration: ${course.durationWeeks || 4} Weeks` });
    }
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
    toolUsed: 'Quiz Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (quiz.subject) {
      html += `<p><span class="badge">${escapeHtml(quiz.subject)}</span> <span class="badge">${escapeHtml(quiz.difficulty || 'All Levels')}</span></p>`;
    }
    if (quiz.description) {
      html += `<p>${escapeHtml(quiz.description)}</p>`;
    }
    if (quiz.questions && quiz.questions.length > 0) {
      html += `<h2>Questions (${quiz.questions.length})</h2>`;
      quiz.questions.forEach((q, idx) => {
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
        html += `<div class="box"><p><strong>Question ${idx + 1}:</strong> ${escapeHtml(q.prompt)}</p><ol type="A">`;
        q.options.forEach((opt, oIdx) => {
          const isCorrect = oIdx === correctIndex;
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
    if (quiz.subject || quiz.difficulty) {
      sections.push({ content: `Subject: ${quiz.subject || 'General'} | Difficulty: ${quiz.difficulty || 'Standard'}` });
    }
    if (quiz.description) {
      sections.push({ content: quiz.description });
    }
    if (quiz.questions && quiz.questions.length > 0) {
      sections.push({ heading: `Questions & Answer Key (${quiz.questions.length} Items)` });
      quiz.questions.forEach((q, idx) => {
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseInt(String(q.correctAnswer), 10);
        const optionsText = q.options.map((opt, oIdx) => `[${String.fromCharCode(65 + oIdx)}] ${opt}${oIdx === correctIndex ? ' (Correct Answer)' : ''}`);
        sections.push({
          content: `Question ${idx + 1}: ${q.prompt}`,
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
    toolUsed: 'Quiz Tool',
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
    toolUsed: 'Flashcard Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (deck.subject) {
      html += `<p><span class="badge">${escapeHtml(deck.subject)}</span> <span class="badge">${deck.cards?.length || 0} Cards</span></p>`;
    }
    if (deck.description) {
      html += `<p>${escapeHtml(deck.description)}</p>`;
    }
    if (deck.cards && deck.cards.length > 0) {
      html += `<h2>Active Recall Flashcards</h2>`;
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
    if (deck.subject) {
      sections.push({ content: `Subject: ${deck.subject} | Total Cards: ${deck.cards?.length || 0}` });
    }
    if (deck.description) {
      sections.push({ content: deck.description });
    }
    if (deck.cards && deck.cards.length > 0) {
      sections.push({ heading: 'Flashcards (Term & Definition)' });
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
    documentType: 'Learning Path Roadmap',
    toolUsed: 'Learning Path Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (path.subject) {
      html += `<p><span class="badge">${escapeHtml(path.subject)}</span> <span class="badge">${path.targetGoal || 'Roadmap'}</span></p>`;
    }
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
    if (path.subject || path.targetGoal) {
      sections.push({ content: `Subject: ${path.subject || ''} | Goal: ${path.targetGoal || 'Mastery'}` });
    }
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

export function exportPresentation(pres: PresentationResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: pres.subject || pres.topic || pres.title,
    documentType: 'Presentation Slide Deck',
    toolUsed: 'Presentation Tool',
  });
  const filename = meta.filenameBase;

  if (format === 'doc' || format === 'print') {
    let html = '';
    if (pres.subtitle) {
      html += `<p><em>${escapeHtml(pres.subtitle)}</em></p>`;
    }
    if (pres.slides && pres.slides.length > 0) {
      html += `<h2>Slide Outline & Speaker Notes (${pres.slides.length} Slides)</h2>`;
      pres.slides.forEach((s) => {
        html += `<div class="box"><h2>Slide ${s.slideNumber}: ${escapeHtml(s.title)}</h2>`;
        if (s.bullets && s.bullets.length > 0) {
          html += `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`;
        }
        if (s.speakerNotes) {
          html += `<p><strong>Speaker Notes:</strong> ${escapeHtml(s.speakerNotes)}</p>`;
        }
        if (s.discussionPrompt) {
          html += `<p><strong>Discussion Prompt:</strong> ${escapeHtml(s.discussionPrompt)}</p>`;
        }
        html += `</div>`;
      });
    }
    if (format === 'print') {
      printDocumentHtml(pres.title, html, meta);
    } else {
      downloadDocFile(filename, pres.title, html, meta);
    }
  } else {
    const sections: PdfSection[] = [];
    if (pres.subtitle) {
      sections.push({ content: pres.subtitle });
    }
    if (pres.slides && pres.slides.length > 0) {
      pres.slides.forEach((s) => {
        sections.push({
          heading: `Slide ${s.slideNumber}: ${s.title}`,
          bulletPoints: s.bullets,
          callout: s.speakerNotes ? `Speaker Notes: ${s.speakerNotes}` : undefined,
        });
      });
    }
    downloadPdfFile(filename, pres.title, sections, meta);
  }
}

export function exportTutorChat(tutor: TutorChatResult, format: 'doc' | 'pdf' | 'print') {
  const meta = resolveDocumentMeta({
    subject: tutor.documentName || tutor.title,
    documentType: 'Socratic Tutoring Session',
    toolUsed: 'Tutor Mentoring Tool',
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
    documentType: 'Essay Evaluation & Feedback',
    toolUsed: 'Essay Grader Tool',
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
  let toolUsed = 'Study Tool';

  if (toolType.includes('worksheet')) {
    documentType = 'Classroom Worksheet';
    toolUsed = 'Worksheet Tool';
  } else if (toolType.includes('quiz') || toolType.includes('exam') || toolType.includes('assessment')) {
    documentType = 'Quiz Assessment';
    toolUsed = 'Quiz Tool';
  } else if (toolType.includes('flashcard')) {
    documentType = 'Study Flashcards';
    toolUsed = 'Flashcard Tool';
  } else if (toolType.includes('course') || toolType.includes('curriculum')) {
    documentType = 'Course Curriculum';
    toolUsed = 'Course Curriculum Tool';
  } else if (toolType.includes('path') || toolType.includes('roadmap')) {
    documentType = 'Learning Path Roadmap';
    toolUsed = 'Learning Path Tool';
  } else if (toolType.includes('presentation') || toolType.includes('slide')) {
    documentType = 'Presentation Slide Deck';
    toolUsed = 'Presentation Tool';
  } else if (toolType.includes('essay') || toolType.includes('grader')) {
    documentType = 'Essay Evaluation & Feedback';
    toolUsed = 'Essay Grader Tool';
  } else if (toolType.includes('tutor')) {
    documentType = 'Socratic Tutoring Session';
    toolUsed = 'Tutor Mentoring Tool';
  } else if (toolType.includes('guide')) {
    documentType = 'Study Guide';
    toolUsed = 'Study Guide Tool';
  } else if (resource?.kindLabel) {
    documentType = resource.kindLabel;
    toolUsed = `${resource.kindLabel} Tool`;
  }

  return resolveDocumentMeta({
    subject: rawSubject,
    documentType,
    toolUsed,
  });
}

export function exportUnifiedItem(item: any, format: 'doc' | 'pdf' | 'print') {
  const studySet = item.originalStudySet;
  const quiz = item.originalQuiz;
  const buildResource = item.originalBuildResource;
  const anyData = item.data || buildResource?.data || {};
  const toolType = item.toolType || buildResource?.toolType || item.kind;

  if (studySet && studySet.concepts) {
    const meta = resolveDocumentMeta({
      subject: item.title || item.categoryOrSubject,
      documentType: 'Study Vocabulary & Concepts',
      toolUsed: 'Study Set Tool',
    });
    const filename = meta.filenameBase;
    if (format === 'doc' || format === 'print') {
      let html = `<p><span class="badge">${escapeHtml(item.categoryOrSubject || 'General')}</span></p>`;
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
      const sections: PdfSection[] = [
        {
          heading: `Category: ${item.categoryOrSubject || 'General'}`,
          content: studySet.description || '',
        },
      ];
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
      subject: item.categoryOrSubject,
      questions: quiz.questions.map((q: any, i: number) => ({
        id: q.id || String(i),
        prompt: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || '',
      })),
    };
    exportQuiz(quizResult, format);
    return;
  }

  // Check if item itself has sections, questions, or activities directly (e.g. from GeneratorModal or SavedResultViewer)
  if (item.sections || item.questions || item.activities || anyData.activities || anyData.exercises || item.exercises) {
    exportBuildResource({ ...item, ...anyData }, format);
    return;
  }

  // Fallback for generic build resources
  const fallbackMeta = resolveBuildResourceMeta(item);
  if (format === 'doc' || format === 'print') {
    let html = `<p><span class="badge">${escapeHtml(item.kindLabel || toolType || 'Study Resource')}</span></p>`;
    html += `<div class="box"><pre style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(JSON.stringify(anyData, null, 2))}</pre></div>`;
    if (format === 'print') {
      printDocumentHtml(item.title, html, fallbackMeta);
    } else {
      downloadDocFile(fallbackMeta.filenameBase, item.title, html, fallbackMeta);
    }
  } else {
    downloadPdfFile(fallbackMeta.filenameBase, item.title, [
      {
        heading: item.kindLabel || 'Saved Resource',
        content: JSON.stringify(anyData, null, 2),
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
    // If subject is generic like "Curriculum", "General", etc. just use topic
    if (/^(?:curriculum|general|general\s+science|educational\s+studies|standard)$/i.test(cleanSubject)) {
      return cleanTopic;
    }
    return `${cleanTopic} - ${cleanSubject}`;
  }

  return cleanTopic || cleanSubject || formattedTitle || 'Classroom Study Topic';
}

/**
 * Determines the response type for worksheet activity items:
 * - 'matching': term and definition match
 * - 'fill-blank': short single blank in sentence
 * - 'medium': short-answer / conceptual explanation (4-5 widely spaced ruled lines)
 * - 'long': scenario application, problem solving, action plan, critical thinking, reflection, synthesis (7 widely spaced ruled lines)
 */
export function getWorksheetResponseType(act: any, item: any): 'long' | 'medium' | 'matching' | 'fill-blank' {
  // Matching item
  if (act?.type === 'matching' || Boolean(item?.matchTarget)) {
    return 'matching';
  }

  // Fill in the blanks with single blank line
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

  // Check if an extended response is expected
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
 * Downloads a structured DOC file for a Worksheet with clearly defined writing areas
 * and ample vertical space for all written-response questions.
 */
function exportWorksheetDoc(resource: any, format: 'doc' | 'print' = 'doc') {
  const cleanTitle = getCleanWorksheetTitle(resource.title, resource.topic, resource.subject);
  const meta = resolveDocumentMeta({
    subject: cleanTitle,
    documentType: 'Classroom Worksheet',
    toolUsed: 'Worksheet Tool',
  });
  const filename = meta.filenameBase;
  const activities = resource.activities || resource.exercises || [];

  let html = `<p><span class="badge" style="background-color: #fff7ed; border-color: #ffedd5; color: #ea580c; font-size: 10pt; padding: 4pt 10pt;">STUDENT CLASSROOM WORKSHEET &bull; ${escapeHtml(resource.gradeLevel || 'Standard')}</span></p>`;

  // Title strictly as the Topic / Subject Title
  html += `<h1 style="font-size: 22pt; color: #0f172a; text-transform: uppercase; margin: 10pt 0 12pt 0; font-family: 'Segoe UI', Calibri, Arial, sans-serif; letter-spacing: 0.5pt; font-weight: 800;">${escapeHtml(cleanTitle)}</h1>`;

  if (resource.estimatedTimeMinutes || resource.estimatedDurationMinutes) {
    html += `<p style="font-size: 11pt; color: #64748b; font-weight: bold; margin: 4pt 0 12pt 0;">Estimated Duration: ${resource.estimatedTimeMinutes || resource.estimatedDurationMinutes} minutes</p>`;
  }

  if (resource.description) {
    html += `<p style="font-size: 13pt; color: #1e293b; margin-bottom: 18pt; font-weight: bold; background: #fafaf9; padding: 12pt 14pt; border-left: 4pt solid #FF7A00; border-radius: 4pt; line-height: 1.5;">${escapeHtml(resource.description)}</p>`;
  }

  // Student header block
  html += `<table style="width: 100%; border: 1.5pt solid #cbd5e1; background-color: #faf7f0; margin-bottom: 22pt; font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 12pt; font-weight: bold; border-radius: 6pt;">
    <tr>
      <td style="padding: 10pt 14pt; width: 50%;">Name: ____________________________________</td>
      <td style="padding: 10pt 14pt; width: 50%;">Date: ________________________</td>
    </tr>
    <tr>
      <td style="padding: 10pt 14pt; width: 50%;">Class: ___________________________________</td>
      <td style="padding: 10pt 14pt; width: 50%;">Score: ________ / ${resource.totalMarks || 40}</td>
    </tr>
  </table>`;

  if (resource.instructions) {
    html += `<div style="background-color: #fffbeb; border: 1.5pt solid #fde68a; border-left: 4pt solid #f59e0b; padding: 12pt 14pt; margin-bottom: 24pt; font-size: 12pt; border-radius: 4pt;">
      <strong style="color: #92400e; text-transform: uppercase;">General Instructions:</strong>
      <p style="margin: 4pt 0 0 0; color: #1e293b; line-height: 1.5;">${escapeHtml(resource.instructions)}</p>
    </div>`;
  }

  if (Array.isArray(activities) && activities.length > 0) {
    activities.forEach((act: any, actIdx: number) => {
      html += `<div style="margin-top: 30pt; margin-bottom: 20pt; border-bottom: 2pt solid #0f172a; padding-bottom: 6pt;">
        <h2 style="font-size: 16pt; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5pt;">
          ${escapeHtml(act.title || `Activity ${actIdx + 1}`)}
        </h2>
      </div>`;

      if (act.instructions) {
        html += `<p style="font-size: 12pt; font-weight: bold; color: #475569; margin-bottom: 14pt; line-height: 1.5;">${escapeHtml(act.instructions)}</p>`;
      }

      if (Array.isArray(act.wordBank) && act.wordBank.length > 0) {
        html += `<div style="border: 1.5pt dashed #6366f1; background: #f5f3ff; padding: 10pt 14pt; margin: 12pt 0 18pt 0; font-size: 12pt; font-weight: bold; color: #312e81; border-radius: 6pt;">
          <strong>Word Bank:</strong> ${act.wordBank.map((w: string) => escapeHtml(w)).join(' &nbsp;&bull;&nbsp; ')}
        </div>`;
      }

      if (act.scenario) {
        html += `<div style="border: 1.5pt solid #f59e0b; background: #fffbeb; padding: 12pt 14pt; margin: 12pt 0 20pt 0; font-size: 12pt; color: #1e293b; border-radius: 6pt;">
          <strong style="color: #b45309; text-transform: uppercase;">Practical Scenario:</strong>
          <p style="margin: 4pt 0 0 0; line-height: 1.5;">${escapeHtml(act.scenario)}</p>
        </div>`;
      }

      const items = act.items || act.questions || [];
      if (Array.isArray(items)) {
        items.forEach((item: any, itemIdx: number) => {
          const respType = getWorksheetResponseType(act, item);
          const itemNum = item.itemNumber || item.number || (itemIdx + 1);

          html += `<div style="margin-top: 18pt; margin-bottom: 26pt;">`;
          html += `<p style="font-size: 13pt; font-weight: bold; color: #0f172a; margin: 0 0 8pt 0; line-height: 1.4;">
            ${itemNum}. ${escapeHtml(item.prompt || '')}
          </p>`;

          if (respType === 'matching') {
            if (item.matchTarget) {
              html += `<div style="margin: 4pt 0 6pt 16pt; font-size: 12pt; color: #334155;"><em>${escapeHtml(item.matchTarget)}</em></div>`;
            }
            html += `<div style="margin: 8pt 0 14pt 16pt; font-size: 12pt; color: #0f172a;">
              <strong>Write Letter: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</strong>
            </div>`;
          } else if (respType === 'fill-blank') {
            html += `<div style="margin: 8pt 0 16pt 16pt; font-size: 12pt; color: #0f172a;">
              <strong>Your Answer:</strong> ____________________________________________________________
            </div>`;
          } else {
            // Written-response questions: Clearly defined writing area with sufficient vertical space!
            const isLong = respType === 'long';
            const lineCount = isLong ? 7 : 4;
            const label = isLong
              ? 'Student Extended Response / Working & Analysis:'
              : 'Student Written Response:';

            html += `<div style="margin: 10pt 0 24pt 16pt; border: 1.5pt solid #cbd5e1; background-color: #fafaf9; border-radius: 6pt; padding: 12pt 14pt;">
              <div style="font-size: 10pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10pt; letter-spacing: 0.5pt;">
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
      <h2 style="font-size: 17pt; color: #b45309; text-transform: uppercase; letter-spacing: 0.5pt; margin-bottom: 14pt;">
        Teacher Solutions & Answer Key (For Instructor Use)
      </h2>`;
    resource.teacherAnswerKey.forEach((k: any) => {
      html += `<h3 style="font-size: 13pt; color: #92400e; margin-top: 16pt; margin-bottom: 6pt;">${escapeHtml(k.activityTitle || 'Activity Answers')}</h3><ul style="margin: 4pt 0 12pt 20pt;">`;
      (k.answers || []).forEach((ans: string) => {
        html += `<li style="font-size: 12pt; color: #1e293b; margin-bottom: 4pt;">${escapeHtml(ans)}</li>`;
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
 * Downloads a structured PDF file for a Worksheet with clearly defined writing areas
 * and ample vertical space for all written-response questions.
 */
function downloadWorksheetPdf(filename: string, resource: any) {
  const cleanTitle = getCleanWorksheetTitle(resource.title, resource.topic, resource.subject);
  const meta = resolveDocumentMeta({
    subject: cleanTitle,
    documentType: 'Classroom Worksheet',
    toolUsed: 'Worksheet Tool',
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
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Top Document Heading Format: Proudly Afrikan | [Subject] [DocumentType] | [Tool]
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 122, 0); // #FF7A00
  const headingText = meta.combinedHeading;
  const splitHeading = doc.splitTextToSize(headingText, contentWidth);
  doc.text(splitHeading, margin, y + 10);
  y += splitHeading.length * 13 + 4;

  // Thin separator rule
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + contentWidth, y);
  y += 12;

  // Top header metadata: grade level & duration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 122, 0); // #FF7A00
  const headerMeta = `STUDENT CLASSROOM WORKSHEET • ${(resource.gradeLevel || 'Standard').toUpperCase()}`;
  doc.text(headerMeta, margin, y + 10);

  if (resource.estimatedTimeMinutes || resource.estimatedDurationMinutes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(75, 85, 99);
    const durationText = `Est. Duration: ${resource.estimatedTimeMinutes || resource.estimatedDurationMinutes} mins`;
    doc.text(durationText, pageWidth - margin, y + 10, { align: 'right' });
  }
  y += 18;

  // Title: strictly the TOPIC / SUBJECT TITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  const titleText = cleanTitle.toUpperCase();
  const splitTitle = doc.splitTextToSize(titleText, contentWidth);
  doc.text(splitTitle, margin, y + 14);
  y += splitTitle.length * 18 + 8;

  // Accent Line
  doc.setDrawColor(255, 122, 0); // #FF7A00
  doc.setLineWidth(2);
  doc.line(margin, y, margin + contentWidth, y);
  y += 14;

  // Description
  if (resource.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const splitDesc = doc.splitTextToSize(resource.description, contentWidth - 16);
    const descHeight = splitDesc.length * 13 + 12;
    checkPageBreak(descHeight + 10);
    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, descHeight, 4, 4, 'FD');
    doc.text(splitDesc, margin + 8, y + 12);
    y += descHeight + 12;
  }

  // Student Fill-in Box
  checkPageBreak(46);
  doc.setFillColor(250, 247, 240); // #FAF7F0
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  doc.text('Name: __________________________________', margin + 12, y + 16);
  doc.text('Date: ________________________', margin + contentWidth / 2 + 10, y + 16);
  doc.text('Class: _________________________________', margin + 12, y + 32);
  doc.text(`Score: ________ / ${resource.totalMarks || 40}`, margin + contentWidth / 2 + 10, y + 32);
  y += 52;

  // Instructions Box
  if (resource.instructions) {
    const splitInst = doc.splitTextToSize(resource.instructions, contentWidth - 20);
    const instHeight = splitInst.length * 12 + 22;
    checkPageBreak(instHeight + 12);
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(252, 211, 77); // amber-300
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentWidth, instHeight, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('GENERAL INSTRUCTIONS:', margin + 10, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text(splitInst, margin + 10, y + 24);
    y += instHeight + 14;
  }

  const activities = resource.activities || resource.exercises || [];
  if (Array.isArray(activities)) {
    activities.forEach((act: any, actIdx: number) => {
      // Activity Heading
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      const actTitle = (act.title || `Activity ${actIdx + 1}`).toUpperCase();
      doc.text(actTitle, margin, y + 12);
      y += 18;

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.line(margin, y, margin + contentWidth, y);
      y += 10;

      if (act.instructions) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(75, 85, 99);
        const splitActInst = doc.splitTextToSize(act.instructions, contentWidth);
        checkPageBreak(splitActInst.length * 13 + 4);
        doc.text(splitActInst, margin, y + 9);
        y += splitActInst.length * 13 + 8;
      }

      if (Array.isArray(act.wordBank) && act.wordBank.length > 0) {
        const wbText = `Word Bank:  ${act.wordBank.join('   •   ')}`;
        const splitWb = doc.splitTextToSize(wbText, contentWidth - 20);
        const wbHeight = splitWb.length * 13 + 12;
        checkPageBreak(wbHeight + 8);
        doc.setFillColor(245, 243, 255);
        doc.setDrawColor(199, 210, 254);
        doc.setLineWidth(0.8);
        doc.roundedRect(margin, y, contentWidth, wbHeight, 4, 4, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(49, 46, 129);
        doc.text(splitWb, margin + 10, y + 12);
        y += wbHeight + 12;
      }

      if (act.scenario) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        const splitSc = doc.splitTextToSize(act.scenario, contentWidth - 20);
        const scHeight = splitSc.length * 12 + 22;
        checkPageBreak(scHeight + 8);
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.roundedRect(margin, y, contentWidth, scHeight, 4, 4, 'FD');
        doc.setTextColor(180, 83, 9);
        doc.text('PRACTICAL SCENARIO:', margin + 10, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.text(splitSc, margin + 10, y + 24);
        y += scHeight + 12;
      }

      const items = act.items || act.questions || [];
      if (Array.isArray(items)) {
        items.forEach((item: any, itemIdx: number) => {
          const respType = getWorksheetResponseType(act, item);
          const itemNum = item.itemNumber || item.number || (itemIdx + 1);
          const promptText = `${itemNum}.  ${item.prompt || ''}`;
          const splitPrompt = doc.splitTextToSize(promptText, contentWidth - 16);
          const promptHeight = splitPrompt.length * 13 + 4;

          if (respType === 'matching') {
            const needHeight = promptHeight + (item.matchTarget ? 34 : 22) + 12;
            checkPageBreak(needHeight);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 10);
            y += promptHeight + 2;

            if (item.matchTarget) {
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(9.5);
              doc.setTextColor(75, 85, 99);
              const splitTarget = doc.splitTextToSize(item.matchTarget, contentWidth - 36);
              doc.text(splitTarget, margin + 20, y + 9);
              y += splitTarget.length * 12 + 4;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(31, 41, 55);
            doc.text('Write Letter: [ _______ ]', margin + 20, y + 10);
            y += 24; // Generous vertical space
          } else if (respType === 'fill-blank') {
            const needHeight = promptHeight + 36;
            checkPageBreak(needHeight);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 10);
            y += promptHeight + 4;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(75, 85, 99);
            doc.text('Your Answer: ______________________________________________________________', margin + 16, y + 12);
            y += 26; // Generous vertical space
          } else {
            // WRITTEN-RESPONSE QUESTIONS:
            // Clearly defined writing areas with sufficient vertical space!
            const isLong = respType === 'long';
            const lineCount = isLong ? 7 : 4;
            const lineSpacing = 22; // Spacious 22pt per line
            const boxPaddingTop = 22;
            const boxHeight = boxPaddingTop + lineCount * lineSpacing + 8; // ~118pt for medium, ~184pt for long
            const totalItemHeight = promptHeight + boxHeight + 24;

            checkPageBreak(totalItemHeight);

            // Draw Question Prompt
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(17, 24, 39);
            doc.text(splitPrompt, margin + 4, y + 10);
            y += promptHeight + 6;

            // Draw Clearly Defined Writing Box
            const boxX = margin + 12;
            const boxW = contentWidth - 12;

            doc.setFillColor(250, 250, 249); // Clean stone off-white
            doc.setDrawColor(203, 213, 225); // slate-300 border
            doc.setLineWidth(0.8);
            doc.roundedRect(boxX, y, boxW, boxHeight, 4, 4, 'FD');

            // Header label inside top of box
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate-400
            const boxLabel = isLong
              ? 'STUDENT EXTENDED RESPONSE / WORKING & ANALYSIS:'
              : 'STUDENT WRITTEN RESPONSE:';
            doc.text(boxLabel, boxX + 10, y + 13);

            // Clearly ruled horizontal lines with sufficient vertical space
            doc.setDrawColor(218, 224, 233); // light slate rule line
            doc.setLineWidth(0.6);
            for (let l = 1; l <= lineCount; l++) {
              const lineY = y + boxPaddingTop + l * lineSpacing;
              doc.line(boxX + 10, lineY, boxX + boxW - 10, lineY);
            }

            // Generous vertical margin so questions are never placed tightly together
            y += boxHeight + 24;
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
    doc.text('TEACHER SOLUTIONS & ANSWER KEY (FOR INSTRUCTOR USE)', margin, y + 14);
    y += 24;

    doc.setDrawColor(255, 122, 0); // #FF7A00
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 16;

    resource.teacherAnswerKey.forEach((k: any) => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(k.activityTitle || 'Activity Answers', margin, y + 10);
      y += 18;

      (k.answers || []).forEach((ans: string) => {
        const splitAns = doc.splitTextToSize(`•  ${ans}`, contentWidth - 16);
        checkPageBreak(splitAns.length * 13 + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);
        doc.text(splitAns, margin + 12, y + 9);
        y += splitAns.length * 13 + 4;
      });
      y += 10;
    });
  }

  // Standardized footer with clickable website hyperlink and page numbers
  renderPdfFooter(doc);

  doc.save(cleanFilename);
}

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

  if (format === 'doc' || format === 'print') {
    let html = `<p><span class="badge">${escapeHtml(resource.toolType || resource.gradeLevel || 'Study Resource')}</span></p>`;
    if (resource.description) {
      html += `<p style="font-size: 14pt; color: #333; margin-bottom: 16pt; font-weight: bold;">${escapeHtml(resource.description)}</p>`;
    }

    if (resource.studentHeader) {
      html += `<div style="border: 2px solid #ccc; padding: 12pt; margin-bottom: 16pt; font-size: 14pt; font-weight: bold;">
        <p><strong>Name:</strong> ____________________________ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Date:</strong> ____________</p>
        <p><strong>Grade / Class:</strong> _____________________ &nbsp;&nbsp;&nbsp;&nbsp; <strong>Score:</strong> _____ / ${resource.totalMarks || 40}</p>
      </div>`;
    }

    if (resource.instructions) {
      html += `<div style="background-color: #fff8e6; border-left: 4px solid #f59e0b; padding: 10pt; margin-bottom: 16pt; font-size: 14pt; font-weight: bold;">
        <p><strong>Instructions:</strong> ${escapeHtml(resource.instructions)}</p>
      </div>`;
    }

    if (Array.isArray(resource.sections)) {
      resource.sections.forEach((sec: any) => {
        html += `<h2>${escapeHtml(sec.heading)}</h2>`;
        html += `<p>${escapeHtml(sec.content)}</p>`;
      });
    }

    if (Array.isArray(resource.questions)) {
      html += `<h2>Assessment Questions</h2>`;
      resource.questions.forEach((q: any, idx: number) => {
        html += `<div class="box" style="margin-bottom: 24pt;">`;
        html += `<p><strong>Q${idx + 1}: ${escapeHtml(q.question)}</strong></p>`;
        if (Array.isArray(q.options) && q.options.length > 0) {
          html += `<ul>`;
          q.options.forEach((opt: string) => {
            const isCorrect = opt === q.correctAnswer;
            html += `<li>${escapeHtml(opt)} ${isCorrect ? '<strong>(Correct)</strong>' : ''}</li>`;
          });
          html += `</ul>`;
        } else {
          // Open-ended written question
          html += `<div style="margin: 10pt 0 16pt 0; border: 1.5pt solid #cbd5e1; background-color: #fafaf9; border-radius: 6pt; padding: 12pt 14pt;">
            <div style="font-size: 10pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8pt;">Student Written Response:</div>
            <div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%;"></div>
            <div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%;"></div>
            <div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%;"></div>
            <div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%;"></div>
            <div style="border-bottom: 1pt solid #cbd5e1; height: 26pt; width: 100%;"></div>
          </div>`;
        }
        if (q.explanation) {
          html += `<p><em>Explanation: ${escapeHtml(q.explanation)}</em></p>`;
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
    const sections: PdfSection[] = [];
    if (resource.description) {
      sections.push({
        heading: 'Overview',
        content: resource.description,
      });
    }

    if (resource.instructions) {
      sections.push({
        heading: 'Student Instructions',
        content: resource.instructions,
      });
    }

    if (Array.isArray(resource.sections)) {
      resource.sections.forEach((sec: any) => {
        sections.push({
          heading: sec.heading,
          content: sec.content,
        });
      });
    }

    if (Array.isArray(resource.questions)) {
      resource.questions.forEach((q: any, idx: number) => {
        sections.push({
          heading: `Question ${idx + 1}: ${q.question}`,
          bulletPoints: Array.isArray(q.options)
            ? q.options.map((opt: string) =>
                opt === q.correctAnswer ? `${opt} (Correct)` : opt
              )
            : undefined,
          callout: q.explanation ? `Explanation: ${q.explanation}` : undefined,
        });
      });
    }

    downloadPdfFile(filename, resource.title, sections, meta);
  }
}

export const exportItem = exportBuildResource;

