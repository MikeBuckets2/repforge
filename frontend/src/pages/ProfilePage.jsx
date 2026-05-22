import { Save } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { goalTypes, trainingDays } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    experienceLevel: user?.experienceLevel || 'BEGINNER',
    goalFocus: user?.goalFocus || 'GENERAL_HEALTH',
    preferredUnits: user?.preferredUnits || 'imperial',
    heightCm: user?.heightCm || '',
    weightKg: user?.weightKg || '',
    trainingDays: user?.trainingDays || []
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const toggleDay = (day) => {
    const next = form.trainingDays.includes(day)
      ? form.trainingDays.filter((item) => item !== day)
      : [...form.trainingDays, day];
    setForm({ ...form, trainingDays: next });
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    try {
      const payload = await apiRequest('/profile', {
        token,
        method: 'PATCH',
        body: {
          ...form,
          heightCm: form.heightCm === '' ? null : Number(form.heightCm),
          weightKg: form.weightKg === '' ? null : Number(form.weightKg)
        }
      });
      setUser(payload.user);
      setStatus('Profile updated');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Athlete profile" title="Training preferences">
        Keep goals, experience, and weekly availability aligned with your plan.
      </PageHeader>

      <form className="panel form-stack profile-form" onSubmit={submit}>
        <div className="two-column">
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
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
        </div>
        <div className="two-column">
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
          <label>
            Units
            <select
              value={form.preferredUnits}
              onChange={(event) => setForm({ ...form, preferredUnits: event.target.value })}
            >
              <option value="imperial">Imperial</option>
              <option value="metric">Metric</option>
            </select>
          </label>
        </div>
        <div className="two-column">
          <label>
            Height in cm
            <input
              type="number"
              min="50"
              value={form.heightCm}
              onChange={(event) => setForm({ ...form, heightCm: event.target.value })}
            />
          </label>
          <label>
            Weight in kg
            <input
              type="number"
              min="20"
              value={form.weightKg}
              onChange={(event) => setForm({ ...form, weightKg: event.target.value })}
            />
          </label>
        </div>
        <fieldset className="segmented-field">
          <legend>Training days</legend>
          <div className="day-grid">
            {trainingDays.map((day) => (
              <button
                type="button"
                key={day}
                className={form.trainingDays.includes(day) ? 'selected' : ''}
                onClick={() => toggleDay(day)}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </fieldset>
        {status ? <p className="form-success">{status}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <Button icon={Save}>Save profile</Button>
      </form>
    </div>
  );
}
