import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './HighlightViewer.css';

interface HighlightViewerProps {
  streamId: string;
}

interface Highlight {
  id: string;
  startTime: number;
  endTime: number;
  excitementScore: number;
  reason: string;
  chatSentiment: number;
  viewerEngagement: number;
  transcription: string;
}

const HighlightViewer: React.FC<HighlightViewerProps> = ({ streamId }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [filterMinScore, setFilterMinScore] = useState(0.7);

  useEffect(() => {
    loadHighlights();
  }, [streamId]);

  const loadHighlights = async () => {
    setLoading(true);
    try {
      const data = await api.getHighlights(streamId);
      setHighlights(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHighlights = highlights.filter(
    (h) => h.excitementScore >= filterMinScore
  );

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60)
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="highlight-viewer">
      <div className="viewer-header">
        <h2>Detected Highlights</h2>
        <div className="filter-controls">
          <label>Minimum Excitement Score:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(parseFloat(e.target.value))}
          />
          <span className="score-display">{filterMinScore.toFixed(1)}</span>
        </div>
      </div>

      {loading && <div className="loading">Loading highlights...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="highlights-container">
        <div className="highlights-list">
          <h3>{filteredHighlights.length} Highlights Found</h3>
          {filteredHighlights.length === 0 ? (
            <p className="no-highlights">
              No highlights found matching your criteria.
            </p>
          ) : (
            <div className="highlights-grid">
              {filteredHighlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className={`highlight-card ${
                    selectedHighlight?.id === highlight.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedHighlight(highlight)}
                >
                  <div className="highlight-time">
                    {formatTime(highlight.startTime)} -{' '}
                    {formatTime(highlight.endTime)}
                  </div>
                  <div className="highlight-score">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${highlight.excitementScore * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{(highlight.excitementScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="highlight-reason">{highlight.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedHighlight && (
          <div className="highlight-details">
            <h3>Highlight Details</h3>
            <div className="detail-item">
              <strong>Time Range:</strong>
              <span>
                {formatTime(selectedHighlight.startTime)} -{' '}
                {formatTime(selectedHighlight.endTime)}
              </span>
            </div>
            <div className="detail-item">
              <strong>Excitement Score:</strong>
              <span>
                {(selectedHighlight.excitementScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="detail-item">
              <strong>Chat Sentiment:</strong>
              <span>
                {selectedHighlight.chatSentiment > 0 ? '+' : ''}
                {selectedHighlight.chatSentiment.toFixed(2)}
              </span>
            </div>
            <div className="detail-item">
              <strong>Viewer Engagement:</strong>
              <span>
                {(selectedHighlight.viewerEngagement * 100).toFixed(0)}%
              </span>
            </div>
            <div className="detail-item">
              <strong>Why Highlighted:</strong>
              <span>{selectedHighlight.reason}</span>
            </div>
            <div className="detail-item">
              <strong>Chat Messages:</strong>
              <p className="transcription">{selectedHighlight.transcription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightViewer;
