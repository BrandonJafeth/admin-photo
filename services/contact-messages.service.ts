import supabaseClient from '@/lib/supabaseClient'

export interface ContactMessage {
    id: string
    name: string
    email: string
    phone: string | null
    message: string
    status: 'pending' | 'read' | 'responded' | 'archived'
    responded_at: string | null
    response: string | null
    notes: string | null
    created_at: string
    updated_at: string
    service_type: string | null
    event_date: string | null
    how_found_us: string | null
}

export interface UpdateMessageStatusPayload {
    status: 'pending' | 'read' | 'responded' | 'archived'
    response?: string | null
    notes?: string | null
}

/**
 * Servicio para gestionar mensajes de contacto
 */
export class ContactMessagesService {
    /**
     * Obtiene todos los mensajes de contacto
     */
    static async getAll(): Promise<ContactMessage[]> {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(`Error al obtener mensajes: ${error.message}`)

        return data || []
    }

    /**
     * Obtiene un mensaje por ID
     */
    static async getById(id: string): Promise<ContactMessage> {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(`Error al obtener mensaje: ${error.message}`)

        return data
    }

    /**
     * Actualiza el estado de un mensaje
     */
    static async updateStatus(id: string, payload: UpdateMessageStatusPayload): Promise<ContactMessage> {
        const updateData: any = {
            status: payload.status,
            updated_at: new Date().toISOString(),
        }

        if (payload.response !== undefined) {
            updateData.response = payload.response
        }

        if (payload.notes !== undefined) {
            updateData.notes = payload.notes
        }

        if (payload.status !== 'pending' && !payload.response) {
            updateData.responded_at = new Date().toISOString()
        }

        const { data, error } = await supabaseClient
            .from('contact_messages')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(`Error al actualizar mensaje: ${error.message}`)

        return data
    }

    /**
     * Elimina un mensaje
     */
    static async delete(id: string): Promise<void> {
        const { error } = await supabaseClient
            .from('contact_messages')
            .delete()
            .eq('id', id)

        if (error) throw new Error(`Error al eliminar mensaje: ${error.message}`)
    }
}
