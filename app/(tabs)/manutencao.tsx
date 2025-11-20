import React, { useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import api from "@/constants/api";
import { useSession } from "@/hooks/useSession";
import { ThemedText } from "@/components/themed-text";

export default function ManutencaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // { vehicle?: 'ABC1234' }
  const { session } = useSession(); // espera objeto com accessToken

  const [isLoading, setIsLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleItems, setVehicleItems] = useState<
    { label: string; value: string; id?: number; km_atual?: number; id_usuario?: number }[]
  >([]);
  const [openVehicles, setOpenVehicles] = useState(false);
  const [selectedPlaca, setSelectedPlaca] = useState<string>("");

  const [placaDisabled, setPlacaDisabled] = useState(false);

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
    status: "pendente",
  });

  // sanitize numeric input (keep only digits)
  const sanitizeKmInput = (raw: string) => (raw ? raw.replace(/[^0-9]/g, "") : "");

  // ------------- load vehicles -------------
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const res = await api.get("/api/v1/vehicles/", {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { limit: 1000 },
        });

        const list = res.data?.vehicles ?? res.data ?? [];
        setVehicles(list);

        const items = list.map((v: any) => ({
          label: `${v.placa} - ${v.marca ?? ""} ${v.modelo ?? ""}`.trim(),
          value: v.placa,
          id: v.id,
          km_atual: v.km_atual,
          id_usuario: v.id_usuario,
        }));
        setVehicleItems(items);
      } catch (err) {
        console.error("Erro ao carregar veículos:", err);
        Alert.alert("Erro", "Não foi possível carregar veículos.");
      } finally {
        setLoadingVehicles(false);
      }
    };

    // fetch only if session token exists
    if (session?.accessToken) fetchVehicles();
  }, [session?.accessToken]);

  // ------------- handle route param to lock placa -------------
  useEffect(() => {
    if (!params) return;
    const p = (params?.vehicle as string) ?? (params?.placa as string) ?? null;
    if (p) {
      setSelectedPlaca(p);
      setFormData((prev) => ({ ...prev, placa: p }));
      setPlacaDisabled(true);
    } else {
      setPlacaDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // when selectedPlaca changes sync to formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, placa: selectedPlaca }));
  }, [selectedPlaca]);

  // find selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.placa === formData.placa);

  // toggle manutencoes
  const toggleManutencao = (key: keyof typeof formData.manutencoes) =>
    setFormData((p) => ({
      ...p,
      manutencoes: { ...p.manutencoes, [key]: !p.manutencoes[key] },
    }));

  // handle generic input change
  const handleChange = (key: string, value: any) => {
    if (key === "kmAtual" && typeof value === "string") {
      value = sanitizeKmInput(value);
    }
    setFormData((p) => ({ ...p, [key]: value }));
  };

  // submit
  const handleSubmit = async () => {
    if (!session?.accessToken) {
      Alert.alert("Erro", "Sessão expirada.");
      return;
    }

    // basic validation
    if (!formData.placa) {
      Alert.alert("Validação", "Selecione um veículo.");
      return;
    }
    if (!formData.kmAtual) {
      Alert.alert("Validação", "Informe a quilometragem atual.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        placa: formData.placa,
        km_atual: Number(formData.kmAtual),
        oleo: !!formData.manutencoes.oleo,
        filtro_oleo: !!formData.manutencoes.filtroOleo,
        filtro_combustivel: !!formData.manutencoes.filtroCombustivel,
        filtro_ar: !!formData.manutencoes.filtroAr,
        engraxamento: !!formData.manutencoes.engraxamento,
        status: formData.status || "pendente",
        id_usuario: selectedVehicle?.id_usuario ?? null,
      };

      await api.post("/api/v1/maintenances/", payload, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      Alert.alert("Sucesso", "Manutenção registrada com sucesso!");
      // reset form (keep placa if it was locked)
      setFormData({
        placa: placaDisabled ? formData.placa : "",
        kmAtual: "",
        manutencoes: {
          oleo: false,
          filtroOleo: false,
          filtroCombustivel: false,
          filtroAr: false,
          engraxamento: false,
        },
        status: "pendente",
      });

      // small delay visual (you already have router.push elsewhere)
      router.push("/home");
    } catch (err) {
      console.error("Erro ao registrar manutenção:", err);
      Alert.alert("Erro", "Falha ao registrar manutenção.");
    } finally {
      setIsLoading(false);
    }
  };

  // items memo (adds placeholder option)
  const vehicleItemsWithPlaceholder = useMemo(
    () => [{ label: "Selecione o veículo", value: "" }, ...vehicleItems],
    [vehicleItems]
  );

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
            <Text style={styles.label}>Veículo (placa)</Text>

            {loadingVehicles ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={[styles.dropdownWrapper, { zIndex: 6000 }]}>
                <DropDownPicker
                  open={openVehicles}
                  value={selectedPlaca}
                  items={vehicleItemsWithPlaceholder}
                  setOpen={(val) => {
                    setOpenVehicles(val);
                  }}
                  setValue={(callbackOrValue) => {
                    if (typeof callbackOrValue === "function") {
                      setSelectedPlaca((prev) => callbackOrValue(prev));
                    } else {
                      setSelectedPlaca(callbackOrValue);
                    }
                  }}
                  setItems={setVehicleItems}
                  placeholder="Selecione um veículo"
                  searchable
                  searchPlaceholder="Buscar..."
                  listMode="SCROLLVIEW"
                  disabled={placaDisabled}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropDownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.placeholderStyle}
                />
              </View>
            )}

            <Text style={styles.label}>KM Atual</Text>
            {selectedVehicle && (
              <Text style={{ color: "#bfb7c8", marginBottom: 6 }}>
                Último KM:{" "}
                <Text style={{ color: "#fff" }}>{selectedVehicle.km_atual}</Text>
              </Text>
            )}

            <TextInput
              placeholder="KM atual"
              placeholderTextColor="#9CA3AF"
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
              }
              style={styles.input}
              value={formData.kmAtual}
              onChangeText={(t) => handleChange("kmAtual", t)}
              editable={!!selectedPlaca} // require selecting vehicle first
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
    marginTop: 8,
    gap: 8,
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
  dropdownWrapper: {
    marginBottom: 8,
  },
  dropdown: {
    height: 45,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
  },
  dropDownContainer: {
    backgroundColor: "#120015",
    borderColor: "#8a0194",
    marginTop: 4,
    borderRadius: 10,
    maxHeight: 220,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },
  placeholderStyle: {
    color: "#bfb7c8",
  },
});
