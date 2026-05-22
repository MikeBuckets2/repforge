import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, env.bcryptRounds);

export const comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);
