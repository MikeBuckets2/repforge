import { Plus, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import WorkoutCard from '../components/WorkoutCard.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import LoadingState from '../components/states/LoadingState.jsx';
import EmptyState from '../components/states/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { apiRequest } from '../services/api.js';

const today = () => new Date().toISOString().slice(0, 10);

const blankSet = () => ({
  reps: '',
  weight: '',
  distance: '',
  durationSeconds: '',
  intensity: 'MODERATE',
  completed: true
});

const blankExercise = (exerciseId = '') => ({
  exerciseId,
  sets: [blankSet()]
});

const initialForm = () => ({
  title: '',
  completedAt: today(),
  durationMinutes: '',
  perceivedExertion: 7,
  intensity: 'MODERATE',
  recoveryScore: '',
  note: '',
  exercises: [blankExercise()]
});

export default function LogWorkoutPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const resources = useApiResource(
    async () => {
      const [exercisePayload, workoutPayload] = await Promise.all([
        apiRequest('/exercises', { token }),
        apiRequest('/workouts?limit=12', { token })
      ]);
      return { exercises: exercisePayload.exercises, sessions: workoutPayload.sessions };
    },
    [token]
  );

  const exerciseOptions = resources.data?.exercises || [];
  const firstExerciseId = exerciseOptions[0]?.id || '';

  const normalizedForm = useMemo(
    () => ({
      ...form,
      exercises: form.exercises.map((exercise) => ({
        ...exercise,
        exerciseId: exercise.exerciseId || firstExerciseId
      }))
    }),
    [firstExerciseId, form]
  );

  const updateExercise = (index, patch) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, itemIndex) =>
        itemIndex === index ? { ...exercise, ...patch } : exercise
      )
    }));
  };

  const updateSet = (exerciseIndex, setIndex, patch) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, itemIndex) => {
        if (itemIndex !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, innerIndex) => (innerIndex === setIndex ? { ...set, ...patch } : set))
        };
      })
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      await apiRequest('/workouts', {
        token,
        method: 'POST',
        body: {
          ...normalizedForm,
          completedAt: new Date(`${normalizedForm.completedAt}T12:00:00`).toISOString()
        }
      });
      setForm(initialForm());
      await resources.reload();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeWorkout = async (id) => {
    await apiRequest(`/workouts/${id}`, { token, method: 'DELETE' });
    resources.reload();
  };

  const duplicateWorkout = async (id) => {
    await apiRequest(`/workouts/${id}/duplicate`, { token, method: 'POST' });
    resources.reload();
  };

  if (resources.loading) return <LoadingState label="Loading workout log" />;
  if (resources.error) return <ErrorState message={resources.error} onRetry={resources.reload} />;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Workout log" title="Record training">
        Capture strength, conditioning, notes, effort, and recovery in one clean flow.
      </PageHeader>

      <section className="editor-layout">
        <form className="panel form-stack" onSubmit={submit}>
          <div className="two-column">
            <label>
              Session title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Lower strength"
                required
              />
            </label>
            <label>
              Completed
              <input
                type="date"
                value={form.completedAt}
                onChange={(event) => setForm({ ...form, completedAt: event.target.value })}
                required
              />
            </label>
          </div>

          <div className="four-column">
            <label>
              Minutes
              <input
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
              />
            </label>
            <label>
              RPE
              <input
                type="number"
                min="1"
                max="10"
                value={form.perceivedExertion}
                onChange={(event) => setForm({ ...form, perceivedExertion: event.target.value })}
              />
            </label>
            <label>
              Recovery
              <input
                type="number"
                min="1"
                max="100"
                value={form.recoveryScore}
                onChange={(event) => setForm({ ...form, recoveryScore: event.target.value })}
              />
            </label>
            <label>
              Intensity
              <select value={form.intensity} onChange={(event) => setForm({ ...form, intensity: event.target.value })}>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Hard</option>
                <option value="MAX">Max</option>
              </select>
            </label>
          </div>

          <div className="exercise-builder">
            {normalizedForm.exercises.map((exercise, exerciseIndex) => (
              <div className="builder-block" key={`${exerciseIndex}-${exercise.exerciseId}`}>
                <label>
                  Exercise
                  <select
                    value={exercise.exerciseId}
                    onChange={(event) => updateExercise(exerciseIndex, { exerciseId: event.target.value })}
                  >
                    {exerciseOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="set-table">
                  <div className="set-row header">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight</span>
                    <span>Distance</span>
                    <span>Seconds</span>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div className="set-row" key={setIndex}>
                      <strong>{setIndex + 1}</strong>
                      <input
                        type="number"
                        min="0"
                        value={set.reps}
                        onChange={(event) => updateSet(exerciseIndex, setIndex, { reps: event.target.value })}
                      />
                      <input
                        type="number"
                        min="0"
                        value={set.weight}
                        onChange={(event) => updateSet(exerciseIndex, setIndex, { weight: event.target.value })}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={set.distance}
                        onChange={(event) => updateSet(exerciseIndex, setIndex, { distance: event.target.value })}
                      />
                      <input
                        type="number"
                        min="0"
                        value={set.durationSeconds}
                        onChange={(event) => updateSet(exerciseIndex, setIndex, { durationSeconds: event.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => updateExercise(exerciseIndex, { sets: [...exercise.sets, blankSet()] })}
                >
                  Add set
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={() => setForm({ ...form, exercises: [...form.exercises, blankExercise(firstExerciseId)] })}
          >
            Add exercise
          </Button>

          <label>
            Notes
            <textarea
              rows="4"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Top set moved well, add 5 lb next week."
            />
          </label>

          {formError ? <p className="form-error">{formError}</p> : null}
          <Button icon={Save} disabled={saving || !exerciseOptions.length}>
            {saving ? 'Saving workout' : 'Save workout'}
          </Button>
        </form>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">History</span>
              <h2>Recent sessions</h2>
            </div>
          </div>
          <div className="workout-list">
            {resources.data?.sessions?.length ? (
              resources.data.sessions.map((session) => (
                <WorkoutCard
                  key={session.id}
                  session={session}
                  onDuplicate={duplicateWorkout}
                  onDelete={removeWorkout}
                />
              ))
            ) : (
              <EmptyState title="No workouts logged" detail="Your first saved session will appear here." />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
