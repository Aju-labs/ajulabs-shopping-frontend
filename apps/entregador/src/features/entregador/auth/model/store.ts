import { create } from 'zustand';

interface AuthEntregadorState {
  isLoggedIn: boolean;
  needsOnboarding: boolean;
  cpf: string | null;
  nome: string | null;
  entregadorId: string | null;
  login: (cpf: string) => void;
  register: () => void;
  logout: () => void;
}

export const useAuthEntregadorStore = create<AuthEntregadorState>((set) => ({
  isLoggedIn: false,
  needsOnboarding: false,
  cpf: null,
  nome: null,
  entregadorId: null,

  login: (cpf: string) => {
    set({ isLoggedIn: true, needsOnboarding: false, entregadorId: 'entregador-001', cpf, nome: 'Entregador' });
  },

  register: () => {
    set({ isLoggedIn: true, needsOnboarding: true, entregadorId: 'entregador-001', cpf: null, nome: null });
  },

  logout: () => {
    set({ isLoggedIn: false, needsOnboarding: false, cpf: null, nome: null, entregadorId: null });
  },
}));
