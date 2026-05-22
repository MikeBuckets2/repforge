import { Activity, UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { goalTypes, trainingDays } from '../utils/formatters.js';

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    experienceLevel: 'BEGINNER',
    goalFocus: 'STRENGTH',
    preferredUnits: 'imperial',
    trainingDays: ['Monday', 'Wednesday', 'Friday']
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const toggleDay = (day) => {
    const next = form.trainingDays.includes(day)
      ? form.trainingDays.filter((item) => item !== day)
      : [...form.trainingDays, day];
    setForm({ ...form, trainingDays: next });
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(form);
      navigate('/app');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page wide">
      <Link to="/" className="brand-mark">
        <span className="brand-icon">
          <Activity size={22} />
        </span>
        <span>RepForge</span>
      </Link>
      <section className="auth-panel">
        <span className="eyebrow">Start forging</span>
        <h1>Create account</h1>
        <form className="form-stack" onSubmit={submit}>
          <div className="two-column">
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
          </div>
          <label>
            Password
            <input
              type="password"
              minLength="8"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <div className="two-column">
            <label>
              Experience
              <select
                value={form.experienceLevel}
                onChange={(event) => setForm({ ...form, experienceLevel: event.target.value })}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <label>
              Goal focus
              <select value={form.goalFocus} onChange={(event) => setForm({ ...form, goalFocus: event.target.value })}>
                {goalTypes.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="segmented-field">
            <legend>Training days</legend>
            <div className="day-grid">
              {trainingDays.map((day) => (
                <button
                  type="button"
                  className={form.trainingDays.includes(day) ? 'selected' : ''}
                  key={day}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </fieldset>
          {error ? <p className="form-error">{error}</p> : null}
          <Button icon={UserPlus} disabled={loading}>
            {loading ? 'Creating account' : 'Create account'}
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
