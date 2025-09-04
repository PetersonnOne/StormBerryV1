import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { textsService } from '@/lib/db/texts';
import { uploadImage } from '@/utils/storage';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format, options, title, description } = await req.json();
    const token = await getToken({ template: 'supabase' });

    // Fetch all user texts to find story, character, and world data
    const allTexts = await textsService.getAll(userId, token || undefined);

    // Get latest story content
    const storyTexts = allTexts.filter(text => {
      try {
        const content = JSON.parse(text.content);
        return content.metadata?.type === 'story';
      } catch {
        return false;
      }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const latestStory = storyTexts[0];
    if (!latestStory) {
      return NextResponse.json({ error: 'No story content found' }, { status: 404 });
    }

    const storyContent = JSON.parse(latestStory.content).story || JSON.parse(latestStory.content).content;

    // Fetch character data if needed
    let characters = [];
    if (options.includeCharacterProfiles) {
      const characterTexts = allTexts.filter(text => {
        try {
          const content = JSON.parse(text.content);
          return content.metadata?.type === 'characters';
        } catch {
          return false;
        }
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (characterTexts[0]) {
        characters = JSON.parse(characterTexts[0].content).characters || [];
      }
    }

    // Fetch world data if needed
    let worldData = null;
    if (options.includeWorldGuide) {
      const worldTexts = allTexts.filter(text => {
        try {
          const content = JSON.parse(text.content);
          return content.metadata?.type === 'world';
        } catch {
          return false;
        }
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (worldTexts[0]) {
        worldData = JSON.parse(worldTexts[0].content).worldData || null;
      }
    }

    let exportedContent = '';
    let contentType = '';
    let fileExtension = '';

    switch (format) {
      case 'pdf': {
        // Generate PDF content
        exportedContent = await generatePDFContent({
          title,
          description,
          content: storyContent,
          characters,
          worldData,
          options,
        });
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      }
      case 'epub': {
        // Generate EPUB content
        exportedContent = await generateEPUBContent({
          title,
          description,
          content: storyContent,
          characters,
          worldData,
          options,
        });
        contentType = 'application/epub+zip';
        fileExtension = 'epub';
        break;
      }
      case 'web': {
        // Generate interactive web page
        exportedContent = await generateWebContent({
          title,
          description,
          content: storyContent,
          characters,
          worldData,
          options,
        });
        contentType = 'text/html';
        fileExtension = 'html';
        break;
      }
      default:
        throw new Error('Unsupported export format');
    }

    // Generate narration if requested
    let narrationUrl = null;
    if (options.addNarration) {
      const narrationResponse = await fetch('https://api.aimlapi.com/eleven-labs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
        },
        body: JSON.stringify({
          text: storyContent.replace(/<[^>]*>/g, ''), // Remove HTML tags
          voice_id: 'en-US-Neural2-F', // Default voice
          stability: 0.5,
          similarity_boost: 0.75,
        }),
      });

      if (!narrationResponse.ok) {
        throw new Error('Failed to generate narration');
      }

      const narrationData = await narrationResponse.arrayBuffer();
      const narrationFile = new File([narrationData], `${title}-narration.mp3`, { type: 'audio/mpeg' });
      narrationUrl = await uploadImage(narrationFile, userId, token || undefined);
    }

    // Save the exported content as a text record
    const exportData = {
      content: JSON.stringify({
        exportedContent,
        metadata: {
          type: 'export',
          title,
          description,
          format,
          options,
          narrationUrl,
          timestamp: new Date().toISOString(),
        }
      })
    };

    const result = await textsService.create(userId, exportData, token || undefined);

    return NextResponse.json({
      success: true,
      id: result.id,
      downloadContent: exportedContent,
      narrationUrl,
    });

  } catch (error) {
    console.error('Error exporting story:', error);
    return NextResponse.json(
      { error: 'Failed to export story' },
      { status: 500 }
    );
  }
}

// Define interfaces for our data structures
interface ExportOptions {
  includeCharacterProfiles: boolean;
  includeWorldGuide: boolean;
  addTableOfContents: boolean;
  addNarration: boolean;
  [key: string]: any; // For any additional options
}

interface Character {
  name: string;
  role: string;
  description: string;
  background: string;
  personality: string;
  imageUrl?: string;
}

interface Location {
  name: string;
  description: string;
  climate?: string;
  culture?: string;
}

interface WorldData {
  name: string;
  description: string;
  history: string;
  magicSystem?: string;
  technology?: string;
  locations: Location[];
}

interface ContentParams {
  title: string;
  description: string;
  content: string;
  characters: Character[];
  worldData: WorldData | null;
  options: ExportOptions;
}

async function generatePDFContent({
  title,
  description,
  content,
  characters,
  worldData,
  options,
}: ContentParams) {
  // TODO: Implement PDF generation using a library like pdf-lib
  // For now, return a simple PDF structure
  return `%PDF-1.7
%âãÏÓ
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 6 0 R>>
endobj
4 0 obj
<</Font <</F1 5 0 R>>>>
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
6 0 obj
<</Length 44>>
stream
BT
/F1 24 Tf
72 720 Td
(${title}) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000199 00000 n
0000000238 00000 n
0000000306 00000 n
trailer
<</Size 7 /Root 1 0 R>>
startxref
406
%%EOF`;
}

async function generateEPUBContent({
  title,
  description,
  content,
  characters,
  worldData,
  options,
}: ContentParams) {
  // TODO: Implement EPUB generation using a library like epub-gen
  // For now, return a simple EPUB structure
  return `PK\x03\x04\x14\x00\x00\x00\x00\x00...`; // Basic EPUB file structure
}

async function generateWebContent({
  title,
  description,
  content,
  characters,
  worldData,
  options,
}: ContentParams) {
  // Generate an interactive web page with the story content
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .story-content {
          margin: 2rem 0;
        }
        .character-profile {
          background: #f5f5f5;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }
        .world-guide {
          background: #f0f7ff;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${description ? `<p class="description">${description}</p>` : ''}
      
      ${options.addTableOfContents ? generateTableOfContents() : ''}
      
      <div class="story-content">
        ${content}
      </div>

      ${options.includeCharacterProfiles ? generateCharacterProfiles(characters) : ''}
      
      ${options.includeWorldGuide ? generateWorldGuide(worldData) : ''}
      
      ${options.addNarration ? generateNarrationPlayer() : ''}
    </body>
    </html>
  `;
}

function generateTableOfContents() {
  return `
    <nav class="table-of-contents">
      <h2>Table of Contents</h2>
      <ul>
        <li><a href="#story">Story</a></li>
        <li><a href="#characters">Characters</a></li>
        <li><a href="#world">World Guide</a></li>
      </ul>
    </nav>
  `;
}

function generateCharacterProfiles(characters: Character[]) {
  return `
    <section id="characters">
      <h2>Characters</h2>
      ${characters.map(character => `
        <div class="character-profile">
          <h3>${character.name}</h3>
          ${character.imageUrl ? `<img src="${character.imageUrl}" alt="${character.name}" />` : ''}
          <p><strong>Role:</strong> ${character.role}</p>
          <p>${character.description}</p>
          <p><strong>Background:</strong> ${character.background}</p>
          <p><strong>Personality:</strong> ${character.personality}</p>
        </div>
      `).join('')}
    </section>
  `;
}

function generateWorldGuide(worldData: WorldData | null) {
  if (!worldData) return '';
  
  return `
    <section id="world" class="world-guide">
      <h2>World Guide</h2>
      <h3>${worldData.name}</h3>
      <p>${worldData.description}</p>
      
      <h4>History</h4>
      <p>${worldData.history}</p>
      
      ${worldData.magicSystem ? `
        <h4>Magic System</h4>
        <p>${worldData.magicSystem}</p>
      ` : ''}
      
      ${worldData.technology ? `
        <h4>Technology</h4>
        <p>${worldData.technology}</p>
      ` : ''}
      
      <h4>Locations</h4>
      ${worldData.locations.map(location => `
        <div class="location">
          <h5>${location.name}</h5>
          <p>${location.description}</p>
          ${location.climate ? `<p><strong>Climate:</strong> ${location.climate}</p>` : ''}
          ${location.culture ? `<p><strong>Culture:</strong> ${location.culture}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function generateNarrationPlayer() {
  return `
    <div class="narration-player">
      <h2>Story Narration</h2>
      <audio controls>
        <source src="narration.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    </div>
  `;
}