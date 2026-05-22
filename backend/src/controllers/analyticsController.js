import { prisma } from '../config/prisma.js';
import { addDays, daysBetween, startOfDay, startOfWeek } from '../utils/dates.js';

const lastNDays = (days) => {
  const dates = [];
  const today = startOfDay(new Date());
  for (let index = days - 1; index >= 0; index -= 1) {
    dates.push(addDays(today, -index));
  }
  return dates;
};

const isoDay = (date) => startOfDay(date).toISOString().slice(0, 10);

const calculateStreak = (sessions) => {
  const completedDays = new Set(sessions.filter((session) => session.completedAt).map((session) => isoDay(session.completedAt)));
  let cursor = startOfDay(new Date());
  let streak = 0;

  if (!completedDays.has(isoDay(cursor))) {
    cursor = addDays(cursor, -1);
  }

  while (completedDays.has(isoDay(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

const buildSuggestions = (user, recentSessions) => {
  const suggestions = [];
  const lastSession = recentSessions[0];
  const daysSinceLast = lastSession?.completedAt ? daysBetween(lastSession.completedAt, new Date()) : null;
  const hardSessions = recentSessions.filter((session) => session.intensity === 'HARD' || session.intensity === 'MAX').length;

  if (daysSinceLast === null || daysSinceLast >= 3) {
    suggestions.push({
      title: 'Restart with a clean full-body session',
      detail: 'Use two compound lifts, one accessory superset, and a short zone-two finish.',
      tag: 'Consistency'
    });
  }

  if (hardSessions >= 2) {
    suggestions.push({
      title: 'Place a recovery-focused day next',
      detail: 'Keep effort easy and log mobility, walking, or light aerobic work.',
      tag: 'Recovery'
    });
  }

  if (user.goalFocus === 'STRENGTH') {
    suggestions.push({
      title: 'Progress the first main lift by 5 lb',
      detail: 'Recent volume is stable. Add a small load jump while preserving reps.',
      tag: 'Strength'
    });
  }

  if (user.goalFocus === 'RUNNING_ENDURANCE') {
    suggestions.push({
      title: 'Add one controlled interval block',
      detail: 'Try 4 x 3 minutes at tempo effort with full easy recoveries.',
      tag: 'Run'
    });
  }

  return suggestions.slice(0, 3);
};

const buildBadges = (records, sessions, streak) => {
  const badges = [];
  const bestLift = records.find((record) => record.recordType === 'BEST_WEIGHT');
  const bestRun = records.find((record) => record.recordType === 'LONGEST_DISTANCE');

  if (bestLift) {
    badges.push({
      label: 'Best lift',
      value: `${bestLift.value} ${bestLift.unit}`,
      detail: bestLift.exercise.name
    });
  }

  if (bestRun) {
    badges.push({
      label: 'Best run',
      value: `${bestRun.value} ${bestRun.unit}`,
      detail: bestRun.exercise.name
    });
  }

  if (streak >= 2 || sessions.length >= 3) {
    badges.push({
      label: 'Consistency',
      value: `${Math.max(streak, sessions.length)} check-ins`,
      detail: 'Training rhythm is active'
    });
  }

  return badges;
};

const buildWeeklyChart = (sessions) => {
  const weeks = [];
  const currentWeek = startOfWeek(new Date());

  for (let index = 7; index >= 0; index -= 1) {
    const weekStart = addDays(currentWeek, -index * 7);
    const weekEnd = addDays(weekStart, 7);
    const weekSessions = sessions.filter((session) => {
      const date = session.completedAt || session.scheduledFor;
      return date >= weekStart && date < weekEnd;
    });

    weeks.push({
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: weekSessions.length,
      volume: Math.round(weekSessions.reduce((total, session) => total + Number(session.totalVolume || 0), 0)),
      distance: Number(weekSessions.reduce((total, session) => total + Number(session.totalDistance || 0), 0).toFixed(1))
    });
  }

  return weeks;
};

export const getSummary = async (req, res) => {
  const since = addDays(new Date(), -70);
  const weekStart = startOfWeek(new Date());

  const [sessions, goals, records, activePlan] = await Promise.all([
    prisma.workoutSession.findMany({
      where: {
        userId: req.user.id,
        OR: [{ completedAt: { gte: since } }, { scheduledFor: { gte: since } }]
      },
      include: {
        exercises: { include: { exercise: true, sets: true } },
        notes: true
      },
      orderBy: [{ completedAt: 'desc' }, { scheduledFor: 'desc' }]
    }),
    prisma.fitnessGoal.findMany({
      where: { userId: req.user.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    }),
    prisma.personalRecord.findMany({
      where: { userId: req.user.id },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
      take: 8
    }),
    prisma.workoutPlan.findFirst({
      where: { userId: req.user.id, active: true },
      include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  const completedSessions = sessions.filter((session) => session.status === 'COMPLETED');
  const weekSessions = completedSessions.filter((session) => session.completedAt && session.completedAt >= weekStart);
  const completedWeekDays = new Set(weekSessions.map((session) => isoDay(session.completedAt))).size;
  const targetTrainingDays = Math.max(req.user.trainingDays.length || 4, 1);
  const streak = calculateStreak(completedSessions);
  const chart = buildWeeklyChart(completedSessions);
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayExercises = activePlan?.exercises.filter((exercise) => exercise.dayLabel === todayName);

  res.json({
    summary: {
      totalSessions: completedSessions.length,
      weeklySessions: weekSessions.length,
      streak,
      weeklyConsistency: Math.min(Math.round((completedWeekDays / targetTrainingDays) * 100), 100),
      totalVolume: Math.round(completedSessions.reduce((total, session) => total + Number(session.totalVolume || 0), 0)),
      totalDistance: Number(completedSessions.reduce((total, session) => total + Number(session.totalDistance || 0), 0).toFixed(1)),
      goalCompletion: goals.length
        ? Math.round((goals.filter((goal) => goal.status === 'COMPLETED').length / goals.length) * 100)
        : 0
    },
    weeklySummary: {
      headline:
        weekSessions.length >= targetTrainingDays
          ? 'You are on pace with this week’s training target.'
          : 'There is still room to bank another quality session this week.',
      sessions: weekSessions.length,
      volume: Math.round(weekSessions.reduce((total, session) => total + Number(session.totalVolume || 0), 0)),
      distance: Number(weekSessions.reduce((total, session) => total + Number(session.totalDistance || 0), 0).toFixed(1))
    },
    chart,
    goals,
    recentSessions: sessions.slice(0, 5),
    records,
    badges: buildBadges(records, weekSessions, streak),
    suggestions: buildSuggestions(req.user, completedSessions.slice(0, 5)),
    todaysWorkout: activePlan
      ? {
          planName: activePlan.name,
          dayLabel: todayName,
          exercises: todayExercises?.length ? todayExercises : activePlan.exercises.slice(0, 3)
        }
      : null
  });
};

export const getProgress = async (req, res) => {
  const metrics = await prisma.progressMetric.findMany({
    where: { userId: req.user.id },
    orderBy: { measuredAt: 'asc' }
  });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'asc' }
  });

  res.json({
    metrics,
    chart: buildWeeklyChart(sessions),
    calendar: lastNDays(35).map((date) => ({
      date: isoDay(date),
      sessions: sessions.filter((session) => session.completedAt && isoDay(session.completedAt) === isoDay(date)).length
    }))
  });
};

export const getRecords = async (req, res) => {
  const records = await prisma.personalRecord.findMany({
    where: { userId: req.user.id },
    include: { exercise: true },
    orderBy: [{ achievedAt: 'desc' }]
  });

  res.json({ records });
};
