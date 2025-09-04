'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>;
  showExplanation: boolean;
}

export default function QuizSection() {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    showExplanation: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuizQuestions();
  }, []);

  const loadQuizQuestions = async () => {
    try {
      setLoading(true);
      // Generate quiz using education API
      const response = await fetch('/api/education/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'General Knowledge',
          difficulty: 'medium',
          questionCount: 5,
          questionTypes: ['multiple-choice'],
          model: 'gemini-2.5-pro',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      if (data.quiz && data.quiz.questions) {
        setQuizState(prev => ({ 
          ...prev, 
          questions: data.quiz.questions,
          currentIndex: 0,
          answers: {},
          showExplanation: false
        }));
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load quiz questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    const currentQuestion = quizState.questions[quizState.currentIndex];
    const answer = parseInt(value);

    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: answer },
      showExplanation: true,
    }));
  };

  const handleNext = () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showExplanation: false,
      }));
    } else {
      // Quiz completed
      const correctAnswers = Object.entries(quizState.answers).filter(
        ([id, answer]) => {
          const question = quizState.questions.find(q => q.id === id);
          return question?.correctAnswer === answer;
        }
      ).length;

      toast({
        title: 'Quiz Completed!',
        description: `You got ${correctAnswers} out of ${quizState.questions.length} questions correct.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-gray-500">Loading quiz questions...</p>
      </div>
    );
  }

  if (quizState.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No quiz questions available.</p>
        <Button
          onClick={loadQuizQuestions}
          className="mt-4"
        >
          Generate New Quiz
        </Button>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentIndex];
  const selectedAnswer = quizState.answers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Question {quizState.currentIndex + 1} of {quizState.questions.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadQuizQuestions}
        >
          New Quiz
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-lg mb-4">{currentQuestion.text}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index.toString())}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                quizState.answers[currentQuestion.id] === index
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {quizState.showExplanation && (
          <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="mt-2">{currentQuestion.explanation}</p>
          </div>
        )}
      </Card>

      {quizState.showExplanation && (
        <Button
          onClick={handleNext}
          className="w-full"
        >
          {quizState.currentIndex < quizState.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      )}
    </div>
  );
}