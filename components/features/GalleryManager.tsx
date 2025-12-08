'use client'

import PortfolioImagesManager from './PortfolioImagesManager'

export default function GalleryManager() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto bg-[#F5F5F7]">
        <div className="p-6">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Galería</h1>
            <p className="text-sm text-slate-600 mb-6">
              Gestiona todas las imágenes del portafolio
            </p>
            <PortfolioImagesManager />
          </div>
        </div>
      </div>
    </div>
  )
}
