import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  telefone: string | null;
  nome: string | null;
  userId: string | null;
  codigoVerificado: boolean;

  enviarCodigo: (telefone: string) => Promise<void>;
  verificarCodigo: (codigo: string) => Promise<boolean>;
  registrarNome: (nome: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  telefone: null,
  nome: null,
  userId: null,
  codigoVerificado: false,

  enviarCodigo: async (telefone: string) => {
    await new Promise(r => setTimeout(r, 1000));
    set({ telefone });
  },

  verificarCodigo: async (codigo: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (codigo.length === 4) {
      // NÃO seta isLoggedIn aqui — espera o nome
      set({ codigoVerificado: true, userId: 'user-001' });
      return true;
    }
    return false;
  },

  registrarNome: (nome: string) => {
    // Agora sim: tem nome → está logado
    set({ nome, isLoggedIn: true });
  },

  logout: () => {
    set({
      isLoggedIn: false,
      telefone: null,
      nome: null,
      userId: null,
      codigoVerificado: false,
    });
  },
}));