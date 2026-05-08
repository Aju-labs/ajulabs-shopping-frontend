import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  StyleSheet, ActivityIndicator, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';
import { EnderecoService } from '@ajulabs/api-client';
import { EnderecoSalvo } from '@ajulabs/types';
import { useAuthStore } from '../../src/store';

interface EnderecoForm {
  apelido: string;
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  complemento: string;
}

const FORM_VAZIO: EnderecoForm = {
  apelido: '', rua: '', numero: '', bairro: '',
  cep: '', cidade: 'Aracaju', complemento: '',
};

function iconeApelido(apelido: string): string {
  const a = apelido.toLowerCase();
  if (a.includes('casa') || a.includes('home')) return 'home';
  if (a.includes('trabalho') || a.includes('work') || a.includes('emprego')) return 'briefcase';
  return 'location';
}

export default function EnderecosScreen() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);

  const [enderecos, setEnderecos] = useState<EnderecoSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<EnderecoForm>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    EnderecoService.listar(token)
      .then(setEnderecos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleRemover = (id: string) => {
    const confirmar = () => {
      if (!token) return;
      EnderecoService.remover(token, id).then(carregar).catch(() =>
        Alert.alert('Erro', 'Não foi possível remover o endereço'),
      );
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Remover este endereço?')) confirmar();
    } else {
      Alert.alert('Remover endereço', 'Deseja remover este endereço?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  const handleDefinirPadrao = (id: string) => {
    if (!token) return;
    EnderecoService.definirPadrao(token, id).then(carregar).catch(() => {});
  };

  const [erroForm, setErroForm] = useState('');

  const handleSalvar = async () => {
    setErroForm('');
    if (!token) return;
    if (!form.apelido || !form.rua || !form.numero || !form.bairro || !form.cidade) {
      setErroForm('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.cep.replace(/\D/g, '').length !== 8) {
      setErroForm('CEP deve ter 8 dígitos.');
      return;
    }
    setSaving(true);
    try {
      await EnderecoService.criar(token, {
        ...form,
        complemento: form.complemento || undefined,
      });
      setShowModal(false);
      setForm(FORM_VAZIO);
      setErroForm('');
      carregar();
    } catch (e: any) {
      setErroForm(e?.message ?? 'Não foi possível salvar o endereço.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Meus Endereços</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {enderecos.length === 0 && (
            <View style={styles.vazio}>
              <Ionicons name="location-outline" size={52} color={colors.n300} />
              <Text style={styles.vazioTitulo}>Nenhum endereço salvo</Text>
              <Text style={styles.vazioTxt}>Adicione um endereço para receber seus pedidos</Text>
            </View>
          )}

          {enderecos.map(addr => (
            <View key={addr.id} style={styles.card}>
              <View style={styles.cardIconBox}>
                <Ionicons name={iconeApelido(addr.apelido) as any} size={18} color={colors.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardApelido}>{addr.apelido}</Text>
                  {addr.padrao && (
                    <View style={styles.badgePadrao}>
                      <Text style={styles.badgePadraoTxt}>Padrão</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardRua}>{addr.rua}</Text>
                <Text style={styles.cardBairro}>{addr.bairro} · CEP {addr.cep}</Text>
              </View>
              <View style={styles.cardActions}>
                {!addr.padrao && (
                  <TouchableOpacity onPress={() => handleDefinirPadrao(addr.id)} style={styles.actionBtn}>
                    <Ionicons name="star-outline" size={18} color={colors.orange} />
                  </TouchableOpacity>
                )}
                {!addr.padrao && (
                  <TouchableOpacity onPress={() => handleRemover(addr.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color="#A32D2D" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={colors.orange} />
            <Text style={styles.addBtnTxt}>Adicionar novo endereço</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Novo Endereço</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setForm(FORM_VAZIO); }}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Apelido *</Text>
              <TextInput
                style={styles.input}
                value={form.apelido}
                onChangeText={v => setForm(f => ({ ...f, apelido: v }))}
                placeholder="Ex: Casa, Trabalho, Apartamento"
                placeholderTextColor={colors.n500}
              />

              <Text style={styles.fieldLabel}>Rua / Avenida *</Text>
              <TextInput
                style={styles.input}
                value={form.rua}
                onChangeText={v => setForm(f => ({ ...f, rua: v }))}
                placeholder="Ex: Av. Ivo do Prado"
                placeholderTextColor={colors.n500}
              />

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.numero}
                    onChangeText={v => setForm(f => ({ ...f, numero: v }))}
                    placeholder="123"
                    placeholderTextColor={colors.n500}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 2, marginLeft: 12 }}>
                  <Text style={styles.fieldLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={form.complemento}
                    onChangeText={v => setForm(f => ({ ...f, complemento: v }))}
                    placeholder="Apto, Bloco..."
                    placeholderTextColor={colors.n500}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Bairro *</Text>
              <TextInput
                style={styles.input}
                value={form.bairro}
                onChangeText={v => setForm(f => ({ ...f, bairro: v }))}
                placeholder="Ex: Centro"
                placeholderTextColor={colors.n500}
              />

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>CEP *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cep}
                    onChangeText={v => setForm(f => ({ ...f, cep: v.replace(/\D/g, '').slice(0, 8) }))}
                    placeholder="49000000"
                    placeholderTextColor={colors.n500}
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </View>
                <View style={{ flex: 2, marginLeft: 12 }}>
                  <Text style={styles.fieldLabel}>Cidade *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cidade}
                    onChangeText={v => setForm(f => ({ ...f, cidade: v }))}
                    placeholder="Aracaju"
                    placeholderTextColor={colors.n500}
                  />
                </View>
              </View>

              {!!erroForm && (
                <View style={styles.erroBox}>
                  <Ionicons name="alert-circle-outline" size={15} color="#A32D2D" />
                  <Text style={styles.erroTxt}>{erroForm}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSalvar}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color={colors.n0} />
                  : <Text style={styles.saveBtnTxt}>Salvar endereço</Text>}
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
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:         { padding: 16, paddingBottom: 40 },
  vazio:          { alignItems: 'center', paddingVertical: 56, gap: 10 },
  vazioTitulo:    { fontSize: 17, fontWeight: '700', color: colors.navy },
  vazioTxt:       { fontSize: 13, color: colors.n600, textAlign: 'center' },
  card:           { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14,
                    backgroundColor: colors.n0, borderRadius: 14, marginBottom: 12,
                    borderWidth: 1, borderColor: colors.n200 },
  cardIconBox:    { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.orange100,
                    alignItems: 'center', justifyContent: 'center' },
  cardTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardApelido:    { fontSize: 15, fontWeight: '700', color: colors.navy },
  cardRua:        { fontSize: 13, color: colors.n600, marginTop: 3 },
  cardBairro:     { fontSize: 12, color: colors.n600 },
  badgePadrao:    { backgroundColor: colors.orange100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  badgePadraoTxt: { fontSize: 10, fontWeight: '600', color: colors.orange600 },
  cardActions:    { gap: 8 },
  actionBtn:      { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.n50,
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
  erroBox:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14,
                    padding: 12, backgroundColor: '#FCEBEB', borderRadius: 10 },
  erroTxt:        { flex: 1, fontSize: 13, color: '#A32D2D' },
  saveBtn:        { backgroundColor: colors.orange, height: 52, borderRadius: 14, marginTop: 24,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: colors.orange, shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 14, elevation: 4 },
  saveBtnTxt:     { color: colors.n0, fontSize: 15, fontWeight: '700' },
});
