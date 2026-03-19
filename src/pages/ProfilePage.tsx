import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CarFront, Mail, Phone, Plus, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../services/api';
import { useAuthStore } from '../store';
import { AddVehicleRequest, Vehicle, VehicleType } from '../types';

const initialVehicleForm: AddVehicleRequest = {
  vehicleType: VehicleType.CAR,
  manufacturer: '',
  model: '',
  registrationNumber: '',
  year: new Date().getFullYear(),
  color: '',
};

const ProfilePage = () => {
  const { user, refreshUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<AddVehicleRequest>(initialVehicleForm);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        await refreshUser();
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      void loadUserData();
    }
  }, [isAuthenticated, refreshUser]);

  const vehicles = useMemo(() => user?.vehicles ?? [], [user?.vehicles]);

  const handleAddVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingVehicle(true);

    try {
      const payload: AddVehicleRequest = {
        ...vehicleForm,
        manufacturer: vehicleForm.manufacturer.trim(),
        model: vehicleForm.model.trim(),
        registrationNumber: vehicleForm.registrationNumber.trim().toUpperCase(),
        color: vehicleForm.color?.trim() || '',
      };

      const response = await userApi.addVehicle(payload);
      if (response.success) {
        toast.success('Vehicle added successfully');
        setVehicleForm(initialVehicleForm);
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const vehicleCountLabel = vehicles.length === 1 ? '1 vehicle' : `${vehicles.length} vehicles`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
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
        <div className="max-w-5xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="glass-card p-8 text-center">
            <p className="text-dark-300">Unable to load user profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-dark-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Full Name</label>
                <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                  <User className="w-5 h-5 text-dark-400" />
                  <span>{user.fullName || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Email</label>
                <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                  <Mail className="w-5 h-5 text-dark-400" />
                  <span>{user.email || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Phone</label>
                <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                  <Phone className="w-5 h-5 text-dark-400" />
                  <span>{user.phone || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Role</label>
                <div className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl">
                  <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-500 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>

              {user.isVerified && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-400">Email verified</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">My Vehicles</h2>
                  <p className="text-sm text-dark-400 mt-1">{vehicleCountLabel}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center">
                  <CarFront className="w-6 h-6 text-primary-400" />
                </div>
              </div>

              {vehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-dark-600 bg-dark-800/60 p-5 text-sm text-dark-400">
                  No vehicles added yet. Add one below so you can create a roadside assistance request.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle: Vehicle) => (
                    <div key={vehicle.id} className="rounded-xl border border-dark-700 bg-dark-800/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {vehicle.manufacturer} {vehicle.model}
                          </p>
                          <p className="text-sm text-dark-400 mt-1">
                            {vehicle.vehicleType} • {vehicle.year}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-400">
                          {vehicle.registrationNumber}
                        </span>
                      </div>
                      {vehicle.color && (
                        <p className="text-xs text-dark-500 mt-3">Color: {vehicle.color}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-5 h-5 text-primary-400" />
                <h2 className="text-2xl font-bold">Add Vehicle</h2>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Type *</label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm((current) => ({ ...current, vehicleType: e.target.value as VehicleType }))}
                    className="input-field"
                    required
                  >
                    {Object.values(VehicleType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Manufacturer *</label>
                    <input
                      type="text"
                      value={vehicleForm.manufacturer}
                      onChange={(e) => setVehicleForm((current) => ({ ...current, manufacturer: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Hyundai"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Model *</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm((current) => ({ ...current, model: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. i20"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Year *</label>
                    <input
                      type="number"
                      min="1900"
                      max="2030"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm((current) => ({ ...current, year: Number(e.target.value) || new Date().getFullYear() }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="text"
                      value={vehicleForm.color ?? ''}
                      onChange={(e) => setVehicleForm((current) => ({ ...current, color: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. White"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Registration Number *</label>
                  <input
                    type="text"
                    value={vehicleForm.registrationNumber}
                    onChange={(e) => setVehicleForm((current) => ({ ...current, registrationNumber: e.target.value.toUpperCase() }))}
                    className="input-field"
                    placeholder="DL-01-AB-1234"
                    required
                  />
                  <p className="text-xs text-dark-500 mt-2">Use the format `DL-01-AB-1234`.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingVehicle}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingVehicle ? 'Saving Vehicle...' : 'Add Vehicle'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
