'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ModelSelector from '@/components/ui/model-selector';

type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
  background: string;
  personality: string;
  goals: string[];
  relationships: Array<{
    characterId: string;
    relationship: string;
  }>;
  imagePrompt?: string;
  imageUrl?: string;
};

export function CharacterManager() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');

  const saveCharacters = useCallback(async () => {
    try {
      const response = await fetch('/api/story/save-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters }),
      });

      if (!response.ok) throw new Error('Failed to save characters');
      toast.success('Characters saved successfully');
    } catch (error) {
      console.error('Error saving characters:', error);
      toast.error('Failed to save characters');
    }
  }, [characters]);

  const generateCharacterDetails = useCallback(async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character?.name) {
      toast.error('Character name is required');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/story/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: character.name,
          role: character.role,
          existingCharacters: characters.filter(c => c.id !== characterId),
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate character details');
      
      const data = await response.json();
      setCharacters(prev => prev.map(c => (
        c.id === characterId ? {
          ...c,
          description: data.description || c.description,
          background: data.background || c.background,
          personality: data.personality || c.personality,
          goals: data.goals || c.goals,
          imagePrompt: data.imagePrompt,
        } : c
      )));

      toast.success('Character details generated successfully');
    } catch (error) {
      console.error('Error generating character details:', error);
      toast.error('Failed to generate character details');
    } finally {
      setIsGenerating(false);
    }
  }, [characters]);

  const generateCharacterImage = useCallback(async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character?.imagePrompt) {
      toast.error('Character description is required for image generation');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/story/generate-character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: character.imagePrompt,
          characterId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate character image');
      
      const data = await response.json();
      setCharacters(prev => prev.map(c => (
        c.id === characterId ? { ...c, imageUrl: data.imageUrl } : c
      )));

      toast.success('Character image generated successfully');
    } catch (error) {
      console.error('Error generating character image:', error);
      toast.error('Failed to generate character image');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [characters]);

  const addCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: '',
      role: '',
      description: '',
      background: '',
      personality: '',
      goals: [],
      relationships: [],
    };
    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacter(newCharacter.id);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(char =>
      char.id === id ? { ...char, ...updates } : char
    ));
  };

  const removeCharacter = (id: string) => {
    setCharacters(prev => prev.filter(char => char.id !== id));
    if (selectedCharacter === id) {
      setSelectedCharacter(null);
    }
  };

  const addGoal = (characterId: string) => {
    setCharacters(prev => prev.map(char =>
      char.id === characterId
        ? { ...char, goals: [...(char.goals || []), ''] }
        : char
    ));
  };

  const updateGoal = (characterId: string, index: number, value: string) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === characterId) {
        const newGoals = [...char.goals];
        newGoals[index] = value;
        return { ...char, goals: newGoals };
      }
      return char;
    }));
  };

  const removeGoal = (characterId: string, index: number) => {
    setCharacters(prev => prev.map(char => {
      if (char.id === characterId) {
        const newGoals = char.goals.filter((_, i) => i !== index);
        return { ...char, goals: newGoals };
      }
      return char;
    }));
  };

  const addRelationship = (characterId: string) => {
    setCharacters(prev => prev.map(char =>
      char.id === characterId
        ? {
            ...char,
            relationships: [
              ...(char.relationships || []),
              { characterId: '', relationship: '' }
            ]
          }
        : char
    ));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Characters</h3>
            <Button
              size="sm"
              onClick={addCharacter}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Character
            </Button>
          </div>

          <div className="space-y-2">
            {characters.map(character => (
              <div
                key={character.id}
                className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedCharacter === character.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                onClick={() => setSelectedCharacter(character.id)}
              >
                <span>{character.name || 'Unnamed Character'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCharacter(character.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Button
          className="w-full"
          variant="outline"
          onClick={saveCharacters}
        >
          Save All Characters
        </Button>
      </div>

      {selectedCharacter && (
        <div className="md:col-span-2">
          {characters.map(character => (
            character.id === selectedCharacter && (
              <div key={character.id} className="space-y-6">
                <Card className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-grow">
                      <Input
                        placeholder="Character Name"
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                      />
                      
                      <Input
                        placeholder="Role in Story"
                        value={character.role}
                        onChange={(e) => updateCharacter(character.id, { role: e.target.value })}
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">AI Model:</span>
                        <ModelSelector
                          value={selectedModel}
                          onChange={setSelectedModel}
                        />
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        onClick={() => generateCharacterDetails(character.id)}
                        disabled={isGenerating || !character.name}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Details'
                        )}
                      </Button>

                      {character.imagePrompt && (
                        <Button
                          onClick={() => generateCharacterImage(character.id)}
                          disabled={isGeneratingImage}
                          variant="outline"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Image...
                            </>
                          ) : (
                            'Generate Image'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {character.imageUrl && (
                    <div className="relative w-48 h-48 mx-auto">
                      <img
                        src={character.imageUrl}
                        alt={character.name}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    </div>
                  )}
                </Card>

                <Card className="p-6 space-y-4">
                  <h4 className="text-lg font-semibold">Character Details</h4>
                  
                  <Textarea
                    placeholder="Physical Description"
                    value={character.description}
                    onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                    rows={3}
                  />

                  <Textarea
                    placeholder="Background Story"
                    value={character.background}
                    onChange={(e) => updateCharacter(character.id, { background: e.target.value })}
                    rows={4}
                  />

                  <Textarea
                    placeholder="Personality Traits"
                    value={character.personality}
                    onChange={(e) => updateCharacter(character.id, { personality: e.target.value })}
                    rows={3}
                  />
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Character Goals</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addGoal(character.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {character.goals.map((goal, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={goal}
                          onChange={(e) => updateGoal(character.id, index, e.target.value)}
                          placeholder="Character goal"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoal(character.id, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Relationships</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addRelationship(character.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Relationship
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {character.relationships.map((rel, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <select
                          value={rel.characterId}
                          onChange={(e) => {
                            const newRelationships = [...character.relationships];
                            newRelationships[index] = {
                              ...newRelationships[index],
                              characterId: e.target.value,
                            };
                            updateCharacter(character.id, { relationships: newRelationships });
                          }}
                          className="border rounded p-2"
                        >
                          <option value="">Select Character</option>
                          {characters
                            .filter(c => c.id !== character.id)
                            .map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name || 'Unnamed Character'}
                              </option>
                            ))}
                        </select>
                        
                        <div className="flex gap-2">
                          <Input
                            value={rel.relationship}
                            onChange={(e) => {
                              const newRelationships = [...character.relationships];
                              newRelationships[index] = {
                                ...newRelationships[index],
                                relationship: e.target.value,
                              };
                              updateCharacter(character.id, { relationships: newRelationships });
                            }}
                            placeholder="Relationship type"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRelationships = character.relationships.filter((_, i) => i !== index);
                              updateCharacter(character.id, { relationships: newRelationships });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}