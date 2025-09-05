'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import ModelSelector from '@/components/ui/model-selector';

interface ImageInputProps {
  setLoading: (loading: boolean) => void;
  onResponse: (response: string) => void;
}

export default function ImageInput({ setLoading, onResponse }: ImageInputProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: 'Error',
        description: 'Please select an image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64 for direct processing
      const reader = new FileReader();
      const imageDataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });
      
      const imageData = await imageDataPromise;
      
      // Call education API to process the image directly
      const response = await fetch('/api/education/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question || 'What do you see in this image? Please explain it in an educational context.',
          type: 'image',
          imageData: imageData,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const data = await response.json();
      onResponse(data.answer);
      // Keep the image and question for user reference - don't clear immediately
      // setSelectedImage(null);
      // setPreview(null);
      // setQuestion('');
      
    } catch (error) {
      console.error('Education image input error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">AI Model:</span>
        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          includeOnly={['gemini-2.5-pro', 'gemini-2.5-flash']}
        />
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        ref={fileInputRef}
      />

      <Textarea
        placeholder="Ask a question about the image (optional)..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[80px]"
      />

      <Card
        className="border-dashed border-2 p-4 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Selected"
            className="max-h-[200px] mx-auto"
          />
        ) : (
          <div className="py-8">
            <Image className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2">Click to select an image</p>
          </div>
        )}
      </Card>

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!selectedImage}
      >
        Submit Image
      </Button>
    </div>
  );
}