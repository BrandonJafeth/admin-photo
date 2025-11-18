// services/services.service.ts
import supabaseClient from '@/lib/supabaseClient'

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
