'use client'

import { useState } from 'react'
import AboutUsManager from '@/components/features/about-us/AboutUsManager'
import HeroImagesManager from '@/components/features/hero-images/HeroImagesManager'
import { Button } from '@/components/ui/button'

type Section = 'hero' | 'about-us' | 'contact' | 'social'

export default function ContenidoPage() {
  const [activeSection, setActiveSection] = useState<Section>('about-us')

  return (
    <div className="h-full bg-[#F5F5F7]">
      <div className="border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center px-6 gap-4">
          <Button
            variant={activeSection === 'hero' ? 'default' : 'outline'}
            onClick={() => setActiveSection('hero')}
            size="sm"
          >
            Hero
          </Button>
          <Button
            variant={activeSection === 'about-us' ? 'default' : 'outline'}
            onClick={() => setActiveSection('about-us')}
            size="sm"
          >
            Sobre Nosotros
          </Button>
        </div>
      </div>

      {/* Contenido de cada sección */}
      <div className="">
        {activeSection === 'hero' && <HeroImagesManager />}

        {activeSection === 'about-us' && <AboutUsManager />}

        {activeSection === 'contact' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Información de Contacto</h2>
              <p className="text-muted-foreground">
                Próximamente: Editor de información de contacto
              </p>
            </div>
          </div>
        )}

        {activeSection === 'social' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Redes Sociales</h2>
              <p className="text-muted-foreground">
                Próximamente: Editor de enlaces a redes sociales
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
