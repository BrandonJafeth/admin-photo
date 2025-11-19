// services/portfolio-images.service.ts
import supabaseClient from '@/lib/supabaseClient'
import { deleteFromCloudinary, deleteManyFromCloudinary } from '@/lib/cloudinary'

export interface PortfolioImage {
  id: string
  image_url: string
  thumbnail_url: string | null
  title: string | null
  alt: string | null
  is_featured: boolean
  featured_order: number
  order: number
  is_visible: boolean
  link_url: string | null
  created_at: string
  updated_at: string
  category_id: string | null
  service_id: string | null
}

export interface CreatePortfolioImagePayload {
  image_url: string
  thumbnail_url?: string | null
  title?: string | null
  alt?: string | null
  is_featured?: boolean
  featured_order?: number
  order?: number
  is_visible?: boolean
  link_url?: string | null
  category_id?: string | null
  service_id?: string | null
}

export interface UpdatePortfolioImagePayload {
  image_url?: string
  thumbnail_url?: string | null
  title?: string | null
  alt?: string | null
  is_featured?: boolean
  featured_order?: number
  order?: number
  is_visible?: boolean
  link_url?: string | null
  category_id?: string | null
  service_id?: string | null
}

/**
 * Servicio para gestionar imágenes del portafolio vinculadas a servicios
 */
export class PortfolioImagesService {
  /**
   * Obtiene todas las imágenes del portafolio
   */
  static async getAll(): Promise<PortfolioImage[]> {
    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw new Error(`Error al obtener imágenes: ${error.message}`)

    return data || []
  }

  /**
   * Obtiene todas las imágenes de un servicio
   */
  static async getByServiceId(serviceId: string): Promise<PortfolioImage[]> {
    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .select('*')
      .eq('service_id', serviceId)
      .order('order', { ascending: true })

    if (error) throw new Error(`Error al obtener imágenes: ${error.message}`)

    return data || []
  }

  /**
   * Obtiene una imagen por ID
   */
  static async getById(id: string): Promise<PortfolioImage> {
    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener imagen: ${error.message}`)

    return data
  }

  /**
   * Crea una nueva imagen del portafolio
   */
  static async create(payload: CreatePortfolioImagePayload): Promise<PortfolioImage> {
    // Obtener el siguiente order disponible
    let nextOrder = 0
    if (payload.service_id) {
      const existingImages = await this.getByServiceId(payload.service_id)
      nextOrder = existingImages.length > 0 
        ? Math.max(...existingImages.map(img => img.order)) + 1 
        : 0
    } else {
      // Si no tiene service_id, obtener el máximo order de todas las imágenes
      const allImages = await this.getAll()
      nextOrder = allImages.length > 0 
        ? Math.max(...allImages.map(img => img.order)) + 1 
        : 0
    }

    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .insert({
        ...payload,
        order: payload.order ?? nextOrder,
        is_visible: payload.is_visible ?? true,
        is_featured: payload.is_featured ?? false,
        featured_order: payload.featured_order ?? 0,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear imagen: ${error.message}`)

    return data
  }

  /**
   * Crea múltiples imágenes del portafolio
   */
  static async createMany(payloads: CreatePortfolioImagePayload[]): Promise<PortfolioImage[]> {
    if (payloads.length === 0) return []

    const serviceId = payloads[0].service_id
    
    // Obtener el siguiente order disponible
    const existingImages = await this.getByServiceId(serviceId)
    let nextOrder = existingImages.length > 0 
      ? Math.max(...existingImages.map(img => img.order)) + 1 
      : 0

    const imagesWithOrder = payloads.map((payload, index) => ({
      ...payload,
      order: payload.order ?? nextOrder + index,
      is_visible: payload.is_visible ?? true,
      is_featured: payload.is_featured ?? false,
      featured_order: payload.featured_order ?? 0,
    }))

    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .insert(imagesWithOrder)
      .select()

    if (error) throw new Error(`Error al crear imágenes: ${error.message}`)

    return data || []
  }

  /**
   * Actualiza una imagen del portafolio
   */
  static async update(id: string, payload: UpdatePortfolioImagePayload): Promise<PortfolioImage> {
    // Obtener la imagen actual antes de actualizar para eliminar imagen anterior
    const { data: currentImage, error: fetchError } = await supabaseClient
      .from('portfolio_images')
      .select('image_url, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener imagen: ${fetchError.message}`)

    // Eliminar imagen anterior de Cloudinary si se está reemplazando
    if (payload.image_url && 
        currentImage.image_url && 
        payload.image_url !== currentImage.image_url) {
      try {
        const urlsToDelete = [currentImage.image_url]
        if (currentImage.thumbnail_url) {
          urlsToDelete.push(currentImage.thumbnail_url)
        }
        await deleteManyFromCloudinary(urlsToDelete)
      } catch (error) {
        console.error('Error al eliminar imagen anterior de Cloudinary:', error)
        // Continuar con la actualización aunque falle la eliminación
      }
    }

    // Actualizar la imagen
    const { data, error } = await supabaseClient
      .from('portfolio_images')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar imagen: ${error.message}`)

    return data
  }

  /**
   * Elimina una imagen del portafolio
   */
  static async delete(id: string): Promise<void> {
    // Obtener la imagen antes de eliminarla para poder eliminar de Cloudinary
    const { data: image, error: fetchError } = await supabaseClient
      .from('portfolio_images')
      .select('image_url, thumbnail_url')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener imagen: ${fetchError.message}`)

    // Eliminar de Cloudinary
    if (image) {
      const urlsToDelete = [image.image_url]
      if (image.thumbnail_url) {
        urlsToDelete.push(image.thumbnail_url)
      }
      await deleteManyFromCloudinary(urlsToDelete)
    }

    // Eliminar de la base de datos
    const { error } = await supabaseClient
      .from('portfolio_images')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar imagen: ${error.message}`)
  }

  /**
   * Actualiza el orden de múltiples imágenes
   */
  static async updateOrder(updates: Array<{ id: string; order: number }>): Promise<void> {
    const promises = updates.map(({ id, order }) =>
      supabaseClient
        .from('portfolio_images')
        .update({ order, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      throw new Error(`Error al actualizar orden: ${errors[0].error?.message}`)
    }
  }

  /**
   * Elimina todas las imágenes de un servicio
   */
  static async deleteByServiceId(serviceId: string): Promise<void> {
    // Obtener todas las imágenes antes de eliminarlas
    const { data: images, error: fetchError } = await supabaseClient
      .from('portfolio_images')
      .select('image_url, thumbnail_url')
      .eq('service_id', serviceId)

    if (fetchError) throw new Error(`Error al obtener imágenes: ${fetchError.message}`)

    // Eliminar de Cloudinary
    if (images && images.length > 0) {
      const urlsToDelete = images.flatMap(img => {
        const urls = [img.image_url]
        if (img.thumbnail_url) {
          urls.push(img.thumbnail_url)
        }
        return urls
      })
      await deleteManyFromCloudinary(urlsToDelete)
    }

    // Eliminar de la base de datos
    const { error } = await supabaseClient
      .from('portfolio_images')
      .delete()
      .eq('service_id', serviceId)

    if (error) throw new Error(`Error al eliminar imágenes: ${error.message}`)
  }
}

