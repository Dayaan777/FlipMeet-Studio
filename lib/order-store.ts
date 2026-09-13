"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  lookId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  dropId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryWindow: { start: string; end: string };
  notes?: string;
};

type OrderState = {
  orders: Order[];
  createOrder: (data: Omit<Order, "id" | "createdAt" | "status"> & { id?: string }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByCustomer: (customerId: string, email?: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  resetToSampleData: () => void;
};

const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-9401",
    customerId: "usr-cust-01",
    customerName: "Zaid Ali",
    customerEmail: "zaid@flipmeet.studio",
    customerPhone: "+92 321 8841920",
    shippingAddress: "House 14-B, Street 9, Phase 6, DHA, Karachi",
    dropId: "drop-001",
    items: [
      {
        lookId: "look-01",
        name: "Look 01",
        size: "L",
        price: 18500,
        quantity: 1,
        image: "/images/looks/look-01.jpg",
      },
    ],
    total: 18500,
    status: "in_production",
    createdAt: "2026-09-02T14:20:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
    notes: "Leave package at reception if unavailable.",
  },
  {
    id: "ORD-9402",
    customerId: "usr-cust-01",
    customerName: "Zaid Ali",
    customerEmail: "zaid@flipmeet.studio",
    customerPhone: "+92 321 8841920",
    shippingAddress: "House 14-B, Street 9, Phase 6, DHA, Karachi",
    dropId: "drop-001",
    items: [
      {
        lookId: "look-03",
        name: "Look 03",
        size: "L",
        price: 22000,
        quantity: 1,
        image: "/images/looks/look-03.jpg",
      },
      {
        lookId: "look-06",
        name: "Look 06",
        size: "XL",
        price: 19500,
        quantity: 1,
        image: "/images/looks/look-06.jpg",
      },
    ],
    total: 41500,
    status: "confirmed",
    createdAt: "2026-09-06T18:45:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
  },
  {
    id: "ORD-9403",
    customerId: "usr-cust-02",
    customerName: "Hamza Tariq",
    customerEmail: "hamza.t@gmail.com",
    customerPhone: "+92 300 4492103",
    shippingAddress: "Apartment 402, Creek Vistas, DHA Phase 8, Karachi",
    dropId: "drop-001",
    items: [
      {
        lookId: "look-02",
        name: "Look 02",
        size: "M",
        price: 16500,
        quantity: 1,
        image: "/images/looks/look-02.jpg",
      },
    ],
    total: 16500,
    status: "pending",
    createdAt: "2026-09-09T09:12:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
  },
  {
    id: "ORD-9404",
    customerId: "usr-cust-03",
    customerName: "Sara Mansoor",
    customerEmail: "sara.m@outlook.com",
    customerPhone: "+92 333 5519820",
    shippingAddress: "Villa 12, Street 3, F-7/2, Islamabad",
    dropId: "drop-001",
    items: [
      {
        lookId: "look-04",
        name: "Look 04",
        size: "S",
        price: 17500,
        quantity: 2,
        image: "/images/looks/look-04.jpg",
      },
      {
        lookId: "look-05",
        name: "Look 05",
        size: "M",
        price: 21000,
        quantity: 1,
        image: "/images/looks/look-05.jpg",
      },
    ],
    total: 56000,
    status: "shipped",
    createdAt: "2026-08-28T11:30:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
    notes: "Call upon dispatch.",
  },
  {
    id: "ORD-9405",
    customerId: "usr-cust-04",
    customerName: "Daniyal Khan",
    customerEmail: "daniyal.k@gmail.com",
    customerPhone: "+92 345 9901234",
    shippingAddress: "Plaza 88, Gulberg III, Lahore",
    dropId: "drop-001",
    items: [
      {
        lookId: "look-01",
        name: "Look 01",
        size: "XL",
        price: 18500,
        quantity: 1,
        image: "/images/looks/look-01.jpg",
      },
    ],
    total: 18500,
    status: "pending",
    createdAt: "2026-09-10T16:05:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: SAMPLE_ORDERS,

      createOrder: (data) => {
        const newOrder: Order = {
          ...data,
          id: data.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },

      getOrdersByCustomer: (customerId, email) => {
        const currentOrders = get().orders;
        return currentOrders.filter(
          (o) =>
            o.customerId === customerId ||
            (email && o.customerEmail.toLowerCase() === email.toLowerCase())
        );
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      resetToSampleData: () => {
        set({ orders: SAMPLE_ORDERS });
      },
    }),
    {
      name: "flipmeet-orders",
    }
  )
);
