const translations = {
  education: {
    title: 'Education Module',
    input: {
      text: {
        label: 'Ask a Question',
        placeholder: 'Type your question here...',
        submit: 'Submit',
        error: 'Please enter a valid question',
      },
      voice: {
        start: 'Start Recording',
        stop: 'Stop Recording',
        processing: 'Processing your voice...',
        error: 'Error processing voice input',
        permission: 'Please grant microphone permission',
      },
      image: {
        select: 'Select Image',
        upload: 'Upload',
        processing: 'Processing image...',
        error: 'Error uploading image',
        format: 'Supported formats: JPG, PNG, GIF',
        size: 'Maximum file size: 5MB',
      },
    },
    lesson: {
      loading: 'Loading lesson...',
      error: 'Error loading lesson',
      next: 'Next',
      previous: 'Previous',
      complete: 'Complete Lesson',
      progress: 'Progress: {{completed}}/{{total}}',
    },
    quiz: {
      title: 'Quiz',
      start: 'Start Quiz',
      next: 'Next Question',
      submit: 'Submit Answer',
      result: 'Quiz Result',
      score: 'Your Score: {{score}}/{{total}}',
      retry: 'Try Again',
      loading: 'Loading quiz...',
      error: 'Error loading quiz',
      explanation: 'Explanation',
      correct: 'Correct!',
      incorrect: 'Incorrect',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    offline: {
      status: 'You are offline',
      limited: 'Limited functionality available',
      sync: 'Sync when online',
    },
  },
};

export default translations;