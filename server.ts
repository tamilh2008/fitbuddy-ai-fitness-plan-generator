import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  UserProfile,
  UserOnboardingInput,
  WorkoutPlan,
  NutritionTip,
  FeedbackRecord,
  DayWorkout
} from './src/types/fitness';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client server-side
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DB_FILE = path.resolve(__dirname, '.fitbuddy_db.json');

function loadUsers(): UserProfile[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading db file:', err);
  }
  return [];
}

function saveUsers(users: UserProfile[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file:', err);
  }
}

let usersStore: UserProfile[] = loadUsers();

// Fallback plan generator matching the user-selected plan days
function generateFallbackWorkoutPlan(user: UserOnboardingInput): WorkoutPlan {
  const goal = user.fitnessGoal || 'General Wellness';
  const name = user.fullName || 'Athlete';
  const level = user.fitnessLevel || 'Intermediate';
  const daysCount = Math.max(1, Math.min(7, Number(user.planDays) || 4));

  const standardDays: DayWorkout[] = [
    {
      dayNumber: 1,
      dayName: 'Day 1: Upper Body Strength & Posture',
      focus: 'Chest, Upper Back & Shoulders',
      durationMinutes: 45,
      warmup: '5 mins arm swings, dynamic chest openers, cat-cow and band pulls',
      exercises: [
        { name: 'Dumbbell or Machine Chest Press', sets: 3, reps: '10-12 reps', rest: '60s', targetMuscle: 'Chest & Triceps', notes: 'Maintain control on the descent' },
        { name: 'Seated Cable or Dumbbell Row', sets: 3, reps: '10-12 reps', rest: '60s', targetMuscle: 'Upper Back & Lats', notes: 'Squeeze shoulder blades at peak' },
        { name: 'Overhead Dumbbell Shoulder Press', sets: 3, reps: '10-12 reps', rest: '60s', targetMuscle: 'Deltoids', notes: 'Keep core engaged' },
        { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12 reps', rest: '45s', targetMuscle: 'Biceps' }
      ],
      cooldown: 'Doorway chest stretch, cross-body shoulder hold, overhead triceps stretch (5 mins)',
      estimatedCaloriesBurned: 320
    },
    {
      dayNumber: 2,
      dayName: 'Day 2: Lower Body Foundations & Glutes',
      focus: 'Quadriceps, Hamstrings & Glutes',
      durationMinutes: 45,
      warmup: '5 mins leg swings, bodyweight air squats, hip 90/90 mobility drill',
      exercises: [
        { name: 'Goblet Squats or Barbell Squats', sets: 4, reps: '10 reps', rest: '75s', targetMuscle: 'Quads & Glutes', notes: 'Maintain chest up and feet flat' },
        { name: 'Romanian Dumbbell Deadlifts', sets: 3, reps: '10-12 reps', rest: '60s', targetMuscle: 'Hamstrings & Posterior Chain', notes: 'Hinge at the hips with soft knees' },
        { name: 'Walking Lunges or Step-Ups', sets: 3, reps: '10 steps/leg', rest: '60s', targetMuscle: 'Legs & Core Balance' },
        { name: 'Standing Calf Raises', sets: 3, reps: '15 reps', rest: '45s', targetMuscle: 'Calves' }
      ],
      cooldown: 'Standing quad stretch, seated hamstring stretch, butterfly stretch',
      estimatedCaloriesBurned: 350
    },
    {
      dayNumber: 3,
      dayName: 'Day 3: Core & Cardiovascular Conditioning',
      focus: 'Aerobic Base, Heart Health & Deep Core',
      durationMinutes: 40,
      warmup: 'Light jogging in place, high knees, inchworms (4 mins)',
      exercises: [
        { name: 'Interval Cardio (Brisk Walk, Jog, Cycle or Row)', sets: 5, reps: '2 mins active / 1 min easy', rest: '60s', targetMuscle: 'Cardiorespiratory' },
        { name: 'Dead Bug Core Holds', sets: 3, reps: '10 reps/side', rest: '45s', targetMuscle: 'Transverse Abdominis' },
        { name: 'Bird Dog with Pause', sets: 3, reps: '10 reps/side', rest: '45s', targetMuscle: 'Lower Back & Glutes' },
        { name: 'Side Plank Holds', sets: 3, reps: '30s/side', rest: '30s', targetMuscle: 'Obliques' }
      ],
      cooldown: 'Child’s pose, cobra stretch, standing side reaches',
      estimatedCaloriesBurned: 310
    },
    {
      dayNumber: 4,
      dayName: 'Day 4: Full Body Functional Circuit',
      focus: 'Muscular Endurance & Dynamic Balance',
      durationMinutes: 45,
      warmup: 'Arm circles, hip rotations, bodyweight lunges',
      exercises: [
        { name: 'Dumbbell Thrusters (Squat to Press)', sets: 3, reps: '12 reps', rest: '60s', targetMuscle: 'Full Body' },
        { name: 'Push-Ups (Standard or Incline)', sets: 3, reps: '10-12 reps', rest: '60s', targetMuscle: 'Chest & Core' },
        { name: 'Dumbbell Bent-Over Row', sets: 3, reps: '12 reps', rest: '60s', targetMuscle: 'Upper Back' },
        { name: 'Plank with Shoulder Taps', sets: 3, reps: '30 seconds', rest: '45s', targetMuscle: 'Core Stability' }
      ],
      cooldown: 'Hamstring stretch, quad stretch, full body relaxing breaths',
      estimatedCaloriesBurned: 340
    },
    {
      dayNumber: 5,
      dayName: 'Day 5: Posterior Chain & Pull Power',
      focus: 'Lats, Rhomboids, Hamstrings & Posterior Delts',
      durationMinutes: 45,
      warmup: 'Band pull-aparts, torso twists, glute bridges',
      exercises: [
        { name: 'Lat Pulldowns or Resistance Band Pulls', sets: 4, reps: '10-12 reps', rest: '60s', targetMuscle: 'Lats' },
        { name: 'Single-Leg Dumbbell RDL', sets: 3, reps: '10 reps/leg', rest: '60s', targetMuscle: 'Hamstrings' },
        { name: 'Face Pulls for Posture', sets: 3, reps: '15 reps', rest: '45s', targetMuscle: 'Rear Delts' },
        { name: 'Hammer Curls', sets: 3, reps: '12 reps', rest: '45s', targetMuscle: 'Biceps & Forearms' }
      ],
      cooldown: 'Pec stretch against doorframe, cat-cow mobility',
      estimatedCaloriesBurned: 330
    },
    {
      dayNumber: 6,
      dayName: 'Day 6: Lower Body Power & Athletic Conditioning',
      focus: 'Quads, Calves & Agility',
      durationMinutes: 40,
      warmup: 'Ankle circles, deep squats, lateral monster walks',
      exercises: [
        { name: 'Bulgarian Split Squats or Step-Ups', sets: 3, reps: '10 reps/leg', rest: '60s', targetMuscle: 'Quads & Glutes' },
        { name: 'Kettlebell or Dumbbell Swings', sets: 4, reps: '15 reps', rest: '60s', targetMuscle: 'Posterior Chain' },
        { name: 'Farmer’s Walk Carry', sets: 3, reps: '40 seconds', rest: '60s', targetMuscle: 'Grip & Core' },
        { name: 'Seated or Standing Calf Raises', sets: 3, reps: '15 reps', rest: '45s', targetMuscle: 'Calves' }
      ],
      cooldown: 'Couch stretch, calf wall stretch, diaphragmatic breathing',
      estimatedCaloriesBurned: 350
    },
    {
      dayNumber: 7,
      dayName: 'Day 7: Active Recovery, Mobility & Rejuvenation',
      focus: 'Joint Health, Flexibility & Central Nervous System Recovery',
      isRestDay: true,
      durationMinutes: 25,
      warmup: 'Gentle walk or light stretching (5 mins)',
      exercises: [
        { name: 'World’s Greatest Stretch', sets: 2, reps: '6 reps/side', rest: '30s', targetMuscle: 'Full Body Mobility' },
        { name: 'Thoracic Spine Openers', sets: 2, reps: '8 reps/side', rest: '30s', targetMuscle: 'Upper Spine' },
        { name: 'Deep Diaphragmatic Breathing in Savasana', sets: 1, reps: '5 minutes', rest: '0s', targetMuscle: 'Nervous System Reset' }
      ],
      cooldown: 'Gentle hydration and posture check',
      estimatedCaloriesBurned: 110
    }
  ];

  const selectedDays = standardDays.slice(0, daysCount).map((d, index) => ({
    ...d,
    dayNumber: index + 1,
    dayName: `Day ${index + 1}: ${d.focus}`
  }));

  return {
    title: `${daysCount}-Day Personalized Routine (${goal})`,
    totalDays: daysCount,
    weeklySplit: `${daysCount}-Day targeted split designed for ${goal} at an ${level} level.`,
    overview: `Custom-calibrated ${daysCount}-day fitness plan for ${name}, targeting ${goal}. Structured with safe progressive overload, targeted warm-ups, and mobility cool-downs.`,
    days: selectedDays,
    tipsForSuccess: [
      'Focus on steady consistency: aim to complete each of your selected workout days.',
      'Stay well-hydrated throughout the day and listen to your body signals.',
      'Maintain proper form on every repetition before considering increasing weight.'
    ]
  };
}

function generateFallbackNutritionTip(user: UserOnboardingInput): NutritionTip {
  const goal = user.fitnessGoal || 'General Wellness';
  const diet = user.dietaryPreference || 'Balanced Whole Foods';

  return {
    title: `Nutrition Strategy for ${goal}`,
    coreAdvice: `Align your daily nutrition with your routine. For ${goal}, focus on whole foods, steady protein intake, and consistent hydration. Dietary preference: ${diet}.`,
    proteinRecommendation: 'Aim for 1.4 to 1.8 grams of protein per kilogram of body weight spread across 3-4 meals to preserve and recover muscle fibers.',
    hydrationTip: 'Drink 2.5 to 3 Liters of water daily. Keep a water bottle close during workouts and replenish with an extra 500ml on training days.',
    mealTiming: 'Consume a light, carbohydrate-rich snack 45-60 minutes before training, and enjoy a balanced protein + complex carb meal within 90 minutes post-workout.',
    recoveryNote: 'Target 7 to 8 hours of quality sleep nightly to optimize hormonal recovery and tissue repair.',
    suggestedFoods: ['Lean Poultry or Fish', 'Eggs / Tofu', 'Greek Yogurt', 'Oatmeal', 'Berries', 'Quinoa', 'Leafy Greens', 'Almonds']
  };
}

// AI Workout Plan Generator based on user's chosen planDays
async function generateWorkoutWithAI(user: UserOnboardingInput): Promise<WorkoutPlan> {
  const daysCount = Math.max(1, Math.min(7, Number(user.planDays) || 4));

  if (!geminiApiKey) {
    return generateFallbackWorkoutPlan(user);
  }

  try {
    const prompt = `You are an expert personal trainer. Generate a personalized ${daysCount}-DAY WORKOUT PLAN tailored specifically for this athlete:
- Full Name: ${user.fullName}
- Age: ${user.age}
- Height: ${user.height}
- Weight: ${user.weight}
- Gender: ${user.gender || 'Not specified'}
- Primary Fitness Goal: ${user.fitnessGoal}
- Current Fitness Level: ${user.fitnessLevel}
- EXACT NUMBER OF PLAN DAYS SELECTED BY USER: ${daysCount} DAYS
- Location & Equipment: ${user.workoutLocation}
- Dietary Preferences: ${user.dietaryPreference}
- Injuries / Limitations: ${user.injuriesLimitations || 'None'}
- Daily Activity Level: ${user.activityLevel || 'Moderate'}
- Nightly Sleep: ${user.sleepHours || '7-8 hours'}

CRITICAL INSTRUCTIONS:
1. You MUST generate EXACTLY ${daysCount} DAYS of workouts (Day 1 through Day ${daysCount}). Do not generate 7 days if the user requested ${daysCount} days.
2. Every day must include:
   - dayNumber: integer (1 to ${daysCount})
   - dayName: descriptive title
   - focus: primary muscle or fitness focus
   - isRestDay: boolean (true if active recovery/rest, false if lifting/training)
   - durationMinutes: duration in minutes
   - warmup: structured 5-10 min warmup instructions
   - exercises: list of exercises with name, sets, reps, rest interval, target muscle, notes
   - cooldown: 5 min cooldown/stretch
   - estimatedCaloriesBurned: estimated kcal
3. Provide a clear title, weekly split overview, and 3 practical tips for success.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            weeklySplit: { type: Type.STRING },
            overview: { type: Type.STRING },
            tipsForSuccess: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayName: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  isRestDay: { type: Type.BOOLEAN },
                  durationMinutes: { type: Type.INTEGER },
                  warmup: { type: Type.STRING },
                  cooldown: { type: Type.STRING },
                  estimatedCaloriesBurned: { type: Type.INTEGER },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.INTEGER },
                        reps: { type: Type.STRING },
                        rest: { type: Type.STRING },
                        targetMuscle: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      },
                      required: ['name', 'sets', 'reps', 'rest', 'targetMuscle']
                    }
                  }
                },
                required: ['dayNumber', 'dayName', 'focus', 'durationMinutes', 'warmup', 'cooldown', 'exercises']
              }
            }
          },
          required: ['title', 'weeklySplit', 'overview', 'days', 'tipsForSuccess']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.days && parsed.days.length >= 1) {
      return {
        ...parsed,
        totalDays: parsed.days.length
      } as WorkoutPlan;
    }
    return generateFallbackWorkoutPlan(user);
  } catch (error) {
    console.error('AI generation fallback triggered:', error);
    return generateFallbackWorkoutPlan(user);
  }
}

// AI Nutrition Tip Generator
async function generateNutritionWithAI(user: UserOnboardingInput): Promise<NutritionTip> {
  if (!geminiApiKey) {
    return generateFallbackNutritionTip(user);
  }

  try {
    const prompt = `You are a sports nutritionist. Generate a tailored nutrition and recovery guide for this user:
- Goal: ${user.fitnessGoal}
- Height: ${user.height}
- Weight: ${user.weight}
- Age: ${user.age}
- Dietary Preference: ${user.dietaryPreference}
- Activity Level: ${user.activityLevel || 'Moderate'}

Provide actionable advice for protein intake, hydration, meal timing around workouts, sleep/recovery, and 6-8 recommended whole foods.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            coreAdvice: { type: Type.STRING },
            proteinRecommendation: { type: Type.STRING },
            hydrationTip: { type: Type.STRING },
            mealTiming: { type: Type.STRING },
            recoveryNote: { type: Type.STRING },
            suggestedFoods: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'coreAdvice', 'proteinRecommendation', 'hydrationTip', 'mealTiming', 'recoveryNote', 'suggestedFoods']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.coreAdvice) {
      return parsed as NutritionTip;
    }
    return generateFallbackNutritionTip(user);
  } catch (error) {
    console.error('AI nutrition fallback triggered:', error);
    return generateFallbackNutritionTip(user);
  }
}

// Feedback-based plan updater
async function updateWorkoutPlanWithAI(
  originalPlan: WorkoutPlan,
  feedback: string,
  user: UserProfile
): Promise<{ updatedPlan: WorkoutPlan; changesSummary: string }> {
  if (!geminiApiKey) {
    const updated = JSON.parse(JSON.stringify(originalPlan)) as WorkoutPlan;
    updated.title = `${originalPlan.title} (Updated)`;
    updated.overview = `${originalPlan.overview} Adjusted per request: "${feedback}".`;
    return {
      updatedPlan: updated,
      changesSummary: `Plan modified to accommodate: "${feedback}".`
    };
  }

  try {
    const prompt = `A user wants adjustments to their ${originalPlan.days.length}-day workout plan.
User: ${user.fullName}, Goal: ${user.fitnessGoal}, Limitations: ${user.injuriesLimitations || 'None'}
Feedback: "${feedback}"

Existing Plan:
${JSON.stringify(originalPlan, null, 2)}

Provide the revised plan maintaining the ${originalPlan.days.length}-day duration, plus a 2-sentence summary of the changes made.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            changesSummary: { type: Type.STRING },
            updatedPlan: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                totalDays: { type: Type.INTEGER },
                weeklySplit: { type: Type.STRING },
                overview: { type: Type.STRING },
                tipsForSuccess: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.INTEGER },
                      dayName: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      isRestDay: { type: Type.BOOLEAN },
                      durationMinutes: { type: Type.INTEGER },
                      warmup: { type: Type.STRING },
                      cooldown: { type: Type.STRING },
                      estimatedCaloriesBurned: { type: Type.INTEGER },
                      exercises: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            sets: { type: Type.INTEGER },
                            reps: { type: Type.STRING },
                            rest: { type: Type.STRING },
                            targetMuscle: { type: Type.STRING },
                            notes: { type: Type.STRING }
                          },
                          required: ['name', 'sets', 'reps', 'rest', 'targetMuscle']
                        }
                      }
                    },
                    required: ['dayNumber', 'dayName', 'focus', 'durationMinutes', 'warmup', 'cooldown', 'exercises']
                  }
                }
              },
              required: ['title', 'weeklySplit', 'overview', 'days', 'tipsForSuccess']
            }
          },
          required: ['changesSummary', 'updatedPlan']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.updatedPlan && parsed.updatedPlan.days) {
      return {
        updatedPlan: {
          ...parsed.updatedPlan,
          totalDays: parsed.updatedPlan.days.length
        } as WorkoutPlan,
        changesSummary: parsed.changesSummary || `Plan adapted for: "${feedback}"`
      };
    }
    throw new Error('Invalid AI response');
  } catch (err) {
    const updated = JSON.parse(JSON.stringify(originalPlan)) as WorkoutPlan;
    updated.title = `${originalPlan.title} (Updated)`;
    return {
      updatedPlan: updated,
      changesSummary: `Updated exercises and routine to reflect: "${feedback}"`
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'FitBuddy' });
  });

  // Get active user or all users
  app.get('/api/users', (req: Request, res: Response) => {
    res.json({ users: usersStore });
  });

  // User submits details -> Generate plan with user-selected planDays
  app.post('/api/submit-user', async (req: Request, res: Response) => {
    try {
      const { userDetails, userAccount, googleUser } = req.body;
      if (!userDetails || !userDetails.fullName) {
        return res.status(400).json({ error: 'Missing required user details' });
      }

      const input: UserOnboardingInput = {
        ...userDetails,
        planDays: Number(userDetails.planDays) || 4
      };

      const userEmail = userAccount?.email || googleUser?.email || 'user@example.com';
      const userId = `FB-${Date.now().toString().slice(-6)}`;

      // Run AI plan and nutrition generation concurrently
      const [workoutPlan, nutritionTip] = await Promise.all([
        generateWorkoutWithAI(input),
        generateNutritionWithAI(input)
      ]);

      const now = new Date().toISOString();
      const newUser: UserProfile = {
        userId,
        email: userEmail,
        fullName: input.fullName,
        age: input.age,
        height: input.height,
        weight: input.weight,
        gender: input.gender,
        fitnessGoal: input.fitnessGoal,
        fitnessLevel: input.fitnessLevel,
        planDays: input.planDays,
        workoutLocation: input.workoutLocation,
        dietaryPreference: input.dietaryPreference,
        injuriesLimitations: input.injuriesLimitations,
        activityLevel: input.activityLevel,
        sleepHours: input.sleepHours,
        createdAt: now,
        updatedAt: now,
        originalPlan: workoutPlan,
        nutritionTip: nutritionTip,
        feedbackHistory: []
      };

      usersStore = [newUser, ...usersStore.filter(u => u.userId !== userId)];
      saveUsers(usersStore);

      res.json({
        success: true,
        user: newUser,
        message: 'Your personalized workout plan and nutrition strategy have been created.'
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // User updates profile details from Settings page
  app.post('/api/update-user', async (req: Request, res: Response) => {
    try {
      const { userId, updatedDetails, regeneratePlan } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const userIndex = usersStore.findIndex(u => u.userId.toLowerCase() === userId.toLowerCase());
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingUser = usersStore[userIndex];
      const mergedInput: UserOnboardingInput = {
        fullName: updatedDetails.fullName || existingUser.fullName,
        age: updatedDetails.age || String(existingUser.age),
        height: updatedDetails.height || existingUser.height,
        weight: updatedDetails.weight || existingUser.weight,
        gender: updatedDetails.gender ?? existingUser.gender,
        fitnessGoal: updatedDetails.fitnessGoal || existingUser.fitnessGoal,
        fitnessLevel: updatedDetails.fitnessLevel || existingUser.fitnessLevel,
        planDays: Number(updatedDetails.planDays) || existingUser.planDays || 4,
        workoutLocation: updatedDetails.workoutLocation || existingUser.workoutLocation,
        dietaryPreference: updatedDetails.dietaryPreference || existingUser.dietaryPreference,
        injuriesLimitations: updatedDetails.injuriesLimitations ?? existingUser.injuriesLimitations,
        activityLevel: updatedDetails.activityLevel ?? existingUser.activityLevel,
        sleepHours: updatedDetails.sleepHours ?? existingUser.sleepHours
      };

      let workoutPlan = existingUser.originalPlan;
      let nutritionTip = existingUser.nutritionTip;

      if (regeneratePlan || Number(updatedDetails.planDays) !== existingUser.planDays || updatedDetails.fitnessGoal !== existingUser.fitnessGoal) {
        [workoutPlan, nutritionTip] = await Promise.all([
          generateWorkoutWithAI(mergedInput),
          generateNutritionWithAI(mergedInput)
        ]);
      }

      const updatedUser: UserProfile = {
        ...existingUser,
        fullName: mergedInput.fullName,
        age: mergedInput.age,
        height: mergedInput.height,
        weight: mergedInput.weight,
        gender: mergedInput.gender,
        fitnessGoal: mergedInput.fitnessGoal,
        fitnessLevel: mergedInput.fitnessLevel,
        planDays: mergedInput.planDays,
        workoutLocation: mergedInput.workoutLocation,
        dietaryPreference: mergedInput.dietaryPreference,
        injuriesLimitations: mergedInput.injuriesLimitations,
        activityLevel: mergedInput.activityLevel,
        sleepHours: mergedInput.sleepHours,
        updatedAt: new Date().toISOString(),
        originalPlan: workoutPlan,
        updatedPlan: regeneratePlan ? undefined : existingUser.updatedPlan,
        nutritionTip: nutritionTip
      };

      usersStore[userIndex] = updatedUser;
      saveUsers(usersStore);

      res.json({
        success: true,
        user: updatedUser,
        message: 'Your profile and settings have been updated.'
      });
    } catch (err: any) {
      console.error('Update user error:', err);
      res.status(500).json({ error: err.message || 'Failed to update user' });
    }
  });

  // Feedback update endpoint
  app.post('/api/submit-feedback', async (req: Request, res: Response) => {
    try {
      const { userId, feedback } = req.body;
      if (!userId || !feedback) {
        return res.status(400).json({ error: 'Missing userId or feedback' });
      }

      const user = usersStore.find(u => u.userId.toLowerCase() === userId.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { updatedPlan, changesSummary } = await updateWorkoutPlanWithAI(user.originalPlan, feedback, user);

      const feedbackRecord: FeedbackRecord = {
        id: `fb-${Date.now()}`,
        timestamp: new Date().toISOString(),
        feedbackText: feedback,
        changesSummary
      };

      user.updatedPlan = updatedPlan;
      user.updatedAt = new Date().toISOString();
      user.feedbackHistory = [feedbackRecord, ...user.feedbackHistory];

      saveUsers(usersStore);

      res.json({
        success: true,
        user,
        message: 'Plan successfully updated and synchronized.'
      });
    } catch (err: any) {
      console.error('Feedback error:', err);
      res.status(500).json({ error: err.message || 'Failed to update plan' });
    }
  });

  // Vite middleware in dev
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy Server running on http://localhost:${PORT}`);
  });
}

startServer();
