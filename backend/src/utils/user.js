export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  isGuest: user.isGuest,
  experienceLevel: user.experienceLevel,
  preferredUnits: user.preferredUnits,
  trainingDays: user.trainingDays,
  goalFocus: user.goalFocus,
  heightCm: user.heightCm,
  weightKg: user.weightKg,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
