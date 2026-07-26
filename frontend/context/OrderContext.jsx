'use client';
import { createContext, useContext, useState } from 'react';
import { orderApi } from '@/services/api';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchOrder = async (id) => {
    const { data } = await orderApi.getById(id);
    setActiveOrder(data.order);
    return data.order;
  };

  const fetchOrders = async () => {
    const { data } = await orderApi.getAll();
    setOrders(data.orders);
    return data.orders;
  };

  const placeOrder = async (orderData) => {
    const { data } = await orderApi.place(orderData);
    setActiveOrder(data.order);
    return data.order;
  };

  return (
    <OrderContext.Provider value={{ activeOrder, orders, fetchOrder, fetchOrders, placeOrder, setActiveOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);
