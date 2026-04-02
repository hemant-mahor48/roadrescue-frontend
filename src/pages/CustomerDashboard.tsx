import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  AlertCircle,
  LogOut,
  User,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle,
  Navigation,
  Loader
} from 'lucide-react';
import { useAuthStore, useRequestStore } from '../store';
import { paymentApi, ratingApi, requestApi } from '../services/api';
import { RequestStatus, IssueType, type PaymentSummary, type Rating } from '../types';
import NotificationBell from '../components/NotificationBell';
import TrackingPanel from '../components/TrackingPanel';
import toast from 'react-hot-toast';

const REQUEST_REFRESH_INTERVAL_MS = 15_000;
const SERVICE_TIMER_INTERVAL_MS = 1_000;

const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();
  const { activeRequests, setActiveRequests } = useRequestStore();
  const [isLoading, setIsLoading] = useState(true);
  const [timerTick, setTimerTick] = useState(0);
  const [payingRequestId, setPayingRequestId] = useState<string | null>(null);
  const [paymentSummaries, setPaymentSummaries] = useState<Record<string, PaymentSummary>>({});
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, { score: number; review: string }>>({});
  const [submittingRatingRequestId, setSubmittingRatingRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    const intervalId = setInterval(fetchRequests, REQUEST_REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimerTick((current) => current + 1);
    }, SERVICE_TIMER_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await requestApi.getMyRequests();
      if (response.success && response.data) {
        console.log('response:', response);
        setActiveRequests(response.data);
        await loadPaymentSummaries(response.data.map((request) => request.id));
        await loadRatings(response.data.map((request) => request.id));
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    const colors: Record<RequestStatus, string> = {
      [RequestStatus.PENDING]: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      [RequestStatus.SEARCHING]: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      [RequestStatus.ASSIGNED]: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      [RequestStatus.EN_ROUTE]: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      [RequestStatus.IN_PROGRESS]: 'bg-primary-500/20 text-primary-500 border-primary-500/30',
      [RequestStatus.COMPLETED]: 'bg-green-500/20 text-green-500 border-green-500/30',
      [RequestStatus.CANCELLED]: 'bg-red-500/20 text-red-500 border-red-500/30',
      [RequestStatus.PAYMENT_PENDING]: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      [RequestStatus.PAID]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const getIssueTypeLabel = (type: IssueType): string => {
    const labels: Record<IssueType, string> = {
      [IssueType.TYRE_PUNCTURE]: 'Tyre Puncture',
      [IssueType.BATTERY_ISSUE]: 'Battery Issue',
      [IssueType.ENGINE_FAILURE]: 'Engine Failure',
      [IssueType.FUEL_EMPTY]: 'Fuel Empty',
      [IssueType.LOCKOUT]: 'Lockout',
      [IssueType.ACCIDENT]: 'Accident',
      [IssueType.OTHER]: 'Other',
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatElapsedTime = (startedAt?: string) => {
    void timerTick;
    if (!startedAt) return '00:00';

    const totalSeconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const loadPaymentSummaries = async (requestIds: string[]) => {
    const uniqueRequestIds = [...new Set(requestIds)];
    if (uniqueRequestIds.length === 0) {
      setPaymentSummaries({});
      return;
    }

    const results = await Promise.allSettled(
      uniqueRequestIds.map(async (requestId) => {
        const response = await paymentApi.getPaymentSummary(requestId);
        return { requestId, paymentSummary: response.data };
      })
    );

    const nextSummaries: Record<string, PaymentSummary> = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.paymentSummary) {
        nextSummaries[result.value.requestId] = result.value.paymentSummary;
      }
    });

    setPaymentSummaries(nextSummaries);
  };

  const loadRatings = async (requestIds: string[]) => {
    const uniqueRequestIds = [...new Set(requestIds)];
    if (uniqueRequestIds.length === 0) {
      setRatings({});
      return;
    }

    const results = await Promise.allSettled(
      uniqueRequestIds.map(async (requestId) => {
        const response = await ratingApi.getByRequestId(requestId);
        return { requestId, rating: response.data };
      })
    );

    const nextRatings: Record<string, Rating> = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.rating) {
        nextRatings[result.value.requestId] = result.value.rating;
      }
    });

    setRatings(nextRatings);
  };

  const handlePayNow = async (requestId: string) => {
    try {
      setPayingRequestId(requestId);
      await paymentApi.payForRequest(requestId, 'RAZORPAY');
      toast.success('Payment processed successfully');
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPayingRequestId(null);
    }
  };

  const handleSubmitRating = async (requestId: string, mechanicId?: string) => {
    if (!mechanicId) {
      toast.error('Mechanic information is missing for this request');
      return;
    }

    const draft = ratingDrafts[requestId] ?? { score: 5, review: '' };
    if (draft.score < 1 || draft.score > 5) {
      toast.error('Please choose a rating between 1 and 5');
      return;
    }

    try {
      setSubmittingRatingRequestId(requestId);
      const response = await ratingApi.submit({
        requestId,
        mechanicId,
        score: draft.score,
        review: draft.review.trim() || undefined,
      });

      if (response.data) {
        setRatings((current) => ({
          ...current,
          [requestId]: response.data!,
        }));
        toast.success('Rating submitted successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRatingRequestId(null);
    }
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
              RoadRescue
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
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>!
          </h1>
          <p className="text-dark-400">Manage your breakdown requests and get instant help</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to="/request/new">
            <motion.div
              className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <Plus className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Request Help</h3>
                  <p className="text-dark-400">Get assistance now</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/become-mechanic">
            <motion.div
              className="glass-card p-8 hover:scale-105 transition-transform cursor-pointer group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <TrendingUp className="w-8 h-8 text-green-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Become a Mechanic</h3>
                  <p className="text-dark-400">Earn by helping others</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Active Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">My Requests</h2>
            <p className="text-dark-400">Track and manage your breakdown service requests</p>
          </div>

          {isLoading ? (
            <div className="card text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-dark-400">Loading your requests...</p>
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Requests Yet</h3>
              <p className="text-dark-400 mb-6">
                You haven't created any breakdown service requests yet
              </p>
              <Link to="/request/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Your First Request</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map((requestItem, index) => {
                const paymentSummary = paymentSummaries[requestItem.id];
                const request = { ...requestItem } as typeof requestItem & { finalAmount: number };
                request.finalAmount =
                  paymentSummary?.estimatedAmount ?? requestItem.finalAmount ?? 0;

                return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:border-primary-500/50 transition-colors"
                >
                  {/* Request Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold">
                          {getIssueTypeLabel(request.issueType)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                          {request.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-dark-400 text-sm mb-3">{request.description}</p>
                    </div>
                    <div className="text-right text-dark-400 text-sm">
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-dark-700">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-dark-500">Location</p>
                        <p className="text-sm font-medium truncate" title={request.address}>
                          {request.address || 'No address provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-dark-500">Status</p>
                        <p className="text-sm font-medium">
                          {request.status === RequestStatus.PENDING && 'Pending'}
                          {request.status === RequestStatus.SEARCHING && 'Searching'}
                          {request.status === RequestStatus.ASSIGNED && 'Assigned'}
                          {request.status === RequestStatus.EN_ROUTE && 'En Route'}
                          {request.status === RequestStatus.IN_PROGRESS && 'In Progress'}
                          {request.status === RequestStatus.COMPLETED && 'Completed'}
                          {request.status === RequestStatus.CANCELLED && 'Cancelled'}
                          {request.status === RequestStatus.PAYMENT_PENDING && 'Payment Pending'}
                          {request.status === RequestStatus.PAID && 'Paid'}
                        </p>
                      </div>
                    </div>

                    {request.mechanicId && (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-dark-500">Mechanic</p>
                          <p className="text-sm font-medium">{request.mechanicName || 'Assigned'}</p>
                        </div>
                      </div>
                    )}

                    {(request.finalAmount || paymentSummary?.estimatedAmount) && (
                      <div>
                        <p className="text-xs text-dark-500">
                          {requestItem.finalAmount ? 'Total Amount' : 'Estimated Amount'}
                        </p>
                        <p className="text-sm font-bold text-primary-400">
                          ₹{request.finalAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ─── LIVE TRACKING PANEL (EN_ROUTE only) ──────────────── */}
                  {paymentSummary?.depositHoldAmount != null && !requestItem.finalAmount && (
                    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-amber-300">Deposit Hold Reserved</p>
                          <p className="text-xs text-dark-300">
                            Rs {paymentSummary.depositHoldAmount.toFixed(0)} is reserved while the mechanic is assigned.
                          </p>
                        </div>
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2 text-right">
                          <p className="text-xs text-dark-500">Hold Status</p>
                          <p className="text-sm font-bold text-white">
                            {paymentSummary.depositHeld ? 'Held' : 'Released'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(requestItem.finalAmount != null || request.status === RequestStatus.PAID || request.status === RequestStatus.PAYMENT_PENDING) && paymentSummary && (
                    <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-green-300">Bill Breakdown</p>
                          <p className="text-xs text-dark-400">Review the completed service charges</p>
                        </div>
                        <span className="text-xs font-medium text-dark-300">
                          {paymentSummary.status}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2">
                          <p className="text-xs text-dark-500">Parts</p>
                          <p className="text-sm font-semibold text-white">Rs {(paymentSummary.partsCharge ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2">
                          <p className="text-xs text-dark-500">Labor</p>
                          <p className="text-sm font-semibold text-white">Rs {(paymentSummary.laborCharge ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2">
                          <p className="text-xs text-dark-500">Platform Fee</p>
                          <p className="text-sm font-semibold text-white">Rs {(paymentSummary.platformFee ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2">
                          <p className="text-xs text-dark-500">Mechanic Earning</p>
                          <p className="text-sm font-semibold text-white">Rs {(paymentSummary.mechanicEarning ?? 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg border border-dark-700 bg-dark-900/50 px-3 py-2">
                        <p className="text-xs text-dark-500">Total</p>
                        <p className="text-base font-bold text-primary-300">Rs {(paymentSummary.totalAmount ?? 0).toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {request.status === RequestStatus.EN_ROUTE && (
                    <TrackingPanel
                      requestId={request.id}
                      mechanicName={request.mechanicName}
                      mechanicProfileImageUrl={request.mechanicProfileImageUrl}
                      mechanicRating={request.mechanicRating}
                      customerLat={request.locationLatitude}
                      customerLng={request.locationLongitude}
                    />
                  )}

                  {request.status === RequestStatus.IN_PROGRESS && (
                    <div className="mt-4 rounded-xl border border-primary-500/30 bg-primary-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-primary-300">
                            {request.mechanicName || 'Mechanic'} has arrived
                          </p>
                          <p className="text-xs text-dark-400">
                            Service is underway{request.serviceStartedAt ? ` since ${formatDate(request.serviceStartedAt)}` : ''}.
                          </p>
                        </div>
                        <div className="rounded-lg bg-dark-800/60 px-3 py-2 text-right">
                          <p className="text-xs text-dark-500">Service Timer</p>
                          <p className="text-sm font-bold text-white">
                            {formatElapsedTime(request.serviceStartedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${request.locationLatitude},${request.locationLongitude}`,
                          '_blank'
                        )
                      }
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>View on Maps</span>
                    </button>

                    {request.status === RequestStatus.COMPLETED && request.finalAmount && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-400">Completed</span>
                      </div>
                    )}

                    {[RequestStatus.COMPLETED, RequestStatus.PAYMENT_PENDING].includes(request.status) && request.finalAmount && (
                      <button
                        onClick={() => handlePayNow(request.id)}
                        disabled={payingRequestId === request.id}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {payingRequestId === request.id ? 'Processing...' : `Pay Now ₹${request.finalAmount.toFixed(0)}`}
                      </button>
                    )}

                  {request.status === RequestStatus.PAID && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">Paid</span>
                      </div>
                    )}

                    {request.status === RequestStatus.CANCELLED && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium text-red-400">Cancelled</span>
                      </div>
                    )}

                    {[RequestStatus.PENDING, RequestStatus.SEARCHING, RequestStatus.ASSIGNED].includes(
                      request.status
                    ) && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-blue-400">In Progress</span>
                      </div>
                    )}

                    {request.status === RequestStatus.EN_ROUTE && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-orange-400">Mechanic En Route</span>
                      </div>
                    )}

                    {request.status === RequestStatus.IN_PROGRESS && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-primary-300">Service In Progress</span>
                      </div>
                    )}
                  </div>

                  {request.status === RequestStatus.PAID && request.mechanicId && (
                    <div className="mt-4 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
                      {ratings[request.id] ? (
                        <div>
                          <p className="text-sm font-semibold text-primary-300">Your Rating</p>
                          <p className="text-sm text-white mt-1">{'★'.repeat(ratings[request.id].score)}{'☆'.repeat(5 - ratings[request.id].score)}</p>
                          {ratings[request.id].review && (
                            <p className="text-xs text-dark-300 mt-2">{ratings[request.id].review}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-primary-300">Rate Your Mechanic</p>
                            <p className="text-xs text-dark-400">Share your experience after payment.</p>
                          </div>
                          <div>
                            <label className="block text-xs text-dark-500 mb-1">Rating</label>
                            <select
                              value={ratingDrafts[request.id]?.score ?? 5}
                              onChange={(event) =>
                                setRatingDrafts((current) => ({
                                  ...current,
                                  [request.id]: {
                                    score: Number(event.target.value),
                                    review: current[request.id]?.review ?? '',
                                  },
                                }))
                              }
                              className="input-field"
                            >
                              {[5, 4, 3, 2, 1].map((score) => (
                                <option key={score} value={score}>
                                  {score} Star{score > 1 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-dark-500 mb-1">Review</label>
                            <textarea
                              value={ratingDrafts[request.id]?.review ?? ''}
                              onChange={(event) =>
                                setRatingDrafts((current) => ({
                                  ...current,
                                  [request.id]: {
                                    score: current[request.id]?.score ?? 5,
                                    review: event.target.value,
                                  },
                                }))
                              }
                              className="input-field h-24 resize-none"
                              placeholder="Tell us how the service went..."
                            />
                          </div>
                          <button
                            onClick={() => handleSubmitRating(request.id, request.mechanicId)}
                            disabled={submittingRatingRequestId === request.id}
                            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingRatingRequestId === request.id ? 'Submitting...' : 'Submit Rating'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
