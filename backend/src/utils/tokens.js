import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
