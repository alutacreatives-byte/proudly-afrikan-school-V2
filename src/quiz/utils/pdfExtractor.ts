import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source for browser pdf parsing
try {
  // Use official CDN or bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch {
  // worker fallback
}

/**
 * Extracts plain text from an uploaded File (PDF or text file)
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; pageCount?: number }> {
  const fileName = file.name.toLowerCase();

  // If plain text / markdown / csv
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || (file.type.startsWith('text/') && !file.type.includes('html'))) {
    const text = await file.text();
    return { text: text.trim() };
  }

  // For doc, docx, pdf, or other document formats, use server-side parser (/api/parse-document)
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = (reader.result as string) || '';
        resolve(res.replace(/^data:[^;]+;base64,/, '').trim());
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch('/api/parse-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        base64,
        fileType: file.type || 'application/octet-stream',
        mimeType: file.type || 'application/octet-stream',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.text === 'string' && data.text.trim()) {
        const cleanText = data.text.replace(/--- Page \d+ ---/g, '').trim();
        if (cleanText.length > 0 && !cleanText.includes('\uFFFD')) {
          return { text: cleanText, pageCount: data.pageCount || 1 };
        }
      }
    }
  } catch (parseErr) {
    console.warn('Server parse-document error:', parseErr);
  }

  // Client-side PDF fallback if server parse failed
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      let fullText = '';
      const pagesToExtract = Math.min(totalPages, 25);
      for (let pageNum = 1; pageNum <= pagesToExtract; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += `${pageItems}\n\n`;
      }
      const cleanText = fullText.trim();
      if (cleanText.length > 0 && !cleanText.includes('\uFFFD')) {
        return { text: cleanText, pageCount: totalPages };
      }
    } catch (pdfErr: any) {
      console.warn('PDF client fallback error:', pdfErr);
    }
  }

  throw new Error(`Unable to extract readable text from ${file.name}. Please ensure the document is not password-protected or corrupted, or paste the text directly.`);
}
