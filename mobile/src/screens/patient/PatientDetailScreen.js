import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../../store/slices/patientSlice';
import SummaryTab from './SummaryTab';
import AnamnesisTab from './AnamnesisTab';
import TestsTab from './TestsTab';
import AITab from './AITabNew';
import ChatTab from './ChatTabNew';
import colors from '../../constants/colors';

export default function PatientDetailScreen({ route }) {
  const { patientId } = route.params;
  const layout = useWindowDimensions();
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patient);

  const patient = patients.find(p => p.id === patientId);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'summary', title: 'Özet' },
    { key: 'anamnesis', title: 'Anamnez' },
    { key: 'tests', title: 'Tetkikler' },
    { key: 'ai', title: 'AI' },
    { key: 'chat', title: 'Chat' },
  ]);

  useEffect(() => {
    if (!patient) {
      dispatch(fetchPatients());
    }
  }, [dispatch, patient]);

  const renderScene = ({ route }) => {
    const sceneStyle = { flex: 1 };
    
    switch (route.key) {
      case 'summary':
        return <View style={sceneStyle}><SummaryTab patientId={patientId} patient={patient} /></View>;
      case 'anamnesis':
        return <View style={sceneStyle}><AnamnesisTab patientId={patientId} /></View>;
      case 'tests':
        return <View style={sceneStyle}><TestsTab patientId={patientId} /></View>;
      case 'ai':
        return <View style={sceneStyle}><AITab patientId={patientId} /></View>;
      case 'chat':
        return <View style={sceneStyle}><ChatTab patientId={patientId} /></View>;
      default:
        return null;
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      activeColor={colors.primary}
      inactiveColor={colors.gray}
      scrollEnabled
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.white,
    elevation: 2,
  },
  indicator: {
    backgroundColor: colors.primary,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});
