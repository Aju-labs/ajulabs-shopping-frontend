import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';

const APP_VERSION = '1.0.0';

export default function AjustesScreen() {
  const router = useRouter();
  const [historiocoLimpo, setHistoricoLimpo] = useState(false);

  const handleLimparHistorico = () => {
    const confirmar = () => {
      setHistoricoLimpo(true);
      Alert.alert('Concluído', 'Histórico de busca limpo com sucesso.');
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Limpar histórico de busca?')) confirmar();
    } else {
      Alert.alert('Limpar histórico', 'Deseja limpar seu histórico de busca?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Links legais */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={() => Linking.openURL('https://ajulabs.com/termos').catch(() => {})}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons name="document-text-outline" size={17} color={colors.orange600} />
            </View>
            <Text style={styles.rowLabel}>Termos de uso</Text>
            <Ionicons name="open-outline" size={15} color={colors.n500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://ajulabs.com/privacidade').catch(() => {})}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark-outline" size={17} color={colors.orange600} />
            </View>
            <Text style={styles.rowLabel}>Política de privacidade</Text>
            <Ionicons name="open-outline" size={15} color={colors.n500} />
          </TouchableOpacity>
        </View>

        {/* Histórico de busca */}
        <View style={[styles.card, { marginTop: 14 }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleLimparHistorico}
            disabled={historiocoLimpo}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FCEBEB' }]}>
              <Ionicons name="trash-outline" size={17} color="#A32D2D" />
            </View>
            <Text style={[styles.rowLabel, historiocoLimpo && { color: colors.n500 }]}>
              Limpar histórico de busca
            </Text>
            {historiocoLimpo && (
              <View style={styles.limpoBadge}>
                <Text style={styles.limpoBadgeTxt}>Limpo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <View style={styles.versaoCard}>
          <View style={styles.versaoLogo}>
            <Ionicons name="storefront" size={24} color={colors.orange} />
          </View>
          <Text style={styles.versaoApp}>AjuLabs Shopping</Text>
          <Text style={styles.versaoNum}>Versão {APP_VERSION}</Text>
          <Text style={styles.versaoDesc}>Feito com carinho em Aracaju, SE</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FAFBFE' },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
                    backgroundColor: colors.n0, borderBottomWidth: 1, borderBottomColor: colors.n100 },
  btnBack:        { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.n50,
                    alignItems: 'center', justifyContent: 'center' },
  titulo:         { fontSize: 20, fontWeight: '700', color: colors.navy },
  scroll:         { padding: 16, paddingBottom: 40 },
  card:           { backgroundColor: colors.n0, borderRadius: 16, borderWidth: 1,
                    borderColor: colors.n200, overflow: 'hidden' },
  row:            { flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: colors.n100 },
  iconBox:        { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.orange100,
                    alignItems: 'center', justifyContent: 'center' },
  rowLabel:       { flex: 1, fontSize: 14, fontWeight: '500', color: colors.navy },
  limpoBadge:     { backgroundColor: colors.n100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  limpoBadgeTxt:  { fontSize: 11, fontWeight: '600', color: colors.n600 },
  versaoCard:     { alignItems: 'center', marginTop: 32, paddingVertical: 24, gap: 4 },
  versaoLogo:     { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.orange100,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  versaoApp:      { fontSize: 16, fontWeight: '700', color: colors.navy },
  versaoNum:      { fontSize: 13, color: colors.n600, marginTop: 2 },
  versaoDesc:     { fontSize: 12, color: colors.n500, marginTop: 4 },
});
