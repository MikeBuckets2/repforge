import { CheckCircle2, Plus, Target } from 'lucide-react';
import { useState } from 'react';
import BadgePill from '../components/BadgePill.jsx';
import Button from '../components/Button.jsx';
import GoalCard from '../components/GoalCard.jsx';
import { SessionBarChart, VolumeAreaChart } from '../components/MetricChart.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/states/EmptyState.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import LoadingState from '../components/states/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { apiRequest } from '../services/api.js';
import { formatDate, formatNumber, goalTypes, labelize } from '../utils/formatters.js';

export default function ProgressPage() {
  const { token } = useAuth();
  const [goalForm, setGoalForm] = useState({
    title: '',
    type: 'STRENGTH',
    targetValue: '',
    currentValue: '',
    unit: 'lb',
    deadline: ''
  });
  const [error, setError] = useState('');

  const resources = useApiResource(
    async () => {
      const [summary, progress, records, goals] = await Promise.all([
        apiRequest('/analytics/summary', { token }),
        apiRequest('/analytics/progress', { token }),
        apiRequest('/analytics/records', { token }),
        apiRequest('/goals', { token })
      ]);
      return { summary, progress, records: records.records, goals: goals.goals };
    },
    [token]
  );

  const createGoal = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await apiRequest('/goals', {
        token,
        method: 'POST',
        body: {
          ...goalForm,
          targetValue: Number(goalForm.targetValue),
          currentValue: Number(goalForm.currentValue || 0),
          deadline: goalForm.deadline ? new Date(`${goalForm.deadline}T12:00:00`).toISOString() : null
        }
      });
      setGoalForm({ title: '', type: 'STRENGTH', targetValue: '', currentValue: '', unit: 'lb', deadline: '' });
      resources.reload();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const completeGoal = async (goal) => {
    await apiRequest(`/goals/${goal.id}`, {
      token,
      method: 'PATCH',
      body: { status: 'COMPLETED', currentValue: goal.targetValue || goal.currentValue }
    });
    resources.reload();
  };

  const deleteGoal = async (id) => {
    await apiRequest(`/goals/${id}`, { token, method: 'DELETE' });
    resources.reload();
  };

  if (resources.loading) return <LoadingState label="Loading progress" />;
  if (resources.error) return <ErrorState message={resources.error} onRetry={resources.reload} />;

  const chart = resources.data?.summary?.chart || [];

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Progress analytics" title="Measure the trend">
        Review records, weekly work, goal milestones, and body metrics.
      </PageHeader>

      <section className="dashboard-grid">
        <article className="panel span-2">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Load trend</span>
              <h2>Volume over time</h2>
            </div>
          </div>
          <VolumeAreaChart data={chart} />
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Consistency</span>
              <h2>Sessions by week</h2>
            </div>
          </div>
          <SessionBarChart data={resources.data?.progress?.chart || []} />
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Personal records</span>
              <h2>Recent bests</h2>
            </div>
            <CheckCircle2 size={22} />
          </div>
          <div className="record-list">
            {resources.data?.records?.length ? (
              resources.data.records.slice(0, 8).map((record) => (
                <div key={record.id}>
                  <BadgePill tone="mint">{labelize(record.recordType)}</BadgePill>
                  <strong>
                    {formatNumber(record.value, 1)} {record.unit}
                  </strong>
                  <span>{record.exercise.name}</span>
                  <small>{formatDate(record.achievedAt)}</small>
                </div>
              ))
            ) : (
              <EmptyState title="No records yet" detail="Log completed sets to populate bests." />
            )}
          </div>
        </article>

        <article className="panel span-2">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Goals</span>
              <h2>Milestone board</h2>
            </div>
            <Target size={22} />
          </div>
          <div className="goal-grid">
            {resources.data?.goals?.length ? (
              resources.data.goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onComplete={completeGoal} onDelete={deleteGoal} />
              ))
            ) : (
              <EmptyState title="No goals created" detail="Add your first measurable target below." />
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">New target</span>
            <h2>Create fitness goal</h2>
          </div>
        </div>
        <form className="form-stack" onSubmit={createGoal}>
          <div className="four-column">
            <label>
              Title
              <input
                value={goalForm.title}
                onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })}
                required
              />
            </label>
            <label>
              Type
              <select value={goalForm.type} onChange={(event) => setGoalForm({ ...goalForm, type: event.target.value })}>
                {goalTypes.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Current
              <input
                type="number"
                min="0"
                step="0.1"
                value={goalForm.currentValue}
                onChange={(event) => setGoalForm({ ...goalForm, currentValue: event.target.value })}
              />
            </label>
            <label>
              Target
              <input
                type="number"
                min="0"
                step="0.1"
                value={goalForm.targetValue}
                onChange={(event) => setGoalForm({ ...goalForm, targetValue: event.target.value })}
                required
              />
            </label>
          </div>
          <div className="two-column">
            <label>
              Unit
              <input value={goalForm.unit} onChange={(event) => setGoalForm({ ...goalForm, unit: event.target.value })} />
            </label>
            <label>
              Deadline
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(event) => setGoalForm({ ...goalForm, deadline: event.target.value })}
              />
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <Button icon={Plus}>Add goal</Button>
        </form>
      </section>
    </div>
  );
}
