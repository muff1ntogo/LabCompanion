import React, { useEffect } from 'react';
import { useQuests } from '@/lib/stores/useQuests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle, Lock, Gift } from 'lucide-react';

export function QuestSystem() {
  const { 
    quests, 
    playerScore, 
    level, 
    completeQuest, 
    generateDailyQuests,
    loadFromStorage 
  } = useQuests();

  useEffect(() => {
    loadFromStorage();
    generateDailyQuests();
  }, [loadFromStorage, generateDailyQuests]);

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'protocol_complete': return <Target className="w-4 h-4" />;
      case 'timer_complete': return <Target className="w-4 h-4" />;
      case 'checklist_complete': return <CheckCircle className="w-4 h-4" />;
      case 'daily_login': return <Gift className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getQuestTypeLabel = (type: string) => {
    switch (type) {
      case 'protocol_complete': return 'Protocol';
      case 'timer_complete': return 'Timer';
      case 'checklist_complete': return 'Checklist';
      case 'daily_login': return 'Daily';
      default: return 'Quest';
    }
  };

  const activeQuests = quests.filter(quest => quest.unlocked && !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);

  return (
    <div className="space-y-6">
      {/* Player Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Research Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{playerScore}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Research Points</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">Level {level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Researcher</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{playerScore % 100}/100</span>
            </div>
            <Progress value={(playerScore % 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Active Quests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Active Quests
        </h3>
        
        {activeQuests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>All quests completed!</p>
              <p className="text-sm">Keep doing research to unlock more quests</p>
            </CardContent>
          </Card>
        ) : (
          activeQuests.map((quest) => {
            const progressPercentage = (quest.progress / quest.target) * 100;
            const isComplete = quest.progress >= quest.target;
            
            return (
              <Card key={quest.id} className={`transition-colors ${
                isComplete ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-white dark:bg-gray-800'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getQuestIcon(quest.type)}
                      <CardTitle className="text-base text-gray-900 dark:text-white">{quest.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getQuestTypeLabel(quest.type)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        +{quest.reward} pts
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{quest.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{quest.progress}/{quest.target}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  {isComplete && (
                    <Button 
                      onClick={() => completeQuest(quest.id)}
                      className="w-full"
                      variant="default"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Claim Reward (+{quest.reward} points)
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Quests
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {completedQuests.map((quest) => (
              <Card key={quest.id} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{quest.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{quest.reward} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Quests Preview */}
      {quests.filter(quest => !quest.unlocked).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            Coming Soon
          </h3>
          
          <div className="space-y-2">
            {quests.filter(quest => !quest.unlocked).slice(0, 3).map((quest) => (
              <Card key={quest.id} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Locked Quest</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      +{quest.reward} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
