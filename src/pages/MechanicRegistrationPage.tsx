import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Contact, CheckCircle } from 'lucide-react';
import { mechanicApi } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const MechanicRegistrationPage = () => {
  const navigate = useNavigate();
  const { refreshUser, user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    licenseNumber: '',
    aadhaarNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!formData.licenseNumber.trim() || !formData.aadhaarNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const cleanAadhaar = formData.aadhaarNumber.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) {
      toast.error('Aadhaar number must be 12 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await mechanicApi.registerAsMechanic({
        licenseNumber: formData.licenseNumber.trim(),
        aadhaarNumber: cleanAadhaar,
      });
      
      if (response.success) {
        toast.success('Mechanic profile created successfully! Awaiting verification.');
        await refreshUser();
        
        setTimeout(() => {
          navigate('/mechanic/dashboard', { replace: true });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to register as mechanic');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to register as mechanic');
      setIsSubmitting(false);
    }
  };

  // Check if already a mechanic
  if (user?.mechanicProfile) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="glass-card p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already a Mechanic</h2>
            <p className="text-dark-400 mb-6">You have already registered as a mechanic.</p>
            <Link to="/mechanic/dashboard" className="btn-primary">
              Go to Mechanic Dashboard
            </Link>
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Become a Mechanic</h1>
            <p className="text-dark-400">Register as a mechanic and start earning</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Driving License Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="input-field pl-12"
                  placeholder="DL-1420110012345"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">Enter your valid driving license number</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aadhaar Number</label>
              <div className="relative">
                <Contact className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      setFormData({ ...formData, aadhaarNumber: value });
                    }
                  }}
                  className="input-field pl-12"
                  placeholder="123456789012"
                  maxLength={12}
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                12-digit Aadhaar number (current: {formData.aadhaarNumber.length}/12)
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-dark-300">
                Your documents will be verified within 24-48 hours. You'll be notified once approved.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicRegistrationPage;