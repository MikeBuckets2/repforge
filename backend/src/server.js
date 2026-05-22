import 'dotenv/config';   // ✅ MUST be first line
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`RepForge API listening on port ${env.port}`);
});