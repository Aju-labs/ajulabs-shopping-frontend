import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme';
import { LOJAS, getLojasAbertas } from '@/src/mock/mock-data';
import type { Loja } from '@/src/types';

interface VitrinasScreenProps {
  dark?: boolean;
}

// ── Imagem com fallback ────────────────────────────────────────
function LojaImg({ uri, nome }: { uri: string; nome: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <View style={styles.imgFallback}>
        <Text style={styles.imgFallbackText}>{nome.charAt(0)}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={styles.cardImg}
      onError={() => setError(true)}
    />
  );
}

// ── Estrelas ───────────────────────────────────────────────────
function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(value) ? '★' : '☆');
  return <Text style={styles.stars}>{stars.join('')}</Text>;
}

// ── Card de cada loja ──────────────────────────────────────────
interface LojaCardProps {
  loja: Loja;
  onPress: (id: string) => void;
  dark: boolean;
}

function LojaCard({ loja, onPress, dark }: LojaCardProps) {
  const textColor = dark ? colors.n0     : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const surface   = dark ? colors.surfDark : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  const handlePress = useCallback(() => onPress(loja.id), [loja.id, onPress]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: border }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <LojaImg uri={loja.imagem} nome={loja.nome} />

      <View style={styles.cardInfo}>
        <Text style={[styles.cardNome, { color: textColor }]} numberOfLines={1}>
          {loja.nome}
        </Text>

        <Text style={[styles.cardSub, { color: subColor }]}>
          {loja.endereco.bairro} · {loja.tempoEntregaMin}–{loja.tempoEntregaMax} min
        </Text>

        <View style={styles.cardRow}>
          <Stars value={loja.avaliacao} />
          <Text style={[styles.cardAval, { color: subColor }]}>
            · {loja.totalAvaliacoes} avaliações
          </Text>
          {loja.taxaEntrega === 0 && (
            <View style={styles.badgeMint}>
              <Text style={styles.badgeMintText}>Frete grátis</Text>
            </View>
          )}
        </View>

        {!loja.aberta && (
          <View style={styles.badgeFechado}>
            <Text style={styles.badgeFechadoText}>Fechado agora</Text>
          </View>
        )}
      </View>

      <Text style={{ color: subColor, fontSize: 20, alignSelf: 'center' }}>›</Text>
    </TouchableOpacity>
  );
}

// ── Tela principal ─────────────────────────────────────────────
export default function VitrinasScreen({ dark = false }: VitrinasScreenProps) {
  const [busca, setBusca] = useState('');
  const router = useRouter();

  const textColor = dark ? colors.n0 : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const bgMain    = dark ? colors.bgDark : '#FAFBFE';
  const surface   = dark ? colors.surfDark : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  const lojasFiltradas = LOJAS.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase()) ||
    l.endereco.bairro.toLowerCase().includes(busca.toLowerCase())
  );

  const handleAbrirVitrine = useCallback((id: string) => {
    router.push(`/(consumer)/vitrine/${id}`);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: bgMain }]}>

      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Text style={[styles.titulo, { color: textColor }]}>
          Lojas em Aracaju
        </Text>
        <Text style={[styles.subtitulo, { color: subColor }]}>
          {LOJAS.length} lojas parceiras · entrega em até 50 min
        </Text>

        {/* Campo de busca */}
        <View style={[styles.buscaWrapper, {
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : colors.n50,
          borderColor: border,
        }]}>
          <Text style={{ color: subColor, fontSize: 16 }}>🔍</Text>
          <TextInput
            style={[styles.buscaInput, { color: textColor }]}
            placeholder="Buscar lojas ou bairros…"
            placeholderTextColor={subColor}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={lojasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LojaCard loja={item} onPress={handleAbrirVitrine} dark={dark} />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.vazio, { color: subColor }]}>
            Nenhuma loja encontrada.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1 },
  titulo:          { fontWeight: '700', fontSize: 22, letterSpacing: -0.3 },
  subtitulo:       { fontSize: 13, marginTop: 4 },
  buscaWrapper:    { flexDirection: 'row', alignItems: 'center', gap: 10,
                     borderWidth: 1, borderRadius: 14,
                     paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
  buscaInput:      { flex: 1, fontSize: 14, padding: 0 },
  lista:           { padding: 16, gap: 12 },
  card:            { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  cardImg:         { width: 64, height: 64, borderRadius: 10 },
  imgFallback:     { width: 64, height: 64, borderRadius: 10,
                     backgroundColor: colors.orange100,
                     alignItems: 'center', justifyContent: 'center' },
  imgFallbackText: { fontSize: 24, fontWeight: '700', color: colors.orange600 },
  cardInfo:        { flex: 1, minWidth: 0 },
  cardNome:        { fontSize: 14, fontWeight: '600', lineHeight: 17 },
  cardSub:         { fontSize: 11, marginTop: 2 },
  cardRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  cardAval:        { fontSize: 11 },
  stars:           { color: '#F2760F', fontSize: 11, letterSpacing: 1 },
  badgeMint:       { backgroundColor: 'rgba(57,255,137,0.15)',
                     paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, marginLeft: 4 },
  badgeMintText:   { fontSize: 10, fontWeight: '600', color: '#046C2E' },
  badgeFechado:    { marginTop: 6, backgroundColor: 'rgba(107,115,144,0.15)',
                     paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start' },
  badgeFechadoText:{ fontSize: 10, fontWeight: '600', color: '#6B7390' },
  vazio:           { textAlign: 'center', marginTop: 40, fontSize: 14 },
});