'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PageLoading({ 
  message = "Loading...", 
  className,
  size = 'md' 
}: PageLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <div className="flex items-center space-x-3">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <span className="text-lg font-medium text-muted-foreground">
          {message}
        </span>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

interface OperationLoadingProps {
  message?: string;
  progress?: number;
  className?: string;
}

export function OperationLoading({ 
  message = "Processing...", 
  progress,
  className 
}: OperationLoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 space-y-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{message}</p>
        {progress !== undefined && (
          <div className="w-64 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Please wait while we process your request...
        </p>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineLoading({ 
  message = "Loading...", 
  size = 'sm',
  className 
}: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
