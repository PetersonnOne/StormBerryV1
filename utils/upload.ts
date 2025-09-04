import { createSupabaseClient } from './supabase'

export async function uploadToSupabase(
  file: File, 
  getToken: () => Promise<string | null>
): Promise<string> {
  try {
    // Get Clerk JWT token for Supabase
    const token = await getToken({ template: 'supabase' })
    
    if (!token) {
      throw new Error('No authentication token available')
    }

    // Create Supabase client with auth token
    const supabase = createSupabaseClient(token)
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('genai-images')
      .upload(fileName, file, {
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
    console.error('Upload error:', error)
    throw error
  }
}
