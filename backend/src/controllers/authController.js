import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signAuthToken } from '../utils/tokens.js';
import { publicUser } from '../utils/user.js';
import { createGuestUser } from '../utils/demoData.js';

export const signup = async (req, res) => {
  const { email, name, password, experienceLevel, goalFocus, preferredUnits, trainingDays } = req.body;
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash: await hashPassword(password),
      experienceLevel: experienceLevel || 'BEGINNER',
      goalFocus: goalFocus || 'GENERAL_HEALTH',
      preferredUnits: preferredUnits || 'imperial',
      trainingDays: trainingDays || []
    }
  });

  res.status(201).json({
    user: publicUser(user),
    token: signAuthToken(user)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    user: publicUser(user),
    token: signAuthToken(user)
  });
};

export const guestLogin = async (_req, res) => {
  const user = await createGuestUser(prisma);

  res.status(201).json({
    user: publicUser(user),
    token: signAuthToken(user)
  });
};

export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
