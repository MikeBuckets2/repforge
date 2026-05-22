import { CalendarDays } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import WorkoutCard from '../components/WorkoutCard.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import LoadingState from '../components/states/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { apiRequest } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function CalendarPage() {
  const { token } = useAuth();
  const resources = useApiResource(
    async () => {
      const [workouts, progress] = await Promise.all([
        apiRequest('/workouts?limit=50', { token }),
        apiRequest('/analytics/progress', { token })
      ]);
      return { sessions: workouts.sessions, calendar: progress.calendar };
    },
    [token]
  );

  if (resources.loading) return <LoadingState label="Loading timeline" />;
  if (resources.error) return <ErrorState message={resources.error} onRetry={resources.reload} />;

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Training timeline" title="Calendar and history">
        See recent training density and past sessions in chronological context.
      </PageHeader>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Last 35 days</span>
            <h2>Consistency map</h2>
          </div>
          <CalendarDays size={22} />
        </div>
        <div className="heatmap">
          {(resources.data?.calendar || []).map((day) => (
            <span
              key={day.date}
              className={day.sessions ? 'active' : ''}
              title={`${formatDate(day.date)}: ${day.sessions} session${day.sessions === 1 ? '' : 's'}`}
            />
          ))}
        </div>
      </section>

      <section className="timeline">
        {(resources.data?.sessions || []).map((session) => (
          <div className="timeline-item" key={session.id}>
            <time>{formatDate(session.completedAt || session.scheduledFor)}</time>
            <WorkoutCard session={session} />
          </div>
        ))}
      </section>
    </div>
  );
}
