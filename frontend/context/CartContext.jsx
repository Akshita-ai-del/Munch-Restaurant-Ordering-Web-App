'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { cartApi } from '@/services/api';

const CartContext = createContext(null);

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('munch_session');
  if (!id) { id = 'sess_' + Math.random().toString(36).slice(2); localStorage.setItem('munch_session', id); }
  return id;
}

const initialState = { cart: null, loading: false, count: 0 };

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.cart,
        count: action.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0,
        loading: false,
      };
    case 'LOADING': return { ...state, loading: action.value };
    default:        return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    try {
      const { data } = await cartApi.get();
      dispatch({ type: 'SET_CART', cart: data.cart });
    } catch { /* silent */ }
  };

  useEffect(() => { fetchCart(); }, []);

  const addItem = async (menuItemId, quantity = 1, addons = null, specialNote = '') => {
    dispatch({ type: 'LOADING', value: true });
    const { data } = await cartApi.addItem({ menuItemId, quantity, addons, specialNote, sessionId: getSessionId() });
    dispatch({ type: 'SET_CART', cart: data.cart });
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, { quantity });
    if (data.cart) dispatch({ type: 'SET_CART', cart: data.cart });
    else fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartApi.removeItem(itemId);
    fetchCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    dispatch({ type: 'SET_CART', cart: null });
  };

  const subtotal = state.cart?.items?.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ ...state, subtotal, addItem, updateItem, removeItem, clearCart, refresh: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
