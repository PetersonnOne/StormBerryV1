'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, File } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ExportableContent, exportToPDF, exportToDOCX, saveFile } from '@/lib/export-utils'

interface ExportButtonProps {
  data: ExportableContent
  filename?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export function ExportButton({ 
  data, 
  filename = 'export', 
  variant = 'ghost', 
  size = 'sm' 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'pdf' | 'docx') => {
    setIsExporting(true)
    
    try {
      let blob: Blob
      let fileExtension: string
      
      if (format === 'pdf') {
        blob = await exportToPDF(data)
        fileExtension = '.pdf'
      } else {
        blob = await exportToDOCX(data)
        fileExtension = '.docx'
      }
      
      const finalFilename = filename.includes('.') 
        ? filename.replace(/\.[^/.]+$/, fileExtension)
        : filename + fileExtension
      
      await saveFile(blob, finalFilename)
      toast.success(`Successfully exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export as ${format.toUpperCase()}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')}>
          <File className="h-4 w-4 mr-2" />
          Export as DOCX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
