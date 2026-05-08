import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';

interface Config {
  id: string;
  label: string;
  descricao: string;
  ativo: boolean;
}

const CONFIGS_INICIAIS: Config[] = [
  { id: 'pedido_status',  label: 'Status do pedido',     descricao: 'Confirmação, preparação e entrega',       ativo: true },
  { id: 'promocoes',      label: 'Promoções',             descricao: 'Ofertas especiais das lojas parceiras',   ativo: true },
  { id: 'novos_produtos', label: 'Novos produtos',        descricao: 'Lançamentos das lojas que você acompanha', ativo: false },
  { id: 'chat',           label: 'Chat com a Aju',        descricao: 'Sugestões e novidades da assistente',     ativo: true },
  { id: 'app',            label: 'Atualizações do app',   descricao: 'Novidades e melhorias do AjuLabs',        ativo: false },
];

export default function NotificacoesScreen() {
  const router = useRouter();
  const [configs, setConfigs] = useState(CONFIGS_INICIAIS);

  const toggle = (id: string) =>
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Notificações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.descricao}>
          Escolha quais notificações você quer receber do AjuLabs Shopping.
        </Text>

        <View style={styles.card}>
          {configs.map((config, i) => (
            <View key={config.id} style={[styles.row, i < configs.length - 1 && styles.rowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{config.label}</Text>
                <Text style={styles.rowDesc}>{config.descricao}</Text>
              </View>
              <Switch
                value={config.ativo}
                onValueChange={() => toggle(config.id)}
                trackColor={{ false: colors.n200, true: colors.orange }}
                thumbColor={colors.n0}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FAFBFE' },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
                backgroundColor: colors.n0, borderBottomWidth: 1, borderBottomColor: colors.n100 },
  btnBack:    { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.n50,
                alignItems: 'center', justifyContent: 'center' },
  titulo:     { fontSize: 20, fontWeight: '700', color: colors.navy },
  scroll:     { padding: 16, paddingBottom: 40 },
  descricao:  { fontSize: 13, color: colors.n600, marginBottom: 16, lineHeight: 20 },
  card:       { backgroundColor: colors.n0, borderRadius: 16, borderWidth: 1,
                borderColor: colors.n200, overflow: 'hidden' },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 14,
                paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.n100 },
  rowLabel:   { fontSize: 14, fontWeight: '600', color: colors.navy },
  rowDesc:    { fontSize: 12, color: colors.n600, marginTop: 2, lineHeight: 16 },
});
