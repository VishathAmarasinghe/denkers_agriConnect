import { APPLICATION_FARMER } from "@/config/config";
import { useAppSelector } from "@/slice/store";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function Layout() {
  const authSlice = useAppSelector((state) => state?.auth);
  const roles = authSlice?.roles || [];
  
  return (
    <View className="flex-1 bg-white">
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#52B788",
        tabBarInactiveTintColor: "#9BBBC8",
        tabBarStyle: {
          width: "85%",
          marginHorizontal: "auto",
          backgroundColor: "#ffffff",
          borderRadius: 25,
          paddingBottom: 0,
          overflow: "hidden",
          height: 70,
          justifyContent: "center",
          alignSelf: "center",
          flexDirection: "column",
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          borderTopWidth: 1,
          borderTopColor: "#E3F2FD",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
    >

      {/* HOME TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="home"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}

      {/* CHAT AGENT TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="chatAgent"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="chat"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}

      {/* FIELD VISIT TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="fieldVisit"
          options={{
            title: "Field Visit",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="location-on"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}

      {/* HARVEST HUB TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="harvestHub"
          options={{
            title: "Harvest",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="agriculture"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}

      {/* MACHINE RENT TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="machineRent"
          options={{
            title: "Machines",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="build"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}

      {/* SOIL MANAGEMENT TAB */}
      {roles.includes(APPLICATION_FARMER) && (
        <Tabs.Screen
          name="soilManagement"
          options={{
            title: "Soil",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="eco"
                size={24}
                color={focused ? "#52B788" : "#9BBBC8"}
              />
            ),
          }}
        />
      )}
    </Tabs>
    </View>
  );
}
