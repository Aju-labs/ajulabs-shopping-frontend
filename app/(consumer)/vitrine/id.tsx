import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ScrollView, Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/src/theme';
import { getLojaById, getProdutosByLoja } from '@/src/mock/mock-data';
import type { Produto } from '@/src/types';

interface VitrineScreenProps {
  dark?: boolean;
}

// ── Estrelas ───────────────────────────────────────────────────
function Stars({ value, size = 12 }: { value: number; size?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(value) ? '★' : '☆');
  return <Text style={{ color: colors.orange, fontSize: size, letterSpacing: 1 }}>{stars.join('')}</Text>;
}

// ── Imagem com fallback ────────────────────────────────────────
function ProductImg({
  uri, alt, width, height, borderRadius = 0,
}: {
  uri: string; alt: string;
  width: number; height: number; borderRadius?: number;
}) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <View style={{ width, height, borderRadius, backgroundColor: colors.orange100,
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: height * 0.3, fontWeight: '700', color: colors.orange600 }}>
          {alt.charAt(0)}
        </Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius }}
      onError={() => setError(true)}
    />
  );
}

// ── Card de produto ────────────────────────────────────────────
function ProdutoCard({ produto, onAdd, dark }: { produto: Produto; onAdd: (id: string) => void; dark: boolean }) {
  const textColor = dark ? colors.n0 : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const surface   = dark ? colors.surfDark : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  const handleAdd = useCallback(() => onAdd(produto.id), [produto.id, onAdd]);

  return (
    <View style={[styles.prodCard, { backgroundColor: surface, borderColor: border }]}>
      <View>
        <ProductImg uri={produto.imagem} alt={produto.nome} width={160} height={130} />
        {produto.destaque && (
          <View style={styles.badgeDestaque}>
            <Text style={styles.badgeDestaqueText}>⭐ Destaque</Text>
          </View>
        )}
        {!produto.disponivel && (
          <View style={styles.badgeIndisponivel}>
            <Text style={styles.badgeIndisponivelText}>Indisponível</Text>
          </View>
        )}
      </View>

      <View style={styles.prodInfo}>
        <Text style={[styles.prodNome, { color: textColor }]} numberOfLines={2}>
          {produto.nome}
        </Text>
        <Text style={[styles.prodDesc, { color: subColor }]} numberOfLines={2}>
          {produto.descricao}
        </Text>
        <Text style={[styles.prodPreco, { color: textColor }]}>
          R$ {produto.preco.toFixed(2).replace('.', ',')}
        </Text>

        <TouchableOpacity
          style={[styles.btnAdicionar, !produto.disponivel && { opacity: 0.4 }]}
          onPress={handleAdd}
          disabled={!produto.disponivel}
          activeOpacity={0.8}
        >
          <Text style={styles.btnAdicionarText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Tela principal ─────────────────────────────────────────────
export default function VitrineScreen({ dark = false }: VitrineScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [catSelecionada, setCatSelecionada] = useState('Todos');

  const loja = getLojaById(id);
  const produtos = loja ? getProdutosByLoja(loja.id) : [];

  const textColor = dark ? colors.n0 : colors.navy;
  const subColor  = dark ? 'rgba(255,255,255,0.6)' : colors.n600;
  const bgMain    = dark ? colors.bgDark : '#FAFBFE';
  const surface   = dark ? colors.surfDark : colors.n0;
  const border    = dark ? 'rgba(255,255,255,0.06)' : colors.n200;

  if (!loja) {
    return (
      <View style={[styles.container, { backgroundColor: bgMain, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: textColor, fontSize: 16 }}>Loja não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.orange, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Categorias únicas dos produtos desta loja
  const cats = ['Todos', ...Array.from(new Set(produtos.map(p => p.categoria)))];
  const produtosFiltrados = catSelecionada === 'Todos'
    ? produtos
    : produtos.filter(p => p.categoria === catSelecionada);

  const handleAddToCart = useCallback((_prodId: string) => {
    // Dev 3 vai implementar o cartStore — por enquanto navega para o carrinho
    router.push('/(consumer)/carrinho');
  }, [router]);

  const handleAskAju = useCallback(() => {
    router.push('/(consumer)/chat');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: bgMain }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Banner ── */}
        <View style={styles.bannerWrapper}>
          <ProductImg uri={loja.imagem} alt={loja.nome} width={400} height={180} />
          <View style={styles.bannerGradient} />

          <TouchableOpacity style={styles.btnBack} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={{ fontSize: 20, color: colors.navy, fontWeight: '600' }}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* ── Card de info da loja ── */}
        <View style={styles.infoCardWrapper}>
          <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>

            <View style={styles.infoCardTop}>
              <ProductImg uri={loja.imagem} alt={loja.nome} width={52} height={52} borderRadius={12} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.lojaNome, { color: textColor }]}>{loja.nome}</Text>
                <Text style={[styles.lojaCategoria, { color: subColor }]}>
                  {loja.endereco.bairro} · {loja.endereco.cidade}
                </Text>
                <View style={styles.starsRow}>
                  <Stars value={loja.avaliacao} size={12} />
                  <Text style={[{ fontSize: 12, fontWeight: '600', color: textColor }]}>
                    {' '}{loja.avaliacao}
                  </Text>
                  <Text style={[{ fontSize: 11, color: subColor }]}>
                    {' '}({loja.totalAvaliacoes} avaliações)
                  </Text>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: 'rgba(57,255,137,0.15)' }]}>
                <Text style={[styles.badgeText, { color: '#046C2E' }]}>
                  🛵 {loja.tempoEntregaMin}–{loja.tempoEntregaMax} min
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : colors.n100 }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                  {loja.taxaEntrega === 0 ? '🚚 Frete grátis' : `🚚 Frete R$ ${loja.taxaEntrega.toFixed(2).replace('.', ',')}`}
                </Text>
              </View>
              {!loja.aberta && (
                <View style={[styles.badge, { backgroundColor: 'rgba(107,115,144,0.15)' }]}>
                  <Text style={[styles.badgeText, { color: colors.n600 }]}>Fechado agora</Text>
                </View>
              )}
            </View>

            {/* Botão Aju */}
            <TouchableOpacity style={styles.btnAju} onPress={handleAskAju} activeOpacity={0.85}>
              <Text style={styles.btnAjuText}>✨ Conversar com a Aju sobre essa loja</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Chips de categoria ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsWrapper}
        >
          {cats.map(cat => {
            const ativo = cat === catSelecionada;
            return (
              <Pressable
                key={cat}
                onPress={() => setCatSelecionada(cat)}
                style={[styles.chip, {
                  backgroundColor: ativo ? colors.navy : (dark ? 'rgba(255,255,255,0.06)' : colors.n0),
                  borderColor: ativo ? colors.navy : border,
                }]}
              >
                <Text style={[styles.chipText, { color: ativo ? colors.n0 : textColor }]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Grid de produtos ── */}
        <View style={styles.grid}>
          {produtosFiltrados.map(p => (
            <View key={p.id} style={styles.gridItem}>
              <ProdutoCard produto={p} onAdd={handleAddToCart} dark={dark} />
            </View>
          ))}
          {produtosFiltrados.length === 0 && (
            <Text style={[styles.vazio, { color: subColor }]}>
              Nenhum produto nessa categoria.
            </Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  bannerWrapper:      { height: 180, position: 'relative' },
  bannerGradient:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,9,51,0.4)' },
  btnBack:            { position: 'absolute', top: 44, left: 14,
                        width: 38, height: 38, borderRadius: 19,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        alignItems: 'center', justifyContent: 'center' },
  infoCardWrapper:    { marginHorizontal: 16, marginTop: -40, zIndex: 1 },
  infoCard:           { borderRadius: 20, padding: 16, borderWidth: 1,
                        shadowColor: '#000933', shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.08, shadowRadius: 24, elevation: 4 },
  infoCardTop:        { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  lojaNome:           { fontWeight: '700', fontSize: 18, letterSpacing: -0.3, lineHeight: 22 },
  lojaCategoria:      { fontSize: 12, marginTop: 2 },
  starsRow:           { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badgesRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  badge:              { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99 },
  badgeText:          { fontSize: 11.5, fontWeight: '600' },
  btnAju:             { marginTop: 14, paddingVertical: 10, paddingHorizontal: 14,
                        borderRadius: 12, alignItems: 'center', backgroundColor: colors.orange,
                        shadowColor: colors.orange, shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3, shadowRadius: 14, elevation: 4 },
  btnAjuText:         { color: colors.n0, fontSize: 13.5, fontWeight: '600' },
  chipsWrapper:       { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 8 },
  chip:               { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
  chipText:           { fontSize: 13, fontWeight: '600' },
  grid:               { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  gridItem:           { width: '47%' },
  prodCard:           { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  prodInfo:           { padding: 10 },
  prodNome:           { fontSize: 12.5, fontWeight: '600', lineHeight: 16, minHeight: 30 },
  prodDesc:           { fontSize: 11, marginTop: 2, lineHeight: 15, minHeight: 28 },
  prodPreco:          { fontSize: 14, fontWeight: '700', marginTop: 4 },
  badgeDestaque:      { position: 'absolute', top: 8, left: 8,
                        backgroundColor: colors.orange,
                        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 99 },
  badgeDestaqueText:  { color: colors.n0, fontSize: 9, fontWeight: '700' },
  badgeIndisponivel:  { position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        alignItems: 'center', justifyContent: 'center' },
  badgeIndisponivelText: { color: colors.n0, fontSize: 12, fontWeight: '700' },
  btnAdicionar:       { width: '100%', height: 30, borderRadius: 8, marginTop: 8,
                        backgroundColor: colors.orange100,
                        alignItems: 'center', justifyContent: 'center' },
  btnAdicionarText:   { color: colors.orange600, fontSize: 12, fontWeight: '600' },
  vazio:              { textAlign: 'center', marginTop: 40, fontSize: 14,
                        paddingHorizontal: 16, width: '100%' },
});