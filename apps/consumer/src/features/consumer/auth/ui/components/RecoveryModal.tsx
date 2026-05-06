import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@ajulabs/theme';
import { formatCPF } from '../../lib/formatCPF';

type RecoveryStep = 'form' | 'success';

interface RecoveryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RecoveryModal({ visible, onClose }: RecoveryModalProps) {
  const [step, setStep]       = useState<RecoveryStep>('form');
  const [cpf, setCpf]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleClose = useCallback(() => {
    setStep('form');
    setCpf('');
    setError('');
    onClose();
  }, [onClose]);

  const validate = useCallback(() => {
    if (cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido — deve ter 11 dígitos.');
      return false;
    }
    return true;
  }, [cpf]);

  const handleEnviar = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('success');
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [validate]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHandle} />

          {step === 'form' && (
            <>
              <Text style={styles.modalTitle}>Recuperar senha</Text>
              <Text style={styles.modalSub}>
                Informe seu CPF cadastrado. Enviaremos o código de verificação para o email associado à sua conta.
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CPF</Text>
                <TextInput
                  style={[styles.fieldInput, error ? styles.fieldInputError : undefined]}
                  value={cpf}
                  onChangeText={v => { setCpf(formatCPF(v)); setError(''); }}
                  placeholder="000.000.000-00"
                  placeholderTextColor={colors.n600}
                  keyboardType="numeric"
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, loading && { opacity: 0.7 }]}
                onPress={handleEnviar}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalBtnText}>Enviar código</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'success' && (
            <>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark" size={32} color="#046C2E" />
              </View>
              <Text style={styles.successTitle}>Código enviado!</Text>
              <Text style={styles.successSub}>
                Enviamos um código de verificação para o email cadastrado no CPF{'\n'}
                <Text style={styles.successCpf}>{cpf}</Text>
                {'\n\n'}Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </Text>

              <View style={styles.successBanner}>
                <Ionicons name="checkmark" size={16} color="#046C2E" />
                <Text style={styles.successBannerText}>Código enviado com sucesso!</Text>
              </View>

              <TouchableOpacity style={styles.modalBtn} onPress={handleClose} activeOpacity={0.85}>
                <Text style={styles.modalBtnText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,9,51,0.7)', justifyContent: 'flex-end' },
  modalSheet:        { backgroundColor: colors.n0, borderRadius: 24,
                       borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                       padding: 28, paddingBottom: 40 },
  modalHandle:       { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.n200,
                       alignSelf: 'center', marginBottom: 20 },
  modalTitle:        { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  modalSub:          { fontSize: 13, color: colors.n600, marginBottom: 20, lineHeight: 19 },

  field:             { marginBottom: 14 },
  fieldLabel:        { fontSize: 11, fontWeight: '700', color: colors.n600,
                       textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 },
  fieldInput:        { height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: colors.n200,
                       backgroundColor: colors.n50, paddingHorizontal: 14,
                       fontSize: 14, color: colors.navy },
  fieldInputError:   { borderColor: '#E24B4A' },
  errorText:         { fontSize: 11, color: '#E24B4A', marginTop: 4, fontWeight: '500' },

  modalBtn:          { height: 50, borderRadius: 14, backgroundColor: colors.orange,
                       alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  modalBtnText:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalCancelBtn:    { height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: colors.n200,
                       alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  modalCancelText:   { fontSize: 14, fontWeight: '600', color: colors.n600 },

  successIconWrap:   { width: 72, height: 72, borderRadius: 36,
                       backgroundColor: 'rgba(57,255,137,0.15)',
                       alignItems: 'center', justifyContent: 'center',
                       alignSelf: 'center', marginBottom: 16 },
  successTitle:      { fontSize: 20, fontWeight: '700', color: colors.navy,
                       textAlign: 'center', marginBottom: 10 },
  successSub:        { fontSize: 13, color: colors.n600, textAlign: 'center',
                       lineHeight: 20, marginBottom: 16 },
  successCpf:        { fontWeight: '700', color: colors.navy },
  successBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8,
                       backgroundColor: 'rgba(57,255,137,0.15)',
                       borderWidth: 1, borderColor: 'rgba(4,108,46,0.3)',
                       borderRadius: 12, padding: 12, marginBottom: 16 },
  successBannerText: { fontSize: 13, fontWeight: '600', color: '#046C2E' },
});
