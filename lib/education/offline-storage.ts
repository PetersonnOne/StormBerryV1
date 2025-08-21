import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageKeys {
  LESSONS: string;
  QUIZZES: string;
  USER_PROGRESS: string;
  LANGUAGE: string;
}

const STORAGE_KEYS: StorageKeys = {
  LESSONS: '@education/lessons',
  QUIZZES: '@education/quizzes',
  USER_PROGRESS: '@education/progress',
  LANGUAGE: '@education/language',
};

export class OfflineStorageService {
  private static instance: OfflineStorageService;

  private constructor() {}

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async saveLesson(lessonId: string, lessonData: any): Promise<void> {
    try {
      const lessons = await this.getLessons();
      lessons[lessonId] = {
        ...lessonData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (error) {
      console.error('Failed to save lesson:', error);
      throw error;
    }
  }

  async getLesson(lessonId: string): Promise<any | null> {
    try {
      const lessons = await this.getLessons();
      return lessons[lessonId] || null;
    } catch (error) {
      console.error('Failed to get lesson:', error);
      throw error;
    }
  }

  async getLessons(): Promise<Record<string, any>> {
    try {
      const lessonsJson = await AsyncStorage.getItem(STORAGE_KEYS.LESSONS);
      return lessonsJson ? JSON.parse(lessonsJson) : {};
    } catch (error) {
      console.error('Failed to get lessons:', error);
      throw error;
    }
  }

  async saveQuiz(quizId: string, quizData: any): Promise<void> {
    try {
      const quizzes = await this.getQuizzes();
      quizzes[quizId] = {
        ...quizData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Failed to save quiz:', error);
      throw error;
    }
  }

  async getQuiz(quizId: string): Promise<any | null> {
    try {
      const quizzes = await this.getQuizzes();
      return quizzes[quizId] || null;
    } catch (error) {
      console.error('Failed to get quiz:', error);
      throw error;
    }
  }

  async getQuizzes(): Promise<Record<string, any>> {
    try {
      const quizzesJson = await AsyncStorage.getItem(STORAGE_KEYS.QUIZZES);
      return quizzesJson ? JSON.parse(quizzesJson) : {};
    } catch (error) {
      console.error('Failed to get quizzes:', error);
      throw error;
    }
  }

  async saveProgress(userId: string, progressData: any): Promise<void> {
    try {
      const progress = await this.getAllProgress();
      progress[userId] = {
        ...progressData,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }

  async getProgress(userId: string): Promise<any | null> {
    try {
      const progress = await this.getAllProgress();
      return progress[userId] || null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      throw error;
    }
  }

  async getAllProgress(): Promise<Record<string, any>> {
    try {
      const progressJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      return progressJson ? JSON.parse(progressJson) : {};
    } catch (error) {
      console.error('Failed to get all progress:', error);
      throw error;
    }
  }

  async saveLanguagePreference(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      throw error;
    }
  }

  async getLanguagePreference(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    } catch (error) {
      console.error('Failed to get language preference:', error);
      throw error;
    }
  }

  async clearStorage(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
}

export const offlineStorage = OfflineStorageService.getInstance();