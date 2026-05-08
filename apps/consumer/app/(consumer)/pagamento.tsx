import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  StyleSheet, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';

interface Cartao {
  id: string;
  apelido: string;
  bandeira: 'Visa' | 'Mastercard' | 'Elo' | 'Outro';
  ultimos4: string;
  titular: string;
}

const FORM_VAZIO = { apelido: '', titular: '', numero: '', validade: '', cvv: '' };

function detectarBandeira(num: string): Cartao['bandeira'] {
  if (num.startsWith('4')) return 'Visa';
  if (num.startsWith('5')) return 'Mastercard';
  if (num.startsWith('6')) return 'Elo';
  return 'Outro';
}

function formatarNumero(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatarValidade(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function PagamentoScreen() {
  const router = useRouter();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);

  const handleSalvar = () => {
    const digits = form.numero.replace(/\D/g, '');
    if (!form.titular || digits.length < 16 || !form.validade || form.cvv.length < 3) {
      Alert.alert('Atenção', 'Preencha todos os campos corretamente.');
      return;
    }
    setCartoes(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        apelido: form.apelido || `Cartão ${detectarBandeira(digits)}`,
        bandeira: detectarBandeira(digits),
        ultimos4: digits.slice(-4),
        titular: form.titular.toUpperCase(),
      },
    ]);
    setShowModal(false);
    setForm(FORM_VAZIO);
  };

  const handleRemover = (id: string) => {
    const confirmar = () => setCartoes(prev => prev.filter(c => c.id !== id));
    if (Platform.OS === 'web') {
      if (window.confirm('Remover este cartão?')) confirmar();
    } else {
      Alert.alert('Remover cartão', 'Deseja remover este cartão?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Formas de Pagamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.secao}>Pix</Text>
        <View style={styles.pixCard}>
          <View style={styles.pixIconBox}>
            <Ionicons name="flash" size={20} color="#00C65E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pixTitulo}>Pix</Text>
            <Text style={styles.pixSub}>5% de desconto · Pagamento instantâneo</Text>
          </View>
          <View style={styles.pixBadge}>
            <Text style={styles.pixBadgeTxt}>Disponível</Text>
          </View>
        </View>

        <Text style={[styles.secao, { marginTop: 20 }]}>Cartões salvos</Text>

        {cartoes.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="card-outline" size={42} color={colors.n300} />
            <Text style={styles.vazioTxt}>Nenhum cartão salvo</Text>
          </View>
        ) : (
          cartoes.map(cartao => (
            <View key={cartao.id} style={styles.cartaoCard}>
              <View style={styles.cartaoIconBox}>
                <Ionicons name="card" size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartaoApelido}>{cartao.apelido}</Text>
                <Text style={styles.cartaoInfo}>{cartao.bandeira} •••• {cartao.ultimos4}</Text>
                <Text style={styles.cartaoTitular}>{cartao.titular}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemover(cartao.id)} style={styles.trashBtn}>
                <Ionicons name="trash-outline" size={17} color="#A32D2D" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={colors.orange} />
          <Text style={styles.addBtnTxt}>Adicionar cartão</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Novo Cartão</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setForm(FORM_VAZIO); }}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Apelido do cartão</Text>
              <TextInput
                style={styles.input}
                value={form.apelido}
                onChangeText={v => setForm(f => ({ ...f, apelido: v }))}
                placeholder="Ex: Meu Visa, Cartão pessoal"
                placeholderTextColor={colors.n500}
              />

              <Text style={styles.fieldLabel}>Nome do titular *</Text>
              <TextInput
                style={styles.input}
                value={form.titular}
                onChangeText={v => setForm(f => ({ ...f, titular: v }))}
                placeholder="Nome como no cartão"
                placeholderTextColor={colors.n500}
                autoCapitalize="characters"
              />

              <Text style={styles.fieldLabel}>Número do cartão *</Text>
              <TextInput
                style={styles.input}
                value={form.numero}
                onChangeText={v => setForm(f => ({ ...f, numero: formatarNumero(v) }))}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={colors.n500}
                keyboardType="numeric"
                maxLength={19}
              />

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Validade *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.validade}
                    onChangeText={v => setForm(f => ({ ...f, validade: formatarValidade(v) }))}
                    placeholder="MM/AA"
                    placeholderTextColor={colors.n500}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.fieldLabel}>CVV *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cvv}
                    onChangeText={v => setForm(f => ({ ...f, cvv: v.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="000"
                    placeholderTextColor={colors.n500}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.aviso}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.n600} />
                <Text style={styles.avisoTxt}>Seus dados são armazenados com segurança</Text>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar} activeOpacity={0.85}>
                <Text style={styles.saveBtnTxt}>Salvar cartão</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  secao:          { fontSize: 13, fontWeight: '700', color: colors.n600, marginBottom: 10, letterSpacing: 0.3 },
  pixCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                    backgroundColor: colors.n0, borderRadius: 14, borderWidth: 1, borderColor: colors.n200 },
  pixIconBox:     { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,198,94,0.1)',
                    alignItems: 'center', justifyContent: 'center' },
  pixTitulo:      { fontSize: 15, fontWeight: '700', color: colors.navy },
  pixSub:         { fontSize: 12, color: colors.n600, marginTop: 2 },
  pixBadge:       { backgroundColor: 'rgba(0,198,94,0.1)', paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 99 },
  pixBadgeTxt:    { fontSize: 11, fontWeight: '600', color: '#00A050' },
  vazio:          { alignItems: 'center', paddingVertical: 32, gap: 8 },
  vazioTxt:       { fontSize: 13, color: colors.n600 },
  cartaoCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
                    backgroundColor: colors.n0, borderRadius: 14, marginBottom: 10,
                    borderWidth: 1, borderColor: colors.n200 },
  cartaoIconBox:  { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.n100,
                    alignItems: 'center', justifyContent: 'center' },
  cartaoApelido:  { fontSize: 14, fontWeight: '700', color: colors.navy },
  cartaoInfo:     { fontSize: 12, color: colors.n600, marginTop: 2 },
  cartaoTitular:  { fontSize: 11, color: colors.n500, marginTop: 1 },
  trashBtn:       { width: 34, height: 34, borderRadius: 9, backgroundColor: '#FCEBEB',
                    alignItems: 'center', justifyContent: 'center' },
  addBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
                    borderColor: colors.orange, marginTop: 4 },
  addBtnTxt:      { fontSize: 14, fontWeight: '600', color: colors.orange },
  modal:          { flex: 1, backgroundColor: '#FAFBFE' },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
                    borderBottomWidth: 1, borderBottomColor: colors.n100, backgroundColor: colors.n0 },
  modalTitulo:    { fontSize: 18, fontWeight: '700', color: colors.navy },
  modalScroll:    { padding: 20 },
  fieldLabel:     { fontSize: 12, fontWeight: '600', color: colors.n600, marginBottom: 6, marginTop: 14 },
  input:          { backgroundColor: colors.n0, borderRadius: 12, borderWidth: 1, borderColor: colors.n200,
                    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.navy },
  row2:           { flexDirection: 'row' },
  aviso:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16,
                    padding: 12, backgroundColor: colors.n50, borderRadius: 10 },
  avisoTxt:       { fontSize: 12, color: colors.n600 },
  saveBtn:        { backgroundColor: colors.orange, height: 52, borderRadius: 14, marginTop: 20,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: colors.orange, shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 14, elevation: 4 },
  saveBtnTxt:     { color: colors.n0, fontSize: 15, fontWeight: '700' },
});
