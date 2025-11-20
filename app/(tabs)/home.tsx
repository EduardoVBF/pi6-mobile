import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/icon-symbol";
import useSession from "@/hooks/useSession";

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const handleNavigateAbastecimento = () => {
    navigation.navigate("abastecimento" as never);
  };

  const handleNavigateManutencao = () => {
    navigation.navigate("manutencao" as never);
  };

  const { logout } = useSession();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#0a0a12", "#1a001f", "#32004b"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        {/* Header com botão de sair */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ThemedText type="title" style={styles.logo}>
            FROTINIX
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Tecnologia para gestão de frotas.
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Otimize operações, reduza custos e acompanhe sua frota em tempo
            real.
          </ThemedText>
        </View>

        {/* Botões principais */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleNavigateAbastecimento}
            activeOpacity={0.85}
          >
            <IconSymbol
              size={28}
              name="fuelpump.fill"
              color={"#fff"}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Cadastrar Abastecimento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleNavigateManutencao}
            activeOpacity={0.85}
          >
            <Ionicons
              size={28}
              name="construct-outline"
              color={"#fff"}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Cadastrar Manutenção</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 45,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    paddingVertical: 10,
    fontSize: 50,
    lineHeight: 58,
    fontWeight: "900",
    color: "#c54aff",
    letterSpacing: 2,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 10,
  },
  heroContainer: {
    marginTop: 30,
    marginBottom: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
    width: "100%",
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 700,
    color: "#d0e9f3",
    fontSize: 16,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 20,
    height: "auto",
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 120,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonPrimary: {
    backgroundColor: "#8a0194",
  },
  buttonSecondary: {
    backgroundColor: "#5900b0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  icon: {
    marginRight: 10,
  },
});
