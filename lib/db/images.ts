import { createSupabaseClient, GenAIImage } from '@/utils/supabase'

export interface CreateImageData {
  url: string
  prompt?: string
}

export interface UpdateImageData {
  url?: string
  prompt?: string
}

export class ImagesService {
  private getClient(authToken?: string) {
    return createSupabaseClient(authToken)
  }

  async create(
    userId: string, 
    data: CreateImageData, 
    authToken?: string
  ): Promise<GenAIImage> {
    const supabase = this.getClient(authToken)
    
    const { data: result, error } = await supabase
      .from('genai_images')
      .insert({
        user_id: userId,
        url: data.url,
        prompt: data.prompt,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create image: ${error.message}`)
    }

    return result
  }

  async read(
    userId: string, 
    imageId?: string, 
    authToken?: string
  ): Promise<GenAIImage | GenAIImage[]> {
    const supabase = this.getClient(authToken)
    
    let query = supabase
      .from('genai_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (imageId) {
      query = query.eq('id', imageId)
      const { data, error } = await query.single()
      
      if (error) {
        throw new Error(`Failed to read image: ${error.message}`)
      }
      
      return data
    }

    const { data, error } = await query
    
    if (error) {
      throw new Error(`Failed to read images: ${error.message}`)
    }

    return data || []
  }

  async update(
    userId: string, 
    imageId: string, 
    data: UpdateImageData, 
    authToken?: string
  ): Promise<GenAIImage> {
    const supabase = this.getClient(authToken)
    
    const { data: result, error } = await supabase
      .from('genai_images')
      .update(data)
      .eq('id', imageId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update image: ${error.message}`)
    }

    return result
  }

  async delete(
    userId: string, 
    imageId: string, 
    authToken?: string
  ): Promise<void> {
    const supabase = this.getClient(authToken)
    
    const { error } = await supabase
      .from('genai_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }
}

export const imagesService = new ImagesService()
