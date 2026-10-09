import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, type BarcodeType } from "expo-camera";
import { useRef } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/components/login/gradient-button";
import { ThemedText } from "@/components/themed-text";
import { Gradients } from "@/constants/theme";

const BARCODE_TYPES: BarcodeType[] = ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "itf14"];

type BarcodeScannerProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (barcode: string) => void;
};

export function BarcodeScanner({ visible, onClose, onScanned }: BarcodeScannerProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  // O callback dispara várias vezes por segundo; aceita só a primeira leitura.
  const scannedRef = useRef(false);

  const handleShow = () => {
    scannedRef.current = false;
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  };

  return (
    <Modal visible={visible} animationType="slide" onShow={handleShow} onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
            onBarcodeScanned={({ data }) => {
              if (scannedRef.current || !data) return;
              scannedRef.current = true;
              onScanned(data);
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-three px-five">
            <Ionicons name="camera-outline" size={40} color="#ffffff" />
            <ThemedText className="text-center text-white">
              Precisamos de acesso à câmera para ler o código de barras.
            </ThemedText>
            {permission?.canAskAgain !== false ? (
              <GradientButton
                label="Permitir câmera"
                colors={Gradients.primary}
                onPress={requestPermission}
                className="self-stretch"
              />
            ) : (
              <ThemedText type="small" className="text-center text-white/70">
                Libere o acesso à câmera nas configurações do aparelho.
              </ThemedText>
            )}
          </View>
        )}

        {permission?.granted && (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
            <View className="h-40 w-72 rounded-three border-2 border-white" />
            <ThemedText type="small" className="mt-three text-white">
              Aponte para o código de barras
            </ThemedText>
          </View>
        )}

        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Fechar leitor"
          className="absolute left-four h-10 w-10 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 16 }}
        >
          <Ionicons name="close" size={22} color="#ffffff" />
        </Pressable>
      </View>
    </Modal>
  );
}
