import { ScrollView, View } from "react-native";
import React from 'react';
import { Next as SwiftUI } from '@expo/ui/swift-ui';

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
  flavours: Flavour[];
}

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <SwiftUI.Host matchContents>
          <SwiftUI.Form>
            {DATA.map(location => (
              <SwiftUI.Text key={location.id}>{location.name}</SwiftUI.Text>
            ))}
            <SwiftUI.Text>hello</SwiftUI.Text>
          </SwiftUI.Form>
        </SwiftUI.Host>

      </ScrollView>
    </View>
  );
}

function getCombinedData() {
  const locations: Location[] = LocationListJson.data;
  const flavours: Flavour[] = FlavourListJson.data;

  const processedData: CombinedLocation[] = locations.map(location => {
    const locationFlavours = flavours.filter(flavour => flavour.location === location.id);
    return {
      ...location,
      flavours: locationFlavours,
    };
  }).filter(location => location.flavours.length > 0); // Only include locations with flavours

  return processedData;
}
const DATA = getCombinedData();
