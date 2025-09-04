'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelType, aiService } from '@/lib/ai/unified-ai-service';

interface ModelSelectorProps {
  value: ModelType;
  onValueChange?: (model: ModelType) => void;
  onChange?: (model: ModelType) => void;
  disabled?: boolean;
}

export default function ModelSelector({ value, onValueChange, onChange, disabled }: ModelSelectorProps) {
  const models = aiService.getAvailableModels();

  const handleChange = (model: ModelType) => {
    // Don't allow selection of disabled models
    const selectedModel = models.find(m => m.value === model);
    if (selectedModel?.disabled) {
      return;
    }
    
    onValueChange?.(model);
    onChange?.(model);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select AI Model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem 
            key={model.value} 
            value={model.value}
            disabled={model.disabled}
            className={model.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
