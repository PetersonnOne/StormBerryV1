'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { GenAIText, GenAIImage } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Edit3, Image, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function GenAIContentPage() {
  const { user } = useUser()
  const [texts, setTexts] = useState<GenAIText[]>([])
  const [images, setImages] = useState<GenAIImage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContent = async () => {
    try {
      setLoading(true)
      
      // Fetch texts
      const textsResponse = await fetch('/api/genai/texts')
      if (textsResponse.ok) {
        const textsData = await textsResponse.json()
        setTexts(Array.isArray(textsData.data) ? textsData.data : [])
      }

      // Fetch images
      const imagesResponse = await fetch('/api/genai/images')
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setImages(Array.isArray(imagesData.data) ? imagesData.data : [])
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const deleteText = async (id: string) => {
    try {
      const response = await fetch(`/api/genai/texts?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setTexts(texts.filter(text => text.id !== id))
        toast.success('Text deleted successfully')
      } else {
        toast.error('Failed to delete text')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete text')
    }
  }

  const deleteImage = async (id: string) => {
    try {
      const response = await fetch(`/api/genai/images?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setImages(images.filter(image => image.id !== id))
        toast.success('Image deleted successfully')
      } else {
        toast.error('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  useEffect(() => {
    if (user) {
      fetchContent()
    }
  }, [user])

  return (
    <>
      <SignedIn>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GenAI Content Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your AI-generated texts and images
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-8">
              {/* Texts Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-semibold">AI Generated Texts</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                    {texts.length}
                  </span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {texts.map((text) => (
                    <Card key={text.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-gray-500">
                          {new Date(text.created_at).toLocaleDateString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {text.content}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement edit */}}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteText(text.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {texts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No AI-generated texts yet
                  </div>
                )}
              </section>

              {/* Images Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5 text-green-600" />
                  <h2 className="text-2xl font-semibold">AI Generated Images</h2>
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                    {images.length}
                  </span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {images.map((image) => (
                    <Card key={image.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.prompt || 'AI Generated Image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {image.prompt && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {image.prompt}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mb-3">
                          {new Date(image.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement edit */}}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteImage(image.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {images.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No AI-generated images yet
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}
