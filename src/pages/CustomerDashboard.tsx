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
import { requestApi } from '../services/api';
import { RequestStatus, IssueType } from '../types';
import NotificationBell from '../components/NotificationBell';

const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();
  const { activeRequests, setActiveRequests } = useRequestStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await requestApi.getMyRequests();
      if (response.success && response.data) {
        console.log('response:', response);
        setActiveRequests(response.data);
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
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  // const getStatusIcon = (status: RequestStatus) => {
  //   switch (status) {
  //     case RequestStatus.COMPLETED:
  //       return '✓';
  //     case RequestStatus.ASSIGNED:
  //     case RequestStatus.IN_PROGRESS:
  //       return '⏳';
  //     case RequestStatus.SEARCHING:
  //       return '🔍';
  //     default:
  //       return '•';
  //   }
  // };

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
      minute: '2-digit'
    });
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
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
              {activeRequests.map((request, index) => (
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
                      <p className="text-dark-400 text-sm mb-3">
                        {request.description}
                      </p>
                    </div>
                    <div className="text-right text-dark-400 text-sm">
                      <p className="font-medium">{formatDate(request.createdAt)}</p>
                    </div>
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-dark-700">
                    {/* Location */}
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-dark-500">Location</p>
                        <p className="text-sm font-medium truncate" title={request.address}>
                          {request.address || 'No address provided'}
                        </p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-primary-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-dark-500">Status</p>
                        <p className="text-sm font-medium">
                          {request.status === RequestStatus.PENDING && 'Pending'}
                          {request.status === RequestStatus.SEARCHING && 'Searching'}
                          {request.status === RequestStatus.ASSIGNED && 'Assigned'}
                          {request.status === RequestStatus.IN_PROGRESS && 'In Progress'}
                          {request.status === RequestStatus.COMPLETED && 'Completed'}
                          {request.status === RequestStatus.CANCELLED && 'Cancelled'}
                        </p>
                      </div>
                    </div>

                    {/* Mechanic Assigned */}
                    {request.mechanicId && (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-dark-500">Mechanic</p>
                          <p className="text-sm font-medium">
                            {request.mechanicName || 'Assigned'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Charges */}
                    {request.finalAmount && (
                      <div>
                        <p className="text-xs text-dark-500">Total Amount</p>
                        <p className="text-sm font-bold text-primary-400">
                          ₹{request.finalAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${request.locationLatitude},${request.locationLongitude}`, '_blank')}
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

                    {request.status === RequestStatus.CANCELLED && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium text-red-400">Cancelled</span>
                      </div>
                    )}

                    {[RequestStatus.PENDING, RequestStatus.SEARCHING, RequestStatus.ASSIGNED].includes(request.status) && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-blue-400">In Progress</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;