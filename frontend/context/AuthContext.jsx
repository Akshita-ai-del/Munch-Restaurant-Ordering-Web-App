'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { authApi } from '@/services/api';

const AuthContext = createContext(null);

const initialState = { user: null, token: null, loading: true };

// Helper: set cookie accessible to Next.js middleware
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':  return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGOUT':    return { user: null, token: null, loading: false };
    case 'LOADING':   return { ...state, loading: action.value };
    default:          return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('munch_token');
    if (!token) { dispatch({ type: 'LOGOUT' }); return; }
    authApi.me()
      .then(({ data }) => dispatch({ type: 'SET_USER', user: data.user, token }))
      .catch(() => {
        localStorage.removeItem('munch_token');
        deleteCookie('munch_token');
        dispatch({ type: 'LOGOUT' });
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('munch_token', data.token);
    setCookie('munch_token', data.token);
    dispatch({ type: 'SET_USER', user: data.user, token: data.token });
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await authApi.register({ name, email, password, phone });
    localStorage.setItem('munch_token', data.token);
    setCookie('munch_token', data.token);
    dispatch({ type: 'SET_USER', user: data.user, token: data.token });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('munch_token');
    deleteCookie('munch_token');
    dispatch({ type: 'LOGOUT' });
    if (typeof window !== 'underfined') {
       window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
