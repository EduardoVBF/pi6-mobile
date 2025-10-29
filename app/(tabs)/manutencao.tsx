import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Switch,
  TextInput,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";

export default function ManutencaoScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    placa: "",
    kmAtual: "",
    manutencoes: {
      oleo: false,
      filtroOleo: false,
      filtroCombustivel: false,
      filtroAr: false,
      engraxamento: false,
    },
  });

  const handleChange = (key: string, value: string) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const toggleManutencao = (key: keyof typeof formData.manutencoes) =>
    setFormData((p) => ({
      ...p,
      manutencoes: { ...p.manutencoes, [key]: !p.manutencoes[key] },
    }));

  const handleSubmit = () => {
    setIsLoading(true);
    // aqui você integra com backend ou salva localmente
    console.log("Enviar payload:", formData);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("✅ Sucesso", "Manutenção registrada.");
      router.push("/");
    }, 800);
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
            <Text style={styles.label}>Placa</Text>
            <TextInput
              placeholder="Placa do veículo"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={formData.placa}
              onChangeText={(t) => handleChange("placa", t)}
            />

            <Text style={styles.label}>KM Atual</Text>
            <TextInput
              placeholder="KM atual"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={styles.input}
              value={formData.kmAtual}
              onChangeText={(t) => handleChange("kmAtual", t)}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>
              Manutenções Realizadas
            </Text>

            <View style={styles.switchRow}>
              <Switch
                value={formData.manutencoes.oleo}
                onValueChange={() => toggleManutencao("oleo")}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
              <Text style={styles.switchLabel}>Troca de óleo</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.manutencoes.filtroOleo}
                onValueChange={() => toggleManutencao("filtroOleo")}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
              <Text style={styles.switchLabel}>Filtro de óleo</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.manutencoes.filtroCombustivel}
                onValueChange={() => toggleManutencao("filtroCombustivel")}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
              <Text style={styles.switchLabel}>Filtro de combustível</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.manutencoes.filtroAr}
                onValueChange={() => toggleManutencao("filtroAr")}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
              <Text style={styles.switchLabel}>Filtro de ar</Text>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={formData.manutencoes.engraxamento}
                onValueChange={() => toggleManutencao("engraxamento")}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
              <Text style={styles.switchLabel}>Engraxamento</Text>
            </View>
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
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  label: {
    color: "#d0e9f3",
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.04)",
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    gap: 2,
  },
  switchLabel: {
    color: "#d0e9f3",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    backgroundColor: "#5900b0",
    borderRadius: 12,
    marginTop: 6,
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
