import { motion } from 'framer-motion';
import { Navigation, Clock, MapPin, Radio } from 'lucide-react';
import { useTracking } from '../hooks/UseTracking';

interface TrackingPanelProps {
  requestId: string;
  mechanicName?: string;
  customerLat: number;
  customerLng: number;
}

const TrackingPanel = ({ requestId, mechanicName, customerLat, customerLng }: TrackingPanelProps) => {
  const { trackingData, isReceiving } = useTracking(requestId);

  const openMechanicInMaps = () => {
    if (!trackingData) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${trackingData.mechanicLat},${trackingData.mechanicLng}&destination=${customerLat},${customerLng}`,
      '_blank'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Navigation className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-sm font-semibold text-orange-300">
            {mechanicName ? `${mechanicName} is on the way` : 'Mechanic en route'}
          </span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center space-x-1.5">
          <Radio
            className={`w-3.5 h-3.5 ${isReceiving ? 'text-green-400 animate-pulse' : 'text-dark-500'}`}
          />
          <span className={`text-xs font-medium ${isReceiving ? 'text-green-400' : 'text-dark-500'}`}>
            {isReceiving ? 'LIVE' : 'Waiting…'}
          </span>
        </div>
      </div>

      {trackingData ? (
        <div className="grid grid-cols-2 gap-3">
          {/* ETA */}
          <div className="flex items-center space-x-2 bg-dark-800/60 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-500">ETA</p>
              <p className="text-sm font-bold text-white">
                {trackingData.etaMinutes <= 1
                  ? '< 1 min'
                  : `~${trackingData.etaMinutes} min`}
              </p>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center space-x-2 bg-dark-800/60 rounded-lg px-3 py-2">
            <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-dark-500">Distance</p>
              <p className="text-sm font-bold text-white">
                {trackingData.distanceRemainingKm < 1
                  ? `${(trackingData.distanceRemainingKm * 1000).toFixed(0)} m`
                  : `${trackingData.distanceRemainingKm.toFixed(1)} km`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-dark-400 text-xs">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span>Waiting for first location update…</span>
        </div>
      )}

      {/* View in Maps */}
      {trackingData && (
        <button
          onClick={openMechanicInMaps}
          className="mt-3 w-full text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center justify-center space-x-1"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>View mechanic route on Maps</span>
        </button>
      )}
    </motion.div>
  );
};

export default TrackingPanel;