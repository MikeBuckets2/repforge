import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import BadgePill from '../components/BadgePill.jsx';
import EmptyState from '../components/states/EmptyState.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import LoadingState from '../components/states/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { apiRequest } from '../services/api.js';
import { goalTypes, labelize, trainingDays } from '../utils/formatters.js';

const blankPlanExercise = (exerciseId = '') => ({
  exerciseId,
  dayLabel: 'Monday',
  targetSets: 3,
  targetReps: 8,
  targetWeight: '',
  targetDistance: '',
  targetDuration: ''
});

export default function PlannerPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    goalType: 'STRENGTH',
    daysPerWeek: 4,
    active: true,
    exercises: [blankPlanExercise()]
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const resources = useApiResource(
    async () => {
      const [planPayload, exercisePayload] = await Promise.all([
        apiRequest('/plans', { token }),
        apiRequest('/exercises', { token })
      ]);
      return { plans: planPayload.plans, exercises: exercisePayload.exercises };
    },
    [token]
  );

  const firstExerciseId = resources.data?.exercises?.[0]?.id || '';

  const updateExercise = (index, patch) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, itemIndex) =>
        itemIndex === index ? { ...exercise, ...patch } : exercise
      )
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiRequest('/plans', {
        token,
        method: 'POST',
        body: {
          ...form,
          exercises: form.exercises.map((exercise) => ({
            ...exercise,
            exerciseId: exercise.exerciseId || firstExerciseId
          }))
        }
      });
      setForm({ name: '', description: '', goalType: 'STRENGTH', daysPerWeek: 4, active: true, exercises: [blankPlanExercise(firstExerciseId)] });
      await resources.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id) => {
    await apiRequest(`/plans/${id}`, { token, method: 'DELETE' });
    resources.reload();
  };

  if (resources.loading) return <LoadingState label="Loading plans" />;
  if (resources.error) return <ErrorState message={resources.error} onRetry={resources.reload} />;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Plan builder" title="Build the next block">
        Organize weekly training around the goal you want to move first.
      </PageHeader>

      <section className="editor-layout">
        <form className="panel form-stack" onSubmit={submit}>
          <div className="two-column">
            <label>
              Plan name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Goal type
              <select value={form.goalType} onChange={(event) => setForm({ ...form, goalType: event.target.value })}>
                {goalTypes.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="two-column">
            <label>
              Days per week
              <input
                type="number"
                min="1"
                max="7"
                value={form.daysPerWeek}
                onChange={(event) => setForm({ ...form, daysPerWeek: event.target.value })}
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
          </div>

          {form.exercises.map((exercise, index) => (
            <div className="builder-block compact" key={index}>
              <div className="two-column">
                <label>
                  Exercise
                  <select
                    value={exercise.exerciseId || firstExerciseId}
                    onChange={(event) => updateExercise(index, { exerciseId: event.target.value })}
                  >
                    {(resources.data?.exercises || []).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Day
                  <select value={exercise.dayLabel} onChange={(event) => updateExercise(index, { dayLabel: event.target.value })}>
                    {trainingDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="four-column">
                <label>
                  Sets
                  <input
                    type="number"
                    min="1"
                    value={exercise.targetSets}
                    onChange={(event) => updateExercise(index, { targetSets: event.target.value })}
                  />
                </label>
                <label>
                  Reps
                  <input
                    type="number"
                    min="1"
                    value={exercise.targetReps}
                    onChange={(event) => updateExercise(index, { targetReps: event.target.value })}
                  />
                </label>
                <label>
                  Weight
                  <input
                    type="number"
                    min="0"
                    value={exercise.targetWeight}
                    onChange={(event) => updateExercise(index, { targetWeight: event.target.value })}
                  />
                </label>
                <label>
                  Distance
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={exercise.targetDistance}
                    onChange={(event) => updateExercise(index, { targetDistance: event.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={() => setForm({ ...form, exercises: [...form.exercises, blankPlanExercise(firstExerciseId)] })}
          >
            Add exercise
          </Button>
          {error ? <p className="form-error">{error}</p> : null}
          <Button icon={Save} disabled={saving || !firstExerciseId}>
            {saving ? 'Saving plan' : 'Save plan'}
          </Button>
        </form>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Saved plans</span>
              <h2>Training blocks</h2>
            </div>
          </div>
          <div className="plan-list">
            {resources.data?.plans?.length ? (
              resources.data.plans.map((plan) => (
                <article key={plan.id} className="plan-card">
                  <div>
                    <h3>{plan.name}</h3>
                    <p>{plan.description || 'No description'}</p>
                    <div className="mini-metrics">
                      <span>{plan.daysPerWeek} days</span>
                      <span>{plan.exercises.length} exercises</span>
                    </div>
                  </div>
                  <BadgePill tone={plan.active ? 'mint' : 'neutral'}>{labelize(plan.goalType)}</BadgePill>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => deletePlan(plan.id)}>
                    Delete
                  </Button>
                </article>
              ))
            ) : (
              <EmptyState title="No plans saved" detail="Create a block to populate today’s workout." />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
