
export async function compressImage(
  file: File, 
  maxWidth: number = 1920, 
  quality: number = 0.8
): Promise<File> {
  // If not an image, return original
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const elem = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }

        elem.width = width
        elem.height = height

        const ctx = elem.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        
        ctx.canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(newFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}
