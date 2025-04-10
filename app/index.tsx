import { Text, View } from "react-native";
import { AppleMaps } from "expo-maps";

// @ts-ignore
import FlavorList from "../assets/FlavorList.json";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
