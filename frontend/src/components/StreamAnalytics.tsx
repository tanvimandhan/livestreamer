import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocket';
import './StreamAnalytics.css';

interface StreamAnalyticsProps {
  streamId: string;
}

interface StreamMetrics {
  currentViewers: number;
  peakViewers: number;
  averageEngagement: number;
  chatMessages: number;
  averageSentiment: number;
}

const StreamAnalytics: React.FC<StreamAnalyticsProps> = ({ streamId }) => {
  const [metrics, setMetrics] = useState<StreamMetrics>({
    currentViewers: 0,
    peakViewers: 0,
    averageEngagement: 0,
    chatMessages: 0,
    averageSentiment: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    const startWS = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
        websocketService.subscribe(streamId);

        websocketService.on('stream-update', (data) => {
          if (data.data?.viewerMetrics) {
            setMetrics({
              currentViewers: data.data.viewerMetrics.currentViewers || 0,
              peakViewers: data.data.viewerMetrics.peakViewers || 0,
              averageEngagement:
                data.data.viewerMetrics.averageEngagement || 0,
              chatMessages: data.data.chatMessages?.length || 0,
              averageSentiment: calculateAverageSentiment(
                data.data.chatMessages
              ),
            });
          }
        });
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    };

    startWS();

    const durationInterval = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(durationInterval);
      websocketService.disconnect();
    };
  }, [streamId]);

  const calculateAverageSentiment = (messages: any[]): number => {
    if (messages.length === 0) return 0;

    const sentiments = messages
      .filter((m) => m.sentiment)
      .map((m) => m.sentiment.score || 0);

    if (sentiments.length === 0) return 0;

    return sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getSentimentLabel = (score: number): string => {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  };

  const getSentimentColor = (score: number): string => {
    if (score > 0.3) return '#4caf50';
    if (score < -0.3) return '#f44336';
    return '#ff9800';
  };

  return (
    <div className="stream-analytics">
      <div className="analytics-header">
        <h2>Stream Analytics</h2>
        <div className="connection-status">
          <span
            className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
          ></span>
          {isConnected ? 'Live' : 'Connecting...'}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Current Viewers</div>
          <div className="metric-value">
            {metrics.currentViewers.toLocaleString()}
          </div>
          <div className="metric-icon">👥</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Peak Viewers</div>
          <div className="metric-value">
            {metrics.peakViewers.toLocaleString()}
          </div>
          <div className="metric-icon">📈</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Stream Duration</div>
          <div className="metric-value">{formatDuration(streamDuration)}</div>
          <div className="metric-icon">⏱️</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Chat Messages</div>
          <div className="metric-value">{metrics.chatMessages}</div>
          <div className="metric-icon">💬</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Engagement</div>
          <div className="metric-value">
            {(metrics.averageEngagement * 100).toFixed(1)}%
          </div>
          <div className="metric-icon">⚡</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Chat Sentiment</div>
          <div
            className="metric-value"
            style={{
              color: getSentimentColor(metrics.averageSentiment),
            }}
          >
            {getSentimentLabel(metrics.averageSentiment)}
          </div>
          <div className="metric-icon">😊</div>
        </div>
      </div>

      <div className="detailed-analytics">
        <div className="analytics-section">
          <h3>Engagement Trend</h3>
          <div className="engagement-bar">
            <div
              className="engagement-fill"
              style={{
                width: `${Math.max(5, (metrics.averageEngagement || 0) * 100)}%`,
              }}
            ></div>
          </div>
          <p className="section-description">
            {(metrics.averageEngagement * 100).toFixed(1)}% average engagement
            level
          </p>
        </div>

        <div className="analytics-section">
          <h3>Sentiment Distribution</h3>
          <div className="sentiment-display">
            <div
              className="sentiment-score"
              style={{
                background: getSentimentColor(metrics.averageSentiment),
              }}
            >
              {metrics.averageSentiment.toFixed(2)}
            </div>
            <p>
              {metrics.averageSentiment > 0 ? '😊' : metrics.averageSentiment < 0 ? '😢' : '😐'}{' '}
              {getSentimentLabel(metrics.averageSentiment)}
            </p>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Viewer Growth</h3>
          <div className="growth-stats">
            <div className="stat-row">
              <span>Peak Concurrent:</span>
              <strong>{metrics.peakViewers.toLocaleString()} viewers</strong>
            </div>
            <div className="stat-row">
              <span>Current Concurrent:</span>
              <strong>{metrics.currentViewers.toLocaleString()} viewers</strong>
            </div>
            <div className="stat-row">
              <span>Retention Rate:</span>
              <strong>
                {metrics.peakViewers > 0
                  ? (
                      ((metrics.currentViewers / metrics.peakViewers) * 100).toFixed(
                        1
                      ) + '%'
                    )
                  : 'N/A'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="recommendations">
        <h3>AI Recommendations</h3>
        <div className="recommendation-list">
          {metrics.averageEngagement > 0.8 && (
            <div className="recommendation positive">
              ✅ High engagement detected - Consider extending stream
            </div>
          )}
          {metrics.averageSentiment > 0.5 && (
            <div className="recommendation positive">
              ✅ Positive chat sentiment - Content resonating well
            </div>
          )}
          {metrics.chatMessages > 100 && (
            <div className="recommendation positive">
              ✅ Active chat - Great moments for clipping
            </div>
          )}
          {metrics.currentViewers < metrics.peakViewers * 0.5 && (
            <div className="recommendation warning">
              ⚠️ Viewer drop detected - Consider interactive content
            </div>
          )}
          {metrics.averageSentiment < 0 && (
            <div className="recommendation warning">
              ⚠️ Negative sentiment - Check chat for issues
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamAnalytics;
