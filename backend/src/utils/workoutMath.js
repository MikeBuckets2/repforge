export const calculateSessionTotals = (exercises = []) => {
  return exercises.reduce(
    (totals, exercise) => {
      for (const set of exercise.sets || []) {
        if (set.completed === false) continue;
        const reps = Number(set.reps || 0);
        const weight = Number(set.weight || 0);
        const distance = Number(set.distance || 0);

        totals.totalVolume += reps * weight;
        totals.totalDistance += distance;
      }

      return totals;
    },
    { totalVolume: 0, totalDistance: 0 }
  );
};

export const normalizeWorkoutExercises = (exercises = []) =>
  exercises.map((exercise, index) => ({
    exerciseId: exercise.exerciseId,
    order: Number.isFinite(Number(exercise.order)) ? Number(exercise.order) : index,
    notes: exercise.notes || null,
    sets: {
      create: (exercise.sets || []).map((set, setIndex) => ({
        setNumber: Number(set.setNumber || setIndex + 1),
        reps: set.reps === undefined || set.reps === null || set.reps === '' ? null : Number(set.reps),
        weight: set.weight === undefined || set.weight === null || set.weight === '' ? null : Number(set.weight),
        distance:
          set.distance === undefined || set.distance === null || set.distance === '' ? null : Number(set.distance),
        durationSeconds:
          set.durationSeconds === undefined || set.durationSeconds === null || set.durationSeconds === ''
            ? null
            : Number(set.durationSeconds),
        intensity: set.intensity || null,
        completed: set.completed !== false
      }))
    }
  }));
