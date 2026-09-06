/**
 * Validates whether extracted document text is corrupted, garbled, binary, or unreadable.
 */
export function isTextCorruptedOrUnreadable(text: string | undefined | null): boolean {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length < 3) return false;

  // Count replacement characters (), null bytes, and non-whitespace control chars
  const replacementMatches = trimmed.match(/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F]/g) || [];
  if (replacementMatches.length > 3 && (replacementMatches.length / trimmed.length) > 0.03) {
    return true;
  }

  // Check printable alphanumeric + punctuation + whitespace ratio
  const printableMatches = trimmed.match(/[a-zA-Z0-9\s.,!?:;'"()\-\n\r\t/\\&%$#@+=*<>[\]{}_~`]/g) || [];
  const printableRatio = printableMatches.length / trimmed.length;
  if (printableRatio < 0.60) {
    return true;
  }

  // Detect raw binary header signatures or unparsed stream sequences
  if (trimmed.startsWith('%PDF-') && trimmed.includes('xref') && !trimmed.includes(' ')) {
    return true;
  }

  return false;
}
