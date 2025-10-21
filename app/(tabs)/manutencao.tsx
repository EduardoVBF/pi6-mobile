import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";

export default function ManutencaoScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    kmTroca: "",
    proximaTroca: "",
    status: "Regular",
    dataUltimaTroca: "",
    responsavel: "",
    custo: "",
    placa: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("✅ Sucesso", "Manutenção adicionada com sucesso!");
      router.push("/");
    }, 700);
  };

  return (
    <LinearGradient
      colors={["#0a0a12", "#1a001f", "#32004b"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: "Manutenção" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Registrar Manutenção
          </ThemedText>

          <View style={styles.card}>
            <Text style={styles.label}>Veículo</Text>
            <TextInput
              placeholder="Placa do veículo"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.placa}
              onChangeText={(t) => handleChange("placa", t)}
            />

            <Text style={styles.label}>Tipo</Text>
            <TextInput
              placeholder="Tipo de manutenção"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.tipo}
              onChangeText={(t) => handleChange("tipo", t)}
            />

            <Text style={styles.label}>KM Manutenção</Text>
            <TextInput
              placeholder="KM atual da troca"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.kmTroca}
              onChangeText={(t) => handleChange("kmTroca", t)}
            />

            <Text style={styles.label}>Próxima Troca (km)</Text>
            <TextInput
              placeholder="KM da próxima troca"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.proximaTroca}
              onChangeText={(t) => handleChange("proximaTroca", t)}
            />

            <Text style={styles.label}>Status</Text>
            <TextInput
              placeholder="Regular / Próximo / Atrasado"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.status}
              onChangeText={(t) => handleChange("status", t)}
            />

            <Text style={styles.label}>Custo</Text>
            <TextInput
              placeholder="Custo da manutenção"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.custo}
              onChangeText={(t) => handleChange("custo", t)}
            />

            {/* <Text style={styles.label}>Data Última Troca</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.dataUltimaTroca}
              onChangeText={(t) => handleChange("dataUltimaTroca", t)}
            /> */}

            <Text style={styles.label}>Responsável</Text>
            <TextInput
              placeholder="Nome do responsável"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.responsavel}
              onChangeText={(t) => handleChange("responsavel", t)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLoading ? "time-outline" : "construct-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {isLoading ? "Registrando..." : "Registrar Manutenção"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  label: {
    color: "#d0e9f3",
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
    fontSize: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    backgroundColor: "#5900b0",
    borderRadius: 12,
    shadowColor: "#5900b0",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
