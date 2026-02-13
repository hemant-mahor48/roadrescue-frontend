import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Wrench, 
  MapPin, 
  ToggleLeft, 
  ToggleRight,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore, useMechanicStore } from '../store';
import { useNotification } from '../hooks/useNotification';
import { mechanicApi, requestApi } from '../services/api';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

interface IncomingRequest {
  requestId: string;
  customerLatitude: number;
  customerLongitude: number;
  estimatedDistance: number;
  issueType: string;
  timestamp: string;
}

const MechanicDashboard = () => {
  const { user, logout } = useAuthStore();
  const { isAvailable, setAvailability } = useMechanicStore();
  const { notifications } = useNotification();
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  // Extract incoming requests from notifications
  useEffect(() => {
    const newRequests = notifications
      .filter(n => n.type === 'NEW_REQUEST_NEARBY' && !n.read && n.data)
      .map(n => ({
        requestId: n.data.requestId,
        customerLatitude: n.data.customerLatitude,
        customerLongitude: n.data.customerLongitude,
        estimatedDistance: n.data.estimatedDistance,
        issueType: n.data.issueType,
        timestamp: n.timestamp,
      }));
    
    setIncomingRequests(newRequests);
  }, [notifications]);

  const handleToggleAvailability = async () => {
    setIsUpdatingAvailability(true);
    try {
      const newAvailability = !isAvailable;
      await mechanicApi.updateAvailability(newAvailability);
      setAvailability(newAvailability);
      
      if (newAvailability) {
        // Update location when going online
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              await mechanicApi.updateLocation(
                position.coords.latitude,
                position.coords.longitude
              );
              toast.success('You are now online and ready to receive requests!');
            },
            (error) => {
              console.error('Error getting location:', error);
              toast.error('Could not get your location. Please enable location services.');
            }
          );
        }
      } else {
        toast.success('You are now offline');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await requestApi.acceptRequest(requestId);
      toast.success('Request accepted! Proceeding to customer location.');
      
      // Remove from incoming requests
      setIncomingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await requestApi.rejectRequest(requestId);
      toast.success('Request rejected');
      
      // Remove from incoming requests
      setIncomingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getIssueTypeLabel = (type: string): string => {
    return type.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              RoadRescue Pro
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Link to="/profile" className="btn-ghost flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.fullName}</span>
            </Link>
            <button onClick={logout} className="btn-ghost">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>!
          </h1>
          <p className="text-dark-400">Manage your availability and incoming requests</p>
        </motion.div>

        {/* Availability Toggle */}
        <motion.div 
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {isAvailable ? 'You\'re Online' : 'You\'re Offline'}
              </h3>
              <p className="text-dark-400">
                {isAvailable 
                  ? 'Ready to receive requests from nearby customers' 
                  : 'Toggle to start receiving requests'
                }
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={isUpdatingAvailability}
              className="flex items-center space-x-2 disabled:opacity-50"
            >
              {isAvailable ? (
                <ToggleRight className="w-16 h-16 text-green-500 hover:text-green-400 transition-colors" />
              ) : (
                <ToggleLeft className="w-16 h-16 text-dark-600 hover:text-dark-500 transition-colors" />
              )}
            </button>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isAvailable 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-dark-700 text-dark-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-dark-500'}`} />
              <span className="text-sm font-semibold">
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Incoming Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Incoming Requests
              {incomingRequests.length > 0 && (
                <span className="ml-3 px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold">
                  {incomingRequests.length}
                </span>
              )}
            </h2>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="card text-center py-12">
              <MapPin className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Incoming Requests</h3>
              <p className="text-dark-400">
                {isAvailable 
                  ? 'Waiting for customers nearby to request help...' 
                  : 'Turn on availability to start receiving requests'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {incomingRequests.map((request, index) => (
                  <motion.div
                    key={request.requestId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 border-2 border-primary-500/30 hover:border-primary-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold">
                            NEW REQUEST
                          </span>
                          <span className="text-dark-400 text-sm">
                            {new Date(request.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">
                          {getIssueTypeLabel(request.issueType)}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-dark-300">
                            <Navigation className="w-5 h-5 text-primary-500" />
                            <div>
                              <p className="text-xs text-dark-500">Distance</p>
                              <p className="font-semibold">{request.estimatedDistance.toFixed(1)} km</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-dark-300">
                            <Clock className="w-5 h-5 text-primary-500" />
                            <div>
                              <p className="text-xs text-dark-500">Est. Time</p>
                              <p className="font-semibold">~{Math.ceil(request.estimatedDistance * 3)} min</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => openInMaps(request.customerLatitude, request.customerLongitude)}
                          className="text-sm text-primary-500 hover:text-primary-400 flex items-center space-x-1"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>View on Maps</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptRequest(request.requestId)}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Accept</span>
                      </button>
                      
                      <button
                        onClick={() => handleRejectRequest(request.requestId)}
                        className="btn-secondary flex-1 flex items-center justify-center space-x-2 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>

                    {/* Warning */}
                    <div className="mt-4 flex items-start space-x-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-dark-300">
                        Please respond within 2 minutes or the request will be sent to another mechanic
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MechanicDashboard;