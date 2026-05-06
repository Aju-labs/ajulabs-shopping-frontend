import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@ajulabs/theme';
import { useAuthStore } from '../../../../store';

export function RegisterNameScreen() {
  const router = useRouter();
  const registrarNome = useAuthStore(s => s.registrarNome);
  const [nome, setNome] = useState('');

  const valido = nome.trim().length >= 2;

  function handleContinuar() {
    if (!valido) return;
    registrarNome(nome.trim());
    router.replace('/(consumer)/chat');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="person-circle-outline" size={56} color={colors.orange} />
        </View>

        <Text style={styles.titulo}>Como podemos te chamar?</Text>
        <Text style={styles.descricao}>
          Esse nome aparece nos seus pedidos e no chat com a Aju
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor={colors.n300}
          value={nome}
          onChangeText={setNome}
          autoFocus
          autoCapitalize="words"
          maxLength={50}
        />

        <TouchableOpacity
          style={[styles.btn, !valido && styles.btnDisabled]}
          onPress={handleContinuar}
          activeOpacity={0.9}
          disabled={!valido}
        >
          <Text style={styles.btnTxt}>Começar a comprar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FAFBFE' },
  content:    { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  iconBox:    { alignItems: 'center', marginBottom: 24 },

  titulo:     { fontSize: 22, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  descricao:  { fontSize: 13, color: colors.n600, lineHeight: 18, marginBottom: 24 },

  input:      { backgroundColor: colors.n0, borderRadius: 14, borderWidth: 1.5,
                borderColor: colors.n200, paddingHorizontal: 16, height: 52,
                fontSize: 16, color: colors.navy, fontWeight: '500' },

  btn:        { backgroundColor: colors.orange, height: 52, borderRadius: 14,
                alignItems: 'center', justifyContent: 'center', marginTop: 16,
                shadowColor: colors.orange, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 14, elevation: 4 },
  btnDisabled:{ opacity: 0.5 },
  btnTxt:     { color: '#fff', fontSize: 15, fontWeight: '700' },
});
