import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  AlertCircle, 
  LogOut, 
  Loader2 
} from 'lucide-react';
import { UserProfile, AppUser, GoogleUser, UserOnboardingInput } from '../types/fitness';

interface SettingsPageProps {
  user: UserProfile;
  currentUser?: AppUser | null;
  googleUser?: GoogleUser | null;
  onClose: () => void;
  onUpdateUser: (updatedDetails: Partial<UserOnboardingInput>, regeneratePlan: boolean) => Promise<void>;
  onSignOut: () => void;
  isSaving: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  currentUser,
  googleUser,
  onClose,
  onUpdateUser,
  onSignOut,
  isSaving
}) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    age: String(user.age || ''),
    height: user.height || '',
    weight: user.weight || '',
    gender: user.gender || '',
    fitnessGoal: user.fitnessGoal || '',
    fitnessLevel: user.fitnessLevel || '',
    planDays: user.planDays || 4,
    workoutLocation: user.workoutLocation || '',
    dietaryPreference: user.dietaryPreference || '',
    injuriesLimitations: user.injuriesLimitations || '',
    activityLevel: user.activityLevel || '',
    sleepHours: user.sleepHours || ''
  });

  const [regeneratePlan, setRegeneratePlan] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const goalOptions = [
    'Weight Loss & Fat Burn',
    'Muscle Building & Hypertrophy',
    'Toning & Body Sculpting',
    'Cardiovascular Endurance',
    'Flexibility & Posture',
    'General Health & Wellness'
  ];

  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const dayOptions = [2, 3, 4, 5, 6, 7];

  const locationOptions = [
    'Commercial Gym (Full Equipment, Barbells, Machines)',
    'Home Gym (Dumbbells & Resistance Bands)',
    'Bodyweight & Calisthenics Only (No Equipment)',
    'Kettlebells & Exercise Mat'
  ];

  const dietOptions = [
    'No restrictions (Balanced Whole Foods)',
    'High Protein Focus',
    'Vegetarian',
    'Vegan / Plant-Based',
    'Low Carb / Ketogenic',
    'Gluten-Free'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      setErrorMsg('Please enter a valid age.');
      return;
    }
    if (!formData.height.trim() || !formData.weight.trim()) {
      setErrorMsg('Please specify height and weight.');
      return;
    }

    await onUpdateUser(
      {
        fullName: formData.fullName,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        gender: formData.gender,
        fitnessGoal: formData.fitnessGoal,
        fitnessLevel: formData.fitnessLevel,
        planDays: Number(formData.planDays),
        workoutLocation: formData.workoutLocation,
        dietaryPreference: formData.dietaryPreference,
        injuriesLimitations: formData.injuriesLimitations,
        activityLevel: formData.activityLevel,
        sleepHours: formData.sleepHours
      },
      regeneratePlan
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Full-height solid white drawer panel */}
      <div 
        className="w-full max-w-xl h-full bg-white text-gray-900 border-l border-gray-200 shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Pinned Header */}
        <div className="p-6 pb-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
              <Settings className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-heading">
                User Details & Settings
              </h2>
              <span className="text-xs text-gray-500">
                Manage your personal biometrics and training preferences
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with solid white background */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white">
          {/* Account Profile Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-900 block">
                  {user.fullName}
                </span>
                <span className="text-xs text-gray-500 block">
                  {user.email || currentUser?.email || googleUser?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form id="settings-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Age, Height, Weight */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="text"
                  required
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g. 175 cm"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 70 kg"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select option</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary / Other">Non-binary / Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Workout Plan Days Duration (User selection) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-900">
                  Workout Plan Days (Custom Schedule)
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {formData.planDays} Days Plan
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {dayOptions.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, planDays: days });
                      setRegeneratePlan(true);
                    }}
                    className={`py-2 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                      Number(formData.planDays) === days
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">
                Choose how many days your personalized workout plan should cover.
              </span>
            </div>

            {/* Primary Fitness Goal */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Primary Fitness Goal
              </label>
              <select
                value={formData.fitnessGoal}
                onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {goalOptions.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Fitness Level */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fitness Experience Level
              </label>
              <select
                value={formData.fitnessLevel}
                onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {levelOptions.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Location & Equipment */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Workout Location & Equipment
              </label>
              <select
                value={formData.workoutLocation}
                onChange={(e) => setFormData({ ...formData, workoutLocation: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {locationOptions.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Dietary Preference
              </label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {dietOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Limitations or Injuries */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Injuries or Physical Limitations
              </label>
              <input
                type="text"
                value={formData.injuriesLimitations}
                onChange={(e) => setFormData({ ...formData, injuriesLimitations: e.target.value })}
                placeholder="e.g. Lower back discomfort, sensitive knees"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Regenerate Plan Checkbox */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
              <input
                type="checkbox"
                id="regenPlanCheck"
                checked={regeneratePlan}
                onChange={(e) => setRegeneratePlan(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
              />
              <label htmlFor="regenPlanCheck" className="text-xs text-emerald-950 font-medium cursor-pointer">
                Re-generate workout plan and nutrition advice based on these updated details
              </label>
            </div>
          </form>
        </div>

        {/* Pinned Footer with Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50/90 shrink-0 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
