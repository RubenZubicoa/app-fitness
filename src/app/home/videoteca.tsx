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
import { videoLibrary } from '@/data/mock';

const toneMap = {
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

export default function VideotecaTabScreen() {
  return (
    <Screen
      header={
        <GradientHeader
          eyebrow="Formación"
          title="Videoteca"
          subtitle="Vídeos y PDFs sobre nutrición, entreno y hábitos"
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        {videoLibrary.map((cat) => {
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
        })}
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
