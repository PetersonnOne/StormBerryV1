import { createSupabaseClient, GenAIText } from '@/utils/supabase'

export interface CreateTextData {
  content: string
}

export interface UpdateTextData {
  content?: string
}

export class TextsService {
  private getClient(authToken?: string) {
    return createSupabaseClient(authToken)
  }

  async create(
    userId: string, 
    data: CreateTextData, 
    authToken?: string
  ): Promise<GenAIText> {
    const supabase = this.getClient(authToken)
    
    const { data: result, error } = await supabase
      .from('genai_texts')
      .insert({
        user_id: userId,
        content: data.content,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create text: ${error.message}`)
    }

    return result
  }

  async read(
    userId: string, 
    textId?: string, 
    authToken?: string
  ): Promise<GenAIText | GenAIText[]> {
    const supabase = this.getClient(authToken)
    
    let query = supabase
      .from('genai_texts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (textId) {
      query = query.eq('id', textId)
      const { data, error } = await query.single()
      
      if (error) {
        throw new Error(`Failed to read text: ${error.message}`)
      }
      
      return data
    }

    const { data, error } = await query
    
    if (error) {
      throw new Error(`Failed to read texts: ${error.message}`)
    }

    return data || []
  }

  async update(
    userId: string, 
    textId: string, 
    data: UpdateTextData, 
    authToken?: string
  ): Promise<GenAIText> {
    const supabase = this.getClient(authToken)
    
    const { data: result, error } = await supabase
      .from('genai_texts')
      .update(data)
      .eq('id', textId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update text: ${error.message}`)
    }

    return result
  }

  async delete(
    userId: string, 
    textId: string, 
    authToken?: string
  ): Promise<void> {
    const supabase = this.getClient(authToken)
    
    const { error } = await supabase
      .from('genai_texts')
      .delete()
      .eq('id', textId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete text: ${error.message}`)
    }
  }
}

export const textsService = new TextsService()
