// services/heroImages.service.ts
import supabaseClient from '@/lib/supabaseClient'

export interface HeroImage {
  id: string
  url: string
  thumbnail_url: string | null
  title: string | null
  alt: string | null
  width: number | null
  height: number | null
  order: number
  is_visible: boolean
  uploaded_at: string
  updated_at: string
}

export interface CreateHeroImagePayload {
  url: string
  thumbnail_url?: string
  title?: string
  alt?: string
  width?: number
  height?: number
  order?: number
  is_visible?: boolean
}

export interface UpdateHeroImagePayload {
  url?: string
  thumbnail_url?: string
  title?: string
  alt?: string
  width?: number
  height?: number
  order?: number
  is_visible?: boolean
}

/**
 * Servicio para gestionar imágenes del hero
 */
export class HeroImagesService {
  /**
   * Obtiene todas las imágenes del hero ordenadas
   */
  static async getAll(): Promise<HeroImage[]> {
    const { data, error } = await supabaseClient
      .from('hero_images')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw new Error(`Error al obtener imágenes del hero: ${error.message}`)

    return data || []
  }

  /**
   * Obtiene una imagen del hero por ID
   */
  static async getById(id: string): Promise<HeroImage> {
    const { data, error } = await supabaseClient
      .from('hero_images')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener imagen del hero: ${error.message}`)

    return data
  }

  /**
   * Crea una nueva imagen del hero
   */
  static async create(payload: CreateHeroImagePayload): Promise<HeroImage> {
    const { data, error } = await supabaseClient
      .from('hero_images')
      .insert({
        ...payload,
        order: payload.order ?? 0,
        is_visible: payload.is_visible ?? true,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear imagen del hero: ${error.message}`)

    return data
  }

  /**
   * Actualiza una imagen del hero
   */
  static async update(id: string, payload: UpdateHeroImagePayload): Promise<HeroImage> {
    const { data, error } = await supabaseClient
      .from('hero_images')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar imagen del hero: ${error.message}`)

    return data
  }

  /**
   * Elimina una imagen del hero
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('hero_images')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar imagen del hero: ${error.message}`)
  }

  /**
   * Actualiza el orden de múltiples imágenes
   */
  static async updateOrder(updates: Array<{ id: string; order: number }>): Promise<void> {
    const promises = updates.map(({ id, order }) =>
      supabaseClient
        .from('hero_images')
        .update({ order, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      throw new Error(`Error al actualizar orden: ${errors[0].error?.message}`)
    }
  }
}
