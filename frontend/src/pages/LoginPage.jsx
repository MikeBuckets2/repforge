import { Activity, ArrowRight, LogIn } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, guestLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate('/app');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    setLoading(true);
    setError('');

    try {
      await guestLogin();
      navigate('/app');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="brand-mark">
        <span className="brand-icon">
          <Activity size={22} />
        </span>
        <span>RepForge</span>
      </Link>
      <section className="auth-panel">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
        <form className="form-stack" onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button icon={LogIn} disabled={loading}>
            {loading ? 'Logging in' : 'Log in'}
          </Button>
          <Button type="button" variant="secondary" icon={ArrowRight} onClick={guest} disabled={loading}>
            Enter as guest
          </Button>
        </form>
        <p className="auth-switch">
          New to RepForge? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
