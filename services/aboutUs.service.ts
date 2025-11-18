// services/aboutUs.service.ts
import supabaseClient from '@/lib/supabaseClient'

export interface AboutUs {
  id: string
  image_url: string | null
  image_alt: string | null
  title: string | null
  description: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface UpdateAboutUsPayload {
  image_url?: string
  image_alt?: string
  title?: string
  description?: string
  is_active?: boolean
  order?: number
}

/**
 * Servicio para gestionar la información de About Us
 */
export class AboutUsService {
  /**
   * Obtiene todos los registros de About Us
   */
  static async getAll(): Promise<AboutUs[]> {
    const { data, error } = await supabaseClient
      .from('about_us')
      .select('*')
      .order('order', { ascending: true })

    if (error) throw new Error(`Error al obtener About Us: ${error.message}`)

    return data || []
  }

  /**
   * Obtiene el About Us activo
   */
  static async getActive(): Promise<AboutUs | null> {
    const { data, error } = await supabaseClient
      .from('about_us')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No data found
      throw new Error(`Error al obtener About Us activo: ${error.message}`)
    }

    return data
  }

  /**
   * Obtiene un About Us por ID
   */
  static async getById(id: string): Promise<AboutUs> {
    const { data, error } = await supabaseClient
      .from('about_us')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener About Us: ${error.message}`)

    return data
  }

  /**
   * Actualiza un About Us existente
   */
  static async update(id: string, payload: UpdateAboutUsPayload): Promise<AboutUs> {
    const { data, error } = await supabaseClient
      .from('about_us')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar About Us: ${error.message}`)

    return data
  }

  /**
   * Crea un nuevo About Us
   */
  static async create(payload: Omit<UpdateAboutUsPayload, 'id'>): Promise<AboutUs> {
    const { data, error } = await supabaseClient
      .from('about_us')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(`Error al crear About Us: ${error.message}`)

    return data
  }

  /**
   * Elimina un About Us
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from('about_us')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar About Us: ${error.message}`)
  }
}
