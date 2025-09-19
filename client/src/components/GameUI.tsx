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
  VolumeX,
  StickyNote
} from 'lucide-react';
import { ProtocolBuilder } from './ProtocolBuilder';
import { TimerManager } from './TimerManager';
import { ChecklistManager } from './ChecklistManager';
import { QuestSystem } from './QuestSystem';
import { CompanionCharacter } from './CompanionCharacter';
import { CompanionPage } from './CompanionPage';
import { JournalViewer } from './JournalViewer';
import { useQuests } from '@/lib/stores/useQuests';
import { useAudio } from '@/lib/stores/useAudio';
import { cn } from '@/lib/utils';
import { SettingsPanel } from './SettingsPanel';

export function GameUI() {
  const [activeTab, setActiveTab] = useState('protocols');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCompanionMinimized, setIsCompanionMinimized] = useState(true); // Always minimized now
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
    },
    {
      id: 'companion',
      label: 'Companion',
      icon: <Heart className="w-4 h-4" />,
      component: <CompanionPage />
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <StickyNote className="w-4 h-4" />,
      component: <JournalViewer />
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">ResearchLab</h1>
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
            <SettingsPanel />
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
          <div className="flex items-center gap-2">
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
            <SettingsPanel />
          </div>
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
        <aside className="hidden md:flex w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-col">
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
      <nav className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="grid grid-cols-5">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-16 flex-col gap-1 rounded-none",
                activeTab === tab.id ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"
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
