import { NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Map of common words/phrases to sign animation names
const signMap: { [key: string]: string[] } = {
  'hello': ['wave', 'greet'],
  'goodbye': ['wave', 'bye'],
  'thank you': ['thank_you'],
  'please': ['please'],
  'yes': ['nod', 'yes'],
  'no': ['shake_head', 'no'],
  'good': ['thumbs_up', 'good'],
  'bad': ['thumbs_down', 'bad'],
  'help': ['help'],
  'want': ['want'],
  'need': ['need'],
  'more': ['more'],
  'less': ['less'],
  'stop': ['stop'],
  'go': ['go'],
  'eat': ['eat'],
  'drink': ['drink'],
  'sleep': ['sleep'],
  'work': ['work'],
  'play': ['play'],
  'learn': ['learn'],
  'understand': ['understand'],
  'not understand': ['confused', 'no', 'understand'],
  'happy': ['smile', 'happy'],
  'sad': ['frown', 'sad'],
  'angry': ['angry'],
  'tired': ['tired'],
  'sick': ['sick'],
  'better': ['better'],
  'worse': ['worse'],
  'same': ['same'],
  'different': ['different'],
  'big': ['big'],
  'small': ['small'],
  'hot': ['hot'],
  'cold': ['cold'],
  'day': ['sun', 'day'],
  'night': ['moon', 'night'],
  'time': ['clock', 'time'],
  'where': ['where'],
  'what': ['what'],
  'when': ['when'],
  'who': ['who'],
  'why': ['why'],
  'how': ['how'],
};

export async function POST(req: Request) {
  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text to translate' },
        { status: 400 }
      );
    }

    // Use GPT-5 to break down the text into basic concepts that match our sign vocabulary
    const completion = await openai.createChatCompletion({
      model: 'gpt-5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at converting English text into simplified concepts for sign language translation.
          Break down the input text into basic concepts that can be represented by these available signs: ${Object.keys(signMap).join(', ')}.
          Return only the list of basic concepts, separated by commas. Use the exact words from the available signs list.
          For example:
          Input: "I need help understanding this"
          Output: need, help, understand
          
          Input: "Are you feeling happy or sad today?"
          Output: what, feel, happy, sad, day
          
          Keep the translation simple and use only available signs.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    });

    const concepts = completion.data.choices[0]?.message?.content;
    if (!concepts) {
      throw new Error('Failed to break down text into concepts');
    }

    // Convert concepts into animation sequence
    const conceptList = concepts.split(',').map(c => c.trim().toLowerCase());
    const animationSequence: string[] = [];

    for (const concept of conceptList) {
      if (signMap[concept]) {
        animationSequence.push(...signMap[concept]);
      }
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      concepts: conceptList,
      signs: animationSequence,
    });

  } catch (error) {
    console.error('Error translating to signs:', error);
    return NextResponse.json(
      { error: 'Failed to translate text to signs' },
      { status: 500 }
    );
  }
}