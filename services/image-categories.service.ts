import supabase from '@/lib/supabaseClient'

export interface ImageCategory {
  id: string
  name: string
  description: string | null
  created_at: string
}

export class ImageCategoriesService {
  static async getAll(): Promise<ImageCategory[]> {
    const { data, error } = await supabase
      .from('image_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(name: string, description?: string): Promise<ImageCategory> {
    const { data, error } = await supabase
      .from('image_categories')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('image_categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
