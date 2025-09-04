'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ui/model-selector';

type WorkflowStep = {
  id: string;
  type: 'text-generation' | 'summarization' | 'translation' | 'email';
  config: Record<string, any>;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  steps: WorkflowStep[];
};

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowTemplate | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const { toast } = useToast();

  const stepTypes = [
    { id: 'text-generation', label: 'Generate Text' },
    { id: 'summarization', label: 'Summarize' },
    { id: 'translation', label: 'Translate' },
    { id: 'email', label: 'Send Email' },
  ];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'steps' && destination.droppableId === 'workflow') {
      const stepType = stepTypes[source.index];
      const newStep: WorkflowStep = {
        id: `${stepType.id}-${Date.now()}`,
        type: stepType.id as WorkflowStep['type'],
        config: {},
      };

      if (currentWorkflow) {
        const newSteps = Array.from(currentWorkflow.steps);
        newSteps.splice(destination.index, 0, newStep);
        setCurrentWorkflow({ ...currentWorkflow, steps: newSteps });
      }
    }
  };

  const generateWorkflow = async () => {
    if (!currentWorkflow?.name) {
      toast({
        title: 'Error',
        description: 'Please give your workflow a name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/business/create-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: currentWorkflow.name,
          industry: 'general',
          complexity: 'moderate',
          steps: ['automation', 'ai'],
          tools: ['automation', 'ai'],
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate workflow');
      }

      const data = await response.json();
      
      // Convert AI-generated workflow to our format
      const generatedSteps = data.workflow.steps.map((step: any, index: number) => ({
        id: `step-${index}-${Date.now()}`,
        type: 'text-generation' as WorkflowStep['type'],
        config: { title: step.title, description: step.description },
      }));

      setCurrentWorkflow({
        ...currentWorkflow,
        steps: generatedSteps,
      });

      toast({
        title: 'Success',
        description: 'AI workflow generated successfully',
      });
    } catch (error) {
      console.error('Workflow generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate workflow',
        variant: 'destructive',
      });
    }
  };

  const saveWorkflow = async () => {
    if (!currentWorkflow?.name) {
      toast({
        title: 'Error',
        description: 'Please give your workflow a name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setWorkflows([...workflows, currentWorkflow]);
      setCurrentWorkflow(null);

      toast({
        title: 'Success',
        description: 'Workflow saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save workflow',
        variant: 'destructive',
      });
    }
  };

  const createNewWorkflow = () => {
    setCurrentWorkflow({
      id: `workflow-${Date.now()}`,
      name: '',
      steps: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Workflow Builder</h2>
        <Button onClick={createNewWorkflow} disabled={!!currentWorkflow}>
          Create New Workflow
        </Button>
      </div>

      {currentWorkflow && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Workflow Name"
              value={currentWorkflow.name}
              onChange={(e) => setCurrentWorkflow({ ...currentWorkflow, name: e.target.value })}
              className="max-w-md"
            />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">AI Model:</span>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <h3 className="text-lg font-medium mb-4">Available Steps</h3>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {stepTypes.map((step, index) => (
                        <Draggable key={step.id} draggableId={step.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 bg-secondary rounded-lg cursor-move"
                            >
                              {step.label}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-4">Current Workflow</h3>
                <Droppable droppableId="workflow">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px] p-4 border-2 border-dashed rounded-lg"
                    >
                      {currentWorkflow.steps.map((step, index) => (
                        <Draggable key={step.id} draggableId={step.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 mb-2 bg-card rounded-lg cursor-move"
                            >
                              {stepTypes.find((t) => t.id === step.type)?.label}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>

          <div className="flex justify-end gap-2">
            <Button onClick={generateWorkflow} variant="outline">
              Generate with AI
            </Button>
            <Button onClick={saveWorkflow}>Save Workflow</Button>
          </div>
        </div>
      )}

      {!currentWorkflow && workflows.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Saved Workflows</h3>
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 bg-card rounded-lg flex justify-between items-center"
              >
                <span>{workflow.name}</span>
                <Button
                  onClick={() => setCurrentWorkflow(workflow)}
                  variant="outline"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}