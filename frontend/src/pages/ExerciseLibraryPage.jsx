import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import BadgePill from '../components/BadgePill.jsx';
import ErrorState from '../components/states/ErrorState.jsx';
import LoadingState from '../components/states/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { exerciseCategories, labelize } from '../utils/formatters.js';

export default function ExerciseLibraryPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [custom, setCustom] = useState({
    name: '',
    category: 'STRENGTH',
    primaryMuscle: '',
    equipment: '',
    instructions: ''
  });

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      const payload = await apiRequest(`/exercises?${params.toString()}`, { token });
      setExercises(payload.exercises);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [filters.search, filters.category, token]);

  const createExercise = async (event) => {
    event.preventDefault();
    await apiRequest('/exercises', { token, method: 'POST', body: custom });
    setCustom({ name: '', category: 'STRENGTH', primaryMuscle: '', equipment: '', instructions: '' });
    load();
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Exercise library" title="Search movement options">
        Filter by category, muscle group, equipment, and training style.
      </PageHeader>

      <section className="library-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            placeholder="Search exercises"
          />
        </label>
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          {exerciseCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </section>

      {loading ? <LoadingState label="Searching library" /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}

      <section className="library-grid">
        {exercises.map((exercise) => (
          <article key={exercise.id} className="exercise-card">
            <div className="exercise-card-top">
              <BadgePill tone={exercise.category === 'STRENGTH' ? 'mint' : 'amber'}>{labelize(exercise.category)}</BadgePill>
              <span>{exercise.equipment}</span>
            </div>
            <h3>{exercise.name}</h3>
            <p>{exercise.primaryMuscle}</p>
            <small>{exercise.instructions}</small>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Custom library</span>
            <h2>Add movement</h2>
          </div>
        </div>
        <form className="form-stack" onSubmit={createExercise}>
          <div className="four-column">
            <label>
              Name
              <input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} required />
            </label>
            <label>
              Category
              <select value={custom.category} onChange={(event) => setCustom({ ...custom, category: event.target.value })}>
                {exerciseCategories.slice(1).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Muscle
              <input
                value={custom.primaryMuscle}
                onChange={(event) => setCustom({ ...custom, primaryMuscle: event.target.value })}
                required
              />
            </label>
            <label>
              Equipment
              <input
                value={custom.equipment}
                onChange={(event) => setCustom({ ...custom, equipment: event.target.value })}
                required
              />
            </label>
          </div>
          <label>
            Instructions
            <textarea
              rows="3"
              value={custom.instructions}
              onChange={(event) => setCustom({ ...custom, instructions: event.target.value })}
            />
          </label>
          <Button icon={Plus}>Add exercise</Button>
        </form>
      </section>
    </div>
  );
}
