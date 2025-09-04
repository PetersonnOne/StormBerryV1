import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { textsService } from '@/lib/db/texts'
import { imagesService } from '@/lib/db/images'
import { uploadImage } from '@/utils/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { userId, getToken } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken({ template: 'supabase' })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (params.resource === 'texts') {
      const data = await textsService.read(userId, id || undefined, token || undefined)
      return NextResponse.json({ data })
    } else if (params.resource === 'images') {
      const data = await imagesService.read(userId, id || undefined, token || undefined)
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { userId, getToken } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken({ template: 'supabase' })

    if (params.resource === 'texts') {
      const { content } = await request.json()
      const data = await textsService.create(userId, { content }, token || undefined)
      return NextResponse.json({ data }, { status: 201 })
    } else if (params.resource === 'images') {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const prompt = formData.get('prompt') as string

      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 })
      }

      // Upload to storage
      const url = await uploadImage(file, userId, token || undefined)
      
      // Save metadata to database
      const data = await imagesService.create(userId, { url, prompt }, token || undefined)
      return NextResponse.json({ data }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { userId, getToken } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken({ template: 'supabase' })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()

    if (params.resource === 'texts') {
      const data = await textsService.update(userId, id, body, token || undefined)
      return NextResponse.json({ data })
    } else if (params.resource === 'images') {
      const data = await imagesService.update(userId, id, body, token || undefined)
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const { userId, getToken } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = await getToken({ template: 'supabase' })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (params.resource === 'texts') {
      await textsService.delete(userId, id, token || undefined)
      return NextResponse.json({ success: true })
    } else if (params.resource === 'images') {
      await imagesService.delete(userId, id, token || undefined)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
