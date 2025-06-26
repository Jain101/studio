'use server';

import pdf from 'pdf-parse';

/**
 * Parses a PDF file provided as a base64 string, extracts the text,
 * and splits it into manageable chunks.
 * @param pdfBase64 The base64-encoded string of the PDF file.
 * @returns A promise that resolves to an array of text chunks.
 */
export async function getPdfTextInChunks(
  pdfBase64: string
): Promise<string[]> {
  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const data = await pdf(pdfBuffer);
    const pdfText = data.text;

    // Based on Gemini 1.5 Flash's context window, but being conservative.
    const CHUNK_SIZE = 16000;

    if (pdfText.length <= CHUNK_SIZE) {
      return [pdfText];
    }

    // Split by paragraphs to avoid breaking sentences mid-way.
    const paragraphs = pdfText.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      if (currentChunk.length + p.length + 2 > CHUNK_SIZE) {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = p;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + p;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse the PDF file.');
  }
}
