import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const API_URL = 'http://localhost:3000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || ''
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        const savedUser = JSON.parse(
          localStorage.getItem('user') || 'null'
        );

        const updatedUser = {
          ...savedUser,
          id: data.userId,
          email: data.email,
          role: data.role
        };

        if (active) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch {
        if (active) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken('');
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign-in failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }

  async function signup(name, email, password) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign-up failed');
    }

    return data;
  }

  async function logout() {
    if (token) {
      try {
        await fetch(`${API_URL}/auth/signout`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch {
        // The local session will still be cleared.
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken('');
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role === 'Admin',
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}