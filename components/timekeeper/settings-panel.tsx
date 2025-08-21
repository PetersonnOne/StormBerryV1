'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ConnectionStatus {
  google: boolean;
  microsoft: boolean;
  resend: boolean;
  twilio: boolean;
}

export function SettingsPanel() {
  const [apiKeys, setApiKeys] = useState({
    resend: '',
    twilio: {
      accountSid: '',
      authToken: ''
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    google: false,
    microsoft: false,
    resend: false,
    twilio: false
  });

  const connectGoogle = async () => {
    // TODO: Implement Google OAuth flow
    try {
      // Initiate Google OAuth
      console.log('Connecting to Google...');
    } catch (error) {
      console.error('Error connecting to Google:', error);
    }
  };

  const connectMicrosoft = async () => {
    // TODO: Implement Microsoft OAuth flow
    try {
      // Initiate Microsoft OAuth
      console.log('Connecting to Microsoft...');
    } catch (error) {
      console.error('Error connecting to Microsoft:', error);
    }
  };

  const saveAPIKeys = async () => {
    // TODO: Implement secure API key storage
    try {
      // Save API keys securely
      console.log('Saving API keys...');
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Calendar Connections</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Google Calendar</h4>
              <p className="text-sm text-gray-500">
                {connectionStatus.google ? 'Connected' : 'Not connected'}
              </p>
            </div>
            <Button
              onClick={connectGoogle}
              variant={connectionStatus.google ? 'outline' : 'default'}
            >
              {connectionStatus.google ? 'Disconnect' : 'Connect'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Microsoft Calendar</h4>
              <p className="text-sm text-gray-500">
                {connectionStatus.microsoft ? 'Connected' : 'Not connected'}
              </p>
            </div>
            <Button
              onClick={connectMicrosoft}
              variant={connectionStatus.microsoft ? 'outline' : 'default'}
            >
              {connectionStatus.microsoft ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="resend-key">Resend API Key</Label>
            <Input
              id="resend-key"
              type="password"
              value={apiKeys.resend}
              onChange={(e) => setApiKeys({ ...apiKeys, resend: e.target.value })}
              placeholder="Enter your Resend API key"
            />
          </div>

          <div>
            <Label htmlFor="twilio-sid">Twilio Account SID</Label>
            <Input
              id="twilio-sid"
              type="password"
              value={apiKeys.twilio.accountSid}
              onChange={(e) => setApiKeys({
                ...apiKeys,
                twilio: { ...apiKeys.twilio, accountSid: e.target.value }
              })}
              placeholder="Enter your Twilio Account SID"
            />
          </div>

          <div>
            <Label htmlFor="twilio-token">Twilio Auth Token</Label>
            <Input
              id="twilio-token"
              type="password"
              value={apiKeys.twilio.authToken}
              onChange={(e) => setApiKeys({
                ...apiKeys,
                twilio: { ...apiKeys.twilio, authToken: e.target.value }
              })}
              placeholder="Enter your Twilio Auth Token"
            />
          </div>

          <Button
            onClick={saveAPIKeys}
            className="w-full"
            disabled={!apiKeys.resend && !apiKeys.twilio.accountSid && !apiKeys.twilio.authToken}
          >
            Save API Keys
          </Button>
        </div>
      </Card>
    </div>
  );
}