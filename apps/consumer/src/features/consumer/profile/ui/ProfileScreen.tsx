import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';
import { ProfileHeader } from './ProfileHeader';
import { ProfileMenu } from './ProfileMenu';
import { useAuthStore } from '../../../../store';

export function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore(s => s.logout);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const menuPrincipal = [
    {
      icon: 'receipt-outline',
      label: 'Meus pedidos',
      badge: '3',
      onPress: () => router.push('/(consumer)/pedidos'),
    },
    {
      icon: 'location-outline',
      label: 'Endereços',
      onPress: () => router.push('/(consumer)/enderecos'),
    },
    {
      icon: 'card-outline',
      label: 'Formas de pagamento',
      onPress: () => router.push('/(consumer)/pagamento'),
    },
    {
      icon: 'heart-outline',
      label: 'Favoritos',
      onPress: () => router.push('/(consumer)/favoritos'),
    },
  ];

  const menuConfig = [
    {
      icon: 'notifications-outline',
      label: 'Notificações',
      onPress: () => router.push('/(consumer)/notificacoes'),
    },
    {
      icon: 'settings-outline',
      label: 'Ajustes',
      onPress: () => router.push('/(consumer)/ajustes'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Ajuda e suporte',
      onPress: () => Alert.alert('Em breve', 'Suporte em desenvolvimento'),
    },
  ];

  const handleLogout = () => setLogoutVisible(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProfileHeader />

        <View style={{ marginTop: 14 }}>
          <ProfileMenu items={menuPrincipal} />
        </View>

        <View style={{ marginTop: 14 }}>
          <ProfileMenu items={menuConfig} />
        </View>

        {/* Sair */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={17} color="#A32D2D" />
          <Text style={styles.logoutTxt}>Sair da conta</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Shopping Digital · v1.0 · by <Text style={{ color: colors.orange, fontWeight: '600' }}>AjuLabs</Text>
        </Text>
      </ScrollView>

      <Modal visible={logoutVisible} transparent animationType="fade" onRequestClose={() => setLogoutVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="log-out-outline" size={28} color="#A32D2D" />
            </View>
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalMsg}>Tem certeza que deseja sair da sua conta?</Text>
            <TouchableOpacity style={styles.modalBtnSair} onPress={() => { setLogoutVisible(false); logout(); }} activeOpacity={0.8}>
              <Text style={styles.modalBtnSairText}>Sim, quero sair</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setLogoutVisible(false)} activeOpacity={0.8}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FAFBFE' },

  header:     { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
                backgroundColor: colors.n0, borderBottomWidth: 1, borderBottomColor: colors.n100 },
  titulo:     { fontSize: 20, fontWeight: '700', color: colors.navy },

  scroll:     { padding: 16, paddingBottom: 40 },

  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 20, paddingVertical: 14,
                backgroundColor: '#FCEBEB', borderRadius: 14 },
  logoutTxt:  { fontSize: 14, fontWeight: '600', color: '#A32D2D' },

  footer:     { textAlign: 'center', marginTop: 20, fontSize: 11,
                color: colors.n500, letterSpacing: 0.3 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  modalMsg: { fontSize: 13, color: colors.n500, textAlign: 'center', marginBottom: 22, lineHeight: 19 },
  modalBtnSair: {
    width: '100%',
    backgroundColor: '#A32D2D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnSairText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  modalBtnCancel: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.n100,
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '600', color: colors.navy },
});