import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function AbastecimentoScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: "",
    kilometers: "",
    liters: "",
    fuelType: "",
    pricePerLiter: "",
    gasStation: "",
    totalValue: "",
    isFullTank: false,
  });

  useEffect(() => {
    const liters = parseFloat(formData.liters);
    const price = parseFloat(formData.pricePerLiter);
    if (!isNaN(liters) && !isNaN(price)) {
      setFormData((prev) => ({
        ...prev,
        totalValue: (liters * price).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, totalValue: "" }));
    }
  }, [formData.liters, formData.pricePerLiter]);

  const handleChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("✅ Sucesso", "Abastecimento registrado com sucesso");
      router.push("/");
    }, 900);
  };

  return (
    <LinearGradient
      colors={["#0a0a12", "#1a001f", "#32004b"]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: "Abastecimento" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Registrar Abastecimento
          </ThemedText>

          <View style={styles.card}>
            <Text style={styles.label}>Veículo (placa)</Text>
            <TextInput
              placeholder="Digite a placa"
              placeholderTextColor="#9CA3AF"
              value={formData.licensePlate}
              onChangeText={(t) => handleChange("licensePlate", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Quilometragem</Text>
            <TextInput
              placeholder="Quilometragem atual"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.kilometers}
              onChangeText={(t) => handleChange("kilometers", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Litros</Text>
            <TextInput
              placeholder="Quantidade de litros"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.liters}
              onChangeText={(t) => handleChange("liters", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Tipo de Combustível</Text>
            <TextInput
              placeholder="Gasolina / Etanol / Diesel"
              placeholderTextColor="#9CA3AF"
              value={formData.fuelType}
              onChangeText={(t) => handleChange("fuelType", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Posto</Text>
            <TextInput
              placeholder="Nome do posto"
              placeholderTextColor="#9CA3AF"
              value={formData.gasStation}
              onChangeText={(t) => handleChange("gasStation", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Valor por Litro</Text>
            <TextInput
              placeholder="Preço por litro"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.pricePerLiter}
              onChangeText={(t) => handleChange("pricePerLiter", t)}
              style={styles.input}
            />

            <Text style={styles.label}>Valor Total</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={formData.totalValue}
              editable={false}
              style={[styles.input, styles.readonlyInput]}
            />

            <View style={styles.row}>
              <Text style={[styles.label, { marginRight: 8, marginBottom: 8 }]}>
                Tanque Cheio
              </Text>
              <Switch
                value={formData.isFullTank}
                trackColor={{ false: "#767577", true: "#8a0194" }}
                onValueChange={(v) => handleChange("isFullTank", v)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <IconSymbol size={28} name="fuelpump.fill" color={"#fff"} />
            <Text style={styles.buttonText}>
              {isLoading ? "Registrando..." : "Registrar Abastecimento"}
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
    paddingTop: 45,
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
    fontSize: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  readonlyInput: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#e5e5e5",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    backgroundColor: "#8a0194",
    borderRadius: 12,
    shadowColor: "#8a0194",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
  },
});
