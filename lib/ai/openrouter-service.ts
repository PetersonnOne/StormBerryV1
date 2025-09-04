/**
 * OpenRouter AI Service
 * 
 * This service provides access to various AI models through OpenRouter,
 * including Gemini 2.5 Flash Image (NaNo Banana) for image generation.
 */

interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  siteUrl?: string;
  siteName?: string;
}

interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ImageGenerationResponse {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
}

class OpenRouterService {
  private config: OpenRouterConfig;

  constructor() {
    this.config = {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: 'https://openrouter.ai/api/v1',
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      siteName: 'Storm Berry V1'
    };
  }

  /**
   * Generate text using GPT-OSS 120B (Free OpenAI model via OpenRouter)
   */
  async generateText(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 1000
  ): Promise<ImageGenerationResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.');
    }

    try {
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.siteUrl,
          'X-Title': this.config.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      
      // GPT-OSS 120B is free
      const cost = 0;

      return {
        content,
        model: 'openai/gpt-oss-120b:free',
        tokensUsed,
        cost
      };

    } catch (error) {
      console.error('OpenRouter GPT-OSS 120B generation error:', error);
      throw new Error(`GPT-OSS 120B generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate image using Gemini 2.5 Flash Image (NaNo Banana)
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.');
    }

    const {
      prompt,
      model = 'google/gemini-2.5-flash-image-preview:free',
      maxTokens = 1000,
      temperature = 0.7
    } = options;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.siteUrl,
          'X-Title': this.config.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ],
          max_tokens: maxTokens,
          temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      
      // Estimate cost (Gemini 2.5 Flash Image is free tier, but we track for consistency)
      const cost = 0; // Free tier

      return {
        content,
        model,
        tokensUsed,
        cost
      };

    } catch (error) {
      console.error('OpenRouter image generation error:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate image with image input (for image editing/analysis)
   */
  async generateImageWithInput(
    prompt: string,
    imageUrl: string,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<ImageGenerationResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables.');
    }

    const {
      model = 'google/gemini-2.5-flash-image-preview:free',
      maxTokens = 1000,
      temperature = 0.7
    } = options;

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.siteUrl,
          'X-Title': this.config.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: maxTokens,
          temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      
      // Estimate cost (free tier)
      const cost = 0;

      return {
        content,
        model,
        tokensUsed,
        cost
      };

    } catch (error) {
      console.error('OpenRouter image analysis error:', error);
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if OpenRouter is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return [
      {
        id: 'openai/gpt-oss-120b:free',
        name: 'GPT-OSS 120B (Free OpenAI)',
        description: '117B-parameter Mixture-of-Experts language model from OpenAI, optimized for reasoning and general-purpose use',
        capabilities: ['text-generation', 'reasoning', 'function-calling', 'structured-output'],
        cost: 'Free'
      },
      {
        id: 'google/gemini-2.5-flash-image-preview:free',
        name: 'Gemini 2.5 Flash Image (NaNo Banana)',
        description: 'State-of-the-art image generation with contextual understanding',
        capabilities: ['image-generation', 'image-editing', 'multi-turn-conversations'],
        cost: 'Free'
      }
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OpenRouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (without API key)
   */
  getConfig(): Omit<OpenRouterConfig, 'apiKey'> {
    const { apiKey, ...config } = this.config;
    return config;
  }
}

export const openRouterService = new OpenRouterService();
export type { ImageGenerationOptions, ImageGenerationResponse };