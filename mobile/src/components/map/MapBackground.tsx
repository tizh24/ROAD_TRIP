import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function MapBackground() {
  return (
    <View style={styles.container}>
      <Text style={{ color: '#aaa' }}>[Bản đồ Mapbox sẽ hiển thị ở đây trên thiết bị thật]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E'
  },
});
