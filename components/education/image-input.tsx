'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { getStore } from '@netlify/blobs';

interface ImageInputProps {
  setLoading: (loading: boolean) => void;
}

export default function ImageInput({ setLoading }: ImageInputProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

      // Upload to Netlify Blobs
      const store = getStore({ name: 'education-images' });
      const uniqueKey = `${Date.now()}-${selectedImage.name}`;
      await store.set(uniqueKey, selectedImage);

      // TODO: Implement GPT-5 API call with image URL
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        ref={fileInputRef}
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
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
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