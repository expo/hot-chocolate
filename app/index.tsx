import { ScrollView, View, Text, PlatformColor } from "react-native";
import React, { useEffect } from "react";
import { List, Button, Next as SwiftUI, Label } from "@expo/ui/swift-ui";
import { useNavigation } from "@react-navigation/native";

import FlavourListJson from "../assets/FlavourList.json";
import LocationListJson from "../assets/LocationList.json";

interface Flavour {
  id: number;
  name: string;
  description: string;
  location: number;
}

interface Store {
  address: string;
  hours: string;
  point: number[];
  name: string;
}

interface Location {
  id: number;
  name: string;
  stores: Store[];
  description: string;
}

interface CombinedLocation extends Location {
  name: string;
  flavours: Flavour[];
}

export default function Index() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLargeTitle: true,
      title: "Flavour List",
      headerSearchBarOptions: { placeholder: "Search" },
      headerTransparent: true,
      headerStyle: {
        backgroundColor: PlatformColor("secondarySystemBackground"),
      },
    });
  }, [navigation]);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: PlatformColor("secondarySystemBackground"),
      }}
      contentInsetAdjustmentBehavior="always"
    >
      <SwiftUI.Host style={{ height: 3000, marginTop: -30 }}>
        <SwiftUI.Form>
          {/* need to remove default button style, add > icon */}
          {DATA.map((location) => (
            <SwiftUI.Button
              onPress={() => {
                alert("pressed");
              }}
              key={location.id}
            >
              {location.name}
            </SwiftUI.Button>
          ))}
        </SwiftUI.Form>
      </SwiftUI.Host>
    </ScrollView>
  );

  // return (
  //   <List
  //     scrollEnabled={true}
  //     editModeEnabled={false}
  //     onSelectionChange={(items) => {
  //       // alert(`indexes of selected items: ${items.join(", ")}`)
  //     }}
  //     moveEnabled={false}
  //     onMoveItem={(from, to) => {
  //       // alert(`moved item at index ${from} to index ${to}`)
  //     }}
  //     onDeleteItem={(item) => alert(`deleted item at index: ${item}`)}
  //     style={{ flex: 1 }}
  //     // listStyle={listStyleOptions[selectedIndex ?? 0]}
  //     deleteEnabled={false}
  //     // selectEnabled={false}
  //   >
  //     {DATA.map((item, index) => (
  //       <Label
  //         key={index}
  //         title={item.name}
  //         systemImage="cloud.sun.fill"
  //         color="#ccc"
  //       />
  //     ))}
  //   </List>
  // );
}

function getCombinedData() {
  const locations: Location[] = LocationListJson.data;
  const flavours: Flavour[] = FlavourListJson.data;

  const processedData: CombinedLocation[] = locations
    .map((location) => {
      const locationFlavours = flavours.filter(
        (flavour) => flavour.location === location.id,
      );
      return {
        ...location,
        flavours: locationFlavours,
      };
    })
    .filter((location) => location.flavours.length > 0); // Only include locations with flavours

  return processedData;
}
const DATA = getCombinedData();
