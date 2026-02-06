import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, User, Wrench, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore, useMechanicStore } from '../store';

const MechanicDashboard = () => {
  const { user, logout } = useAuthStore();
  const { isAvailable, setAvailability } = useMechanicStore();

  return (
    <div className="min-h-screen">
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">RoadRescue Mechanic</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="btn-ghost flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.fullName}</span>
            </Link>
            <button onClick={logout} className="btn-ghost"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">
            Mechanic Dashboard
          </h1>
          <p className="text-dark-400">Manage your availability and requests</p>
        </motion.div>

        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Availability Status</h3>
              <p className="text-dark-400">Toggle to receive new requests</p>
            </div>
            <button
              onClick={() => setAvailability(!isAvailable)}
              className="flex items-center space-x-2"
            >
              {isAvailable ? (
                <ToggleRight className="w-12 h-12 text-green-500" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-dark-600" />
              )}
            </button>
          </div>
        </div>

        <div className="card text-center py-12">
          <MapPin className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Active Requests</h3>
          <p className="text-dark-400">Turn on availability to start receiving requests</p>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
