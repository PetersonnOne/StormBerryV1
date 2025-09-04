/**
 * ElevenLabs Text-to-Speech and Speech-to-Text Integration
 * 
 * This module provides utilities for integrating with ElevenLabs API
 * for high-quality voice synthesis and speech recognition.
 */

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model: string;
}

interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  model?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  outputFormat?: string;
}

interface SpeechToTextOptions {
  audioFile: File | Blob;
  model?: string;
  language?: string;
}

class ElevenLabsService {
  private config: ElevenLabsConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.config = {
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'scOwDtmlUjD3prqpp97I', // Default voice ID
      model: 'eleven_multilingual_v2'
    };
  }

  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(options: TextToSpeechOptions): Promise<ArrayBuffer> {
    const {
      text,
      voiceId = this.config.voiceId,
      model = this.config.model,
      voiceSettings = {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      },
      outputFormat = 'mp3_44100_128'
    } = options;

    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: voiceSettings,
        output_format: outputFormat
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Convert speech to text using ElevenLabs API
   */
  async speechToText(options: SpeechToTextOptions): Promise<string> {
    const {
      audioFile,
      model = 'scribe_v1',
      language = 'en'
    } = options;

    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('model_id', model);
    formData.append('language', language);

    const url = `${this.baseUrl}/speech-to-text`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs STT failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.text || '';
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `${this.baseUrl}/voices`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': this.config.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs get voices failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return result.voices || [];
  }

  /**
   * Stream text-to-speech for real-time applications
   */
  async streamTextToSpeech(options: TextToSpeechOptions): Promise<ReadableStream> {
    const {
      text,
      voiceId = this.config.voiceId,
      model = this.config.model,
      voiceSettings = {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      }
    } = options;

    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const url = `${this.baseUrl}/text-to-speech/${voiceId}/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs streaming TTS failed: ${response.status} ${errorText}`);
    }

    return response.body!;
  }

  /**
   * Check if ElevenLabs is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get current configuration
   */
  getConfig(): ElevenLabsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ElevenLabsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Voice presets for different use cases
export const VOICE_PRESETS = {
  NATURAL: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  },
  EXPRESSIVE: {
    stability: 0.3,
    similarityBoost: 0.8,
    style: 0.2,
    useSpeakerBoost: true
  },
  CALM: {
    stability: 0.8,
    similarityBoost: 0.6,
    style: 0.0,
    useSpeakerBoost: false
  },
  ENERGETIC: {
    stability: 0.2,
    similarityBoost: 0.9,
    style: 0.3,
    useSpeakerBoost: true
  }
} as const;

// Available models
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2',
  FLASH_V2_5: 'eleven_flash_v2_5',
  TURBO_V2_5: 'eleven_turbo_v2_5',
  V3: 'eleven_v3'
} as const;

// Output formats
export const OUTPUT_FORMATS = {
  MP3_44100_128: 'mp3_44100_128',
  MP3_44100_192: 'mp3_44100_192',
  PCM_16000: 'pcm_16000',
  PCM_22050: 'pcm_22050',
  PCM_24000: 'pcm_24000',
  PCM_44100: 'pcm_44100'
} as const;

export const elevenLabsService = new ElevenLabsService();
export type { TextToSpeechOptions, SpeechToTextOptions };