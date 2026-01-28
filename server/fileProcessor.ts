import mammoth from "mammoth";
import * as pdfParse from "pdf-parse";

/**
 * Extract text from DOCX file buffer
 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("[FileProcessor] DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX file");
  }
}

/**
 * Extract text from PDF file buffer
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await (pdfParse as any).default(buffer);
    return data.text.trim();
  } catch (error) {
    console.error("[FileProcessor] PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF file");
  }
}

/**
 * Extract text from Markdown file buffer
 */
export function extractMarkdownText(buffer: Buffer): string {
  try {
    return buffer.toString("utf-8").trim();
  } catch (error) {
    console.error("[FileProcessor] Markdown extraction error:", error);
    throw new Error("Failed to extract text from Markdown file");
  }
}

/**
 * Process file based on its type and extract text content
 */
export async function processFile(
  buffer: Buffer,
  fileType: "docx" | "markdown" | "pdf"
): Promise<string> {
  switch (fileType) {
    case "docx":
      return await extractDocxText(buffer);
    case "pdf":
      return await extractPdfText(buffer);
    case "markdown":
      return extractMarkdownText(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Determine file type from filename extension
 */
export function getFileType(filename: string): "docx" | "markdown" | "pdf" | null {
  const ext = filename.toLowerCase().split(".").pop();
  
  if (ext === "docx") return "docx";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "pdf") return "pdf";
  
  return null;
}
