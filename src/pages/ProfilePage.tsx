import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '../store';

const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Full Name</label>
              <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                <User className="w-5 h-5 text-dark-400" />
                <span>{user?.fullName}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Email</label>
              <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                <Mail className="w-5 h-5 text-dark-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Phone</label>
              <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                <Phone className="w-5 h-5 text-dark-400" />
                <span>{user?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
