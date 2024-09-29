import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedSensor,
  SensorType,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function App() {
  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: 20,
  });

  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);

  const avatarStyle = useAnimatedStyle(() => {
    const { pitch, roll } = rotation.sensor.value;
    
    // Calculamos el nuevo desplazamiento
    const newX = positionX.value + roll * 2;
    const newY = positionY.value + pitch * 2;
    
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
    width: '110%',
    height: '110%',
    resizeMode: 'cover',
  },
  avatar: {
    position: "absolute",
    width: 100,
    height: 100,
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