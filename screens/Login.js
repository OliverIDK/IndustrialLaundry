import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { TextInput } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/fb';
import Icon from "@expo/vector-icons/Entypo";
import { Alert } from 'react-native';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': require('../src/Assets/fonts/Quicksand-Regular.ttf'),
  });

  const handleLogin = async () => {
  // Validar campos vacíos
  if (!email.trim()) {
    Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
    return;
  }
  if (!password) {
    Alert.alert('Error', 'Por favor ingresa tu contraseña');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigation.navigate('AuthLoadingScreen');
  } catch (error) {
    console.error(error);
    // Puedes afinar el mensaje según el código de error de Firebase
    let message = 'Correo o contraseña inválidos';
    if (error.code === 'auth/invalid-email') {
      message = 'El correo electrónico no es válido';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No se encontró una cuenta con ese correo';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Contraseña incorrecta';
    } else if (error.code === 'auth/user-disabled') {
      message = 'Esta cuenta ha sido deshabilitada';
    }

    Alert.alert('Error', message);
  }
};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.head}>
          <ImageBackground
            style={styles.logo}
            source={require("../src/Assets/Imagenes/logo1.png")}
            resizeMode='contain'
          />
        </View>
        <View style={styles.body}>
          <TextInput
            style={styles.inputs}
            label="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            mode="outlined"
            activeOutlineColor="#004aad"
            outlineColor="#ccc"
            outlineStyle={{
              borderRadius: 12,
              borderWidth: 1.5,
            }}
            theme={{
              colors: {
                background: "#fff",
                placeholder: "#555",
                text: "#555",
              },
              fonts: {
                regular: {
                  fontFamily: 'Quicksand-Regular',
                  fontWeight: 'normal',
                },
              },
            }}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    name="mail"
                    size={24}
                    color={isFocused ? "#004aad" : "#555"}
                  />
                )}
              />
            }
          />

          <TextInput
            style={styles.inputs}
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={(password) => setPassword(password)}
            onFocus={() => setIsFocusedPassword(true)}
            onBlur={() => setIsFocusedPassword(false)}
            mode="outlined"
            secureTextEntry={!showPassword}
            activeOutlineColor="#004aad"
            outlineColor="#ccc"
            outlineStyle={{
              borderRadius: 12,
              borderWidth: 1.5,
            }}
            theme={{
              colors: {
                background: "#fff",
                placeholder: "#555",
                text: "#555",
              },
            }}
            left={
              <TextInput.Icon
                icon={() => (
                  <Icon
                    name="lock"
                    size={24}
                    color={isFocusedPassword ? "#004aad" : "#555"}
                  />
                )}
              />
            }
            right={
              password.length > 0 && (
                <TextInput.Icon
                  icon={() => (
                    <Icon
                      name={showPassword ? "eye-with-line" : "eye"}
                      size={20}
                      color={isFocusedPassword ? "#004aad" : "#555"}
                    />
                  )}
                  onPress={() => setShowPassword(!showPassword)}
                />
              )
            }
          />
          <TouchableOpacity style={styles.btnSignIn} onPress={handleLogin}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  head: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
    height: 280,
    backgroundColor: "#004aad",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  logo: {
    width: 410,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    paddingTop: 20,
  },
  inputs: {
    width: "90%",
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Quicksand-Regular',
  },
  btnSignIn: {
    height: 50,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#004aad",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
  },
});
