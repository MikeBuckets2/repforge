import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword } from '../src/utils/password.js';
import { createDemoTrainingData, ensureExerciseLibrary } from '../src/utils/demoData.js';

const prisma = new PrismaClient();

const main = async () => {
  await ensureExerciseLibrary(prisma);

  const email = 'demo@repforge.app';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Demo Athlete',
        passwordHash: await hashPassword(process.env.SEED_DEMO_PASSWORD || crypto.randomUUID()),
        isGuest: true,
        experienceLevel: 'INTERMEDIATE',
        preferredUnits: 'imperial',
        trainingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        goalFocus: 'STRENGTH',
        heightCm: 178,
        weightKg: 81
      }
    });

    await createDemoTrainingData(prisma, user.id);
  }

  console.log('Seeded RepForge exercise library and demo athlete.');
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
