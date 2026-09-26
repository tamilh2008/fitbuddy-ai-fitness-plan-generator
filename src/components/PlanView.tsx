import React, { useState } from 'react';
import { 
  Printer, 
  Clock, 
  Flame, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Apple, 
  Utensils, 
  Droplets, 
  Moon, 
  Loader2,
  Check
} from 'lucide-react';
import { UserProfile, WorkoutPlan, DayWorkout, Exercise } from '../types/fitness';

interface PlanViewProps {
  user: UserProfile;
  onSubmitFeedback: (userId: string, feedback: string) => Promise<void>;
  isUpdatingFeedback: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({
  user,
  onSubmitFeedback,
  isUpdatingFeedback
}) => {
  const [activeVersion, setActiveVersion] = useState<'current' | 'original'>(
    user.updatedPlan ? 'current' : 'original'
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  const plan: WorkoutPlan = (activeVersion === 'current' && user.updatedPlan) 
    ? user.updatedPlan 
    : user.originalPlan;

  const totalPlanDays = plan.days ? plan.days.length : (plan.totalDays || 4);
  const currentDay: DayWorkout = plan.days[selectedDayIdx] || plan.days[0];

  const toggleExerciseCheck = (dayNum: number, exIdx: number) => {
    const key = `${dayNum}-${exIdx}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    await onSubmitFeedback(user.userId, feedbackText.trim());
    setFeedbackSuccessMsg(`Your plan has been refined according to: "${feedbackText.trim()}".`);
    setFeedbackText('');
    setActiveVersion('current');
    setTimeout(() => setFeedbackSuccessMsg(null), 7000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white text-gray-900 space-y-8">
      {/* Plan Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {totalPlanDays}-Day Workout Schedule
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Goal: {user.fitnessGoal}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 font-heading mt-0.5">
            {plan.title || `${totalPlanDays}-Day Personalized Routine`}
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
            {plan.overview || plan.weeklySplit}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Routine</span>
          </button>
        </div>
      </div>

      {/* Plan Version Selector (if feedback update exists) */}
      {user.updatedPlan && (
        <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
          <span className="text-gray-600 font-medium">
            Plan revisions available:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveVersion('original')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeVersion === 'original'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Original Plan
            </button>
            <button
              onClick={() => setActiveVersion('current')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                activeVersion === 'current'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Feedback-Updated Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* User-Selected Days Workout Schedule View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Day Navigation Tabs */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block px-1 mb-2">
            Schedule ({totalPlanDays} Days)
          </span>

          <div className="space-y-1.5">
            {plan.days.map((day, idx) => {
              const isSelected = selectedDayIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs text-gray-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-heading ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                        DAY {day.dayNumber}
                      </span>
                      {day.isRestDay && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          Recovery
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {day.focus}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-emerald-700 translate-x-0.5' : 'text-gray-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Coach Advice */}
          {plan.tipsForSuccess && plan.tipsForSuccess.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <span className="font-bold text-gray-900 block">Training Tips:</span>
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                {plan.tipsForSuccess.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Selected Day Workout Details */}
        <div className="md:col-span-8 space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Day {currentDay.dayNumber} of {totalPlanDays}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 font-heading mt-0.5">
                  {currentDay.dayName}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Focus: <span className="font-semibold text-gray-900">{currentDay.focus}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-gray-600">
                <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{currentDay.durationMinutes} min</span>
                </span>
                {currentDay.estimatedCaloriesBurned ? (
                  <span className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1 text-rose-700">
                    <Flame className="w-3.5 h-3.5" />
                    <span>~{currentDay.estimatedCaloriesBurned} kcal</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Warm-Up */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-900 block mb-1 uppercase tracking-wide text-[10px]">
                Warm-Up (5–10 minutes)
              </span>
              <p className="text-amber-950 leading-relaxed">
                {currentDay.warmup}
              </p>
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Session Exercises ({currentDay.exercises.length})
              </span>

              {currentDay.exercises.map((exercise: Exercise, idx: number) => {
                const isChecked = !!completedExercises[`${currentDay.dayNumber}-${idx}`];
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-gray-50 border-gray-200 opacity-70'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExerciseCheck(currentDay.dayNumber, idx)}
                          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-gray-300 hover:border-emerald-600 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {exercise.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {exercise.targetMuscle}
                            </span>
                          </div>
                          {exercise.notes && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-gray-900 block">
                          {exercise.sets} sets × {exercise.reps}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Rest: {exercise.rest}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cool-Down */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
              <span className="font-bold text-blue-900 block mb-1 uppercase tracking-wide text-[10px]">
                Cool-Down & Mobility Stretch
              </span>
              <p className="text-blue-950 leading-relaxed">
                {currentDay.cooldown}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal-Aligned Nutrition Strategy Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Personalized Nutrition Guidance
            </span>
            <h3 className="text-base font-bold text-gray-900 font-heading">
              {user.nutritionTip.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed">
          {user.nutritionTip.coreAdvice}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protein Target</span>
            </span>
            <p className="text-gray-600">{user.nutritionTip.proteinRecommendation}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Hydration</span>
            </span>
            <p className="text-gray-600">{user.nutritionTip.hydrationTip}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Meal Timing</span>
            </span>
            <p className="text-gray-600">{user.nutritionTip.mealTiming}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sleep & Recovery</span>
            </span>
            <p className="text-gray-600">{user.nutritionTip.recoveryNote}</p>
          </div>
        </div>

        {user.nutritionTip.suggestedFoods && user.nutritionTip.suggestedFoods.length > 0 && (
          <div className="pt-1">
            <span className="text-xs font-semibold text-gray-700 block mb-2">
              Recommended Whole Foods:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.nutritionTip.suggestedFoods.map((food, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback & Plan Refinement Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Request Plan Modifications
          </span>
          <h3 className="text-base font-bold text-gray-900 font-heading mt-0.5">
            Adapt & Refine Your Routine
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Need adjustments to your schedule, exercise choices, or recovery balance? Submit your preferences below.
          </p>
        </div>

        {feedbackSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <div>
            <textarea
              rows={2}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Add more cardio intervals; reduce shoulder load on push days"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingFeedback || !feedbackText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-all"
            >
              {isUpdatingFeedback ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Routine...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback & Update Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* History of modifications */}
        {user.feedbackHistory && user.feedbackHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Previous Adjustments:
            </span>
            {user.feedbackHistory.map((h) => (
              <div key={h.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <span className="font-medium text-gray-900 block">"{h.feedbackText}"</span>
                <span className="text-emerald-700 text-[11px] block">{h.changesSummary}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
