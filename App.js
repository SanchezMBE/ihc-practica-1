import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedSensor,
  SensorType,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AVATAR_SIZE = 100;

export default function App() {
  // Bloquear orientación del dispositivo
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
    setOrientation();
  }, []);

  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: 20,
  });

  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  const avatarStyle = useAnimatedStyle(() => {
    const { pitch, roll } = rotation.sensor.value;
    
    // Calculamos el nuevo desplazamiento
    let newX = positionX.value + Number(roll.toFixed(1)) * 6;
    let newY = positionY.value + Number(pitch.toFixed(1)) * 6;
    
    // Limitamos el desplazamiento dentro de los límites de la pantalla
    newX = Math.max(-(screenWidth - AVATAR_SIZE) / 2 + 10, Math.min(newX, (screenWidth - AVATAR_SIZE) / 2 - 10));
    newY = Math.max(-(screenHeight - AVATAR_SIZE) / 2, Math.min(newY, (screenHeight - AVATAR_SIZE) / 2));
    
    // Actualizamos los valores compartidos
    positionX.value = newX;
    positionY.value = newY;

    return {
      transform: [
        { translateX: withSpring(newX, { damping: 200 }) },
        { translateY: withSpring(newY, { damping: 200 }) },
      ],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const { pitch, roll } = rotation.sensor.value;
    return {
      transform: [
        { translateX: withSpring(-roll * 25, { damping: 200 }) },
        { translateY: withSpring(-pitch * 25, { damping: 200 }) },
      ],
    };
  });

  // Efecto para restablecer la posición cuando se desmonta el componente
  useEffect(() => {
    return () => {
      positionX.value = 0;
      positionY.value = 0;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.background, backgroundStyle]}
        source={require("./assets/background.jpg")}
      />
      <Animated.Image
        style={[styles.avatar, avatarStyle]}
        source={require("./assets/avatar.jpg")}
      />
      <Text style={styles.text}>Inclina la pantalla</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: '140%',
    height: '140%',
    resizeMode: 'cover',
  },
  avatar: {
    position: "absolute",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  text: {
    fontWeight: "bold",
    fontSize: 25,
    textAlign: "center",
    color: "black",
    position: "absolute",
    top: 100,
  },
});