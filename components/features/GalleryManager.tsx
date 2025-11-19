'use client'

import PortfolioImagesManager from './PortfolioImagesManager'

export default function GalleryManager() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Galería</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Gestión de imágenes del portafolio
            </p>
            <PortfolioImagesManager />
          </div>
        </div>
      </div>
    </div>
  )
}
