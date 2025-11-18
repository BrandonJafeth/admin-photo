'use client'

import { useState } from 'react'
import AboutUsManager from '@/components/features/about-us/AboutUsManager'
import { Button } from '@/components/ui/button'

type Section = 'hero' | 'about-us' | 'contact' | 'social'

export default function ContenidoPage() {
  const [activeSection, setActiveSection] = useState<Section>('about-us')

  return (
    <div className="h-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6 gap-4">
          <Button
            variant={activeSection === 'hero' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('hero')}
            size="sm"
          >
            Hero
          </Button>
          <Button
            variant={activeSection === 'about-us' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('about-us')}
            size="sm"
          >
            Sobre Nosotros
          </Button>
          <Button
            variant={activeSection === 'contact' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('contact')}
            size="sm"
          >
            Contacto
          </Button>
          <Button
            variant={activeSection === 'social' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('social')}
            size="sm"
          >
            Redes Sociales
          </Button>
        </div>
      </div>

      {/* Contenido de cada sección */}
      <div className="h-[calc(100vh-8rem)]">
        {activeSection === 'hero' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Sección Hero</h2>
              <p className="text-muted-foreground">
                Próximamente: Editor de la sección Hero
              </p>
            </div>
          </div>
        )}

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
