/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserLoginGateway } from './components/UserLoginGateway';
import { OnboardingForm } from './components/OnboardingForm';
import { PlanView } from './components/PlanView';
import { SettingsPage } from './components/SettingsPage';
import { Header } from './components/Header';
import { AppUser, UserProfile, UserOnboardingInput } from './types/fitness';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_app_user') || localStorage.getItem('fitbuddy_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeUser, setActiveUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'onboarding' | 'plan'>(() => {
    return activeUser ? 'plan' : 'onboarding';
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleUserContinue = (user: AppUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('fitbuddy_app_user', JSON.stringify(user));
    } catch (e) {}
    showNotification('success', `Welcome, ${user.name}!`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveUser(null);
    setShowSettings(false);
    try {
      localStorage.removeItem('fitbuddy_app_user');
      localStorage.removeItem('fitbuddy_google_user');
      localStorage.removeItem('fitbuddy_active_profile');
    } catch (e) {}
    setActiveView('onboarding');
    showNotification('success', 'You have been signed out.');
  };

  const handleFormSubmit = async (input: UserOnboardingInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails: input,
          userAccount: currentUser
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process assessment.');
      }

      if (data.user) {
        setActiveUser(data.user);
        try {
          localStorage.setItem('fitbuddy_active_profile', JSON.stringify(data.user));
        } catch (e) {}
        setActiveView('plan');
        showNotification('success', `Your ${input.planDays}-day workout plan has been generated!`);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      showNotification('error', err.message || 'Error processing request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (userId: string, feedback: string) => {
    setIsUpdatingFeedback(true);
    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, feedback })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update plan.');
      }

      if (data.user) {
        setActiveUser(data.user);
        try {
          localStorage.setItem('fitbuddy_active_profile', JSON.stringify(data.user));
        } catch (e) {}
        showNotification('success', 'Workout plan revised according to your feedback.');
      }
    } catch (err: any) {
      console.error('Feedback error:', err);
      showNotification('error', err.message || 'Error updating plan.');
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  const handleUpdateUserSettings = async (
    updatedDetails: Partial<UserOnboardingInput>,
    regeneratePlan: boolean
  ) => {
    if (!activeUser) return;
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.userId,
          updatedDetails,
          regeneratePlan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      if (data.user) {
        setActiveUser(data.user);
        try {
          localStorage.setItem('fitbuddy_active_profile', JSON.stringify(data.user));
        } catch (e) {}
        setShowSettings(false);
        setActiveView('plan');
        showNotification('success', regeneratePlan ? 'Settings saved and new workout plan generated!' : 'User details successfully updated.');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      showNotification('error', err.message || 'Failed to update settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border max-w-md flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-medium leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        activeUser={activeUser}
        onOpenSettings={() => setShowSettings(true)}
        onNewPlan={() => setActiveView('onboarding')}
        onViewPlan={() => setActiveView('plan')}
        hasPlan={!!activeUser}
        activeView={activeView}
      />

      {/* Main Content */}
      <main className="flex-1">
        {!currentUser ? (
          /* Step 1: Basic user details (Name & Email) entry */
          <UserLoginGateway onContinue={handleUserContinue} />
        ) : activeView === 'onboarding' || !activeUser ? (
          /* Step 2: Intake Questionnaire (User selects plan days) */
          <OnboardingForm
            user={currentUser}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
          />
        ) : (
          /* Step 3: Interactive Plan matching user-chosen duration */
          <PlanView
            user={activeUser}
            onSubmitFeedback={handleFeedbackSubmit}
            isUpdatingFeedback={isUpdatingFeedback}
          />
        )}
      </main>

      {/* Settings Modal (Accessible from top right corner) */}
      {showSettings && activeUser && (
        <SettingsPage
          user={activeUser}
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
          onUpdateUser={handleUpdateUserSettings}
          onSignOut={handleSignOut}
          isSaving={isSavingSettings}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FitBuddy — AI Fitness Plan & Nutrition Generator</span>
          <span>Adaptive personal routines customized to your schedule</span>
        </div>
      </footer>
    </div>
  );
}
