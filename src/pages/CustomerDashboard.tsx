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
  TrendingUp
} from 'lucide-react';
import { useAuthStore /*, useRequestStore */ } from '../store';
// import { requestApi } from '../services/api';
// import { IssueType, RequestStatus } from '../types';
import NotificationBell from '../components/NotificationBell';

const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();

  // const { activeRequests, setActiveRequests } = useRequestStore();
  // const [isLoading, setIsLoading] = useState(true);

  /*
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestApi.getMyRequests();
      if (response.success && response.data) {
        setActiveRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  /*
  const getStatusColor = (status: RequestStatus) => {
    const colors = {
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
  */

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

        {/* Active Requests section temporarily disabled */}
        {/*
        <motion.div>
          Active Requests UI here
        </motion.div>
        */}
      </div>
    </div>
  );
};

export default CustomerDashboard;
