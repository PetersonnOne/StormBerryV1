'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversionResult {
  timezone: string;
  time: string;
  offset: string;
  date: string;
}

export function TimeConverter() {
  const [sourceDateTime, setSourceDateTime] = useState('');
  const [sourceZone, setSourceZone] = useState('');
  const [targetZones, setTargetZones] = useState<string[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);

  // Will be replaced with actual API integration
  const convertTime = async () => {
    // TODO: Implement Abstract API integration for time conversion
    // Fallback to IPGeolocation API if needed
    try {
      // Simulated API call
      const converted: ConversionResult[] = [];
      setResults(converted);
    } catch (error) {
      console.error('Error converting time:', error);
    }
  };

  const addTargetZone = (zone: string) => {
    if (!targetZones.includes(zone)) {
      setTargetZones([...targetZones, zone]);
    }
  };

  const removeTargetZone = (zone: string) => {
    setTargetZones(targetZones.filter(tz => tz !== zone));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={sourceDateTime}
              onChange={(e) => setSourceDateTime(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="source-zone">Source Time Zone</Label>
            <Input
              id="source-zone"
              value={sourceZone}
              onChange={(e) => setSourceZone(e.target.value)}
              placeholder="Select source timezone"
            />
          </div>
        </div>

        <div>
          <Label>Target Time Zones</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {targetZones.map((zone) => (
              <Card key={zone} className="p-2 flex items-center gap-2">
                <span>{zone}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTargetZone(zone)}
                >
                  ×
                </Button>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() => addTargetZone('New Zone')} // Will be replaced with zone selector
            >
              + Add Zone
            </Button>
          </div>
        </div>

        <Button
          onClick={convertTime}
          disabled={!sourceDateTime || !sourceZone || targetZones.length === 0}
        >
          Convert
        </Button>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        {results.map((result, index) => (
          <Card key={index} className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{result.timezone}</h3>
                <p className="text-sm text-gray-500">{result.offset}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono">{result.time}</p>
                <p className="text-sm text-gray-500">{result.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}