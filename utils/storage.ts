import { createSupabaseClient } from './supabase'

export async function uploadImage(
  file: File, 
  userId: string,
  authToken?: string
): Promise<string> {
  try {
    if (!authToken) {
      throw new Error('Authentication token required for upload')
    }

    // Create Supabase client with auth token
    const supabase = createSupabaseClient(authToken)
    
    // Generate unique filename with user folder structure
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('genai-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('genai-images')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
}

export async function deleteImage(
  filePath: string,
  authToken?: string
): Promise<void> {
  try {
    if (!authToken) {
      throw new Error('Authentication token required for deletion')
    }

    const supabase = createSupabaseClient(authToken)
    
    const { error } = await supabase.storage
      .from('genai-images')
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Image deletion error:', error)
    throw error
  }
}
