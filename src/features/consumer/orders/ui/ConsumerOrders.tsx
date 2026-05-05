// src/features/consumer/orders/ui/ConsumerOrders.tsx
import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Pressable, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Tipos ────────────────────────────────────────────────────
type OrderStatus = 'aguardando_pagamento' | 'aguardando_loja' | 'finalizado' | 'cancelado';

interface OrderItem {
  nome: string;
  preco: number;
}

interface TimelineStep {
  label: string;
  subtitle?: string;
  state: 'done' | 'active' | 'pending' | 'cancelled';
}

interface Order {
  id: string;
  numero: string;
  loja: string;
  lojaIcon: string;
  data: string;
  total: number;
  status: OrderStatus;
  motivoCancelamento?: string;
  podeRecomprar?: boolean;
  itens: OrderItem[];
  timeline: TimelineStep[];
  entregaEstimada?: string;
}

type TabKey = 'todos' | 'processando' | 'finalizado' | 'cancelado';

interface ConsumerOrdersProps {
  dark?: boolean;
}

// ─── Helpers de status ────────────────────────────────────────
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'aguardando_pagamento': return 'Aguardando pagamento';
    case 'aguardando_loja':      return 'Aguardando loja';
    case 'finalizado':           return 'Entregue';
    case 'cancelado':            return 'Cancelado';
  }
}

function getStatusGroup(status: OrderStatus): 'processando' | 'finalizado' | 'cancelado' {
  if (status === 'finalizado') return 'finalizado';
  if (status === 'cancelado')  return 'cancelado';
  return 'processando';
}

// ─── Dados mock (substituir por store/service) ────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    numero: '#3821',
    loja: 'Sapataria Aracaju',
    lojaIcon: '👟',
    data: '02 Mai 2026',
    total: 189.90,
    status: 'aguardando_pagamento',
    itens: [{ nome: 'Tênis Casual Branco (41)', preco: 189.90 }],
    entregaEstimada: '05–07 Mai 2026',
    timeline: [
      { label: 'Pedido realizado',      subtitle: '02/05 às 14:32', state: 'done' },
      { label: 'Aguardando pagamento',  subtitle: 'Pague para continuar', state: 'active' },
      { label: 'Loja confirmando',      subtitle: 'Pendente',       state: 'pending' },
      { label: 'Entrega',               subtitle: 'Pendente',       state: 'pending' },
    ],
  },
  {
    id: '2',
    numero: '#3714',
    loja: 'Lingerie Bella SE',
    lojaIcon: '👙',
    data: '18 Abr 2026',
    total: 134.50,
    status: 'finalizado',
    podeRecomprar: true,
    itens: [
      { nome: 'Conjunto Renda Nude (M)', preco: 89.90 },
      { nome: 'Body Strappy Preto (P)',  preco: 44.60 },
    ],
    timeline: [
      { label: 'Pedido realizado',        subtitle: '18/04 às 10:15', state: 'done' },
      { label: 'Pagamento confirmado',    subtitle: '18/04 às 10:18', state: 'done' },
      { label: 'Pedido despachado',       subtitle: '19/04 às 09:00', state: 'done' },
      { label: 'Entregue com sucesso',    subtitle: '21/04 às 14:45', state: 'done' },
    ],
  },
  {
    id: '3',
    numero: '#3690',
    loja: 'Joias da Bahia',
    lojaIcon: '💍',
    data: '10 Abr 2026',
    total: 320.00,
    status: 'cancelado',
    motivoCancelamento: 'Produto sem estoque no momento',
    itens: [{ nome: 'Anel Solitário Prata 925', preco: 320.00 }],
    timeline: [
      { label: 'Pedido realizado',     subtitle: '10/04 às 16:22', state: 'done' },
      { label: 'Cancelado pela loja',  subtitle: '10/04 às 18:00 · Produto sem estoque', state: 'cancelled' },
    ],
  },
  {
    id: '4',
    numero: '#3501',
    loja: 'ModaSE Boutique',
    lojaIcon: '👗',
    data: '28 Mar 2026',
    total: 210.00,
    status: 'finalizado',
    itens: [
      { nome: 'Vestido Floral Verão (G)', preco: 130.00 },
      { nome: 'Blusa Cropped (M)',        preco: 80.00 },
    ],
    timeline: [
      { label: 'Pedido realizado',      subtitle: '28/03 às 11:00', state: 'done' },
      { label: 'Pagamento confirmado',  subtitle: '28/03 às 11:03', state: 'done' },
      { label: 'Pedido despachado',     subtitle: '29/03 às 08:30', state: 'done' },
      { label: 'Entregue com sucesso',  subtitle: '31/03 às 17:20', state: 'done' },
    ],
  },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'todos',        label: 'Todos' },
  { key: 'processando',  label: 'Em andamento' },
  { key: 'finalizado',   label: 'Finalizados' },
  { key: 'cancelado',    label: 'Cancelados' },
];

// ─── Dot de timeline ──────────────────────────────────────────
function TimelineDot({ state }: { state: TimelineStep['state'] }) {
  const bg =
    state === 'done'      ? '#046C2E' :
    state === 'active'    ? colors.orange :
    state === 'cancelled' ? '#A32D2D' :
    colors.n200;
  return <View style={[styles.tlDot, { backgroundColor: bg }]} />;
}

// ─── Badge de status ──────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const isProcessando = status === 'aguardando_pagamento' || status === 'aguardando_loja';
  const bg   = status === 'finalizado'  ? 'rgba(57,255,137,0.15)'  :
               status === 'cancelado'   ? 'rgba(226,75,74,0.1)'    :
               'rgba(55,138,221,0.1)';
  const text = status === 'finalizado'  ? '#046C2E' :
               status === 'cancelado'   ? '#A32D2D' :
               '#185FA5';
  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <View style={[styles.statusDot, { backgroundColor: text }]} />
      <Text style={[styles.statusText, { color: text }]}>{getStatusLabel(status)}</Text>
    </View>
  );
}

// ─── Card de pedido ───────────────────────────────────────────
function OrderCard({ order, dark }: { order: Order; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const textColor = dark ? colors.n0    : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const surface   = dark ? '#111638'    : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  }, []);

  const handleRecomprar = useCallback(() => {
    // TODO: conectar com cartStore para adicionar itens
    router.push('/(consumer)/carrinho');
  }, [router]);

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      {/* Header clicável */}
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.cardHeader, pressed && { opacity: 0.75 }]}
      >
        <View style={styles.storeIcon}>
          <Text style={{ fontSize: 18 }}>{order.lojaIcon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardStore, { color: textColor }]} numberOfLines={1}>
            {order.loja}
          </Text>
          <Text style={[styles.cardMeta, { color: subColor }]}>
            {order.numero} · {order.data}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardPrice, { color: textColor }]}>
            R$ {order.total.toFixed(2).replace('.', ',')}
          </Text>
          <View style={{ gap: 3 }}>
            <StatusBadge status={order.status} />
            {order.podeRecomprar && (
              <View style={styles.recomprarBadge}>
                <View style={[styles.statusDot, { backgroundColor: colors.orange600 }]} />
                <Text style={[styles.statusText, { color: colors.orange600 }]}>Comprar novamente</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.chevron, { color: subColor, transform: [{ rotate: open ? '90deg' : '0deg' }] }]}>
          ›
        </Text>
      </Pressable>

      {/* Detalhe accordion */}
      {open && (
        <View style={[styles.cardDetail, { borderTopColor: border }]}>
          {/* Itens */}
          <View style={styles.itemsList}>
            {order.itens.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={[styles.itemNome, { color: subColor }]} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={[styles.itemPreco, { color: textColor }]}>
                  R$ {item.preco.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.separator, { backgroundColor: border }]} />

          {/* Timeline */}
          <View style={styles.timeline}>
            {order.timeline.map((step, i) => {
              const isLast = i === order.timeline.length - 1;
              const lineDone = step.state === 'done';
              return (
                <View key={i} style={styles.tlItem}>
                  <View style={styles.tlLeft}>
                    <TimelineDot state={step.state} />
                    {!isLast && (
                      <View style={[styles.tlLine, { backgroundColor: lineDone ? '#046C2E' : border }]} />
                    )}
                  </View>
                  <View style={[styles.tlText, isLast && { paddingBottom: 0 }]}>
                    <Text style={[styles.tlLabel, { color: textColor }]}>{step.label}</Text>
                    {step.subtitle && (
                      <Text style={[styles.tlSub, { color: subColor }]}>{step.subtitle}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Info extra */}
          {order.entregaEstimada && (
            <View style={[styles.infoRow, { borderTopColor: border }]}>
              <Text style={[styles.infoLabel, { color: subColor }]}>Entrega estimada</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{order.entregaEstimada}</Text>
            </View>
          )}
          {order.motivoCancelamento && (
            <View style={[styles.infoRow, { borderTopColor: border }]}>
              <Text style={[styles.infoLabel, { color: subColor }]}>Motivo</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{order.motivoCancelamento}</Text>
            </View>
          )}

          {/* Botão recomprar */}
          {order.podeRecomprar && (
            <TouchableOpacity style={styles.btnRecomprar} onPress={handleRecomprar} activeOpacity={0.85}>
              <Text style={styles.btnRecomprarText}>+ Comprar novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────
export function ConsumerOrders({ dark = false }: ConsumerOrdersProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('todos');

  const textColor = dark ? colors.n0    : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const bgMain    = dark ? '#0B0F22'    : colors.n50;
  const surface   = dark ? '#111638'    : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  const filteredOrders = MOCK_ORDERS.filter(o => {
    if (activeTab === 'todos') return true;
    return getStatusGroup(o.status) === activeTab;
  });

  const totalPendentes = MOCK_ORDERS.filter(
    o => o.status === 'aguardando_pagamento' || o.status === 'aguardando_loja'
  ).length;

  return (
    <View style={[styles.container, { backgroundColor: bgMain }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity style={styles.btnBack} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={[styles.btnBackIcon, { color: textColor }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Meus pedidos</Text>
        {totalPendentes > 0 && (
          <View style={styles.badgeTotal}>
            <Text style={styles.badgeTotalText}>{totalPendentes}</Text>
          </View>
        )}
      </View>

      {/* Abas */}
      <View style={[styles.tabsWrapper, { backgroundColor: surface, borderBottomColor: border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, active && { borderBottomColor: colors.orange }]}
              >
                <Text style={[styles.tabText, { color: active ? textColor : subColor },
                  active && { fontWeight: '600' }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🛍️</Text>
            <Text style={[styles.emptyText, { color: subColor }]}>
              Nenhum pedido nessa categoria ainda.
            </Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} dark={dark} />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },

  // Header
  header:          { flexDirection: 'row', alignItems: 'center', gap: 10,
                     paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  btnBack:         { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEF0F7',
                     alignItems: 'center', justifyContent: 'center' },
  btnBackIcon:     { fontSize: 22, lineHeight: 28, marginTop: -2 },
  headerTitle:     { fontWeight: '600', fontSize: 18, letterSpacing: -0.3, flex: 1 },
  badgeTotal:      { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.orange,
                     alignItems: 'center', justifyContent: 'center' },
  badgeTotalText:  { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Abas
  tabsWrapper:     { borderBottomWidth: 1 },
  tabs:            { paddingHorizontal: 16, gap: 0 },
  tab:             { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 2,
                     borderBottomColor: 'transparent' },
  tabText:         { fontSize: 13, fontWeight: '500' },

  // Lista
  list:            { paddingTop: 14, paddingHorizontal: 16 },

  // Card
  card:            { borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  storeIcon:       { width: 42, height: 42, borderRadius: 10, backgroundColor: '#FFEAD4',
                     alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo:        { flex: 1, minWidth: 0 },
  cardStore:       { fontSize: 13.5, fontWeight: '600', letterSpacing: -0.2 },
  cardMeta:        { fontSize: 11, marginTop: 2 },
  cardRight:       { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  cardPrice:       { fontSize: 14, fontWeight: '700' },
  chevron:         { fontSize: 22, lineHeight: 26, marginTop: -2 },

  // Status badge
  statusBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4,
                     paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  recomprarBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4,
                     paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
                     backgroundColor: '#FFEAD4' },
  statusDot:       { width: 6, height: 6, borderRadius: 3 },
  statusText:      { fontSize: 10.5, fontWeight: '600' },

  // Detalhe
  cardDetail:      { borderTopWidth: 1, padding: 14, gap: 12 },
  itemsList:       { gap: 4 },
  itemRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemNome:        { fontSize: 12, flex: 1, marginRight: 8 },
  itemPreco:       { fontSize: 12, fontWeight: '500', flexShrink: 0 },
  separator:       { height: 1 },

  // Timeline
  timeline:        { gap: 0 },
  tlItem:          { flexDirection: 'row', gap: 10 },
  tlLeft:          { alignItems: 'center', width: 16 },
  tlDot:           { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  tlLine:          { width: 2, flex: 1, marginVertical: 2, minHeight: 18 },
  tlText:          { flex: 1, paddingBottom: 14 },
  tlLabel:         { fontSize: 12.5, fontWeight: '600' },
  tlSub:           { fontSize: 11, marginTop: 1 },

  // Info extra
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between',
                     borderTopWidth: 1, paddingTop: 10 },
  infoLabel:       { fontSize: 12 },
  infoValue:       { fontSize: 12, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  // Botão recomprar
  btnRecomprar:    { height: 40, borderRadius: 10, backgroundColor: colors.orange,
                     alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnRecomprarText:{ color: '#fff', fontSize: 13.5, fontWeight: '600' },

  // Empty state
  emptyState:      { alignItems: 'center', paddingTop: 60 },
  emptyText:       { fontSize: 14, textAlign: 'center' },
});