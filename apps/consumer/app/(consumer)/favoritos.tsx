import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';

type Aba = 'produtos' | 'lojas';

export default function FavoritosScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('produtos');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Favoritos</Text>
      </View>

      <View style={styles.tabs}>
        {(['produtos', 'lojas'] as Aba[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, aba === t && styles.tabActive]}
            onPress={() => setAba(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabTxt, aba === t && styles.tabTxtActive]}>
              {t === 'produtos' ? 'Produtos' : 'Lojas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.vazio}>
        <Ionicons name="heart-outline" size={56} color={colors.n300} />
        <Text style={styles.vazioTitulo}>
          Nenhum{aba === 'lojas' ? 'a' : ''} {aba === 'produtos' ? 'produto' : 'loja'} favoritad{aba === 'lojas' ? 'a' : 'o'}
        </Text>
        <Text style={styles.vazioTxt}>
          Toque no coração {aba === 'produtos' ? 'de um produto' : 'de uma loja'} para salvar aqui
        </Text>
        <TouchableOpacity
          style={styles.btnExplorar}
          onPress={() => router.push('/(consumer)/vitrines')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnExplorarTxt}>Explorar vitrines</Text>
        </TouchableOpacity>
      </View>
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
  tabs:           { flexDirection: 'row', backgroundColor: colors.n0,
                    borderBottomWidth: 1, borderBottomColor: colors.n100 },
  tab:            { flex: 1, paddingVertical: 14, alignItems: 'center',
                    borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:      { borderBottomColor: colors.orange },
  tabTxt:         { fontSize: 14, fontWeight: '600', color: colors.n500 },
  tabTxtActive:   { color: colors.orange },
  vazio:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  vazioTitulo:    { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: 8 },
  vazioTxt:       { fontSize: 13, color: colors.n600, textAlign: 'center', lineHeight: 20 },
  btnExplorar:    { marginTop: 12, paddingHorizontal: 28, paddingVertical: 13,
                    backgroundColor: colors.orange, borderRadius: 14 },
  btnExplorarTxt: { color: colors.n0, fontSize: 14, fontWeight: '700' },
});
