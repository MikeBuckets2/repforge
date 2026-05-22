import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { toDateOrNull } from '../utils/dates.js';

const goalSelect = {
  id: true,
  title: true,
  type: true,
  targetValue: true,
  currentValue: true,
  unit: true,
  deadline: true,
  status: true,
  milestones: true,
  createdAt: true,
  updatedAt: true
};

const numberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const findOwnedGoal = async (id, userId) => {
  const goal = await prisma.fitnessGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== userId) throw new ApiError(404, 'Goal not found');
  return goal;
};

export const listGoals = async (req, res) => {
  const goals = await prisma.fitnessGoal.findMany({
    where: { userId: req.user.id },
    select: goalSelect,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  });

  res.json({ goals });
};

export const createGoal = async (req, res) => {
  const goal = await prisma.fitnessGoal.create({
    data: {
      userId: req.user.id,
      title: req.body.title,
      type: req.body.type,
      targetValue: numberOrNull(req.body.targetValue),
      currentValue: numberOrNull(req.body.currentValue) || 0,
      unit: req.body.unit || null,
      deadline: toDateOrNull(req.body.deadline),
      milestones: req.body.milestones || null
    },
    select: goalSelect
  });

  res.status(201).json({ goal });
};

export const updateGoal = async (req, res) => {
  await findOwnedGoal(req.params.id, req.user.id);

  const data = {
    ...req.body,
    targetValue: req.body.targetValue === undefined ? undefined : numberOrNull(req.body.targetValue),
    currentValue: req.body.currentValue === undefined ? undefined : numberOrNull(req.body.currentValue),
    deadline: req.body.deadline === undefined ? undefined : toDateOrNull(req.body.deadline)
  };

  const goal = await prisma.fitnessGoal.update({
    where: { id: req.params.id },
    data,
    select: goalSelect
  });

  res.json({ goal });
};

export const deleteGoal = async (req, res) => {
  await findOwnedGoal(req.params.id, req.user.id);
  await prisma.fitnessGoal.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
