import { Redirect } from 'expo-router';
import { useAuthEntregadorStore } from '../src/store';
import { CourierApp } from '../src/CourierApp';

export default function Index() {
  const isLoggedIn = useAuthEntregadorStore(s => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return <CourierApp />;
}