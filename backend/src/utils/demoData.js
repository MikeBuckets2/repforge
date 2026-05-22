import crypto from 'crypto';
import { hashPassword } from './password.js';

export const exerciseSeeds = [
  {
    name: 'Barbell Back Squat',
    category: 'STRENGTH',
    primaryMuscle: 'Quads',
    equipment: 'Barbell',
    instructions: 'Brace, sit between the hips, and drive up with a stable torso.'
  },
  {
    name: 'Bench Press',
    category: 'STRENGTH',
    primaryMuscle: 'Chest',
    equipment: 'Barbell',
    instructions: 'Pin the shoulders, control the descent, and press with leg drive.'
  },
  {
    name: 'Deadlift',
    category: 'STRENGTH',
    primaryMuscle: 'Posterior Chain',
    equipment: 'Barbell',
    instructions: 'Set the lats, push the floor away, and keep the bar close.'
  },
  {
    name: 'Overhead Press',
    category: 'STRENGTH',
    primaryMuscle: 'Shoulders',
    equipment: 'Barbell',
    instructions: 'Stack ribs over hips and finish with the biceps near the ears.'
  },
  {
    name: 'Pull-Up',
    category: 'STRENGTH',
    primaryMuscle: 'Back',
    equipment: 'Bodyweight',
    instructions: 'Start from a controlled hang and pull the chest toward the bar.'
  },
  {
    name: 'Romanian Deadlift',
    category: 'STRENGTH',
    primaryMuscle: 'Hamstrings',
    equipment: 'Barbell',
    instructions: 'Hinge at the hips and keep tension through the hamstrings.'
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'STRENGTH',
    primaryMuscle: 'Chest',
    equipment: 'Dumbbells',
    instructions: 'Press on a shallow incline with a controlled eccentric.'
  },
  {
    name: 'Seated Cable Row',
    category: 'STRENGTH',
    primaryMuscle: 'Back',
    equipment: 'Cable',
    instructions: 'Pull the elbows back without shrugging the shoulders.'
  },
  {
    name: 'Treadmill Run',
    category: 'CARDIO',
    primaryMuscle: 'Cardio',
    equipment: 'Treadmill',
    instructions: 'Keep cadence smooth and match pace to the day’s target.'
  },
  {
    name: 'Outdoor Run',
    category: 'CARDIO',
    primaryMuscle: 'Cardio',
    equipment: 'None',
    instructions: 'Use relaxed shoulders and controlled breathing.'
  },
  {
    name: 'Assault Bike',
    category: 'CARDIO',
    primaryMuscle: 'Cardio',
    equipment: 'Bike',
    instructions: 'Drive through both arms and legs while keeping posture tall.'
  },
  {
    name: 'Hip Mobility Flow',
    category: 'MOBILITY',
    primaryMuscle: 'Hips',
    equipment: 'Mat',
    instructions: 'Move slowly through end ranges without forcing positions.'
  }
];

export const ensureExerciseLibrary = async (prisma) => {
  const exercises = [];

  for (const exercise of exerciseSeeds) {
    const saved = await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
    exercises.push(saved);
  }

  return exercises;
};

const set = (setNumber, reps, weight, intensity = 'MODERATE') => ({
  setNumber,
  reps,
  weight,
  intensity,
  completed: true
});

export const createDemoTrainingData = async (prisma, userId) => {
  const exercises = await ensureExerciseLibrary(prisma);
  const byName = Object.fromEntries(exercises.map((exercise) => [exercise.name, exercise]));
  const today = new Date();
  const daysAgo = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return date;
  };

  await prisma.fitnessGoal.createMany({
    data: [
      {
        userId,
        title: 'Add 35 lb to squat',
        type: 'STRENGTH',
        targetValue: 315,
        currentValue: 285,
        unit: 'lb',
        deadline: daysAgo(-65),
        milestones: [{ label: 'Hit 295', complete: false }, { label: 'Hit 315', complete: false }]
      },
      {
        userId,
        title: 'Run a faster 5K',
        type: 'RUNNING_ENDURANCE',
        targetValue: 24,
        currentValue: 27,
        unit: 'minutes',
        deadline: daysAgo(-90),
        milestones: [{ label: 'Sub 26', complete: false }, { label: 'Sub 24', complete: false }]
      }
    ]
  });

  await prisma.workoutPlan.create({
    data: {
      userId,
      name: 'Strength Base Builder',
      description: 'Four focused days with heavy compounds, controlled accessories, and one conditioning slot.',
      goalType: 'STRENGTH',
      daysPerWeek: 4,
      active: true,
      exercises: {
        create: [
          {
            exerciseId: byName['Barbell Back Squat'].id,
            dayLabel: 'Monday',
            order: 1,
            targetSets: 5,
            targetReps: 5,
            targetWeight: 245
          },
          {
            exerciseId: byName['Bench Press'].id,
            dayLabel: 'Wednesday',
            order: 1,
            targetSets: 5,
            targetReps: 5,
            targetWeight: 185
          },
          {
            exerciseId: byName.Deadlift.id,
            dayLabel: 'Friday',
            order: 1,
            targetSets: 3,
            targetReps: 3,
            targetWeight: 315
          },
          {
            exerciseId: byName['Outdoor Run'].id,
            dayLabel: 'Saturday',
            order: 1,
            targetDistance: 3.1,
            targetDuration: 1680
          }
        ]
      }
    }
  });

  const sessions = [
    {
      title: 'Lower Strength',
      completedAt: daysAgo(1),
      durationMinutes: 72,
      perceivedExertion: 8,
      intensity: 'HARD',
      recoveryScore: 78,
      totalVolume: 9895,
      exercises: [
        {
          exerciseId: byName['Barbell Back Squat'].id,
          order: 1,
          sets: [set(1, 5, 225), set(2, 5, 245), set(3, 5, 255), set(4, 3, 265, 'HARD')]
        },
        {
          exerciseId: byName['Romanian Deadlift'].id,
          order: 2,
          sets: [set(1, 8, 185), set(2, 8, 195), set(3, 8, 205)]
        }
      ],
      note: 'Top set moved cleanly. Keep bracing cues for the next heavy day.'
    },
    {
      title: 'Upper Push',
      completedAt: daysAgo(3),
      durationMinutes: 61,
      perceivedExertion: 7,
      intensity: 'MODERATE',
      recoveryScore: 84,
      totalVolume: 8220,
      exercises: [
        {
          exerciseId: byName['Bench Press'].id,
          order: 1,
          sets: [set(1, 5, 165), set(2, 5, 175), set(3, 5, 185), set(4, 4, 190, 'HARD')]
        },
        {
          exerciseId: byName['Incline Dumbbell Press'].id,
          order: 2,
          sets: [set(1, 10, 55), set(2, 10, 60), set(3, 8, 65)]
        }
      ],
      note: 'Shoulders felt good after longer warmup.'
    },
    {
      title: 'Tempo Run',
      completedAt: daysAgo(5),
      durationMinutes: 34,
      perceivedExertion: 6,
      intensity: 'MODERATE',
      recoveryScore: 88,
      totalDistance: 3.4,
      exercises: [
        {
          exerciseId: byName['Outdoor Run'].id,
          order: 1,
          sets: [
            {
              setNumber: 1,
              distance: 3.4,
              durationSeconds: 1840,
              intensity: 'MODERATE',
              completed: true
            }
          ]
        }
      ],
      note: 'Held steady pace with room to close faster.'
    },
    {
      title: 'Pull Volume',
      completedAt: daysAgo(7),
      durationMinutes: 58,
      perceivedExertion: 7,
      intensity: 'MODERATE',
      recoveryScore: 81,
      totalVolume: 7160,
      exercises: [
        {
          exerciseId: byName['Pull-Up'].id,
          order: 1,
          sets: [set(1, 8, 0), set(2, 7, 0), set(3, 6, 0)]
        },
        {
          exerciseId: byName['Seated Cable Row'].id,
          order: 2,
          sets: [set(1, 12, 120), set(2, 12, 130), set(3, 10, 140)]
        }
      ],
      note: 'Lat engagement improved after cable warmup.'
    }
  ];

  for (const session of sessions) {
    const created = await prisma.workoutSession.create({
      data: {
        userId,
        title: session.title,
        status: 'COMPLETED',
        completedAt: session.completedAt,
        scheduledFor: session.completedAt,
        durationMinutes: session.durationMinutes,
        perceivedExertion: session.perceivedExertion,
        intensity: session.intensity,
        recoveryScore: session.recoveryScore,
        totalVolume: session.totalVolume || 0,
        totalDistance: session.totalDistance || 0,
        exercises: {
          create: session.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            sets: { create: exercise.sets }
          }))
        },
        notes: { create: { body: session.note } }
      }
    });

    const primaryExercise = session.exercises[0];
    const bestWeight = Math.max(...primaryExercise.sets.map((entry) => Number(entry.weight || 0)));
    if (bestWeight > 0) {
      await prisma.personalRecord.upsert({
        where: {
          userId_exerciseId_recordType: {
            userId,
            exerciseId: primaryExercise.exerciseId,
            recordType: 'BEST_WEIGHT'
          }
        },
        create: {
          userId,
          exerciseId: primaryExercise.exerciseId,
          recordType: 'BEST_WEIGHT',
          value: bestWeight,
          unit: 'lb',
          achievedAt: session.completedAt,
          sessionId: created.id
        },
        update: {
          value: bestWeight,
          achievedAt: session.completedAt,
          sessionId: created.id
        }
      });
    }
  }

  await prisma.progressMetric.createMany({
    data: [
      { userId, metricType: 'body_weight', value: 184, unit: 'lb', measuredAt: daysAgo(28) },
      { userId, metricType: 'body_weight', value: 182, unit: 'lb', measuredAt: daysAgo(21) },
      { userId, metricType: 'body_weight', value: 181, unit: 'lb', measuredAt: daysAgo(14) },
      { userId, metricType: 'body_weight', value: 180, unit: 'lb', measuredAt: daysAgo(7) },
      { userId, metricType: 'body_weight', value: 179, unit: 'lb', measuredAt: daysAgo(1) }
    ]
  });
};

export const createGuestUser = async (prisma) => {
  const suffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const user = await prisma.user.create({
    data: {
      email: `guest-${suffix}@repforge.demo`,
      name: 'Guest Athlete',
      passwordHash: await hashPassword(crypto.randomUUID()),
      isGuest: true,
      experienceLevel: 'INTERMEDIATE',
      preferredUnits: 'imperial',
      trainingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      goalFocus: 'STRENGTH',
      heightCm: 178,
      weightKg: 81
    }
  });

  await createDemoTrainingData(prisma, user.id);
  return user;
};
