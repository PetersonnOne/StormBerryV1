'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ModelSelector from '@/components/ui/model-selector';

type Location = {
  id: string;
  name: string;
  description: string;
  climate?: string;
  culture?: string;
  landmarks?: string[];
};

type WorldData = {
  name: string;
  description: string;
  history: string;
  magicSystem?: string;
  technology?: string;
  locations: Location[];
};

export function WorldBuilder() {
  const [worldData, setWorldData] = useState<WorldData>({
    name: '',
    description: '',
    history: '',
    magicSystem: '',
    technology: '',
    locations: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');

  const exportWorldAsDoc = useCallback(() => {
    if (!worldData.name.trim()) {
      toast.error('World name is required for export');
      return;
    }

    try {
      // Create document content
      const worldName = worldData.name || 'Untitled World';
      
      let docContent = `${worldName}\n\n`;
      
      if (worldData.description) {
        docContent += `Description:\n${worldData.description}\n\n`;
      }
      
      if (worldData.history) {
        docContent += `History:\n${worldData.history}\n\n`;
      }
      
      if (worldData.magicSystem) {
        docContent += `Magic System:\n${worldData.magicSystem}\n\n`;
      }
      
      if (worldData.technology) {
        docContent += `Technology:\n${worldData.technology}\n\n`;
      }
      
      if (worldData.locations.length > 0) {
        docContent += `Locations:\n\n`;
        worldData.locations.forEach((location, index) => {
          docContent += `${index + 1}. ${location.name || 'Unnamed Location'}\n`;
          if (location.description) docContent += `   Description: ${location.description}\n`;
          if (location.climate) docContent += `   Climate: ${location.climate}\n`;
          if (location.culture) docContent += `   Culture: ${location.culture}\n`;
          if (location.landmarks && location.landmarks.length > 0) {
            docContent += `   Landmarks: ${location.landmarks.join(', ')}\n`;
          }
          docContent += '\n';
        });
      }

      // Create and download file
      const blob = new Blob([docContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${worldName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_world.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('World data exported successfully');
    } catch (error) {
      console.error('Error exporting world:', error);
      toast.error('Failed to export world data');
    }
  }, [worldData]);

  const generateWorldDetails = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/story/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: worldData.name,
          description: worldData.description,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate world details');
      
      const data = await response.json();
      setWorldData(prev => ({
        ...prev,
        history: data.history || prev.history,
        magicSystem: data.magicSystem || prev.magicSystem,
        technology: data.technology || prev.technology,
      }));

      toast.success('World details generated successfully');
    } catch (error) {
      console.error('Error generating world details:', error);
      toast.error('Failed to generate world details');
    } finally {
      setIsGenerating(false);
    }
  }, [worldData.name, worldData.description, selectedModel]);

  const addLocation = () => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: '',
      description: '',
      landmarks: [],
    };
    setWorldData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
    setSelectedLocation(newLocation.id);
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setWorldData(prev => ({
      ...prev,
      locations: prev.locations.map(loc =>
        loc.id === id ? { ...loc, ...updates } : loc
      ),
    }));
  };

  const removeLocation = (id: string) => {
    setWorldData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== id),
    }));
    if (selectedLocation === id) {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-2xl font-bold">World Overview</h3>
          
          <div className="space-y-4">
            <Input
              placeholder="World Name"
              value={worldData.name}
              onChange={(e) => setWorldData(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <Textarea
              placeholder="World Description"
              value={worldData.description}
              onChange={(e) => setWorldData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">AI Model:</span>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={exportWorldAsDoc}
              >
                Save World
              </Button>
              <Button
                onClick={generateWorldDetails}
                disabled={isGenerating || !worldData.name}
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
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-2xl font-bold">World Details</h3>
          
          <div className="space-y-4">
            <Textarea
              placeholder="World History"
              value={worldData.history}
              onChange={(e) => setWorldData(prev => ({ ...prev, history: e.target.value }))}
              rows={4}
            />

            <Textarea
              placeholder="Magic System (if applicable)"
              value={worldData.magicSystem}
              onChange={(e) => setWorldData(prev => ({ ...prev, magicSystem: e.target.value }))}
              rows={3}
            />

            <Textarea
              placeholder="Technology Level"
              value={worldData.technology}
              onChange={(e) => setWorldData(prev => ({ ...prev, technology: e.target.value }))}
              rows={3}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Locations</h3>
            <Button
              size="sm"
              onClick={addLocation}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Location
            </Button>
          </div>

          <div className="space-y-2">
            {worldData.locations.map(location => (
              <div
                key={location.id}
                className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedLocation === location.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
                onClick={() => setSelectedLocation(location.id)}
              >
                <span>{location.name || 'Unnamed Location'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(location.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {selectedLocation && (
          <Card className="p-4 space-y-4">
            <h4 className="text-lg font-semibold">Location Details</h4>
            {worldData.locations.map(location => (
              location.id === selectedLocation && (
                <div key={location.id} className="space-y-4">
                  <Input
                    placeholder="Location Name"
                    value={location.name}
                    onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                  />
                  
                  <Textarea
                    placeholder="Description"
                    value={location.description}
                    onChange={(e) => updateLocation(location.id, { description: e.target.value })}
                    rows={3}
                  />

                  <Input
                    placeholder="Climate"
                    value={location.climate}
                    onChange={(e) => updateLocation(location.id, { climate: e.target.value })}
                  />

                  <Input
                    placeholder="Culture"
                    value={location.culture}
                    onChange={(e) => updateLocation(location.id, { culture: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Landmarks</label>
                    <div className="space-y-2">
                      {location.landmarks?.map((landmark, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={landmark}
                            onChange={(e) => {
                              const newLandmarks = [...(location.landmarks || [])];
                              newLandmarks[index] = e.target.value;
                              updateLocation(location.id, { landmarks: newLandmarks });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newLandmarks = location.landmarks?.filter((_, i) => i !== index);
                              updateLocation(location.id, { landmarks: newLandmarks });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLandmarks = [...(location.landmarks || []), ''];
                          updateLocation(location.id, { landmarks: newLandmarks });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Landmark
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}