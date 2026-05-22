import { prisma } from '../config/prisma.js';
import { publicUser } from '../utils/user.js';

export const getProfile = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

export const updateProfile = async (req, res) => {
  const allowed = [
    'name',
    'experienceLevel',
    'preferredUnits',
    'trainingDays',
    'goalFocus',
    'heightCm',
    'weightKg'
  ];

  const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data
  });

  res.json({ user: publicUser(user) });
};
