import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CompanionCharacter } from './CompanionCharacter';
import { useQuests } from '@/lib/stores/useQuests';
import { Heart, Star, Zap, Settings, Palette, Volume2, VolumeX } from 'lucide-react';

export function CompanionPage() {
  const { companion, interactWithCompanion } = useQuests();
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const companionThemes = [
    { id: 'default', name: 'Default', color: '#4ade80' },
    { id: 'fire', name: 'Fire', color: '#f97316' },
    { id: 'water', name: 'Water', color: '#3b82f6' },
    { id: 'earth', name: 'Earth', color: '#84cc16' },
    { id: 'electric', name: 'Electric', color: '#eab308' },
    { id: 'cosmic', name: 'Cosmic', color: '#a855f7' }
  ];

  const getMoodDescription = (mood: string) => {
    switch (mood) {
      case 'happy': return 'Your companion is feeling happy and energetic!';
      case 'excited': return 'Your companion is excited about your research progress!';
      case 'working': return 'Your companion is focused and ready to help with research.';
      case 'sleepy': return 'Your companion needs some rest to recharge energy.';
      case 'proud': return 'Your companion is proud of your achievements!';
      default: return 'Your companion is ready for new adventures!';
    }
  };

  return (
    <div className="h-full overflow-auto scrollbar-hide p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Companion Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize and interact with your research companion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companion Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Your Companion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Large companion display */}
              <div className="w-full h-64 mb-4">
                <CompanionCharacter isMinimized={false} />
              </div>
              
              {/* Companion stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Energy</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {companion.energy}/100
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Mood</span>
                  <Badge variant="outline" className="capitalize">
                    {companion.mood}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {getMoodDescription(companion.mood)}
                </div>
                
                <Button onClick={interactWithCompanion} className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Interact with Companion
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Companion Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Companion Theme
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {companionThemes.map((theme) => (
                    <Button
                      key={theme.id}
                      variant={selectedTheme === theme.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTheme(theme.id)}
                      className="justify-start"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Animation Speed */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Animation Speed
                </h3>
                <Slider
                  value={animationSpeed}
                  onValueChange={setAnimationSpeed}
                  max={3}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Sound Settings */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Companion Sounds
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Enable interaction sounds
                  </span>
                  <Button 
                    variant={soundEnabled ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companion Stats & Achievements */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Companion Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {companion.totalInteractions || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Interactions
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.floor(companion.energy / 20) + 1}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Companion Level
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {companion.energy}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Happiness
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Badge variant="outline" className="p-2 justify-start">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    First Interaction
                  </Badge>
                  <Badge variant="outline" className="p-2 justify-start">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Caring Researcher
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}