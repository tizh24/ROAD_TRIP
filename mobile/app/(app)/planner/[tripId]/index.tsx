import React from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapBackground from '../../../../src/components/map/MapBackground';
import DraggableStopList from '../../../../src/components/trip/DraggableStopList';
import { colors } from '../../../../src/constants/colors';

export default function TripPlannerScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapBackground />
        <SafeAreaView style={styles.overlay}>
          <View style={styles.mapSpacer} />
          <View style={styles.bottomSheet}>
            <DraggableStopList />
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
  },
  mapSpacer: {
    flex: 0.4,
  },
  bottomSheet: {
    flex: 0.6,
    backgroundColor: colors.glassBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
});
