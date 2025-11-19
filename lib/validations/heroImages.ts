// lib/validations/heroImages.ts
import { z } from 'zod'

export const heroImageSchema = z.object({
  url: z.string()
    .url('Debe ser una URL válida')
    .min(1, 'La URL es requerida'),
  
  thumbnail_url: z.string()
    .url('Debe ser una URL válida')
    .optional(),
  
  title: z.string()
    .max(200, 'El título es demasiado largo')
    .optional(),
  
  alt: z.string()
    .min(3, 'El texto alternativo debe tener al menos 3 caracteres')
    .max(200, 'El texto alternativo es demasiado largo')
    .optional(),
  
  width: z.number().int().positive().optional(),
  
  height: z.number().int().positive().optional(),
  
  order: z.number().int().min(0).default(0),
  
  is_visible: z.boolean().default(true),
})

export type HeroImageFormData = z.infer<typeof heroImageSchema>

// Schema para actualizar (todos opcionales)
export const updateHeroImageSchema = heroImageSchema.partial()

export type UpdateHeroImageFormData = z.infer<typeof updateHeroImageSchema>
