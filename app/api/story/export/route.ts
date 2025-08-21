import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { put, get } from '@vercel/blob';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format, options, title, description } = await req.json();

    // Fetch story content
    const storyMetadataBlob = await get(`stories/${session.user.id}/metadata.json`);
    const storyMetadata = storyMetadataBlob ? JSON.parse(await storyMetadataBlob.text()) : [];
    const latestStory = storyMetadata[storyMetadata.length - 1];
    const storyContentBlob = await get(latestStory.filename);
    const storyContent = await storyContentBlob.text();

    // Fetch character data if needed
    let characters = [];
    if (options.includeCharacterProfiles) {
      const characterMetadataBlob = await get(`characters/${session.user.id}/metadata.json`);
      const characterMetadata = characterMetadataBlob ? JSON.parse(await characterMetadataBlob.text()) : [];
      const latestCharacters = characterMetadata[characterMetadata.length - 1];
      const characterDataBlob = await get(latestCharacters.filename);
      characters = JSON.parse(await characterDataBlob.text());
    }

    // Fetch world data if needed
    let worldData = null;
    if (options.includeWorldGuide) {
      const worldMetadataBlob = await get(`worlds/${session.user.id}/metadata.json`);
      const worldMetadata = worldMetadataBlob ? JSON.parse(await worldMetadataBlob.text()) : [];
      const latestWorld = worldMetadata[worldMetadata.length - 1];
      const worldDataBlob = await get(latestWorld.filename);
      worldData = JSON.parse(await worldDataBlob.text());
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
      const narrationFilename = `exports/${session.user.id}/narration/${title}-${Date.now()}.mp3`;
      await put(narrationFilename, narrationData, {
        access: 'public',
        contentType: 'audio/mpeg',
      });
    }

    // Save the exported content
    const timestamp = new Date().toISOString();
    const filename = `exports/${session.user.id}/${format}/${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${fileExtension}`;

    const blob = await put(filename, exportedContent, {
      access: 'public',
      contentType,
      metadata: {
        userId: session.user.id,
        title,
        description,
        format,
        options: JSON.stringify(options),
        timestamp,
      },
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });

  } catch (error) {
    console.error('Error exporting story:', error);
    return NextResponse.json(
      { error: 'Failed to export story' },
      { status: 500 }
    );
  }
}

async function generatePDFContent({
  title,
  description,
  content,
  characters,
  worldData,
  options,
}) {
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
}) {
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
}) {
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

function generateCharacterProfiles(characters) {
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

function generateWorldGuide(worldData) {
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