import React, { FormEvent, useState } from 'react';

type LoginPageProps = {
  onLogin: (username: string) => void;
  onGuestLogin: () => void;
};

export default function LoginPage({ onLogin, onGuestLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = username.trim();
    if (!cleanName || !password.trim()) {
      setError('Please enter both a username and password.');
      return;
    }
    setError(null);
    onLogin(cleanName);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to continue, or enter as a guest if you just want to explore.
        </p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter your username"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {error ? <p className="login-error">{error}</p> : null}
          <button type="submit" className="primary-login-button">
            Log In
          </button>
        </form>
        <button type="button" className="guest-login-button" onClick={onGuestLogin}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
