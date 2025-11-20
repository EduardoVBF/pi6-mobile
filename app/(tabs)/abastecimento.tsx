import React, { useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import api from "@/constants/api";
import { useSession } from "@/hooks/useSession";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export default function AbastecimentoScreen() {
  const router = useRouter();
  const { session } = useSession(); // token + user.id

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [formData, setFormData] = useState({
    placa: "",
    km: "",
    litros: "",
    tipo_combustivel: "",
    posto: "",
    valor_litro: "",
    totalValue: "",
    tanque_cheio: false,
    date: "", // YYYY-MM-DD (starts empty now)
    time: "", // HH:MM (starts empty now)
  });

  // Dropdown pickers state (cada um com seu open)
  const [openVehicles, setOpenVehicles] = useState(false);
  const [openFuelType, setOpenFuelType] = useState(false);
  const [openPosto, setOpenPosto] = useState(false);

  const [vehicleItems, setVehicleItems] = useState<
    { label: string; value: string; id?: number; id_usuario?: number }[]
  >([]);
  const [selectedPlaca, setSelectedPlaca] = useState<string>("");

  // Date/time picker UI control
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // pickerReferenceDate used to open the picker with a reasonable initial value
  const [pickerReferenceDate, setPickerReferenceDate] = useState<Date | null>(
    null
  );

  // ==========================================
  // Helper: sanitize numeric input (comma -> dot)
  // ==========================================
  const sanitizeNumberInput = (raw: string) =>
    raw ? raw.replace(",", ".").replace(/[^0-9.]/g, "") : "";

  // ==========================================
  // Load vehicles
  // ==========================================
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const res = await api.get("/api/v1/vehicles/", {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          params: { limit: 1000 },
        });

        const vehs = res.data?.vehicles ?? [];
        setVehicles(vehs);

        const items = vehs.map((v: any) => ({
          label: `${v.placa} - ${v.marca ?? ""} ${v.modelo ?? ""}`.trim(),
          value: v.placa,
          id: v.id,
          id_usuario: v.id_usuario,
        }));
        setVehicleItems(items);
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar os veículos.");
      } finally {
        setLoadingVehicles(false);
      }
    };

    if (session?.accessToken) fetchVehicles();
  }, [session?.accessToken]);

  // when selectedPlaca changes sync to formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, placa: selectedPlaca }));
  }, [selectedPlaca]);

  // ====================================================
  // Calculate totalValue (litros * valor_litro)
  // ====================================================
  useEffect(() => {
    const litros = parseFloat(sanitizeNumberInput(formData.litros));
    const preco = parseFloat(sanitizeNumberInput(formData.valor_litro));

    if (!isNaN(litros) && !isNaN(preco)) {
      setFormData((prev) => ({
        ...prev,
        totalValue: (litros * preco).toFixed(2),
      }));
    } else {
      setFormData((prev) => ({ ...prev, totalValue: "" }));
    }
  }, [formData.litros, formData.valor_litro]);

  // ============================
  // Utils: format date / time
  // ============================
  function pad(n: number) {
    return n < 10 ? "0" + n : String(n);
  }
  function formatDate(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function formatTime(d: Date) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ============================
  // Handlers
  // ============================
  const handleChange = (key: string, value: any) => {
    // sanitize numeric fields
    if (
      ["litros", "valor_litro", "km"].includes(key) &&
      typeof value === "string"
    ) {
      value = sanitizeNumberInput(value);
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Open date picker (we set a reference date so picker opens at:
  // - current selected date/time if exists, or
  // - now by default)
  const openDatePicker = () => {
    const ref = formData.date
      ? new Date(`${formData.date}T${formData.time || "00:00"}:00`)
      : new Date();
    setPickerReferenceDate(ref);
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    const ref = formData.time
      ? new Date(
          `${formData.date || new Date().toISOString().slice(0, 10)}T${
            formData.time
          }:00`
        )
      : new Date();
    setPickerReferenceDate(ref);
    setShowTimePicker(true);
  };

  // Date picker event handler (separate for date/time)
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, event.type can be 'dismissed' or 'set'; on iOS, selectedDate undefined means cancel
    const dismissed = (event as any)?.type === "dismissed";
    setShowDatePicker(Platform.OS === "ios"); // keep open on iOS (spinner) behavior; close on Android
    if (!dismissed && selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: formatDate(selectedDate),
      }));
    }
    if (Platform.OS !== "ios") setShowDatePicker(false);
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const dismissed = (event as any)?.type === "dismissed";
    setShowTimePicker(Platform.OS === "ios");
    if (!dismissed && selectedTime) {
      setFormData((prev) => ({
        ...prev,
        time: formatTime(selectedTime),
      }));
    }
    if (Platform.OS !== "ios") setShowTimePicker(false);
  };

  // Clear helpers
  const clearDate = () => setFormData((prev) => ({ ...prev, date: "" }));
  const clearTime = () => setFormData((prev) => ({ ...prev, time: "" }));

  // ====================================================
  // Submit
  // ====================================================
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
    if (!formData.km) {
      Alert.alert("Validação", "Informe a quilometragem.");
      return;
    }
    if (!formData.litros || !formData.valor_litro) {
      Alert.alert("Validação", "Informe litros e preço por litro.");
      return;
    }

    try {
      setIsLoading(true);
      const vehicle = vehicles.find((v) => v.placa === formData.placa);

      const payload = {
        data: formData.date,
        hora: formData.time,
        km: Number(formData.km),
        litros: Number(formData.litros),
        tipo_combustivel: formData.tipo_combustivel,
        valor_litro: Number(formData.valor_litro),
        posto: formData.posto,
        tanque_cheio: formData.tanque_cheio,
        media: 0,
        id_usuario: vehicle?.id_usuario,
        placa: formData.placa,
        valor_total: Number(formData.totalValue || 0),
      };

      await api.post("/api/v1/refuels/", payload, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      Alert.alert("Sucesso", "Abastecimento registrado!");
      // optional reset
      setFormData((prev) => ({
        ...prev,
        km: "",
        litros: "",
        valor_litro: "",
        totalValue: "",
        tanque_cheio: false,
        // keep placa
      }));
      router.push("/home");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao registrar abastecimento.");
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize static items
  const fuelTypeItems = useMemo(
    () => [
      { label: "Gasolina", value: "gasolina" },
      { label: "Etanol", value: "etanol" },
      { label: "Diesel", value: "diesel" },
    ],
    []
  );

  const postoItems = useMemo(
    () => [
      { label: "Depósito Interno", value: "interno" },
      { label: "Posto Externo", value: "externo" },
      { label: "Posto Alvorada", value: "alvorada" },
      { label: "Posto Central", value: "central" },
    ],
    []
  );

  // find selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.placa === formData.placa);

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <Text style={styles.title}>Registrar Abastecimento</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Veículo (placa)</Text>

            {loadingVehicles ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={[styles.dropdownWrapper, { zIndex: 6000 }]}>
                <DropDownPicker
                  open={openVehicles}
                  value={selectedPlaca}
                  items={vehicleItems}
                  setOpen={(val) => {
                    setOpenVehicles(val);
                    setOpenFuelType(false);
                    setOpenPosto(false);
                  }}
                  setValue={(callbackOrValue) => {
                    if (typeof callbackOrValue === "function") {
                      setSelectedPlaca((prev) => {
                        const newVal = callbackOrValue(prev);
                        return newVal;
                      });
                    } else {
                      setSelectedPlaca(callbackOrValue);
                    }
                  }}
                  setItems={setVehicleItems}
                  placeholder="Selecione um veículo"
                  searchable
                  searchPlaceholder="Buscar..."
                  listMode="SCROLLVIEW"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropDownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.placeholderStyle}
                  searchContainerStyle={styles.searchContainer}
                />
              </View>
            )}

            {/* KM */}
            <Text style={styles.label}>KM Atual</Text>
            {selectedVehicle && (
              <Text style={{ color: "#bfb7c8", marginBottom: 6 }}>
                Último KM:{" "}
                <Text style={{ color: "#fff" }}>
                  {selectedVehicle.km_atual}
                </Text>
              </Text>
            )}

            <TextInput
              placeholder="Quilometragem atual"
              placeholderTextColor="#9CA3AF"
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
              }
              value={formData.km}
              onChangeText={(t) => handleChange("km", t)}
              style={styles.input}
            />

            {/* Litros */}
            <Text style={styles.label}>Litros</Text>
            <TextInput
              placeholder="Quantidade de litros"
              placeholderTextColor="#9CA3AF"
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
              }
              value={formData.litros}
              onChangeText={(t) => handleChange("litros", t)}
              style={styles.input}
            />

            {/* Tipo de combustível */}
            <Text style={styles.label}>Tipo de Combustível</Text>
            <View style={[styles.dropdownWrapper, { zIndex: 5000 }]}>
              <DropDownPicker
                open={openFuelType}
                value={formData.tipo_combustivel}
                items={[{ label: "Selecione", value: "" }, ...fuelTypeItems]}
                setOpen={(v) => {
                  setOpenFuelType(v);
                  setOpenVehicles(false);
                  setOpenPosto(false);
                }}
                setValue={(v: any) => handleChange("tipo_combustivel", v())}
                setItems={() => {}}
                placeholder="Selecione"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                textStyle={styles.dropdownText}
              />
            </View>

            {/* Posto */}
            <Text style={styles.label}>Posto</Text>
            <View style={[styles.dropdownWrapper, { zIndex: 4000 }]}>
              <DropDownPicker
                open={openPosto}
                value={formData.posto}
                items={[{ label: "Selecione", value: "" }, ...postoItems]}
                setOpen={(v) => {
                  setOpenPosto(v);
                  setOpenVehicles(false);
                  setOpenFuelType(false);
                }}
                setValue={(v: any) => handleChange("posto", v())}
                setItems={() => {}}
                placeholder="Selecione"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                textStyle={styles.dropdownText}
              />
            </View>

            {/* Data (native picker) */}
            <Text style={styles.label}>Data</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openDatePicker}
                style={{ flex: 1 }}
              >
                <TextInput
                  placeholder="AAAA-MM-DD"
                  value={formData.date}
                  editable={false}
                  style={[styles.input, styles.readonlyInput]}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={clearDate} style={{ padding: 8 }}>
                <Text style={{ color: "#bfb7c8" }}>Limpar</Text>
              </TouchableOpacity>
            </View>

            {/* Hora (native picker) */}
            <Text style={styles.label}>Hora</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openTimePicker}
                style={{ flex: 1 }}
              >
                <TextInput
                  placeholder="HH:MM"
                  value={formData.time}
                  editable={false}
                  style={[styles.input, styles.readonlyInput]}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={clearTime} style={{ padding: 8 }}>
                <Text style={{ color: "#bfb7c8" }}>Limpar</Text>
              </TouchableOpacity>
            </View>

            {/* Native datetime pickers (hidden until requested) */}
            {showDatePicker && (
              <DateTimePicker
                value={pickerReferenceDate ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onDateChange}
                dateFormat="day month year"
                locale="pt-BR"
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={pickerReferenceDate ?? new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={onTimeChange}
              />
            )}

            {/* Valor por litro */}
            <Text style={styles.label}>Valor por Litro</Text>
            <TextInput
              placeholder="Preço por litro"
              placeholderTextColor="#9CA3AF"
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"
              }
              value={formData.valor_litro}
              onChangeText={(t) => handleChange("valor_litro", t)}
              style={styles.input}
            />

            {/* Total */}
            <Text style={styles.label}>Valor Total</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={formData.totalValue}
              editable={false}
              style={[styles.input, styles.readonlyInput]}
            />

            {/* Tanque cheio */}
            <View style={styles.row}>
              <Text style={[styles.label, { marginRight: 8, marginBottom: 8 }]}>
                Tanque Cheio
              </Text>
              <Switch
                value={formData.tanque_cheio}
                onValueChange={(v) => handleChange("tanque_cheio", v)}
                trackColor={{ false: "#adaaaa", true: "#8a0194" }}
                thumbColor={"#8a0194"}
              />
            </View>
          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar Abastecimento</Text>
            )}
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
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  label: {
    color: "#d0e9f3",
    fontSize: 14,
    marginTop: 8,
  },
  input: {
    height: 44,
    fontSize: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 6,
  },
  readonlyInput: {
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#e5e5e5",
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
  searchContainer: {
    backgroundColor: "#1a001f",
    borderBottomColor: "transparent",
  },
  row: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    height: 50,
    backgroundColor: "#8a0194",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
