'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelType, aiService } from '@/lib/ai/unified-ai-service';

interface ModelSelectorProps {
  selectedModel?: ModelType;
  onModelChange?: (model: ModelType) => void;
  value?: ModelType;
  onValueChange?: (model: ModelType) => void;
  onChange?: (model: ModelType) => void;
  disabled?: boolean;
  excludeModels?: ModelType[];
  includeOnly?: ModelType[];
  className?: string;
}

export function ModelSelector({ selectedModel, onModelChange, value, onValueChange, onChange, disabled, excludeModels, includeOnly, className }: ModelSelectorProps) {
  let models = aiService.getAvailableModels();
  
  // Filter models based on includeOnly or excludeModels
  if (includeOnly && includeOnly.length > 0) {
    models = models.filter(model => includeOnly.includes(model.value));
  } else if (excludeModels && excludeModels.length > 0) {
    models = models.filter(model => !excludeModels.includes(model.value));
  }

  const currentValue = selectedModel || value;
  
  const handleChange = (model: ModelType) => {
    // Don't allow selection of disabled models
    const selectedModelData = models.find(m => m.value === model);
    if (selectedModelData?.disabled) {
      return;
    }
    
    onModelChange?.(model);
    onValueChange?.(model);
    onChange?.(model);
  };

  return (
    <Select value={currentValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={className || "w-[200px]"}>
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
