import { prisma } from '../config/prisma.js';
import { ensureExerciseLibrary } from '../utils/demoData.js';

export const listExercises = async (req, res) => {
  await ensureExerciseLibrary(prisma);

  const { search = '', category, muscle, equipment } = req.query;
  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { primaryMuscle: { contains: search, mode: 'insensitive' } },
        { equipment: { contains: search, mode: 'insensitive' } }
      ]
    });
  }

  if (category) filters.push({ category });
  if (muscle) filters.push({ primaryMuscle: { contains: muscle, mode: 'insensitive' } });
  if (equipment) filters.push({ equipment: { contains: equipment, mode: 'insensitive' } });

  const exercises = await prisma.exercise.findMany({
    where: filters.length ? { AND: filters } : undefined,
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  });

  res.json({ exercises });
};

export const createExercise = async (req, res) => {
  const exercise = await prisma.exercise.create({
    data: req.body
  });

  res.status(201).json({ exercise });
};
