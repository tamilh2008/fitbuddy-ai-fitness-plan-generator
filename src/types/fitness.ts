export interface AppUser {
  id?: string;
  name: string;
  email: string;
}

// Retain alias for backwards compatibility
export type GoogleUser = AppUser;

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  targetMuscle: string;
  notes?: string;
}

export interface DayWorkout {
  dayNumber: number;
  dayName: string;
  focus: string;
  isRestDay?: boolean;
  durationMinutes: number;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
  estimatedCaloriesBurned?: number;
}

export interface WorkoutPlan {
  title: string;
  totalDays: number;
  weeklySplit: string;
  overview: string;
  days: DayWorkout[];
  tipsForSuccess: string[];
}

export interface NutritionTip {
  title: string;
  coreAdvice: string;
  proteinRecommendation: string;
  hydrationTip: string;
  mealTiming: string;
  recoveryNote: string;
  suggestedFoods: string[];
}

export interface FeedbackRecord {
  id: string;
  timestamp: string;
  feedbackText: string;
  changesSummary: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  age: number | string;
  height: string;
  weight: string;
  gender?: string;
  fitnessGoal: string;
  fitnessLevel: string;
  planDays: number; // User selected duration: e.g. 2, 3, 4, 5, 6, 7
  workoutLocation: string;
  dietaryPreference: string;
  injuriesLimitations?: string;
  activityLevel?: string;
  sleepHours?: string;
  createdAt: string;
  updatedAt: string;
  originalPlan: WorkoutPlan;
  updatedPlan?: WorkoutPlan;
  nutritionTip: NutritionTip;
  feedbackHistory: FeedbackRecord[];
}

export interface UserOnboardingInput {
  fullName: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
  fitnessGoal: string;
  fitnessLevel: string;
  planDays: number; // e.g. 2, 3, 4, 5, 6, or 7
  workoutLocation: string;
  dietaryPreference: string;
  injuriesLimitations: string;
  activityLevel: string;
  sleepHours: string;
}
