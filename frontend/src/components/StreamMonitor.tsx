import React, { useState } from 'react';
import api from '../services/api';
import './StreamMonitor.css';

interface StreamMonitorProps {
  onStreamSelected: (streamId: string) => void;
}

const StreamMonitor: React.FC<StreamMonitorProps> = ({ onStreamSelected }) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [platform, setPlatform] = useState('twitch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStreams, setActiveStreams] = useState<any[]>([]);

  const handleStartStream = async () => {
    if (!streamUrl) {
      setError('Please enter a stream URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { streamId } = await api.startStream(streamUrl, platform);
      setActiveStreams([...activeStreams, { id: streamId, url: streamUrl, platform }]);
      setStreamUrl('');
      onStreamSelected(streamId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stream-monitor">
      <div className="monitor-card">
        <h2>Start Monitoring a Stream</h2>
        
        <div className="form-group">
          <label>Stream URL</label>
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://twitch.tv/channel or HLS URL"
          />
        </div>

        <div className="form-group">
          <label>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="twitch">Twitch</option>
            <option value="youtube">YouTube Live</option>
            <option value="custom">Custom (HLS/WebRTC)</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="btn-primary"
          onClick={handleStartStream}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Monitoring'}
        </button>
      </div>

      {activeStreams.length > 0 && (
        <div className="active-streams">
          <h2>Active Streams</h2>
          <div className="streams-grid">
            {activeStreams.map((stream) => (
              <div key={stream.id} className="stream-card">
                <div className="stream-header">
                  <span className="status-badge active">● Live</span>
                </div>
                <h3>{stream.platform}</h3>
                <p className="stream-url">{stream.url}</p>
                <button
                  className="btn-secondary"
                  onClick={() => onStreamSelected(stream.id)}
                >
                  View Analytics
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>How to Use</h3>
        <ol>
          <li>Enter a Twitch channel URL or paste an HLS stream link</li>
          <li>Select the platform type</li>
          <li>Click "Start Monitoring" to begin analyzing</li>
          <li>Monitor chat sentiment, viewer engagement, and key moments</li>
          <li>Generate highlight reels automatically</li>
        </ol>
      </div>
    </div>
  );
};

export default StreamMonitor;
