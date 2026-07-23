import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { FloatingTabList, TabButton } from '@/components/ui/tab-bar';

export default function HomeTabsLayout() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <FloatingTabList>
          <TabTrigger name="index" href="/home" asChild>
            <TabButton icon="home-outline" activeIcon="home" label="Inicio" />
          </TabTrigger>
          <TabTrigger name="progreso" href="/home/progreso" asChild>
            <TabButton icon="stats-chart-outline" activeIcon="stats-chart" label="Progreso" />
          </TabTrigger>
          <TabTrigger name="nutricion" href="/home/nutricion" asChild>
            <TabButton icon="nutrition-outline" activeIcon="nutrition" label="Nutrición" />
          </TabTrigger>
          <TabTrigger name="entreno" href="/home/entreno" asChild>
            <TabButton icon="barbell-outline" activeIcon="barbell" label="Entreno" />
          </TabTrigger>
          <TabTrigger name="videoteca" href="/home/videoteca" asChild>
            <TabButton icon="play-circle-outline" activeIcon="play-circle" label="Videos" />
          </TabTrigger>
          <TabTrigger name="mas" href="/home/mas" asChild>
            <TabButton icon="grid-outline" activeIcon="grid" label="Más" />
          </TabTrigger>
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
    height: '100%',
  },
  slot: {
    flex: 1,
    height: '100%',
  },
});
