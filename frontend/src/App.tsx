import React, { useState } from 'react';
import './App.css';
import StreamMonitor from './components/StreamMonitor';
import HighlightViewer from './components/HighlightViewer';
import ReelGenerator from './components/ReelGenerator';
import StreamAnalytics from './components/StreamAnalytics';

type View = 'monitor' | 'highlights' | 'reels' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<View>('monitor');
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Livestream Highlight Generator</h1>
        <nav className="app-nav">
          <button
            className={`nav-button ${currentView === 'monitor' ? 'active' : ''}`}
            onClick={() => setCurrentView('monitor')}
          >
            Monitor
          </button>
          <button
            className={`nav-button ${currentView === 'highlights' ? 'active' : ''}`}
            onClick={() => setCurrentView('highlights')}
          >
            Highlights
          </button>
          <button
            className={`nav-button ${currentView === 'reels' ? 'active' : ''}`}
            onClick={() => setCurrentView('reels')}
          >
            Reels
          </button>
          <button
            className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'monitor' && (
          <StreamMonitor
            onStreamSelected={(streamId) => {
              setActiveStreamId(streamId);
              setCurrentView('analytics');
            }}
          />
        )}
        {currentView === 'highlights' && activeStreamId && (
          <HighlightViewer streamId={activeStreamId} />
        )}
        {currentView === 'reels' && activeStreamId && (
          <ReelGenerator streamId={activeStreamId} />
        )}
        {currentView === 'analytics' && activeStreamId && (
          <StreamAnalytics streamId={activeStreamId} />
        )}
      </main>
    </div>
  );
}

export default App;
