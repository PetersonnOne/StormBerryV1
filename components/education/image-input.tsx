'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';
// import { getStore } from '@netlify/blobs'; // TODO: Add when package is installed

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

      // TODO: Upload to Netlify Blobs when package is installed
      // const store = getStore({ name: 'education-images' });
      // const uniqueKey = `${Date.now()}-${selectedImage.name}`;
      // await store.set(uniqueKey, selectedImage);

      // Simulate processing for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Image processed successfully!',
      });
      
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