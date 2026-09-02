import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { videoLibrary } from '@/data/mock';
import { getCurrentPhase } from '@/data/program';

const toneMap = {
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

export default function VideotecaTabScreen() {
  const { client } = useClient();

  if (!client) return null;

  const phase = getCurrentPhase(client.phase);
  const filteredLibrary = videoLibrary
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.phase === client.phase),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow={`Fase ${phase.id} · ${phase.name}`}
          title="Videoteca"
          subtitle="Vídeos y PDFs sobre nutrición, entreno y hábitos de tu fase actual"
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        {filteredLibrary.length === 0 ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay contenido disponible para tu fase actual.
            </ThemedText>
          </Card>
        ) : (
          filteredLibrary.map((cat) => {
            const colors = toneMap[cat.tone];
            return (
              <View key={cat.category}>
                <SectionHeader title={cat.category} />
                <View style={styles.items}>
                  {cat.items.map((item) => (
                    <Card key={item.title} style={styles.item}>
                      <IconBadge name={cat.icon} color={colors.color} background={colors.bg} size={44} />
                      <View style={styles.itemBody}>
                        <ThemedText type="h3">{item.title}</ThemedText>
                        <View style={styles.meta}>
                          <Badge label={item.type} tone={cat.tone === 'gold' ? 'gold' : 'primary'} />
                          <ThemedText type="caption" themeColor="textMuted">
                            {item.length}
                          </ThemedText>
                        </View>
                      </View>
                      <Ionicons
                        name={item.type === 'Vídeo' ? 'play-circle' : 'document-text'}
                        size={28}
                        color={colors.color}
                      />
                    </Card>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
  },
  items: { gap: Spacing.two },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemBody: {
    flex: 1,
    gap: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
