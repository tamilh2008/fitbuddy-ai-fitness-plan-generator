import React, { useState } from 'react';
import { 
  ArrowRight, 
  User, 
  Activity, 
  Target, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AppUser, GoogleUser, UserOnboardingInput } from '../types/fitness';

interface OnboardingFormProps {
  user?: AppUser | null;
  googleUser?: GoogleUser | null;
  onSubmit: (input: UserOnboardingInput) => Promise<void>;
  isLoading: boolean;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  user,
  googleUser,
  onSubmit,
  isLoading
}) => {
  const currentUser = user || googleUser;
  const [formData, setFormData] = useState<UserOnboardingInput>({
    fullName: currentUser?.name || '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    fitnessGoal: '',
    fitnessLevel: '',
    planDays: 0, // Unselected by default as requested
    workoutLocation: '',
    dietaryPreference: '',
    injuriesLimitations: '',
    activityLevel: '',
    sleepHours: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const dayOptions = [
    { days: 2, label: '2 Days / Week', desc: 'Minimalist full-body split' },
    { days: 3, label: '3 Days / Week', desc: 'Classic Push / Pull / Legs or Full Body' },
    { days: 4, label: '4 Days / Week', desc: 'Upper / Lower balanced split' },
    { days: 5, label: '5 Days / Week', desc: 'Targeted body-part split' },
    { days: 6, label: '6 Days / Week', desc: 'High frequency training split' },
    { days: 7, label: '7 Days / Week', desc: 'Full weekly training & active recovery cycle' }
  ];

  const goalOptions = [
    { id: 'Weight Loss & Fat Burn', title: 'Weight Loss & Fat Burn', desc: 'Caloric deficit, metabolic circuits, and healthy fat reduction' },
    { id: 'Muscle Building & Hypertrophy', title: 'Muscle Building & Hypertrophy', desc: 'Lean mass accumulation, volume, and progressive overload' },
    { id: 'Toning & Body Sculpting', title: 'Toning & Body Sculpting', desc: 'High-rep resistance, definition, and core tightening' },
    { id: 'Cardiovascular Endurance', title: 'Cardiovascular Endurance', desc: 'Stamina, aerobic threshold, and lung capacity' },
    { id: 'Flexibility & Posture', title: 'Flexibility & Posture', desc: 'Mobility, spinal alignment, and joint longevity' },
    { id: 'General Health & Wellness', title: 'General Health & Wellness', desc: 'Functional energy, mood elevation, and vitality' }
  ];

  const levelOptions = [
    { id: 'Beginner', title: 'Beginner', desc: 'New to workouts or returning after a long break' },
    { id: 'Intermediate', title: 'Intermediate', desc: 'Exercising consistently for 6+ months with good form' },
    { id: 'Advanced', title: 'Advanced', desc: 'Experienced lifter or athlete training consistently' }
  ];

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

  const activityOptions = [
    'Sedentary (Desk job, minimal daily movement)',
    'Lightly Active (Occasional walks, light standing)',
    'Moderately Active (Active during day, on feet often)',
    'Very Active (Physically demanding routine)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      setValidationError('Please enter a valid age.');
      return;
    }
    if (!formData.height.trim()) {
      setValidationError('Please enter your height.');
      return;
    }
    if (!formData.weight.trim()) {
      setValidationError('Please enter your weight.');
      return;
    }
    if (!formData.planDays || formData.planDays <= 0) {
      setValidationError('Please select the number of days for your workout plan.');
      return;
    }
    if (!formData.fitnessGoal) {
      setValidationError('Please select your primary fitness goal.');
      return;
    }
    if (!formData.fitnessLevel) {
      setValidationError('Please select your current fitness experience level.');
      return;
    }
    if (!formData.workoutLocation) {
      setValidationError('Please select your workout location and equipment.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-white text-gray-900">
      {/* Title & Introduction */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
          <span>Personal Assessment</span>
          {currentUser?.email && (
            <>
              <span>•</span>
              <span>{currentUser.email}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
          Tell Us About Your Fitness Profile
        </h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Provide your current bio-metrics and preferences. Your custom workout schedule, exercises, warm-ups, cool-downs, and nutrition tips will be generated based on your exact selections.
        </p>
      </div>

      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Biometrics */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900 font-heading">
              1. Basic Information & Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gender (Optional)
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Select option</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary / Other">Non-binary / Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Age (years) *
              </label>
              <input
                type="number"
                min="14"
                max="100"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Height (e.g. 172 cm) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Weight (e.g. 68 kg) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Workout Plan Days Selection (User Selection, No 7 Days Default) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">
                2. Select Workout Plan Duration *
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose how many days your custom workout plan should cover
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dayOptions.map((opt) => {
              const isSelected = formData.planDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setFormData({ ...formData, planDays: opt.days })}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{opt.label}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Fitness Goal */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Target className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900 font-heading">
              3. Primary Fitness Goal *
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goalOptions.map((goal) => {
              const isSelected = formData.fitnessGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, fitnessGoal: goal.id })}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">{goal.title}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">{goal.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Fitness Experience Level */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900 font-heading">
              4. Current Fitness Experience *
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {levelOptions.map((lvl) => {
              const isSelected = formData.fitnessLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, fitnessLevel: lvl.id })}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">{lvl.title}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{lvl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Equipment & Lifestyle */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-gray-900 font-heading pb-3 border-b border-gray-100">
            5. Workout Logistics & Lifestyle Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Equipment / Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Workout Location & Equipment *
              </label>
              <select
                required
                value={formData.workoutLocation}
                onChange={(e) => setFormData({ ...formData, workoutLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Select location / equipment</option>
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
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Select preference (optional)</option>
                {dietOptions.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            {/* Daily Activity Level */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Daily Activity Level
              </label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Select daily activity (optional)</option>
                {activityOptions.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            {/* Nightly Sleep */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Average Nightly Sleep
              </label>
              <select
                value={formData.sleepHours}
                onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="">Select sleep duration (optional)</option>
                <option value="Under 6 hours">Under 6 hours</option>
                <option value="6-7 hours">6-7 hours</option>
                <option value="7-8 hours">7-8 hours</option>
                <option value="8+ hours">8+ hours</option>
              </select>
            </div>
          </div>

          {/* Injuries or Limitations */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Injuries, Medical Conditions or Joint Limitations (Optional)
            </label>
            <input
              type="text"
              value={formData.injuriesLimitations}
              onChange={(e) => setFormData({ ...formData, injuriesLimitations: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs active:bg-emerald-800 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Your {formData.planDays || ''} Day Workout Routine...</span>
              </>
            ) : (
              <>
                <span>Generate {formData.planDays ? `${formData.planDays}-Day` : ''} Workout Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
