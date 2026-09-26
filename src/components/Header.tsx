import React from 'react';
import { Dumbbell, Settings } from 'lucide-react';
import { AppUser, UserProfile } from '../types/fitness';

interface HeaderProps {
  currentUser: AppUser | null;
  activeUser: UserProfile | null;
  onOpenSettings: () => void;
  onNewPlan: () => void;
  onViewPlan: () => void;
  hasPlan: boolean;
  activeView: 'onboarding' | 'plan';
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeUser,
  onOpenSettings,
  onNewPlan,
  onViewPlan,
  hasPlan,
  activeView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div 
            onClick={hasPlan ? onViewPlan : onNewPlan}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-gray-900">
                FitBuddy
              </span>
              <span className="text-[10px] text-gray-500 block -mt-1 font-medium">
                Personalized Fitness Planner
              </span>
            </div>
          </div>

          {/* Navigation & User Settings in Top Right Corner */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Plan / Questionnaire Switcher if plan exists */}
              {hasPlan && (
                <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={onViewPlan}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeView === 'plan'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Plan
                  </button>
                  <button
                    onClick={onNewPlan}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeView === 'onboarding'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    New Assessment
                  </button>
                </div>
              )}

              {/* Settings / User Details Button in Top Right Corner */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium transition-all shadow-xs cursor-pointer group"
                title="Open User Details & Settings"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {activeUser?.fullName?.charAt(0) || currentUser.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-gray-900 block truncate max-w-[120px] leading-tight">
                    {activeUser?.fullName || currentUser.name || 'User'}
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    Settings
                  </span>
                </div>
                <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0 ml-0.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-500 font-medium">
              Fitness & Nutrition Planner
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
