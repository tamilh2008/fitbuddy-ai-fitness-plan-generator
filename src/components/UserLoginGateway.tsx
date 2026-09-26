import React, { useState } from 'react';
import { User, Mail, ArrowRight, Dumbbell, ShieldCheck } from 'lucide-react';
import { AppUser } from '../types/fitness';

interface UserLoginGatewayProps {
  onContinue: (user: AppUser) => void;
}

export const UserLoginGateway: React.FC<UserLoginGatewayProps> = ({
  onContinue
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    onContinue({
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-white text-gray-900 py-12">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">
        {/* App Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xs mb-4">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 font-heading">
            FitBuddy
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Personalized Workout Schedules & Nutrition Strategies
          </p>
        </div>

        {/* Entry Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-7 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Get Started
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your basic details below to continue to the application
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                User Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Quick & secure access • No password required</span>
          </div>
        </div>
      </div>
    </div>
  );
};
