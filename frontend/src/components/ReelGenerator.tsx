import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ReelGenerator.css';

interface ReelGeneratorProps {
  streamId: string;
}

interface ReelConfig {
  format: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  includeIntro: boolean;
  includeOutro: boolean;
  includeMusic: boolean;
  musicGenre: string;
  maxDuration: number;
}

const ReelGenerator: React.FC<ReelGeneratorProps> = ({ streamId }) => {
  const [config, setConfig] = useState<ReelConfig>({
    format: 'instagram',
    includeIntro: true,
    includeOutro: true,
    includeMusic: true,
    musicGenre: 'electronic',
    maxDuration: 60,
  });

  const [generating, setGenerating] = useState(false);
  const [generatedReels, setGeneratedReels] = useState<any[]>([]);
  const [selectedReel, setSelectedReel] = useState<any | null>(null);

  const musicGenres = [
    'electronic',
    'hip-hop',
    'pop',
    'rock',
    'indie',
    'ambient',
  ];

  const handleGenerateReel = async () => {
    setGenerating(true);
    try {
      const { reelId } = await api.generateReel(streamId, [], config);
      const reel = await api.getReel(reelId);
      setGeneratedReels([...generatedReels, reel]);
    } catch (error) {
      console.error('Error generating reel:', error);
    } finally {
      setGenerating(false);
    }
  };

  const platformInfo: Record<string, string> = {
    instagram: '9:16 vertical video format, max 60 seconds',
    tiktok: '9:16 vertical video format, optimized for engagement',
    youtube: '16:9 horizontal format, up to 5 minutes',
    twitter: '16:9 or 1:1 format, max 60 seconds',
  };

  return (
    <div className="reel-generator">
      <div className="generator-container">
        <div className="config-panel">
          <h2>Generate Highlight Reel</h2>

          <div className="config-section">
            <h3>Output Format</h3>
            <div className="format-options">
              {(['instagram', 'tiktok', 'youtube', 'twitter'] as const).map(
                (fmt) => (
                  <div key={fmt} className="format-option">
                    <input
                      type="radio"
                      id={`format-${fmt}`}
                      name="format"
                      value={fmt}
                      checked={config.format === fmt}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          format: e.target.value as typeof fmt,
                        })
                      }
                    />
                    <label htmlFor={`format-${fmt}`}>
                      <div className="format-name">{fmt.toUpperCase()}</div>
                      <div className="format-info">{platformInfo[fmt]}</div>
                    </label>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="config-section">
            <h3>Reel Components</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.includeIntro}
                  onChange={(e) =>
                    setConfig({ ...config, includeIntro: e.target.checked })
                  }
                />
                <span>Include Intro Animation</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={config.includeOutro}
                  onChange={(e) =>
                    setConfig({ ...config, includeOutro: e.target.checked })
                  }
                />
                <span>Include Outro Animation</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={config.includeMusic}
                  onChange={(e) =>
                    setConfig({ ...config, includeMusic: e.target.checked })
                  }
                />
                <span>Add Background Music</span>
              </label>
            </div>
          </div>

          {config.includeMusic && (
            <div className="config-section">
              <h3>Music Genre</h3>
              <select
                value={config.musicGenre}
                onChange={(e) =>
                  setConfig({ ...config, musicGenre: e.target.value })
                }
              >
                {musicGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="config-section">
            <h3>Maximum Duration</h3>
            <div className="duration-control">
              <input
                type="range"
                min="10"
                max={config.format === 'youtube' ? 300 : 60}
                step="5"
                value={config.maxDuration}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxDuration: parseInt(e.target.value),
                  })
                }
              />
              <span>{config.maxDuration} seconds</span>
            </div>
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerateReel}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Reel'}
          </button>
        </div>

        <div className="preview-panel">
          {selectedReel ? (
            <div className="reel-preview">
              <h3>Generated Reel Preview</h3>
              <div className="preview-info">
                <div className="info-row">
                  <span>Format:</span>
                  <strong>{selectedReel.format.toUpperCase()}</strong>
                </div>
                <div className="info-row">
                  <span>Status:</span>
                  <strong className={`status ${selectedReel.status}`}>
                    {selectedReel.status.toUpperCase()}
                  </strong>
                </div>
                <div className="info-row">
                  <span>Duration:</span>
                  <strong>{selectedReel.duration} seconds</strong>
                </div>
                <div className="info-row">
                  <span>Highlights:</span>
                  <strong>{selectedReel.highlights.length}</strong>
                </div>
              </div>

              {selectedReel.metadata && (
                <div className="metadata">
                  <h4>Metadata</h4>
                  <p>
                    <strong>Title:</strong> {selectedReel.metadata.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{' '}
                    {selectedReel.metadata.description}
                  </p>
                  {selectedReel.metadata.hashtags && (
                    <p>
                      <strong>Hashtags:</strong>{' '}
                      {selectedReel.metadata.hashtags.join(' ')}
                    </p>
                  )}
                </div>
              )}

              <button className="btn-download">Download Reel</button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <p>Generate a reel to see preview</p>
            </div>
          )}
        </div>
      </div>

      {generatedReels.length > 0 && (
        <div className="generated-reels">
          <h3>Generated Reels</h3>
          <div className="reels-grid">
            {generatedReels.map((reel, idx) => (
              <div
                key={idx}
                className={`reel-card ${
                  selectedReel?.id === reel.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedReel(reel)}
              >
                <div className="reel-thumbnail">
                  <div className="format-badge">{reel.format}</div>
                  <div className="duration-badge">{reel.duration}s</div>
                </div>
                <div className="reel-info">
                  <div className="status-badge">{reel.status}</div>
                  <p>{reel.highlights.length} moments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelGenerator;
