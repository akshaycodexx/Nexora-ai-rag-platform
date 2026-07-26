import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('nexora_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('nexora_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      setUser(null);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    if (authToken && authToken.startsWith('firebase_token_')) {
      const saved = localStorage.getItem('nexora_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved user", e);
        }
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('nexora_user', JSON.stringify(data));
      } else {
        logout();
      }
    } catch (e) {
      console.warn("Could not fetch user profile from server");
    }
  };

  const loginWithFirebase = (firebaseUser) => {
    const userObj = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      role: 'admin',
      avatar: firebaseUser.photoURL
    };
    const fbToken = 'firebase_token_' + firebaseUser.uid;
    localStorage.setItem('nexora_token', fbToken);
    localStorage.setItem('nexora_user', JSON.stringify(userObj));
    setToken(fbToken);
    setUser(userObj);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Login failed');
      }

      const data = await res.json();
      setToken(data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, username, password, role = 'user') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, role })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Signup failed');
      }

      return await res.json();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, loginWithFirebase, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
