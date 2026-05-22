import { CalendarCheck, Flame, Gauge, Medal, Route, TrendingUp } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import LoadingState from '../components/states/LoadingState.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import EmptyState from '../components/states/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import BadgePill from '../components/BadgePill.jsx';
import WorkoutCard from '../components/WorkoutCard.jsx';
import { VolumeAreaChart } from '../components/MetricChart.jsx';
import { formatNumber, goalProgress } from '../utils/formatters.js';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { data, loading, error, reload } = useApiResource(
    () => apiRequest('/analytics/summary', { token }),
    [token]
  );

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const summary = data?.summary || {};
  const todaysWorkout = data?.todaysWorkout;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Command center" title={`Good work, ${user?.name?.split(' ')[0] || 'athlete'}`}>
        Your current training cycle, consistency, and next best move are ready.
      </PageHeader>

      <section className="stat-grid">
        <StatCard icon={Flame} label="Streak" value={`${summary.streak || 0} days`} detail="Current rhythm" tone="coral" />
        <StatCard
          icon={CalendarCheck}
          label="This week"
          value={`${summary.weeklyConsistency || 0}%`}
          detail={`${summary.weeklySessions || 0} sessions logged`}
          tone="mint"
        />
        <StatCard
          icon={TrendingUp}
          label="Volume"
          value={formatNumber(summary.totalVolume)}
          detail="Last 10 weeks"
          tone="amber"
        />
        <StatCard
          icon={Route}
          label="Distance"
          value={`${formatNumber(summary.totalDistance, 1)} mi`}
          detail="Run and conditioning"
          tone="blue"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel span-2">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Progress curve</span>
              <h2>Weekly training volume</h2>
            </div>
            <BadgePill tone="mint">{summary.totalSessions || 0} sessions</BadgePill>
          </div>
          <VolumeAreaChart data={data?.chart || []} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Today</span>
              <h2>{todaysWorkout?.planName || 'Open training day'}</h2>
            </div>
            <Gauge size={22} />
          </div>
          {todaysWorkout?.exercises?.length ? (
            <div className="today-list">
              {todaysWorkout.exercises.map((item) => (
                <div key={item.id}>
                  <strong>{item.exercise.name}</strong>
                  <span>
                    {item.targetSets || 1} x {item.targetReps || item.targetDistance || item.targetDuration || 'steady'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No planned work today" detail="Log a session or build a plan when ready." />
          )}
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Weekly summary</span>
              <h2>{data?.weeklySummary?.sessions || 0} sessions</h2>
            </div>
          </div>
          <p className="panel-copy">{data?.weeklySummary?.headline}</p>
          <div className="mini-metrics tall">
            <span>{formatNumber(data?.weeklySummary?.volume)} volume</span>
            <span>{formatNumber(data?.weeklySummary?.distance, 1)} mi</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Adaptive suggestions</span>
              <h2>Next moves</h2>
            </div>
          </div>
          <div className="suggestion-list">
            {(data?.suggestions || []).map((suggestion) => (
              <div key={suggestion.title}>
                <BadgePill tone="amber">{suggestion.tag}</BadgePill>
                <strong>{suggestion.title}</strong>
                <p>{suggestion.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Badges</span>
              <h2>Best work</h2>
            </div>
            <Medal size={22} />
          </div>
          <div className="badge-list">
            {(data?.badges || []).map((badge) => (
              <div key={badge.label}>
                <span>{badge.label}</span>
                <strong>{badge.value}</strong>
                <small>{badge.detail}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Goals</span>
              <h2>Active targets</h2>
            </div>
          </div>
          <div className="goal-list compact-list">
            {(data?.goals || []).slice(0, 3).map((goal) => (
              <ProgressBar key={goal.id} label={goal.title} value={goalProgress(goal)} />
            ))}
            {!data?.goals?.length ? <EmptyState title="No goals yet" detail="Create a target from Progress." /> : null}
          </div>
        </article>

        <article className="panel span-2">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Recent log</span>
              <h2>Latest workouts</h2>
            </div>
          </div>
          <div className="workout-list">
            {(data?.recentSessions || []).map((session) => (
              <WorkoutCard key={session.id} session={session} />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
