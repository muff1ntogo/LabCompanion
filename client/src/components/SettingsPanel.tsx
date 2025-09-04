import React, { useEffect } from 'react';
import { useSettings, ThemeMode, CornerStyle } from '@/lib/stores/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Moon, Sun, Square, Circle } from 'lucide-react';

interface SettingsPanelProps {
  trigger?: React.ReactNode;
}

export function SettingsPanel({ trigger }: SettingsPanelProps) {
  const {
    themeMode,
    cornerStyle,
    setThemeMode,
    setCornerStyle,
    loadFromStorage
  } = useSettings();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleThemeToggle = (checked: boolean) => {
    setThemeMode(checked ? 'dark' : 'light');
  };

  const handleCornerStyleChange = (value: string) => {
    setCornerStyle(value as CornerStyle);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Settings className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your ResearchLab experience with theme and style preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Mode */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Appearance</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm">
                  {themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <Switch
                checked={themeMode === 'dark'}
                onCheckedChange={handleThemeToggle}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>

          {/* Corner Style */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Card Style</Label>
            <Select value={cornerStyle} onValueChange={handleCornerStyleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    Rounded Corners
                  </div>
                </SelectItem>
                <SelectItem value="sharp">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Sharp Corners
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose between rounded or sharp corner styles for cards
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Preview</Label>
            <Card className={cornerStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sample Card</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 dark:text-gray-300">
                This is how cards will appear with your current style settings.
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}