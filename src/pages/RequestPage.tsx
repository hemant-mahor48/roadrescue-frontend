import { ChangeEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, Crosshair, MapPin, X } from 'lucide-react';
import { IssueType, Vehicle } from '../types';
import { requestApi, userApi } from '../services/api';
import toast from 'react-hot-toast';

const MAX_PHOTOS = 5;

const RequestPage = () => {
  const navigate = useNavigate();
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    issueType: IssueType.TYRE_PUNCTURE,
    description: '',
    locationLatitude: 0,
    locationLongitude: 0,
    address: '',
    photoUrls: [] as string[],
  });

  useEffect(() => {
    void loadVehicles();
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const response = await userApi.getVehicles();
      const nextVehicles = response.data ?? [];
      setVehicles(nextVehicles);
      setFormData((prev) => ({
        ...prev,
        vehicleId: prev.vehicleId || nextVehicles[0]?.id || '',
      }));
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      toast.error('Could not load your vehicles');
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            locationLatitude: position.coords.latitude,
            locationLongitude: position.coords.longitude,
          }));
          setIsGettingLocation(false);
          toast.success('Location obtained successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          toast.error('Could not get current location. Please enter it manually.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
      toast.error('Geolocation is not supported by your browser');
      setUseCurrentLocation(false);
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const availableSlots = MAX_PHOTOS - formData.photoUrls.length;
    if (availableSlots <= 0) {
      toast.error(`You can attach up to ${MAX_PHOTOS} photos`);
      event.target.value = '';
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    try {
      const convertedPhotos = await Promise.all(selectedFiles.map(readFileAsDataUrl));
      setFormData((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...convertedPhotos],
      }));

      if (files.length > availableSlots) {
        toast.error(`Only ${MAX_PHOTOS} photos can be attached to a request`);
      }
    } catch (error) {
      console.error('Failed to process photos:', error);
      toast.error('One or more photos could not be attached');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId) {
      toast.error('Please choose the vehicle that needs help');
      return;
    }

    if (!formData.description.trim()) {
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
      const response = await requestApi.createRequest({
        vehicleId: formData.vehicleId,
        currentLocationLat: formData.locationLatitude,
        currentLocationLng: formData.locationLongitude,
        issueType: formData.issueType,
        description: formData.description.trim(),
        address: formData.address.trim(),
        photoUrls: formData.photoUrls,
      });

      if (response.success) {
        toast.success('Request created. We are finding a mechanic now.');
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

  const getVehicleLabel = (vehicle: Vehicle) =>
    `${vehicle.manufacturer} ${vehicle.model} (${vehicle.registrationNumber})`;

  const isSubmitDisabled = isSubmitting || isGettingLocation || isLoadingVehicles || vehicles.length === 0;

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
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle *</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                className="input-field"
                required
                disabled={isLoadingVehicles || vehicles.length === 0}
              >
                {vehicles.length === 0 ? (
                  <option value="">No vehicles found</option>
                ) : (
                  vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleLabel(vehicle)}
                    </option>
                  ))
                )}
              </select>
              {vehicles.length === 0 && !isLoadingVehicles && (
                <p className="text-xs text-amber-400 mt-2">
                  Add a vehicle from your profile before creating a request.
                </p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-32 resize-none"
                placeholder="Describe what happened and anything the mechanic should know..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photos</label>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-dark-600 bg-dark-800/60 px-4 py-5 text-sm text-dark-300 transition-colors hover:border-primary-500 hover:text-white">
                <Camera className="w-5 h-5" />
                <span>Attach up to {MAX_PHOTOS} photos</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              <p className="text-xs text-dark-500 mt-2">
                Photos help the mechanic understand the issue before arriving.
              </p>

              {formData.photoUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {formData.photoUrls.map((photoUrl, index) => (
                    <div key={`${photoUrl.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-xl border border-dark-700 bg-dark-900">
                      <img src={photoUrl} alt={`Issue photo ${index + 1}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition-colors hover:bg-red-500"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                Enter your complete address with landmark details so the mechanic can find you faster.
              </p>
            </div>

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
                        <p className="text-xs text-green-500">Location captured successfully</p>
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

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-300">
                <p className="mb-2">
                  <strong>What happens next:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-dark-400">
                  <li>Your location, issue, vehicle, and photos are stored with the request.</li>
                  <li>We notify you as soon as the mechanic search starts.</li>
                  <li>Nearby mechanics within the active search radius are alerted.</li>
                  <li>You can track progress from the dashboard.</li>
                </ol>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unexpected file reader result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

export default RequestPage;
