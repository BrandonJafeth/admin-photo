// lib/validations/aboutUs.ts
import { z } from 'zod'

export const aboutUsSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título es demasiado largo'),
  
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción es demasiado larga'),
  
  image_url: z.string().optional(),
  
  image_alt: z.string()
    .max(200, 'El texto alternativo es demasiado largo')
    .optional(),
  
  is_active: z.boolean(),
  
  order: z.number().int().min(0),
})

export type AboutUsFormData = z.infer<typeof aboutUsSchema>
