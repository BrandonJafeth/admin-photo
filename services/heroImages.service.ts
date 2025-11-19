// services/heroImages.service.ts
import supabaseClient from '@/lib/supabaseClient'
import { deleteFromCloudinary } from '@/lib/cloudinary'

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
    // Obtener la imagen actual antes de actualizar para eliminar imagen anterior
    const { data: currentImage, error: fetchError } = await supabaseClient
      .from('hero_images')
      .select('url, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener imagen: ${fetchError.message}`)

    // Eliminar imagen anterior de Cloudinary si se está reemplazando
    if (payload.url && currentImage.url && payload.url !== currentImage.url) {
      try {
        const urlsToDelete = [currentImage.url]
        if (currentImage.thumbnail_url) {
          urlsToDelete.push(currentImage.thumbnail_url)
        }
        const { deleteManyFromCloudinary } = await import('@/lib/cloudinary')
        await deleteManyFromCloudinary(urlsToDelete)
      } catch (error) {
        console.error('Error al eliminar imagen anterior de Cloudinary:', error)
        // Continuar con la actualización aunque falle la eliminación
      }
    }

    // Actualizar la imagen
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
    // Obtener la imagen antes de eliminarla para poder eliminar de Cloudinary
    const { data: image, error: fetchError } = await supabaseClient
      .from('hero_images')
      .select('url, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener imagen: ${fetchError.message}`)

    // Eliminar de Cloudinary
    if (image && image.url) {
      try {
        // Eliminar la imagen principal
        const deleted = await deleteFromCloudinary(image.url)
        
        if (!deleted) {
          console.warn(`No se pudo eliminar la imagen de Cloudinary: ${image.url}`)
        }

        // El thumbnail_url generalmente es una transformación de la misma imagen,
        // así que no necesitamos eliminarlo por separado
        // Solo eliminamos si es una URL diferente (no una transformación)
        if (image.thumbnail_url && 
            image.thumbnail_url !== image.url && 
            !image.thumbnail_url.includes(image.url.split('/').pop() || '')) {
          const thumbnailDeleted = await deleteFromCloudinary(image.thumbnail_url)
          if (!thumbnailDeleted) {
            console.warn(`No se pudo eliminar el thumbnail de Cloudinary: ${image.thumbnail_url}`)
          }
        }
      } catch (error) {
        console.error('Error al eliminar de Cloudinary:', error)
        // Continuar con la eliminación de la BD aunque falle Cloudinary
      }
    }

    // Eliminar de la base de datos
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
