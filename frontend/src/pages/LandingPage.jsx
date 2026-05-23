import { Activity, ArrowRight, BarChart3, CalendarCheck, Dumbbell, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { guestLogin, isAuthenticated } = useAuth();
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const enterGuest = async () => {
    setLoadingGuest(true);
    setError('');

    try {
      await guestLogin();
      navigate('/app');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className="marketing-page">
      <nav className="marketing-nav">
        <Link to="/" className="brand-mark">
          <span className="brand-icon">
            <Activity size={22} />
          </span>
          <span>RepForge</span>
        </Link>
        <div>
          {isAuthenticated ? (
            <Button icon={ArrowRight} onClick={() => navigate('/app')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Link className="text-link auth-link" to="/login">
                Log in
              </Link>
              <Link className="btn btn-primary btn-md" to="/signup">
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-media" />
        <div className="hero-content">
          <span className="eyebrow">Training intelligence for consistent athletes</span>
          <h1>RepForge</h1>
          <p>
            Build plans, log precise sessions, and turn every set, mile, and recovery day into visible momentum.
          </p>
          <div className="hero-actions">
            <Button icon={Sparkles} onClick={enterGuest} disabled={loadingGuest}>
              {loadingGuest ? 'Preparing demo' : 'Enter as guest'}
            </Button>
            <Link className="btn btn-secondary btn-md" to="/signup">
              <span>Create account</span>
            </Link>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
        </div>
      </header>

      <main className="landing-sections">
        <section className="story-band">
          <div>
            <span className="eyebrow">Plan, log, adapt</span>
            <h2>Progress tracking that feels built for the weight room and the long run.</h2>
          </div>
          <div className="story-grid">
            <article>
              <Dumbbell size={24} />
              <h3>Workout builder</h3>
              <p>Structure training days around goals, target sets, reps, load, distance, and duration.</p>
            </article>
            <article>
              <BarChart3 size={24} />
              <h3>Analytics</h3>
              <p>Volume, consistency, records, and goal progress stay visible across weekly cycles.</p>
            </article>
            <article>
              <CalendarCheck size={24} />
              <h3>Consistency</h3>
              <p>Streaks, summaries, and badges make adherence obvious without clutter.</p>
            </article>
            <article>
              <ShieldCheck size={24} />
              <h3>Reliable by design</h3>
              <p>Secure authentication, validated data flows, and a structured backend built for consistent performance.</p>
            </article>
          </div>
        </section>

        <section className="product-preview">
          <div className="preview-panel">
            <div className="preview-header">
              <span>Today</span>
              <strong>Strength Base Builder</strong>
            </div>
            <div className="preview-bars">
              <span style={{ width: '86%' }} />
              <span style={{ width: '68%' }} />
              <span style={{ width: '74%' }} />
            </div>
            <div className="preview-row">
              <span>Weekly consistency</span>
              <strong>75%</strong>
            </div>
            <div className="preview-row">
              <span>Current streak</span>
              <strong>4 days</strong>
            </div>
          </div>
          <div>
            <span className="eyebrow">Training system</span>
            <h2>Built for real training not static tracking.</h2>
            <p>
              Enter instantly with guest access, build structured workouts, and track real performance data powered by a persistent API and relational database.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
