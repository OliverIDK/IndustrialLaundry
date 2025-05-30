import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { Image, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

import Login from "./screens/Login";
import Prendas from "./screens/Prendas";
import Inventario from "./screens/Inventario";
import Blancos from "./screens/Blancos";
import Manteleria from "./screens/Manteleria";
import Icon from "@expo/vector-icons/Entypo";
import Usuarios from "./screens/Usuarios";
import AgregarProducto from "./screens/AgregarProducto";
import EditarProducto from "./screens/EditarProducto";
import AgregarPrenda from "./screens/AgregarPrenda";
import EditarPrenda from "./screens/EditarPrenda";
import TipoLavado from "./screens/TipoLavado";
import PrecioPrenda from "./screens/PrecioPrenda";
import AgregarTipoLavado from "./screens/AgregarTipoLavado";
import AgregarPrecio from "./screens/AgregarPrecio";
import EditarTipoLavado from "./screens/EditarTipoLavado";
import AgregarUsuarios from "./screens/AgregarUsuarios";
import AgregarNota from "./screens/AgregarNota";
import AgregarNotaPrendas from "./screens/AgregarNotaPrendas";
import AgregarNotaEntrega from "./screens/AgregarNotaEntrega";
import AgregarNotaCompletada from "./screens/AgregarNotaCompletada";
import GPS from "./screens/Gps";
import Mapa from "./screens/Mapa";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import Configuracion from "./screens/Configuracion";
import Cliente from "./screens/Cliente";
import NotasCliente from "./screens/NotasCliente";
import Steps from "./screens/Steps";
import EditarUsuario from "./screens/EditarUsuario";
import NotasChofer from "./screens/NotasChofer";
import NotasLavador from "./screens/NotasLavador";
import NotasAuxiliar from "./screens/NotasAuxiliar";
import EditarPerfil from "./screens/EditarPerfil";
import EditarNota from "./screens/EditarNota";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MaterialTaps = createMaterialTopTabNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AuthLoadingScreen"
        component={AuthLoadingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TabGroupAdmin"
        component={TabGroupAdmin}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="TabGroupAuxiliar"
        component={TabGroupAuxiliar}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="TabGroupLavador"
        component={TabGroupLavador}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="TabGroupSupervisor"
        component={TabGroupSupervisor}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="TabGroupChofer"
        component={TabGroupChofer}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="TabGroupCliente"
        component={TabGroupCliente}
        options={{
          headerShown: false,
          title: "Volver",
        }}
      />
      <Stack.Screen
        name="AgregarProducto"
        component={AgregarProducto}
        options={{
          title: "Inventario",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarProducto"
        component={EditarProducto}
        options={{
          title: "Inventario",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarPrenda"
        component={AgregarPrenda}
        options={{
          title: "Prenda",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarPrenda"
        component={EditarPrenda}
        options={{
          title: "Prenda",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarTipoLavado"
        component={AgregarTipoLavado}
        options={{
          title: "Tipo de Lavado",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarPrecio"
        component={AgregarPrecio}
        options={{
          title: "Precios",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarTipoLavado"
        component={EditarTipoLavado}
        options={{
          title: "Tipos de Lavado",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarUsuarios"
        component={AgregarUsuarios}
        options={{
          title: "Usuarios",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarNota"
        component={AgregarNota}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarNotaPrendas"
        component={AgregarNotaPrendas}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarNotaEntrega"
        component={AgregarNotaEntrega}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AgregarNotaCompletada"
        component={AgregarNotaCompletada}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Mapa"
        component={Mapa}
        options={{
          title: "Mapa",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="Steps"
        component={Steps}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarUsuario"
        component={EditarUsuario}
        options={{
          title: "Usuario",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfil}
        options={{
          title: "Usuario",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EditarNota"
        component={EditarNota}
        options={{
          title: "Nota",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
function TabGroupAdmin() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        animation: "shift",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#144E78",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name == "Servicios") {
            iconName = "home";
          } else if (route.name == "Usuarios") {
            iconName = "users";
          } else if (route.name == "Tabs") {
            iconName = "inbox";
          } else if (route.name == "Inventario") {
            iconName = "clipboard";
          } else if (route.name == "Mapa") {
            iconName = "location-pin";
          } else if (route.name == "Configuracion") {
            iconName = "cog";
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="Servicios"
        component={TapsService}
        options={{ title: "Servicios" }}
      />
      <Tab.Screen
        name="Usuarios"
        component={Usuarios}
        options={{ title: "Usuarios" }}
      />
      <Tab.Screen name="Tabs" component={Taps} options={{ title: "Notas" }} />
      <Tab.Screen name="Inventario" component={Inventario} />
      <Tab.Screen name="Mapa" component={Mapa} />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}
function TabGroupAuxiliar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        animation: "shift",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#144E78",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name == "Servicios") {
            iconName = "home";
          } else if (route.name == "Usuarios") {
            iconName = "users";
          } else if (route.name == "Tabs") {
            iconName = "inbox";
          } else if (route.name == "Inventario") {
            iconName = "clipboard";
          } else if (route.name == "GPS") {
            iconName = "location-pin";
          } else if (route.name == "Configuracion") {
            iconName = "cog";
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      
      <Tab.Screen
        name="Tabs"
        component={NotasAuxiliar}
        options={{ title: "Notas" }}
      />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

function TabGroupLavador() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        animation: "shift",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#144E78",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name == "Servicios") {
            iconName = "home";
          } else if (route.name == "Usuarios") {
            iconName = "users";
          } else if (route.name == "Notas") {
            iconName = "inbox";
          } else if (route.name == "Inventario") {
            iconName = "clipboard";
          } else if (route.name == "GPS") {
            iconName = "location-pin";
          } else if (route.name == "Configuracion") {
            iconName = "cog";
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Notas" component={NotasLavador} />
      <Tab.Screen name="Inventario" component={Inventario} />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

function TabGroupSupervisor() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        animation: "shift",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#144E78",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name == "Tabs") {
            iconName = "home";
          } else if (route.name == "Lavar") {
            iconName = "air ";
          } else if (route.name == "Planchar") {
            iconName = "inbox";
          } else if (route.name == "Inventario") {
            iconName = "clipboard";
          } else if (route.name == "Configuracion") {
            iconName = "cog";
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Tabs" component={Taps} options={{ title: "Notas" }} />
      <Tab.Screen name="Inventario" component={Inventario} />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}
function TabGroupChofer() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        animation: "shift",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#144E78",
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name == "NotasChofer") {
            iconName = "inbox";
          } else if (route.name == "Configuracion") {
            iconName = "cog";
          }
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="NotasChofer"
        component={NotasChofer}
        options={{ title: "NotasChofer" }}
      />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

function TabGroupCliente() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const baseOptions = {
          tabBarShowLabel: false,
          animation: "shift",
          headerShadowVisible: false,
          tabBarActiveTintColor: "#144E78",
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Servicios") iconName = "home";
            else if (route.name === "Usuarios") iconName = "users";
            else if (route.name === "Tabs") iconName = "inbox";
            else if (route.name === "Configuracion") iconName = "cog";
            return <Icon name={iconName} color={color} size={size} />;
          },
        };

        // Personalizar solo para "Servicios"
        if (route.name === "Servicios") {
          return {
            ...baseOptions,
            headerTitleAlign: "center",
            headerTitle: () => (
              <Image
                source={require("./src/Assets/Imagenes/logo2.png")}
                style={{ width: 160, height: 50, resizeMode: "contain" }}
              />
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  console.log("Notificaciones presionadas");
                }}
                style={{ marginRight: 15 }}
              >
                <Feather name="bell" size={24} color="#2196f3" />
              </TouchableOpacity>
            ),
          };
        }

        return baseOptions;
      }}
    >
      <Tab.Screen
        name="Servicios"
        component={Cliente}
        options={{ title: "Servicios" }} // No afecta, overrideado
      />
      <Tab.Screen
        name="Tabs"
        component={NotasCliente}
        options={{ title: "Notas" }}
      />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

function Taps() {
  return (
    <MaterialTaps.Navigator
      screenOptions={{
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerStyle: {
          shadowOpacity: 0,
          elevation: 0,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
        tabBarActiveTintColor: "#144E78",
        tabBarInactiveTintColor: "#888",
        tabBarIndicatorStyle: {
          backgroundColor: "#144E78",
        },
      }}
    >
      <MaterialTaps.Screen
        name="Blancos"
        component={Blancos}
        options={{
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <MaterialTaps.Screen
        name="Manteleria"
        component={Manteleria}
        options={{
          title: "Manteleria",
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </MaterialTaps.Navigator>
  );
}
function TapsService() {
  return (
    <MaterialTaps.Navigator
      screenOptions={{
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerStyle: {
          shadowOpacity: 0,
          elevation: 0,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
        tabBarActiveTintColor: "#144E78",
        tabBarInactiveTintColor: "#888",
        tabBarIndicatorStyle: {
          backgroundColor: "#144E78",
        },
      }}
    >
      <MaterialTaps.Screen
        name="Prendas"
        component={Prendas}
        options={{
          title: "Prendas",
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <MaterialTaps.Screen
        name="TipoLavado"
        component={TipoLavado}
        options={{
          title: "Tipos de Lavado",
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <MaterialTaps.Screen
        name="PrecioPrenda"
        component={PrecioPrenda}
        options={{
          title: "Precios",
          tabBarLabelStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </MaterialTaps.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}
