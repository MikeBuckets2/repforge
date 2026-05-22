import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

const planInclude = {
  exercises: {
    include: { exercise: true },
    orderBy: [{ dayLabel: 'asc' }, { order: 'asc' }]
  }
};

const findOwnedPlan = async (id, userId) => {
  const plan = await prisma.workoutPlan.findUnique({ where: { id } });
  if (!plan || plan.userId !== userId) throw new ApiError(404, 'Workout plan not found');
  return plan;
};

const normalizeExercises = (exercises = []) =>
  exercises.map((exercise, index) => ({
    exerciseId: exercise.exerciseId,
    dayLabel: exercise.dayLabel,
    order: Number(exercise.order || index + 1),
    targetSets: exercise.targetSets === undefined || exercise.targetSets === '' ? null : Number(exercise.targetSets),
    targetReps: exercise.targetReps === undefined || exercise.targetReps === '' ? null : Number(exercise.targetReps),
    targetWeight:
      exercise.targetWeight === undefined || exercise.targetWeight === '' ? null : Number(exercise.targetWeight),
    targetDistance:
      exercise.targetDistance === undefined || exercise.targetDistance === ''
        ? null
        : Number(exercise.targetDistance),
    targetDuration:
      exercise.targetDuration === undefined || exercise.targetDuration === ''
        ? null
        : Number(exercise.targetDuration)
  }));

export const listPlans = async (req, res) => {
  const plans = await prisma.workoutPlan.findMany({
    where: { userId: req.user.id },
    include: planInclude,
    orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }]
  });

  res.json({ plans });
};

export const createPlan = async (req, res) => {
  const plan = await prisma.workoutPlan.create({
    data: {
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description || null,
      goalType: req.body.goalType,
      daysPerWeek: Number(req.body.daysPerWeek),
      active: req.body.active !== false,
      exercises: { create: normalizeExercises(req.body.exercises) }
    },
    include: planInclude
  });

  res.status(201).json({ plan });
};

export const updatePlan = async (req, res) => {
  await findOwnedPlan(req.params.id, req.user.id);

  const plan = await prisma.$transaction(async (tx) => {
    await tx.planExercise.deleteMany({ where: { planId: req.params.id } });

    return tx.workoutPlan.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description || null,
        goalType: req.body.goalType,
        daysPerWeek: Number(req.body.daysPerWeek),
        active: req.body.active !== false,
        exercises: { create: normalizeExercises(req.body.exercises) }
      },
      include: planInclude
    });
  });

  res.json({ plan });
};

export const deletePlan = async (req, res) => {
  await findOwnedPlan(req.params.id, req.user.id);
  await prisma.workoutPlan.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
