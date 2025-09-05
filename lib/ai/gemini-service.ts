import { GoogleGenerativeAI } from '@google/generative-ai';

export type ModelType = 'gpt-5' | 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-image' | 'gpt-oss-120b';

interface AIResponse {
  content: string;
  model: ModelType;
  tokensUsed: number;
  cost: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateContent(
    prompt: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    systemPrompt?: string
  ): Promise<AIResponse> {
    try {
      const modelName = model === 'gemini-2.5-flash' ? 'gemini-1.5-flash' : 'gemini-1.5-pro';
      const geminiModel = this.genAI.getGenerativeModel({ model: modelName });

      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
      
      const result = await geminiModel.generateContent(fullPrompt);
      const response = await result.response;
      
      // Handle potential JSON parsing issues
      let text: string;
      try {
        text = response.text();
      } catch (error) {
        console.error('Gemini response parsing error:', error);
        // Try to extract text from response object directly
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: Could not parse response';
      }

      // Estimate token usage (approximate)
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
      
      // Estimate cost based on model
      const costPerToken = model === 'gemini-2.5-flash' ? 0.000001 : 0.000005;
      const cost = tokensUsed * costPerToken;

      return {
        content: text,
        model,
        tokensUsed,
        cost,
      };
    } catch (error) {
      console.error(`Gemini ${model} error:`, error);
      throw new Error(`Failed to generate content with ${model}: ${error}`);
    }
  }

  async analyzeImage(
    imageData: string,
    prompt: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro'
  ): Promise<AIResponse> {
    try {
      const modelName = model === 'gemini-2.5-flash' ? 'gemini-1.5-flash' : 'gemini-1.5-pro';
      const geminiModel = this.genAI.getGenerativeModel({ model: modelName });

      // Convert base64 to proper format for Gemini
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg' // Default to JPEG, could be enhanced to detect actual type
        }
      };

      const result = await geminiModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      
      // Handle potential JSON parsing issues
      let text: string;
      try {
        text = response.text();
      } catch (error) {
        console.error('Gemini image response parsing error:', error);
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: Could not parse image response';
      }

      // Estimate token usage (approximate)
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
      
      // Estimate cost based on model (higher cost for image analysis)
      const costPerToken = model === 'gemini-2.5-flash' ? 0.000002 : 0.000010;
      const cost = tokensUsed * costPerToken;

      return {
        content: text,
        model,
        tokensUsed,
        cost,
      };
    } catch (error) {
      console.error(`Gemini ${model} image analysis error:`, error);
      throw new Error(`Failed to analyze image with ${model}: ${error}`);
    }
  }

  async generateContentWithFallback(
    prompt: string,
    preferredModel: ModelType,
    systemPrompt?: string
  ): Promise<AIResponse> {
    try {
      if (preferredModel === 'gpt-5') {
        // Will be handled by OpenAI service
        throw new Error('Use OpenAI service for GPT models');
      }

      return await this.generateContent(prompt, preferredModel, systemPrompt);
    } catch (error) {
      console.error(`Primary model ${preferredModel} failed, trying fallback:`, error);
      
      // Fallback logic: Flash -> Pro -> throw error
      if (preferredModel === 'gemini-2.5-flash') {
        try {
          return await this.generateContent(prompt, 'gemini-2.5-pro', systemPrompt);
        } catch (fallbackError) {
          console.error('Fallback to Gemini Pro also failed:', fallbackError);
          throw new Error('All Gemini models failed. Please try again later.');
        }
      } else {
        try {
          return await this.generateContent(prompt, 'gemini-2.5-flash', systemPrompt);
        } catch (fallbackError) {
          console.error('Fallback to Gemini Flash also failed:', fallbackError);
          throw new Error('All Gemini models failed. Please try again later.');
        }
      }
    }
  }
}

export const geminiService = new GeminiService();
