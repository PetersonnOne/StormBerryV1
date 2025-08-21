'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeZone {
  id: string;
  name: string;
  offset: string;
  currentTime: string;
  isDST: boolean;
}

export function ZoneCardCreator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<TimeZone | null>(null);
  const [zoneLabel, setZoneLabel] = useState('');
  const [savedZones, setSavedZones] = useState<TimeZone[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Simulated timezone search - will be replaced with actual API call
  const searchTimezones = async (query: string) => {
    // TODO: Implement WorldTimeAPI integration
    return [];
  };

  // Update time every second for saved zones
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      
      // TODO: Update times for all saved zones using their offsets
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSaveZone = () => {
    if (selectedZone && zoneLabel) {
      setSavedZones([...savedZones, { ...selectedZone, name: zoneLabel }]);
      setSelectedZone(null);
      setZoneLabel('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Time Zone</Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a timezone..."
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="label">Zone Label</Label>
            <Input
              id="label"
              value={zoneLabel}
              onChange={(e) => setZoneLabel(e.target.value)}
              placeholder="Enter a label for this timezone"
            />
          </div>
        </div>
        
        <Button
          onClick={handleSaveZone}
          disabled={!selectedZone || !zoneLabel}
        >
          Save Zone
        </Button>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        {savedZones.map((zone) => (
          <Card key={zone.id} className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{zone.name}</h3>
                <p className="text-sm text-gray-500">{zone.offset}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono">{zone.currentTime}</p>
                {zone.isDST && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    DST
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}