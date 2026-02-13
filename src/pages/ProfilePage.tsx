import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store';

const ProfilePage = () => {
  const { user, refreshUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // Refresh user data from backend to ensure we have latest data
        await refreshUser();
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, refreshUser]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-dark-300">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="glass-card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-dark-300">Unable to load user profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

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
                <span>{user?.fullName || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Email</label>
              <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                <Mail className="w-5 h-5 text-dark-400" />
                <span>{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Phone</label>
              <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                <Phone className="w-5 h-5 text-dark-400" />
                <span>{user?.phone || 'N/A'}</span>
              </div>
            </div>

            {user?.role && (
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Role</label>
                <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                  <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {user?.isVerified && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-400">✓ Email Verified</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;