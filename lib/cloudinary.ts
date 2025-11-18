/**
 * Utilidades para subir imágenes a Cloudinary
 */

export interface CloudinaryUploadResponse {
  url: string
  publicId: string
  width: number
  height: number
}

/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo a subir
 * @param folder - Carpeta en Cloudinary (default: 'photography')
 * @returns URL de la imagen y metadata
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'photography'
): Promise<CloudinaryUploadResponse> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to upload image')
    }

    const data = await response.json()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Valida que el archivo sea una imagen
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize
}

/**
 * Obtiene el error de validación de imagen
 */
export function getImageValidationError(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    return 'El archivo debe ser una imagen (JPEG, PNG, WebP o GIF)'
  }

  if (file.size > maxSize) {
    return 'La imagen no debe superar 5MB'
  }

  return null
}
