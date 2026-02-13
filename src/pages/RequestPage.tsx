import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle, Crosshair } from 'lucide-react';
import { IssueType } from '../types';
import { requestApi } from '../services/api';
import toast from 'react-hot-toast';

const RequestPage = () => {
  const navigate = useNavigate();
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    issueType: IssueType.TYRE_PUNCTURE, // Default to first issue type, replace spaces with underscores
    description: '',
    locationLatitude: 0,
    locationLongitude: 0,
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current location on mount
  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            locationLatitude: position.coords.latitude,
            locationLongitude: position.coords.longitude,
            // Don't auto-fill address with coordinates
          }));
          setIsGettingLocation(false);
          toast.success('Location obtained successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          toast.error('Could not get current location. Please enter manually.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by your browser');
      setUseCurrentLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      toast.error('Please describe your issue');
      return;
    }

    if (formData.locationLatitude === 0 && formData.locationLongitude === 0) {
      toast.error('Please provide a location');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Please provide your address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map frontend field names to backend expected names
      const response = await requestApi.createRequest({
        currentLocationLat: formData.locationLatitude,
        currentLocationLng: formData.locationLongitude,
        issueType: formData.issueType, 
        description: formData.description,
        address: formData.address.trim(),
      });

      if (response.success) {
        toast.success('Request created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold mb-8">Request Breakdown Service</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Issue Type *</label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value as IssueType })}
                className="input-field"
                required
              >
                {Object.values(IssueType).map((type) => (
                  <option key={type} value={type}>
                    {getIssueTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-32 resize-none"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            {/* Address - Always visible */}
            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field pl-12"
                  placeholder="e.g., Connaught Place, New Delhi, Delhi 110001"
                  required
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Enter your complete address (landmark, street, area, city, pincode)
              </p>
            </div>

            {/* Location Coordinates */}
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">GPS Coordinates *</label>
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUseCurrentLocation(true);
                    getCurrentLocation();
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    useCurrentLocation 
                      ? 'border-primary-500 bg-primary-500/10 text-white' 
                      : 'border-dark-700 bg-dark-800 text-dark-400'
                  }`}
                >
                  <Crosshair className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Use Current Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUseCurrentLocation(false)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    !useCurrentLocation 
                      ? 'border-primary-500 bg-primary-500/10 text-white' 
                      : 'border-dark-700 bg-dark-800 text-dark-400'
                  }`}
                >
                  <MapPin className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Enter Manually</span>
                </button>
              </div>

              {useCurrentLocation ? (
                <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-dark-400">GPS Coordinates</span>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium disabled:opacity-50"
                    >
                      {isGettingLocation ? 'Getting...' : 'Refresh'}
                    </button>
                  </div>
                  {formData.locationLatitude !== 0 && formData.locationLongitude !== 0 ? (
                    <div className="space-y-1">
                      <p className="text-white font-medium">
                        Latitude: {formData.locationLatitude.toFixed(6)}
                      </p>
                      <p className="text-white font-medium">
                        Longitude: {formData.locationLongitude.toFixed(6)}
                      </p>
                      <div className="mt-2 pt-2 border-t border-dark-700">
                        <p className="text-xs text-green-500">✓ Location captured successfully</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-dark-500 text-sm">Waiting for GPS location...</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.locationLatitude || ''}
                      onChange={(e) => setFormData({ ...formData, locationLatitude: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="28.7041"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-2">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.locationLongitude || ''}
                      onChange={(e) => setFormData({ ...formData, locationLongitude: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="77.1025"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-300">
                <p className="mb-2">
                  <strong>How it works:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-dark-400">
                  <li>Provide your address and location</li>
                  <li>We'll find the nearest verified mechanic</li>
                  <li>Track your mechanic in real-time</li>
                  <li>Get your vehicle fixed on-site</li>
                </ol>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGettingLocation}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting Request...' : 'Request Help Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;