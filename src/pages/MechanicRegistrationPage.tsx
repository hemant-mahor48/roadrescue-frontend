import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Contact, CheckCircle, MapPin, Crosshair } from 'lucide-react';
import { mechanicApi } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const MechanicRegistrationPage = () => {
  const navigate = useNavigate();
  const { refreshUser, user, isAuthenticated } = useAuthStore();
  
  // Two-step registration: Step 1 = Location, Step 2 = Verification
  const [step, setStep] = useState<'location' | 'verification'>('location');
  
  // Step 1: Registration with location
  const [locationData, setLocationData] = useState({
    currentLocationLat: 0,
    currentLocationLng: 0,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Step 2: Verification with documents
  const [verificationData, setVerificationData] = useState({
    licenseNumber: '',
    aadhaarNumber: '',
    profileImageUrl: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            currentLocationLat: position.coords.latitude,
            currentLocationLng: position.coords.longitude,
          });
          setIsGettingLocation(false);
          toast.success('Location obtained successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          toast.error('Could not get current location. Please enter manually.');
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Step 1: Register mechanic with location
  const handleStepOne = async () => {
    if (isSubmitting) return;

    if (locationData.currentLocationLat === 0 || locationData.currentLocationLng === 0) {
      toast.error('Please provide your current location');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await mechanicApi.registerAsMechanic(locationData);
      
      if (response.success) {
        toast.success('Step 1 complete! Now submit your documents for verification.');
        setStep('verification');
      } else {
        toast.error(response.message || 'Failed to register as mechanic');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to register as mechanic');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit verification documents
  const handleStepTwo = async () => {
    if (isSubmitting) return;

    if (!verificationData.licenseNumber.trim() || !verificationData.aadhaarNumber.trim() || !verificationData.profileImageUrl.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const cleanAadhaar = verificationData.aadhaarNumber.replace(/\s/g, '');
    if (cleanAadhaar.length !== 12) {
      toast.error('Aadhaar number must be 12 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await mechanicApi.submitVerification({
        licenseNumber: verificationData.licenseNumber.trim(),
        aadhaarNumber: cleanAadhaar,
        profileImageUrl: verificationData.profileImageUrl.trim(),
      });
      
      if (response.success) {
        toast.success('Verification submitted successfully! You can start accepting requests.');
        await refreshUser();
        
        setTimeout(() => {
          navigate('/mechanic/dashboard', { replace: true });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to submit verification');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    } finally {
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
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'location' ? 'bg-primary-500 text-white' : 'bg-green-500 text-white'}`}>
                1
              </div>
              <div className={`w-20 h-1 ${step === 'verification' ? 'bg-primary-500' : 'bg-dark-700'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'verification' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'}`}>
                2
              </div>
            </div>
          </div>

          {step === 'location' ? (
            // STEP 1: Location Registration
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-primary-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Step 1: Set Your Location</h1>
                <p className="text-dark-400">We need your current location to register you as a mechanic</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Location</label>
                  
                  <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-400">Using your current location</span>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="text-primary-500 hover:text-primary-400 text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Crosshair className="w-4 h-4" />
                        <span>{isGettingLocation ? 'Getting...' : 'Refresh'}</span>
                      </button>
                    </div>
                    {locationData.currentLocationLat !== 0 && (
                      <p className="text-xs text-dark-500 mt-1">
                        Lat: {locationData.currentLocationLat.toFixed(6)}, Lng: {locationData.currentLocationLng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Manual entry option */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-dark-400 mb-2">Latitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        value={locationData.currentLocationLat || ''}
                        onChange={(e) => setLocationData({ ...locationData, currentLocationLat: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                        placeholder="28.7041"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 mb-2">Longitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        value={locationData.currentLocationLng || ''}
                        onChange={(e) => setLocationData({ ...locationData, currentLocationLng: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                        placeholder="77.1025"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-dark-300">
                    📍 Your location helps us connect you with nearby customers who need roadside assistance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStepOne}
                  disabled={isSubmitting || isGettingLocation}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Continue to Verification'}
                </button>
              </div>
            </>
          ) : (
            // STEP 2: Document Verification
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Step 2: Document Verification</h1>
                <p className="text-dark-400">Submit your documents to complete registration</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Driving License Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="text"
                      value={verificationData.licenseNumber}
                      onChange={(e) => setVerificationData({ ...verificationData, licenseNumber: e.target.value })}
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
                      value={verificationData.aadhaarNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 12) {
                          setVerificationData({ ...verificationData, aadhaarNumber: value });
                        }
                      }}
                      className="input-field pl-12"
                      placeholder="123456789012"
                      maxLength={12}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">
                    12-digit Aadhaar number (current: {verificationData.aadhaarNumber.length}/12)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                  <input
                    type="url"
                    value={verificationData.profileImageUrl}
                    onChange={(e) => setVerificationData({ ...verificationData, profileImageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/your-photo.jpg"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-dark-500 mt-1">Provide a URL to your profile photo</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-dark-300">
                    🔒 Your documents will be verified within 24-48 hours. You'll be notified once approved.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep('location')}
                    disabled={isSubmitting}
                    className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepTwo}
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicRegistrationPage;