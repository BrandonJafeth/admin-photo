'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'

type ImageFile = {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'uploaded' | 'error'
  url?: string
  error?: string
}

interface MultiImageUploaderProps {
  maxFiles?: number
  onUploadComplete: (urls: string[]) => void
  initialImages?: string[]
  disabled?: boolean
}

export function MultiImageUploader({
  maxFiles = 10,
  onUploadComplete,
  initialImages = [],
  disabled = false,
}: MultiImageUploaderProps) {
  const [files, setFiles] = useState<ImageFile[]>(() =>
    initialImages.map((url) => ({
      id: `existing-${url}`,
      file: new File([], ''),
      preview: url,
      status: 'uploaded' as const,
      url,
    }))
  )
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (newFiles: FileList) => {
      const validFiles = Array.from(newFiles).filter(
        (file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
      )

      const newImageFiles: ImageFile[] = validFiles.slice(0, maxFiles - files.length).map((file) => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading' as const,
      }))

      setFiles((prev) => {
        const updatedFiles = [...prev, ...newImageFiles]
        return updatedFiles.slice(0, maxFiles)
      })

      // Subir cada imagen a Cloudinary
      const uploadPromises = newImageFiles.map(async (imgFile) => {
        try {
          const result = await uploadToCloudinary(imgFile.file, 'services/gallery')
          return { ...imgFile, status: 'uploaded' as const, url: result.url }
        } catch (error) {
          console.error('Error uploading image:', error)
          return {
            ...imgFile,
            status: 'error' as const,
            error: 'Error al subir la imagen',
          }
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)

      setFiles((prev) => {
        const updatedFiles = [...prev]
        uploadedFiles.forEach((uploaded) => {
          const index = updatedFiles.findIndex((f) => f.id === uploaded.id)
          if (index !== -1) {
            updatedFiles[index] = uploaded
          }
        })
        return updatedFiles
      })

      // Notificar URLs de las imágenes subidas correctamente
      const successfulUploads = uploadedFiles.filter((f) => f.status === 'uploaded')
      if (successfulUploads.length > 0) {
        const urls = successfulUploads.map((f) => f.url!).filter(Boolean)
        onUploadComplete([...initialImages, ...urls])
      }
    },
    [files.length, initialImages, maxFiles, onUploadComplete]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const removeImage = (id: string) => {
    setFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== id)
      // Notificar URLs actualizadas
      const urls = newFiles.filter((f) => f.status === 'uploaded').map((f) => f.url!)
      onUploadComplete(urls)
      return newFiles
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const remainingSlots = maxFiles - files.length

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="space-y-2">
          <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div className="text-sm text-muted-foreground">
            {isDragging ? (
              <p>Suelta las imágenes aquí</p>
            ) : (
              <p>
                <span className="font-medium text-foreground">Haz clic para subir</span> o arrastra y suelta
              </p>
            )}
            <p className="text-xs mt-1">
              Soporta JPG, PNG, WebP (máx. 5MB cada una). Máx. {maxFiles} imágenes.
            </p>
            {remainingSlots > 0 && remainingSlots < maxFiles && (
              <p className="text-xs text-muted-foreground mt-2">
                Puedes agregar {remainingSlots} {remainingSlots === 1 ? 'imagen más' : 'imágenes más'}
              </p>
            )}
            {remainingSlots === 0 && (
              <p className="text-xs text-destructive mt-2">
                Has alcanzado el límite de {maxFiles} imágenes
              </p>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={disabled || remainingSlots === 0}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((file) => (
            <div key={file.id} className="relative group aspect-square">
              <div className="relative w-full h-full rounded-md overflow-hidden border">
                <img
                  src={file.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/80 text-white text-xs p-2 flex items-center justify-center text-center">
                    Error al subir
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(file.id)
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
