// services/services.service.ts
import supabaseClient from '@/lib/supabaseClient'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { PortfolioImagesService } from './portfolio-images.service'

export interface Service {
  id: string
  title: string
  slug: string
  description: string
  detailed_description: string | null
  image: string | null
  gallery_images: string[] | null
  cta_text: string
  cta_link: string | null
  features: Record<string, unknown> | null
  pricing: Record<string, unknown> | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
  // Campos para página de servicio
  page_title?: string
  page_description?: string
  page_gallery_images?: string[]
}

export interface CreateServicePayload {
  title: string
  slug: string
  description: string
  detailed_description?: string
  image?: string
  gallery_images?: string[]
  cta_text?: string
  cta_link?: string
  features?: Record<string, unknown>
  pricing?: Record<string, unknown>
  is_active?: boolean
  order?: number
}

export interface UpdateServicePayload {
  title?: string
  slug?: string
  description?: string
  detailed_description?: string
  image?: string
  gallery_images?: string[]
  cta_text?: string
  cta_link?: string
  features?: Record<string, unknown>
  pricing?: Record<string, unknown>
  is_active?: boolean
  order?: number
  page_title?: string
  page_description?: string
  page_gallery_images?: string[]
}

/**
 * Servicio para gestionar servicios
 */
export class ServicesService {
  /**
   * Obtiene todos los servicios ordenados
   */
  static async getAll(): Promise<Service[]> {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw new Error(`Error al obtener servicios: ${error.message}`)

    return data || []
  }

  /**
   * Obtiene un servicio por ID
   */
  static async getById(id: string): Promise<Service> {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener servicio: ${error.message}`)

    return data
  }

  /**
   * Obtiene un servicio por slug
   */
  static async getBySlug(slug: string): Promise<Service> {
    const { data, error } = await supabaseClient
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw new Error(`Error al obtener servicio: ${error.message}`)

    return data
  }

  /**
   * Crea un nuevo servicio
   */
  static async create(payload: CreateServicePayload): Promise<Service> {
    const { data, error } = await supabaseClient
      .from('services')
      .insert({
        ...payload,
        order: payload.order ?? 0,
        is_active: payload.is_active ?? true,
        cta_text: payload.cta_text ?? 'SOLICITAR →',
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear servicio: ${error.message}`)

    return data
  }

  /**
   * Actualiza un servicio
   */
  static async update(id: string, payload: UpdateServicePayload): Promise<Service> {
    // Obtener el servicio actual antes de actualizar para eliminar imágenes anteriores
    const { data: currentService, error: fetchError } = await supabaseClient
      .from('services')
      .select('image, gallery_images')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener servicio: ${fetchError.message}`)

    // Eliminar imagen anterior de Cloudinary si se está reemplazando
    if (payload.image && currentService.image && payload.image !== currentService.image) {
      try {
        await deleteFromCloudinary(currentService.image)
      } catch (error) {
        console.error('Error al eliminar imagen anterior de Cloudinary:', error)
        // Continuar con la actualización aunque falle la eliminación
      }
    }

    // Eliminar imágenes de galería anteriores si se están reemplazando
    if (payload.gallery_images && 
        Array.isArray(payload.gallery_images) && 
        currentService.gallery_images && 
        Array.isArray(currentService.gallery_images)) {
      const oldUrls = currentService.gallery_images.filter(
        (url): url is string => typeof url === 'string' && !payload.gallery_images!.includes(url)
      )
      if (oldUrls.length > 0) {
        try {
          const { deleteManyFromCloudinary } = await import('@/lib/cloudinary')
          await deleteManyFromCloudinary(oldUrls)
        } catch (error) {
          console.error('Error al eliminar imágenes de galería anteriores de Cloudinary:', error)
          // Continuar con la actualización aunque falle la eliminación
        }
      }
    }

    // Actualizar el servicio
    const { data, error } = await supabaseClient
      .from('services')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar servicio: ${error.message}`)

    return data
  }

  /**
   * Elimina un servicio
   */
  static async delete(id: string): Promise<void> {
    // Obtener el servicio antes de eliminarlo para poder eliminar imágenes relacionadas
    const { data: service, error: fetchError } = await supabaseClient
      .from('services')
      .select('id, image, gallery_images')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Error al obtener servicio: ${fetchError.message}`)

    // Eliminar todas las imágenes del portafolio relacionadas al servicio
    try {
      await PortfolioImagesService.deleteByServiceId(id)
    } catch (error) {
      console.error('Error al eliminar imágenes del portafolio:', error)
      // Continuar con la eliminación del servicio aunque falle la eliminación de imágenes
    }

    // Eliminar imagen principal del servicio de Cloudinary
    if (service.image) {
      await deleteFromCloudinary(service.image)
    }

    // Eliminar imágenes de galería del servicio de Cloudinary
    if (service.gallery_images && Array.isArray(service.gallery_images)) {
      const galleryUrls = service.gallery_images.filter((url): url is string => typeof url === 'string')
      if (galleryUrls.length > 0) {
        const { deleteManyFromCloudinary } = await import('@/lib/cloudinary')
        await deleteManyFromCloudinary(galleryUrls)
      }
    }

    // Eliminar el servicio de la base de datos
    const { error } = await supabaseClient
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar servicio: ${error.message}`)
  }

  /**
   * Actualiza el orden de múltiples servicios
   */
  static async updateOrder(updates: Array<{ id: string; order: number }>): Promise<void> {
    const promises = updates.map(({ id, order }) =>
      supabaseClient
        .from('services')
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
