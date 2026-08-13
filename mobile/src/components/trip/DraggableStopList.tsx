import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import StopCard from './StopCard';
import { colors } from '../../constants/colors';

// Dữ liệu mẫu (Task 4.1)
const initialData = [
  { id: '1', title: 'Cà phê Vợt', type: 'Cafe', duration: '1 giờ' },
  { id: '2', title: 'Chợ Đà Lạt', type: 'Tham quan', duration: '2 giờ' },
  { id: '3', title: 'Hồ Tuyền Lâm', type: 'Check-in', duration: '3 giờ' },
  { id: '4', title: 'Tiệm bánh Cối Xay Gió', type: 'Ăn uống', duration: '30 phút' },
  { id: '5', title: 'Đỉnh Langbiang', type: 'Khám phá', duration: '4 giờ' },
];

export default function DraggableStopList() {
  const [data, setData] = useState(initialData);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<typeof initialData[0]>) => {
    return (
      <StopCard
        title={item.title}
        type={item.type}
        duration={item.duration}
        drag={drag}
        isActive={isActive}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lộ trình dự kiến</Text>
        <Text style={styles.headerSubtitle}>Nhấn giữ để kéo thả thứ tự</Text>
      </View>
      <DraggableFlatList
        data={data}
        onDragEnd={({ data }) => setData(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
});
