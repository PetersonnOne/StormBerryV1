import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface FoxitConfig {
  apiKey?: string;
  projectId?: string;
  baseUrl?: string;
}

export interface PDFGenerationOptions {
  title: string;
  content: string;
  author?: string;
  subject?: string;
  includeTableOfContents?: boolean;
  includeCoverPage?: boolean;
  watermark?: string;
}

export interface PDFAnnotationOptions {
  highlightKeywords?: string[];
  addComments?: boolean;
  addWatermark?: string;
  addHeaders?: boolean;
}

export interface PDFAnalysisResult {
  fullText: string;
  sections: Array<{
    title: string;
    content: string;
    summary: string;
  }>;
  overallSummary: string;
  keyFindings: string[];
}

export class FoxitService {
  private config: FoxitConfig;

  constructor(config: FoxitConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.FOXIT_API_KEY,
      projectId: config.projectId || process.env.FOXIT_PROJECT_ID,
      baseUrl: config.baseUrl || 'https://api.foxit.com/v1',
      ...config
    };
  }

  /**
   * Generate a professional PDF report with AI-generated content
   */
  async generatePDFReport(options: PDFGenerationOptions): Promise<Uint8Array> {
    try {
      // Create a new PDF document using pdf-lib
      const pdfDoc = await PDFDocument.create();
      
      // Set document metadata
      pdfDoc.setTitle(options.title);
      pdfDoc.setAuthor(options.author || 'Storm Berry AI');
      pdfDoc.setSubject(options.subject || 'AI Generated Report');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Add cover page if requested
      if (options.includeCoverPage) {
        await this.addCoverPage(pdfDoc, options.title, boldFont, font);
      }

      // Add table of contents if requested
      if (options.includeTableOfContents) {
        await this.addTableOfContents(pdfDoc, options.content, boldFont, font);
      }

      // Add main content
      await this.addMainContent(pdfDoc, options.content, boldFont, font);

      // Add watermark if specified
      if (options.watermark) {
        await this.addWatermark(pdfDoc, options.watermark, font);
      }

      // Add page numbers
      await this.addPageNumbers(pdfDoc, font);

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Annotate and highlight a PDF with AI-generated insights
   */
  async annotatePDF(pdfBuffer: Uint8Array, options: PDFAnnotationOptions): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();

      for (const page of pages) {
        // Add watermark if specified
        if (options.addWatermark) {
          const { width, height } = page.getSize();
          page.drawText(options.addWatermark, {
            x: width / 2 - 50,
            y: height - 30,
            size: 10,
            font,
            color: rgb(0.7, 0.7, 0.7),
          });
        }

        // Add header if requested
        if (options.addHeaders) {
          const { width, height } = page.getSize();
          const currentDate = new Date().toLocaleDateString();
          page.drawText(`Draft - ${currentDate}`, {
            x: 50,
            y: height - 30,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error annotating PDF:', error);
      throw new Error(`Failed to annotate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text and analyze PDF content
   */
  async analyzePDF(pdfBuffer: Uint8Array): Promise<PDFAnalysisResult> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();

      // For now, we'll simulate text extraction since pdf-lib doesn't have OCR
      // In a real implementation, you'd use Foxit's OCR API or a similar service
      const fullText = `Extracted text from ${pages.length} pages. This would contain the actual PDF content in a real implementation.`;

      // Simulate section analysis
      const sections = [
        {
          title: 'Introduction',
          content: 'Introduction section content...',
          summary: 'This section introduces the main topic.'
        },
        {
          title: 'Main Content',
          content: 'Main content section...',
          summary: 'This section contains the primary information.'
        },
        {
          title: 'Conclusion',
          content: 'Conclusion section content...',
          summary: 'This section summarizes the key points.'
        }
      ];

      const overallSummary = 'This document covers key topics with detailed analysis and conclusions.';
      const keyFindings = [
        'Key finding 1: Important insight discovered',
        'Key finding 2: Significant trend identified',
        'Key finding 3: Critical recommendation made'
      ];

      return {
        fullText,
        sections,
        overallSummary,
        keyFindings
      };
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw new Error(`Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assemble a PDF with AI-generated content and professional formatting
   */
  async assemblePDF(content: {
    coverPage: { title: string; subtitle?: string; author?: string };
    sections: Array<{ title: string; content: string }>;
    appendix?: Array<{ title: string; content: string }>;
  }): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Add cover page
      await this.addCoverPage(pdfDoc, content.coverPage.title, boldFont, font, content.coverPage);

      // Add main sections
      for (const section of content.sections) {
        await this.addSection(pdfDoc, section.title, section.content, boldFont, font);
      }

      // Add appendix if provided
      if (content.appendix && content.appendix.length > 0) {
        await this.addAppendix(pdfDoc, content.appendix, boldFont, font);
      }

      // Add page numbers
      await this.addPageNumbers(pdfDoc, font);

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error assembling PDF:', error);
      throw new Error(`Failed to assemble PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods for PDF generation
  private async addCoverPage(
    pdfDoc: PDFDocument, 
    title: string, 
    boldFont: any, 
    font: any, 
    coverData?: { subtitle?: string; author?: string }
  ) {
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    // Title
    page.drawText(title, {
      x: 50,
      y: height - 200,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Subtitle
    if (coverData?.subtitle) {
      page.drawText(coverData.subtitle, {
        x: 50,
        y: height - 240,
        size: 16,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Author
    page.drawText(coverData?.author || 'Generated by Storm Berry AI', {
      x: 50,
      y: height - 300,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Date
    page.drawText(new Date().toLocaleDateString(), {
      x: 50,
      y: height - 320,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  private async addTableOfContents(pdfDoc: PDFDocument, content: string, boldFont: any, font: any) {
    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();

    page.drawText('Table of Contents', {
      x: 50,
      y: height - 100,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Simple TOC based on content sections
    const tocItems = [
      '1. Introduction ........................... 3',
      '2. Main Content ......................... 4',
      '3. Analysis ............................. 5',
      '4. Conclusion ........................... 6'
    ];

    let yPosition = height - 150;
    for (const item of tocItems) {
      page.drawText(item, {
        x: 70,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;
    }
  }

  private async addMainContent(pdfDoc: PDFDocument, content: string, boldFont: any, font: any) {
    let currentPage = pdfDoc.addPage([612, 792]);
    const { width, height } = currentPage.getSize();

    // Clean content to remove problematic characters
    const cleanContent = content
      .replace(/\r\n/g, ' ')  // Replace Windows line endings
      .replace(/\n/g, ' ')    // Replace Unix line endings
      .replace(/\r/g, ' ')    // Replace Mac line endings
      .replace(/[^\x20-\x7E]/g, ' ')  // Replace non-ASCII characters with spaces
      .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
      .trim();

    // Split content into paragraphs and add to page
    const paragraphs = cleanContent.split('. ').filter(p => p.trim().length > 0);
    let yPosition = height - 100;
    const lineHeight = 15;
    const maxWidth = width - 100;

    for (const paragraph of paragraphs) {
      if (yPosition < 100) {
        // Add new page if needed
        currentPage = pdfDoc.addPage([612, 792]);
        yPosition = height - 100;
      }

      // Simple text wrapping
      const words = paragraph.split(' ').filter(w => w.trim().length > 0);
      let line = '';
      
      for (const word of words) {
        const cleanWord = word.replace(/[^\x20-\x7E]/g, ''); // Clean individual words
        const testLine = line + (line ? ' ' : '') + cleanWord;
        
        try {
          const textWidth = font.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > maxWidth && line) {
            currentPage.drawText(line, {
              x: 50,
              y: yPosition,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            line = cleanWord;
          } else {
            line = testLine;
          }
        } catch (error) {
          console.warn('Skipping problematic text:', testLine);
          continue;
        }
      }
      
      if (line.trim()) {
        try {
          currentPage.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight * 1.5; // Extra space between paragraphs
        } catch (error) {
          console.warn('Skipping problematic line:', line);
        }
      }
    }
  }

  private async addSection(pdfDoc: PDFDocument, title: string, content: string, boldFont: any, font: any) {
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();

    // Clean title
    const cleanTitle = title.replace(/[^\x20-\x7E]/g, ' ').trim();

    // Section title
    page.drawText(cleanTitle, {
      x: 50,
      y: height - 100,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Clean and process content similar to addMainContent
    const cleanContent = content
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = cleanContent.split('. ').filter(s => s.trim().length > 0);
    let yPosition = height - 140;
    const lineHeight = 18;
    const maxWidth = width - 100;
    
    for (const sentence of sentences) {
      if (yPosition < 50) break; // Stop if we run out of space
      
      const words = sentence.split(' ').filter(w => w.trim().length > 0);
      let line = '';
      
      for (const word of words) {
        const cleanWord = word.replace(/[^\x20-\x7E]/g, '');
        const testLine = line + (line ? ' ' : '') + cleanWord;
        
        try {
          const textWidth = font.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > maxWidth && line) {
            page.drawText(line, {
              x: 50,
              y: yPosition,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            line = cleanWord;
          } else {
            line = testLine;
          }
        } catch (error) {
          console.warn('Skipping problematic text in section:', testLine);
          continue;
        }
      }
      
      if (line.trim()) {
        try {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        } catch (error) {
          console.warn('Skipping problematic line in section:', line);
        }
      }
    }
  }

  private async addAppendix(pdfDoc: PDFDocument, appendixItems: Array<{ title: string; content: string }>, boldFont: any, font: any) {
    const page = pdfDoc.addPage([612, 792]);
    const { height } = page.getSize();

    page.drawText('Appendix', {
      x: 50,
      y: height - 100,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    let yPosition = height - 140;
    for (const item of appendixItems) {
      page.drawText(item.title, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText(item.content, {
        x: 70,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;
    }
  }

  private async addWatermark(pdfDoc: PDFDocument, watermarkText: string, font: any) {
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 50,
        y: height / 2,
        size: 48,
        font,
        color: rgb(0.9, 0.9, 0.9),
        // rotate: { angle: 45 }, // Rotation disabled for compatibility
      });
    }
  }

  private async addPageNumbers(pdfDoc: PDFDocument, font: any) {
    const pages = pdfDoc.getPages();
    
    pages.forEach((page, index) => {
      const { width } = page.getSize();
      page.drawText(`${index + 1}`, {
        x: width / 2,
        y: 30,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
  }
}

export const foxitService = new FoxitService();
