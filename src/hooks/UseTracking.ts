import { useEffect, useState, useCallback } from 'react';
import { webSocketService } from '../services/websocket';
import type { TrackingData } from '../types';

/**
 * Customer-side hook.
 * Subscribes to /topic/tracking/{requestId} and returns live mechanic position + ETA.
 * Only active when the request status is EN_ROUTE.
 */
export const useTracking = (requestId: string | null) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);

  const handleTrackingUpdate = useCallback((data: TrackingData) => {
    console.log('📍 Tracking update:', data);
    setTrackingData(data);
    setIsReceiving(true);
  }, []);

  useEffect(() => {
    if (!requestId) return;

    const destination = `/topic/tracking/${requestId}`;
    const unsubscribe = webSocketService.subscribeTopic(destination, handleTrackingUpdate);

    return () => {
      unsubscribe();
      setTrackingData(null);
      setIsReceiving(false);
    };
  }, [requestId, handleTrackingUpdate]);

  return { trackingData, isReceiving };
};