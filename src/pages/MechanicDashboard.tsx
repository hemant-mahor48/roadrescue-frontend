import { ChangeEvent, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LogOut,
  User,
  Wrench,
  Camera,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  AlertCircle,
  Radio,
  StopCircle,
} from 'lucide-react';
import { useAuthStore, useMechanicStore } from '../store';
import { useNotification } from '../hooks/useNotification';
import { mechanicApi, requestApi } from '../services/api';
import { RequestStatus, type ActiveAssignment } from '../types';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

const TRACKING_INTERVAL_MS = 10_000; // 10 seconds
const SERVICE_TIMER_INTERVAL_MS = 1_000;

interface IncomingRequest {
  requestId: string;
  customerId: string;
  customerLatitude: number;
  customerLongitude: number;
  estimatedDistance: number;
  estimatedPayment?: number;
  issueType: string;
  timestamp: string;
}

const MechanicDashboard = () => {
  const { user, logout } = useAuthStore();
  const { isAvailable, setAvailability, activeAssignment, setActiveAssignment } = useMechanicStore();
  const { notifications } = useNotification();
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [serviceElapsedMs, setServiceElapsedMs] = useState(0);
  const [isCompletingRequest, setIsCompletingRequest] = useState(false);
  const [completionForm, setCompletionForm] = useState({
    serviceNotes: '',
    partsUsedText: '',
    laborCharge: '',
    partsCharge: '',
    beforeServicePhotos: [] as string[],
    afterServicePhotos: [] as string[],
  });

  // Tracking interval ref — cleared when mechanic stops
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Extract incoming requests from notification stream ──────────────────
  useEffect(() => {
    const newRequests = notifications
      .filter(n => n.type === 'NEW_REQUEST_NEARBY' && !n.read && n.data)
      .map(n => ({
        requestId: n.data.requestId,
        customerId: n.data.customerId ?? '',          // backend must include customerId
        customerLatitude: n.data.customerLatitude,
        customerLongitude: n.data.customerLongitude,
        estimatedDistance: n.data.estimatedDistance,
        estimatedPayment: n.data.estimatedPayment,
        issueType: n.data.issueType,
        timestamp: n.timestamp,
      }));
    setIncomingRequests(newRequests);
  }, [notifications]);

  // ─── GPS tracking loop ───────────────────────────────────────────────────
  const startTracking = useCallback((assignment: ActiveAssignment) => {
    if (!user?.id) return;

    const sendLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            console.log('CustomerId', assignment.customerId);
            await mechanicApi.trackEnRoute(user.id, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              requestId: assignment.requestId,
              customerId: assignment.customerId,
              customerLat: assignment.customerLat,
              customerLng: assignment.customerLng,
            });
          } catch (err) {
            console.error('Tracking update failed:', err);
          }
        },
        (err) => console.error('Geolocation error during tracking:', err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    // Send immediately, then every 10s
    sendLocation();
    trackingIntervalRef.current = setInterval(sendLocation, TRACKING_INTERVAL_MS);
    console.log('🗺️ Tracking started for request', assignment.requestId);
  }, [user?.id]);

  const clearTrackingInterval = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  const stopTracking = useCallback((clearAssignment: boolean = true) => {
    clearTrackingInterval();
    if (clearAssignment) {
      setActiveAssignment(null);
    }
    console.log('Tracking stopped');
  }, [clearTrackingInterval, setActiveAssignment]);

  const formatElapsedTime = (elapsedMs: number) => {
    const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!activeAssignment?.serviceStartedAt || activeAssignment.status !== RequestStatus.IN_PROGRESS) {
      setServiceElapsedMs(0);
      return;
    }

    const updateElapsed = () => {
      setServiceElapsedMs(Date.now() - new Date(activeAssignment.serviceStartedAt!).getTime());
    };

    updateElapsed();
    const timerId = setInterval(updateElapsed, SERVICE_TIMER_INTERVAL_MS);
    return () => clearInterval(timerId);
  }, [activeAssignment?.serviceStartedAt, activeAssignment?.status]);

  useEffect(() => {
    if (activeAssignment?.status === RequestStatus.EN_ROUTE && !trackingIntervalRef.current) {
      startTracking(activeAssignment);
    }
    if (activeAssignment?.status !== RequestStatus.EN_ROUTE) {
      clearTrackingInterval();
    }
  }, [activeAssignment, clearTrackingInterval, startTracking]);

  // Cleanup on unmount: keep assignment in store, only stop the interval.
  useEffect(() => () => clearTrackingInterval(), [clearTrackingInterval]);

  // ─── Availability toggle ─────────────────────────────────────────────────
  const handleToggleAvailability = async () => {
    setIsUpdatingAvailability(true);
    try {
      const newAvailability = !isAvailable;
      await mechanicApi.updateAvailability(newAvailability);
      setAvailability(newAvailability);

      if (newAvailability) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              await mechanicApi.updateLocation(position.coords.latitude, position.coords.longitude);
              toast.success('You are now online and ready to receive requests!');
            },
            () => toast.error('Could not get your location. Please enable location services.')
          );
        }
      } else {
        if (activeAssignment) stopTracking();
        toast.success('You are now offline');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  // ─── Accept request → begin tracking ─────────────────────────────────────
  const handleAcceptRequest = async (request: IncomingRequest) => {
    try {
      await requestApi.acceptRequest(request.requestId, request.estimatedPayment);
      toast.success('Request accepted! Starting navigation…');
      setIncomingRequests(prev => prev.filter(r => r.requestId !== request.requestId));

      const assignment: ActiveAssignment = {
        requestId: request.requestId,
        customerId: request.customerId,
        customerLat: request.customerLatitude,
        customerLng: request.customerLongitude,
        issueType: request.issueType,
        estimatedPayment: request.estimatedPayment,
        depositHoldAmount: 200,
        status: RequestStatus.EN_ROUTE,
      };
      setActiveAssignment(assignment);
      startTracking(assignment);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await requestApi.rejectRequest(requestId);
      toast.success('Request rejected');
      setIncomingRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  // ─── Arrived / stop tracking ──────────────────────────────────────────────
  const handleArrived = async () => {
    if (!activeAssignment) return;

    try {
      await requestApi.markArrived(activeAssignment.requestId);
      stopTracking(false);
      setActiveAssignment({
        ...activeAssignment,
        status: RequestStatus.IN_PROGRESS,
        serviceStartedAt: new Date().toISOString(),
      });
      toast.success('Marked as arrived. Service timer started.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark arrival');
    }
  };

  const handlePhotoUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    field: 'beforeServicePhotos' | 'afterServicePhotos'
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      const encoded = await Promise.all(files.map(readFileAsDataUrl));
      setCompletionForm((current) => ({
        ...current,
        [field]: [...current[field], ...encoded].slice(0, 5),
      }));
    } catch (error) {
      toast.error('Could not read one or more photos');
    } finally {
      event.target.value = '';
    }
  };

  const handleCompleteRequest = async () => {
    if (!activeAssignment) return;

    if (!completionForm.serviceNotes.trim()) {
      toast.error('Please add service notes');
      return;
    }

    const partsUsed = completionForm.partsUsedText
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (!partsUsed.length) {
      toast.error('Please add at least one part used');
      return;
    }

    const laborCharge = Number(completionForm.laborCharge);
    const partsCharge = Number(completionForm.partsCharge);
    if (Number.isNaN(laborCharge) || Number.isNaN(partsCharge)) {
      toast.error('Please enter valid charges');
      return;
    }

    setIsCompletingRequest(true);
    try {
      await requestApi.completeRequest(activeAssignment.requestId, {
        serviceNotes: completionForm.serviceNotes.trim(),
        partsUsed,
        beforeServicePhotos: completionForm.beforeServicePhotos,
        afterServicePhotos: completionForm.afterServicePhotos,
        laborCharge,
        partsCharge,
      });

      toast.success('Request marked as complete');
      setActiveAssignment(null);
      setCompletionForm({
        serviceNotes: '',
        partsUsedText: '',
        laborCharge: '',
        partsCharge: '',
        beforeServicePhotos: [],
        afterServicePhotos: [],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete request');
    } finally {
      setIsCompletingRequest(false);
    }
  };

  const getIssueTypeLabel = (type: string) =>
    type.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const openInMaps = (lat: number, lng: number) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');

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
        {/* Welcome */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>!
          </h1>
          <p className="text-dark-400">Manage your availability and incoming requests</p>
        </motion.div>

        {/* ─── EN ROUTE PANEL ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {activeAssignment && (
            <motion.div
              key="en-route"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`glass-card p-6 mb-8 border-2 ${
                activeAssignment.status === RequestStatus.IN_PROGRESS
                  ? 'border-primary-500/40'
                  : 'border-orange-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeAssignment.status === RequestStatus.IN_PROGRESS
                      ? 'bg-primary-500/20'
                      : 'bg-orange-500/20'
                  }`}>
                    {activeAssignment.status === RequestStatus.IN_PROGRESS ? (
                      <Clock className="w-6 h-6 text-primary-400" />
                    ) : (
                      <Navigation className="w-6 h-6 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${
                      activeAssignment.status === RequestStatus.IN_PROGRESS
                        ? 'text-primary-300'
                        : 'text-orange-300'
                    }`}>
                      {activeAssignment.status === RequestStatus.IN_PROGRESS ? 'Service In Progress' : 'En Route'}
                    </h3>
                    <p className="text-xs text-dark-400">
                      {activeAssignment.status === RequestStatus.IN_PROGRESS
                        ? `${getIssueTypeLabel(activeAssignment.issueType)} · Timer started on arrival`
                        : `${getIssueTypeLabel(activeAssignment.issueType)} · Sending location every 10s`}
                    </p>
                  </div>
                </div>

                {activeAssignment.status === RequestStatus.IN_PROGRESS ? (
                  <div className="px-3 py-1 bg-primary-500/10 rounded-lg">
                    <span className="text-xs text-primary-300 font-semibold">
                      {formatElapsedTime(serviceElapsedMs)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 rounded-lg">
                    <Radio className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-semibold">LIVE</span>
                  </div>
                )}
              </div>

              {activeAssignment.status === RequestStatus.IN_PROGRESS ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-dark-800/60 px-4 py-3">
                      <p className="text-xs text-dark-500">Started</p>
                      <p className="text-sm font-semibold text-white">
                        {activeAssignment.serviceStartedAt
                          ? new Date(activeAssignment.serviceStartedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-dark-800/60 px-4 py-3">
                      <p className="text-xs text-dark-500">Elapsed</p>
                      <p className="text-sm font-semibold text-white">{formatElapsedTime(serviceElapsedMs)}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary-500/20 bg-dark-900/40 p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Notes</label>
                      <textarea
                        value={completionForm.serviceNotes}
                        onChange={(e) => setCompletionForm((current) => ({ ...current, serviceNotes: e.target.value }))}
                        className="input-field h-24 resize-none"
                        placeholder="Describe the work completed..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Parts Used</label>
                      <input
                        value={completionForm.partsUsedText}
                        onChange={(e) => setCompletionForm((current) => ({ ...current, partsUsedText: e.target.value }))}
                        className="input-field"
                        placeholder="e.g. tyre, valve"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Labor Charge</label>
                        <input
                          type="number"
                          min="0"
                          value={completionForm.laborCharge}
                          onChange={(e) => setCompletionForm((current) => ({ ...current, laborCharge: e.target.value }))}
                          className="input-field"
                          placeholder="300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Parts Charge</label>
                        <input
                          type="number"
                          min="0"
                          value={completionForm.partsCharge}
                          onChange={(e) => setCompletionForm((current) => ({ ...current, partsCharge: e.target.value }))}
                          className="input-field"
                          placeholder="500"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="rounded-xl border border-dashed border-dark-600 p-4 text-sm text-dark-300 cursor-pointer">
                        <span className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4" />
                          Before Photos
                        </span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e, 'beforeServicePhotos')} />
                        <span className="text-xs text-dark-500">{completionForm.beforeServicePhotos.length} attached</span>
                      </label>
                      <label className="rounded-xl border border-dashed border-dark-600 p-4 text-sm text-dark-300 cursor-pointer">
                        <span className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4" />
                          After Photos
                        </span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e, 'afterServicePhotos')} />
                        <span className="text-xs text-dark-500">{completionForm.afterServicePhotos.length} attached</span>
                      </label>
                    </div>

                    <button
                      onClick={handleCompleteRequest}
                      disabled={isCompletingRequest}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompletingRequest ? 'Completing Request...' : 'Mark as Complete'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => openInMaps(activeAssignment.customerLat, activeAssignment.customerLng)}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Navigate to Customer</span>
                  </button>
                  <button
                    onClick={handleArrived}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2 text-sm"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>I've Arrived</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
                {isAvailable ? "You're Online" : "You're Offline"}
              </h3>
              <p className="text-dark-400">
                {isAvailable
                  ? 'Ready to receive requests from nearby customers'
                  : 'Toggle to start receiving requests'}
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

          <div className="mt-6 flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isAvailable ? 'bg-green-500/20 text-green-500' : 'bg-dark-700 text-dark-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-dark-500'}`} />
              <span className="text-sm font-semibold">{isAvailable ? 'Available' : 'Unavailable'}</span>
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
                  : 'Turn on availability to start receiving requests'}
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

                        <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
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
                          <div className="flex items-center space-x-2 text-dark-300">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            <div>
                              <p className="text-xs text-dark-500">Est. Payment</p>
                              <p className="font-semibold">
                                {request.estimatedPayment != null
                                  ? `Rs ${request.estimatedPayment.toFixed(0)}`
                                  : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-dark-300">
                            <AlertCircle className="w-5 h-5 text-primary-500" />
                            <div>
                              <p className="text-xs text-dark-500">Deposit Hold</p>
                              <p className="font-semibold">Rs 200</p>
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
                        onClick={() => handleAcceptRequest(request)}
                        disabled={!!activeAssignment}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
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

                    {activeAssignment && (
                      <p className="mt-3 text-xs text-center text-dark-500">
                        Already en route — complete current request first
                      </p>
                    )}

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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unexpected reader result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
