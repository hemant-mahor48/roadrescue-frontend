import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Plus, 
  Car, 
  Clock, 
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Wrench,
  TrendingUp
} from 'lucide-react';
import { useAuthStore, useRequestStore } from '../store';
import { requestApi } from '../services/api';
import { RequestStatus } from '../types';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();
  const { activeRequests, setActiveRequests } = useRequestStore();
  const [isLoading, setIsLoading] = useState(true);

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

        {/* Active Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Requests</h2>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="card h-32 skeleton" />
              ))}
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-400">No active requests</p>
              <Link to="/request/new" className="btn-primary mt-4 inline-block">
                Create New Request
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map((request) => (
                <motion.div
                  key={request.id}
                  className="card-hover"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`status-badge border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className="text-dark-400 text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2">{request.issueType.replace('_', ' ')}</h3>
                      <p className="text-dark-400 mb-3">{request.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-dark-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.address || 'Location'}</span>
                        </div>
                        {request.finalAmount && (
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-primary-500">
                              ₹{request.finalAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
