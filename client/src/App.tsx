import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import "@fontsource/inter";

// Import game components
import { GameUI } from "./components/GameUI";
import { useQuests } from "./lib/stores/useQuests";
import { useProtocol } from "./lib/stores/useProtocol";
import { useAudio } from "./lib/stores/useAudio";
import { useSettings } from "./lib/stores/useSettings";

// Simple loading component
function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading ResearchLab...</p>
      </div>
    </div>
  );
}

// Sound manager component
function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    // Initialize audio files
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    setBackgroundMusic(backgroundMusic);

    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = 0.5;
    setHitSound(hitSound);

    const successSound = new Audio('/sounds/success.mp3');
    successSound.volume = 0.7;
    setSuccessSound(successSound);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
}

// Main App component
function App() {
  const { loadFromStorage: loadQuests } = useQuests();
  const { loadFromStorage: loadProtocols } = useProtocol();
  const { loadFromStorage: loadSettings } = useSettings();

  // Initialize app data
  useEffect(() => {
    // Load saved data from localStorage
    loadQuests();
    loadProtocols();
    loadSettings();

    // Set up the app title
    document.title = "ResearchLab - Gamified Research Assistant";
  }, [loadQuests, loadProtocols, loadSettings]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        {/* Sound Manager */}
        <SoundManager />
        
        {/* Main Game UI */}
        <GameUI />
      </Suspense>
    </div>
  );
}

export default App;
