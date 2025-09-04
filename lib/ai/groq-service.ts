/**
 * Groq AI Service
 * 
 * This service provides access to Groq's fast inference API,
 * primarily for GPT-OSS 120B and other open-source models.
 */

interface GroqConfig {
  apiKey: string;
  baseUrl: string;
}

interface GroqResponse {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
}

class GroqService {
  private config: GroqConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GROQ_API_KEY || '',
      baseUrl: 'https://api.groq.com/openai/v1'
    };
  }

  /**
   * Generate text using GPT-OSS 120B via Groq
   */
  async generateText(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 1000
  ): Promise<GroqResponse> {
    if (!this.config.apiKey) {
      throw new Error('Groq API key not configured. Please add GROQ_API_KEY to your environment variables.');
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Groq's fastest model for general use
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;
      
      // Groq pricing is very competitive
      const cost = tokensUsed * 0.00000059; // $0.59 per 1M tokens for Llama 3.3 70B

      return {
        content,
        model: 'llama-3.3-70b-versatile',
        tokensUsed,
        cost
      };

    } catch (error) {
      console.error('Groq generation error:', error);
      throw new Error(`Groq generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Groq is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get available models from Groq
   */
  getAvailableModels() {
    return [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        description: 'Meta\'s latest Llama model, optimized for versatile tasks with fast inference',
        capabilities: ['text-generation', 'reasoning', 'function-calling', 'structured-output'],
        cost: '$0.59 per 1M tokens'
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        description: 'Ultra-fast inference model for quick responses',
        capabilities: ['text-generation', 'chat', 'quick-responses'],
        cost: '$0.05 per 1M tokens'
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        description: 'Mistral AI\'s mixture of experts model with 32k context',
        capabilities: ['text-generation', 'reasoning', 'long-context'],
        cost: '$0.24 per 1M tokens'
      }
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GroqConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (without API key)
   */
  getConfig(): Omit<GroqConfig, 'apiKey'> {
    const { apiKey, ...config } = this.config;
    return config;
  }
}

export const groqService = new GroqService();
export type { GroqResponse };
