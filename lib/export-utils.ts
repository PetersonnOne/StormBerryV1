import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export interface ExportableContent {
  title: string
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  content?: string
  metadata?: {
    exportDate: Date
    module: string
    [key: string]: any
  }
}

export async function exportToPDF(data: ExportableContent): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  
  let yPosition = margin
  
  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.title, margin, yPosition)
  yPosition += 15
  
  // Export metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Exported: ${data.metadata?.exportDate.toLocaleString()}`, margin, yPosition)
  doc.text(`Module: ${data.metadata?.module}`, margin, yPosition + 5)
  yPosition += 20
  
  // Content
  doc.setFontSize(12)
  
  if (data.messages) {
    // Chat format
    data.messages.forEach((message) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        yPosition = margin
      }
      
      // Role header
      doc.setFont('helvetica', 'bold')
      const roleText = message.role === 'user' ? 'You' : 'AI Assistant'
      doc.text(`${roleText} (${message.timestamp.toLocaleTimeString()}):`, margin, yPosition)
      yPosition += 8
      
      // Message content
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(message.content, maxWidth)
      doc.text(lines, margin, yPosition)
      yPosition += (lines.length * 5) + 10
    })
  } else if (data.content) {
    // Single content format
    const lines = doc.splitTextToSize(data.content, maxWidth)
    doc.text(lines, margin, yPosition)
  }
  
  return doc.output('blob')
}

export async function exportToDOCX(data: ExportableContent): Promise<Blob> {
  const children: Paragraph[] = []
  
  // Title
  children.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.TITLE,
    })
  )
  
  // Metadata
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported: ${data.metadata?.exportDate.toLocaleString()}`,
          size: 20,
        }),
      ],
    })
  )
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Module: ${data.metadata?.module}`,
          size: 20,
        }),
      ],
    })
  )
  
  // Add spacing
  children.push(new Paragraph({ text: "" }))
  
  if (data.messages) {
    // Chat format
    data.messages.forEach((message) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${message.role === 'user' ? 'You' : 'AI Assistant'} (${message.timestamp.toLocaleTimeString()}):`,
              bold: true,
            }),
          ],
        })
      )
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: message.content,
            }),
          ],
        })
      )
      
      children.push(new Paragraph({ text: "" })) // Spacing
    })
  } else if (data.content) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.content,
          }),
        ],
      })
    )
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })
  
  return await Packer.toBlob(doc)
}

export async function saveFile(blob: Blob, filename: string): Promise<void> {
  // Try File System Access API first (modern browsers)
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Documents',
          accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          },
        }],
      })
      
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (error) {
      // User cancelled or API not supported, fall back to download
    }
  }
  
  // Fallback: trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
