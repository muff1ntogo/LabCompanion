import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FlaskConical, 
  Timer, 
  CheckSquare, 
  Trophy, 
  Heart,
  Menu,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ProtocolBuilder } from './ProtocolBuilder';
import { TimerManager } from './TimerManager';
import { ChecklistManager } from './ChecklistManager';
import { QuestSystem } from './QuestSystem';
import { CompanionCharacter } from './CompanionCharacter';
import { useQuests } from '@/lib/stores/useQuests';
import { useAudio } from '@/lib/stores/useAudio';
import { cn } from '@/lib/utils';

export function GameUI() {
  const [activeTab, setActiveTab] = useState('protocols');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { playerScore, level, companion } = useQuests();
  const { isMuted, toggleMute } = useAudio();

  const tabs = [
    {
      id: 'protocols',
      label: 'Protocols',
      icon: <FlaskConical className="w-4 h-4" />,
      component: <ProtocolBuilder />
    },
    {
      id: 'timers',
      label: 'Timers',
      icon: <Timer className="w-4 h-4" />,
      component: <TimerManager />
    },
    {
      id: 'checklists',
      label: 'Lists',
      icon: <CheckSquare className="w-4 h-4" />,
      component: <ChecklistManager />
    },
    {
      id: 'quests',
      label: 'Quests',
      icon: <Trophy className="w-4 h-4" />,
      component: <QuestSystem />
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">ResearchLab</h1>
          </div>

          {/* Player Stats - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{playerScore} pts</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Level {level}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-gray-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-blue-600" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8 w-8 p-0"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{playerScore} pts</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Level {level}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className="justify-start"
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-80 bg-white border-r flex-col">
          {/* Companion */}
          <div className="p-4 border-b">
            <CompanionCharacter />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
              <TabsList className="grid w-full grid-cols-1 h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Mobile Companion */}
          <div className="md:hidden p-4 bg-white border-b">
            <CompanionCharacter />
          </div>

          {/* Content Area */}
          <div className="h-full overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {tabs.map((tab) => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id} 
                  className="h-full m-0"
                >
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-16 flex-col gap-1 rounded-none",
                activeTab === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-600"
              )}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
