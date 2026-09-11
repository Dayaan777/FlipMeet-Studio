"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  sizePreference?: string;
  notifyDrop?: boolean;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (
    data: {
      name: string;
      email: string;
      phone: string;
      address: string;
      sizePreference?: string;
      notifyDrop?: boolean;
    },
    password?: string
  ) => { success: boolean; error?: string };
  loginAsDemo: (role?: UserRole) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, "id" | "email" | "role">>) => void;
};

const DEMO_CUSTOMER: User = {
  id: "usr-cust-01",
  name: "Zaid Ali",
  email: "zaid@flipmeet.studio",
  phone: "+92 321 8841920",
  address: "House 14-B, Street 9, Phase 6, DHA, Karachi",
  role: "customer",
  sizePreference: "L",
  notifyDrop: true,
  createdAt: "2026-08-15T12:00:00.000Z",
};

const DEMO_ADMIN: User = {
  id: "usr-admin-01",
  name: "Studio Lead",
  email: "admin@flipmeet.studio",
  phone: "+92 300 0001122",
  address: "FlipMeet Studio HQ, Block 4, Clifton, Karachi",
  role: "admin",
  sizePreference: "XL",
  notifyDrop: true,
  createdAt: "2026-08-01T10:00:00.000Z",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password?: string) => {
        const normalizedEmail = email.trim().toLowerCase();

        // Check for admin credential
        if (normalizedEmail === "admin@flipmeet.studio" || normalizedEmail === "admin") {
          set({ user: DEMO_ADMIN, isAuthenticated: true });
          return { success: true };
        }

        // Check if existing logged-in user matches or create customer session
        const currentUser = get().user;
        if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
          set({ isAuthenticated: true });
          return { success: true };
        }

        // New or demo customer login
        const customerUser: User = {
          id: `usr-${Date.now().toString(36)}`,
          name: normalizedEmail.split("@")[0].toUpperCase() || "CUSTOMER",
          email: normalizedEmail,
          phone: "+92 300 0000000",
          address: "Delivery address not yet specified",
          role: "customer",
          sizePreference: "L",
          notifyDrop: true,
          createdAt: new Date().toISOString(),
        };

        set({ user: customerUser, isAuthenticated: true });
        return { success: true };
      },

      register: (data, password) => {
        if (!data.email || !data.name) {
          return { success: false, error: "Name and email are required." };
        }

        const newUser: User = {
          id: `usr-${Date.now().toString(36)}`,
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim() || "+92 300 0000000",
          address: data.address.trim() || "Delivery address pending",
          role: "customer",
          sizePreference: data.sizePreference || "L",
          notifyDrop: data.notifyDrop ?? true,
          createdAt: new Date().toISOString(),
        };

        set({ user: newUser, isAuthenticated: true });
        return { success: true };
      },

      loginAsDemo: (role: UserRole = "customer") => {
        const target = role === "admin" ? DEMO_ADMIN : DEMO_CUSTOMER;
        set({ user: target, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...updates,
            },
          };
        });
      },
    }),
    {
      name: "flipmeet-auth",
    }
  )
);
