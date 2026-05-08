import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../src/features/entregador/onboarding';

export default function CadastroPage() {
  const router = useRouter();
  return (
    <OnboardingScreen
      onDone={(r) => {
        if (r === 'cancel') router.back();
        // 'submitted' → _layout.tsx redireciona automaticamente para '/' via isLoggedIn
      }}
    />
  );
}
