import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Switch, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'entregador_notif_prefs';

interface Prefs {
  novaCorrida:  boolean;
  corridaAceita: boolean;
  pagamento:    boolean;
  promocoes:    boolean;
}

const DEFAULT_PREFS: Prefs = {
  novaCorrida:   true,
  corridaAceita: true,
  pagamento:     true,
  promocoes:     false,
};

const ITEMS: { key: keyof Prefs; icon: string; title: string; sub: string }[] = [
  { key: 'novaCorrida',   icon: 'bicycle',    title: 'Nova corrida disponível', sub: 'Avisa quando uma corrida estiver próxima de você' },
  { key: 'corridaAceita', icon: 'checkmark-circle', title: 'Corrida aceita',   sub: 'Confirma quando o pedido for atribuído a você' },
  { key: 'pagamento',     icon: 'flash',      title: 'Pagamento processado',   sub: 'Notifica cada vez que você receber um valor' },
  { key: 'promocoes',     icon: 'gift',       title: 'Promoções e novidades',  sub: 'Bônus, campanhas e atualizações do app' },
];

interface Props { onBack: () => void }

export function NotificacoesScreen({ onBack }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved]  = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(raw => {
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    }).catch(() => {});
  }, []);

  const toggle = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color="#000933" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notificações</Text>
        {saved && (
          <View style={s.savedBadge}>
            <Ionicons name="checkmark" size={12} color="#039855" />
            <Text style={s.savedText}>Salvo</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.desc}>
          Escolha quais notificações deseja receber. Você pode alterar a qualquer momento.
        </Text>

        <View style={s.card}>
          {ITEMS.map((item, i) => (
            <View
              key={item.key}
              style={[s.row, i < ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' }]}
            >
              <View style={s.rowIcon}>
                <Ionicons name={item.icon as any} size={18} color="#F2760F" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.rowTitle}>{item.title}</Text>
                <Text style={s.rowSub}>{item.sub}</Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#E4E7F1', true: 'rgba(242,118,15,0.35)' }}
                thumbColor={prefs[item.key] ? '#F2760F' : '#FFFFFF'}
              />
            </View>
          ))}
        </View>

        <View style={s.infoBox}>
          <Ionicons name="information-circle" size={16} color="#209CEF" />
          <Text style={s.infoText}>
            As notificações de nova corrida e pagamento são essenciais para o funcionamento do app. Recomendamos mantê-las ativadas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F6F7FB' },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E4E7F1' },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F6F7FB', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: '#000933', flex: 1 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(3,152,85,0.1)', borderRadius: 99 },
  savedText:  { fontSize: 11, fontWeight: '700', color: '#039855' },
  content:    { padding: 16, paddingBottom: 40 },
  desc:       { fontSize: 13, color: '#9099B3', lineHeight: 19, marginBottom: 16 },
  card:       { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E4E7F1', overflow: 'hidden', marginBottom: 16 },
  row:        { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowIcon:    { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FEF0E3', alignItems: 'center', justifyContent: 'center' },
  rowTitle:   { fontSize: 14, fontWeight: '600', color: '#000933', marginBottom: 2 },
  rowSub:     { fontSize: 11, color: '#9099B3', lineHeight: 15 },
  infoBox:    { flexDirection: 'row', gap: 8, padding: 14, backgroundColor: 'rgba(32,156,239,0.08)', borderRadius: 12 },
  infoText:   { flex: 1, fontSize: 12, color: '#2A3156', lineHeight: 18 },
});
