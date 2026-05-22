import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { calculateSessionTotals, normalizeWorkoutExercises } from '../utils/workoutMath.js';
import { toDateOrNull } from '../utils/dates.js';

const workoutInclude = {
  exercises: {
    include: {
      exercise: true,
      sets: { orderBy: { setNumber: 'asc' } }
    },
    orderBy: { order: 'asc' }
  },
  notes: { orderBy: { createdAt: 'asc' } }
};

const findOwnedSession = async (id, userId) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id },
    include: workoutInclude
  });

  if (!session || session.userId !== userId) throw new ApiError(404, 'Workout session not found');
  return session;
};

const numberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const sessionPayload = (userId, body) => {
  const totals = calculateSessionTotals(body.exercises);
  const completedAt = toDateOrNull(body.completedAt);
  const scheduledFor = toDateOrNull(body.scheduledFor);

  return {
    userId,
    planId: body.planId || null,
    title: body.title,
    status: body.status || 'COMPLETED',
    scheduledFor: scheduledFor || completedAt || new Date(),
    completedAt: body.status === 'PLANNED' ? null : completedAt || new Date(),
    durationMinutes: numberOrNull(body.durationMinutes),
    perceivedExertion: numberOrNull(body.perceivedExertion),
    intensity: body.intensity || null,
    recoveryScore: numberOrNull(body.recoveryScore),
    bodyWeight: numberOrNull(body.bodyWeight),
    totalVolume: totals.totalVolume,
    totalDistance: totals.totalDistance,
    exercises: { create: normalizeWorkoutExercises(body.exercises) },
    notes: body.note ? { create: { body: body.note } } : undefined
  };
};

const updatePersonalRecords = async (userId, sessionId) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: workoutInclude
  });

  if (!session || session.status !== 'COMPLETED') return;

  const candidates = [];

  for (const item of session.exercises) {
    for (const set of item.sets) {
      if (set.completed === false) continue;

      if (set.weight && set.weight > 0) {
        candidates.push({
          exerciseId: item.exerciseId,
          recordType: 'BEST_WEIGHT',
          value: set.weight,
          unit: 'lb'
        });
      }

      if (set.weight && set.reps) {
        candidates.push({
          exerciseId: item.exerciseId,
          recordType: 'BEST_VOLUME_SET',
          value: set.weight * set.reps,
          unit: 'lb-reps'
        });
      }

      if (set.distance && set.distance > 0) {
        candidates.push({
          exerciseId: item.exerciseId,
          recordType: 'LONGEST_DISTANCE',
          value: set.distance,
          unit: 'mi'
        });
      }
    }
  }

  for (const candidate of candidates) {
    const existing = await prisma.personalRecord.findUnique({
      where: {
        userId_exerciseId_recordType: {
          userId,
          exerciseId: candidate.exerciseId,
          recordType: candidate.recordType
        }
      }
    });

    if (!existing || candidate.value > existing.value) {
      await prisma.personalRecord.upsert({
        where: {
          userId_exerciseId_recordType: {
            userId,
            exerciseId: candidate.exerciseId,
            recordType: candidate.recordType
          }
        },
        create: {
          userId,
          exerciseId: candidate.exerciseId,
          recordType: candidate.recordType,
          value: candidate.value,
          unit: candidate.unit,
          achievedAt: session.completedAt || new Date(),
          sessionId
        },
        update: {
          value: candidate.value,
          unit: candidate.unit,
          achievedAt: session.completedAt || new Date(),
          sessionId
        }
      });
    }
  }
};

export const listWorkouts = async (req, res) => {
  const take = Math.min(Number(req.query.limit || 25), 100);
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.user.id },
    include: workoutInclude,
    orderBy: [{ completedAt: 'desc' }, { scheduledFor: 'desc' }],
    take
  });

  res.json({ sessions });
};

export const getWorkout = async (req, res) => {
  const session = await findOwnedSession(req.params.id, req.user.id);
  res.json({ session });
};

export const createWorkout = async (req, res) => {
  const session = await prisma.workoutSession.create({
    data: sessionPayload(req.user.id, req.body),
    include: workoutInclude
  });

  await updatePersonalRecords(req.user.id, session.id);

  res.status(201).json({ session });
};

export const updateWorkout = async (req, res) => {
  await findOwnedSession(req.params.id, req.user.id);

  const session = await prisma.$transaction(async (tx) => {
    await tx.workoutExercise.deleteMany({ where: { sessionId: req.params.id } });
    await tx.workoutNote.deleteMany({ where: { sessionId: req.params.id } });

    return tx.workoutSession.update({
      where: { id: req.params.id },
      data: sessionPayload(req.user.id, req.body),
      include: workoutInclude
    });
  });

  await updatePersonalRecords(req.user.id, session.id);

  res.json({ session });
};

export const deleteWorkout = async (req, res) => {
  await findOwnedSession(req.params.id, req.user.id);
  await prisma.workoutSession.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

export const duplicateWorkout = async (req, res) => {
  const source = await findOwnedSession(req.params.id, req.user.id);

  const session = await prisma.workoutSession.create({
    data: {
      userId: req.user.id,
      planId: source.planId || null,
      title: `${source.title} Copy`,
      status: 'PLANNED',
      scheduledFor: new Date(),
      durationMinutes: source.durationMinutes,
      perceivedExertion: source.perceivedExertion,
      intensity: source.intensity,
      recoveryScore: null,
      totalVolume: source.totalVolume,
      totalDistance: source.totalDistance,
      exercises: {
        create: source.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          notes: exercise.notes,
          sets: {
            create: exercise.sets.map((set) => ({
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              distance: set.distance,
              durationSeconds: set.durationSeconds,
              intensity: set.intensity,
              completed: false
            }))
          }
        }))
      },
      notes: source.notes[0]?.body ? { create: { body: source.notes[0].body } } : undefined
    },
    include: workoutInclude
  });

  res.status(201).json({ session });
};
