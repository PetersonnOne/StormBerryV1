import OpenAI from 'openai';
import { geminiService, ModelType } from './gemini-service';
import { openRouterService } from './openrouter-service';

interface AIResponse {
  content: string;
  model: ModelType;
  tokensUsed: number;
  cost: number;
  fallbackUsed?: boolean;
  fallbackChain?: string[];
}

interface AIStatus {
  success: boolean;
  model: ModelType;
  fallbackUsed: boolean;
  fallbackChain: string[];
  error?: string;
}

class UnifiedAIService {
  private openai: OpenAI;
  private defaultModel: ModelType = 'gemini-2.5-pro'; // Changed default to Gemini 2.5 Pro
  private fallbackOrder: ModelType[] = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gpt-oss-120b'];
  private imageModel: ModelType = 'gemini-2.5-flash-image';
  private disabledModels: ModelType[] = ['gpt-5']; // GPT-5 is disabled but visible

  constructor() {
    // Only initialize OpenAI if API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    } else {
      console.warn('OpenAI API key not found. GPT models will not be available.');
      // Create a mock OpenAI client that will throw errors when used
      this.openai = null as any;
    }
  }

  async generateContent(
    prompt: string,
    model: ModelType = this.defaultModel,
    systemPrompt?: string,
    maxTokens: number = 1000
  ): Promise<AIResponse> {
    // Check if model is disabled
    if (this.disabledModels.includes(model)) {
      throw new Error(`${model} is currently disabled. This model will be available in a future update. Please try Gemini 2.5 Pro or Gemini 2.5 Flash instead.`);
    }

    // Check if required API keys are available for the selected model
    if ((model === 'gemini-2.5-pro' || model === 'gemini-2.5-flash') && !process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables to use Gemini models.');
    }

    if (model === 'gpt-oss-120b' && !process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables to use GPT-OSS 120B.');
    }

    const fallbackChain: string[] = [];
    let currentModel = model;
    
    // Create fallback order starting with requested model
    const modelsToTry = [currentModel, ...this.fallbackOrder.filter(m => m !== currentModel)];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const tryModel = modelsToTry[i];
      fallbackChain.push(tryModel);
      
      try {
        console.log(`Attempting AI generation with ${tryModel}...`);
        
        let response: AIResponse;
        if (tryModel === 'gpt-5') {
          // GPT-5 is disabled, this should not be reached due to disabled check
          throw new Error('GPT-5 is currently disabled');
        } else if (tryModel === 'gpt-oss-120b') {
          const openRouterResponse = await openRouterService.generateText(prompt, systemPrompt, maxTokens);
          response = {
            content: openRouterResponse.content,
            model: 'gpt-oss-120b',
            tokensUsed: openRouterResponse.tokensUsed,
            cost: openRouterResponse.cost,
          };
        } else {
          response = await geminiService.generateContent(prompt, tryModel, systemPrompt);
        }
        
        // Add fallback information
        response.fallbackUsed = i > 0;
        response.fallbackChain = fallbackChain;
        
        console.log(`✅ AI generation successful with ${tryModel}${i > 0 ? ' (fallback)' : ''}`);
        return response;
        
      } catch (error) {
        console.error(`❌ ${tryModel} failed:`, error);
        
        // If this is the last model to try, throw error
        if (i === modelsToTry.length - 1) {
          throw new Error(`All AI models failed. Last error: ${error}`);
        }
        
        // Continue to next model
        console.log(`🔄 Falling back to next model...`);
      }
    }
    
    throw new Error('All AI models are currently unavailable. Please try again later.');
  }

  async generateContentWithStatus(
    prompt: string,
    model: ModelType = this.defaultModel,
    systemPrompt?: string,
    maxTokens: number = 1000,
    onStatusUpdate?: (status: AIStatus) => void
  ): Promise<AIResponse> {
    // Check if model is disabled
    if (this.disabledModels.includes(model)) {
      const error = `${model} is currently disabled. This model will be available in a future update. Please try Gemini 2.5 Pro or Gemini 2.5 Flash instead.`;
      if (onStatusUpdate) {
        onStatusUpdate({
          success: false,
          model: model,
          fallbackUsed: false,
          fallbackChain: [model],
          error,
        });
      }
      throw new Error(error);
    }

    // Check if required API keys are available for the selected model
    if ((model === 'gemini-2.5-pro' || model === 'gemini-2.5-flash') && !process.env.GEMINI_API_KEY) {
      const error = 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables to use Gemini models.'
      if (onStatusUpdate) {
        onStatusUpdate({
          success: false,
          model: model,
          fallbackUsed: false,
          fallbackChain: [model],
          error,
        });
      }
      throw new Error(error);
    }

    if (model === 'gpt-oss-120b' && !process.env.OPENROUTER_API_KEY) {
      const error = 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables to use GPT-OSS 120B.';
      if (onStatusUpdate) {
        onStatusUpdate({
          success: false,
          model: model,
          fallbackUsed: false,
          fallbackChain: [model],
          error,
        });
      }
      throw new Error(error);
    }

    const fallbackChain: string[] = [];
    let currentModel = model;
    
    // Create fallback order starting with requested model
    const modelsToTry = [currentModel, ...this.fallbackOrder.filter(m => m !== currentModel)];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const tryModel = modelsToTry[i];
      fallbackChain.push(tryModel);
      
      // Notify status update
      if (onStatusUpdate) {
        onStatusUpdate({
          success: false,
          model: tryModel,
          fallbackUsed: i > 0,
          fallbackChain: [...fallbackChain],
        });
      }
      
      try {
        console.log(`Attempting AI generation with ${tryModel}...`);
        
        let response: AIResponse;
        if (tryModel === 'gpt-5') {
          // GPT-5 is disabled, this should not be reached due to disabled check
          throw new Error('GPT-5 is currently disabled');
        } else if (tryModel === 'gpt-oss-120b') {
          const openRouterResponse = await openRouterService.generateText(prompt, systemPrompt, maxTokens);
          response = {
            content: openRouterResponse.content,
            model: 'gpt-oss-120b',
            tokensUsed: openRouterResponse.tokensUsed,
            cost: openRouterResponse.cost,
          };
        } else {
          response = await geminiService.generateContent(prompt, tryModel, systemPrompt);
        }
        
        // Add fallback information
        response.fallbackUsed = i > 0;
        response.fallbackChain = fallbackChain;
        
        // Notify success
        if (onStatusUpdate) {
          onStatusUpdate({
            success: true,
            model: tryModel,
            fallbackUsed: i > 0,
            fallbackChain: [...fallbackChain],
          });
        }
        
        console.log(`✅ AI generation successful with ${tryModel}${i > 0 ? ' (fallback)' : ''}`);
        return response;
        
      } catch (error) {
        console.error(`❌ ${tryModel} failed:`, error);
        
        // If this is the last model to try, notify final failure
        if (i === modelsToTry.length - 1) {
          if (onStatusUpdate) {
            onStatusUpdate({
              success: false,
              model: tryModel,
              fallbackUsed: i > 0,
              fallbackChain: [...fallbackChain],
              error: `All AI models failed. Last error: ${error}`,
            });
          }
          throw new Error(`All AI models failed. Last error: ${error}`);
        }
        
        // Continue to next model
        console.log(`🔄 Falling back to next model...`);
      }
    }
    
    throw new Error('All AI models are currently unavailable. Please try again later.');
  }

  private async generateWithOpenAI(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 1000
  ): Promise<AIResponse> {
    // This method is now disabled but kept for future use
    throw new Error('GPT-5 is currently disabled. This model will be available in a future update.');
  }

  async generateImage(
    prompt: string,
    imageUrl?: string
  ): Promise<AIResponse> {
    try {
      console.log('Generating image with Gemini 2.5 Flash Image (NaNo Banana)...');
      
      // Check if OpenRouter API key is configured
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables to use Gemini 2.5 Flash Image (NaNo Banana).');
      }
      
      let response;
      if (imageUrl) {
        // Image editing/analysis
        response = await openRouterService.generateImageWithInput(prompt, imageUrl);
      } else {
        // Image generation
        response = await openRouterService.generateImage({ prompt });
      }
      
      return {
        content: response.content,
        model: this.imageModel,
        tokensUsed: response.tokensUsed,
        cost: response.cost,
        fallbackUsed: false,
        fallbackChain: [this.imageModel]
      };
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): { value: ModelType; label: string; disabled?: boolean }[] {
    return [
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Default)' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gpt-oss-120b', label: 'GPT-OSS 120B (Free OpenAI)' },
      { value: 'gpt-5', label: 'GPT-5 (Coming Soon)', disabled: true },
      { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (NaNo Banana)' },
    ];
  }

  getDefaultModel(): ModelType {
    return this.defaultModel;
  }

  setDefaultModel(model: ModelType): void {
    this.defaultModel = model;
  }

  getFallbackOrder(): ModelType[] {
    return [...this.fallbackOrder];
  }

  isModelDisabled(model: ModelType): boolean {
    return this.disabledModels.includes(model);
  }
}

export const aiService = new UnifiedAIService();
export type { AIResponse, ModelType, AIStatus };