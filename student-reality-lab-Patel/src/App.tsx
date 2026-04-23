import React, { useEffect, useState } from 'react';
import Chatbot from './components/Chatbot';
import LoginPage from './components/LoginPage';

type AuthUser = {
  name: string;
  mode: 'member' | 'guest';
};

const AUTH_STORAGE_KEY = 'student-reality-auth-user';

function parseStoredUser(value: string | null): AuthUser | null {
  if (!value) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'name' in parsed
      && 'mode' in parsed
      && typeof parsed.name === 'string'
      && (parsed.mode === 'member' || parsed.mode === 'guest')
    ) {
      return {
        name: parsed.name,
        mode: parsed.mode
      };
    }
  } catch {
    return null;
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => parseStoredUser(localStorage.getItem(AUTH_STORAGE_KEY)));

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  function handleLogin(username: string) {
    setUser({
      name: username,
      mode: 'member'
    });
  }

  function handleGuestLogin() {
    setUser({
      name: 'Guest User',
      mode: 'guest'
    });
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Can Recent Graduates Afford to Buy a House?</h1>
        <div className="session-controls">
          <span>
            Signed in as <strong>{user.name}</strong>
            {user.mode === 'guest' ? ' (Guest)' : ''}
          </span>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </header>
      <Chatbot />
    </div>
  );
}
