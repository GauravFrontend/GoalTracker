import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save user info (simplified for this task)
                localStorage.setItem('user', JSON.stringify(data.user));

                // Use a custom event or check in App to update state, 
                // but since we navigate, App will re-render if it checks localStorage on mount/route change.
                // Actually, better to reload or have App context. 
                // For now, let's just navigate.
                navigate('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Is the backend running?');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="brand">
                    <Sparkles size={32} />
                    <h1>Glow Goals</h1>
                </div>
                <h2>Welcome Back! ✨</h2>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">Login</button>
                </form>

                <p className="switch-auth">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>

            <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-app);
          padding: 20px;
        }

        .auth-card {
          background: white;
          padding: 40px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-hover);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--primary);
          margin-bottom: 10px;
        }

        .brand h1 {
          font-size: 1.8rem;
          font-weight: 800;
        }

        h2 {
          color: var(--text-main);
          margin-bottom: 30px;
          font-size: 1.2rem;
        }

        .input-group {
          text-align: left;
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .input-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--neutral-gray);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          border-color: var(--primary);
          outline: none;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: var(--primary);
          color: white;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          margin-top: 10px;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .switch-auth {
          margin-top: 20px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .switch-auth a {
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
        }

        .switch-auth a:hover {
          text-decoration: underline;
        }

        .error-msg {
          background: #ffe6e6;
          color: #d8000c;
          padding: 10px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
}
