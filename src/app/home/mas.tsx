import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { client } from '@/data/mock';

const menuItems = [
  {
    title: 'Revisiones',
    subtitle: 'Citas semanales y recordatorios',
    icon: 'calendar-outline',
    href: '/revisiones',
    tone: 'primary',
    badge: 'Próxima: Vie 23 may',
  },
  {
    title: 'Videoteca formativa',
    subtitle: 'Nutrición, entreno, hábitos y sueño',
    icon: 'play-circle-outline',
    href: '/videoteca',
    tone: 'gold',
    badge: '12 recursos',
  },
  {
    title: 'Resultados finales',
    subtitle: 'Comparativa y gráfica al terminar',
    icon: 'trophy-outline',
    href: '/resultados',
    tone: 'purple',
    badge: 'Semana 12',
  },
] as const;

const toneColors = {
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

export default function MasScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow="Más opciones"
          title="Tu espacio"
          subtitle="Revisiones, formación y resultados"
          gradient={Brand.gradientNavy}
        />
      }>
      <Card style={[styles.profileCard, { marginTop: -Spacing.four }]}>
        <Image source={{ uri: client.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.profileInfo}>
          <ThemedText type="h3">{client.fullName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {client.plan} · {client.program}
          </ThemedText>
          <Badge label={`Semana ${client.week}/${client.totalWeeks}`} tone="primary" />
        </View>
        <Pressable style={[styles.settingsBtn, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
        </Pressable>
      </Card>

      <View>
        <SectionHeader title="Explorar" />
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const colors = toneColors[item.tone];
            return (
              <Pressable
                key={item.title}
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={() => router.push(item.href)}>
                <Card style={styles.menuItem}>
                  <IconBadge name={item.icon} color={colors.color} background={colors.bg} size={48} />
                  <View style={styles.menuBody}>
                    <ThemedText type="h3">{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.subtitle}
                    </ThemedText>
                    <Badge label={item.badge} tone={item.tone === 'purple' ? 'primary' : item.tone} />
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.renewCard}>
        <View style={styles.renewRow}>
          <IconBadge name="sparkles" color={theme.gold} background={theme.goldSoft} size={44} />
          <View style={styles.renewBody}>
            <ThemedText type="h3">Renovación con descuento</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Al completar las 12 semanas podrás renovar tu plan con un 15% de descuento.
            </ThemedText>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: { gap: Spacing.three },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  menuBody: {
    flex: 1,
    gap: 4,
  },
  renewCard: {
    marginTop: Spacing.one,
  },
  renewRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  renewBody: {
    flex: 1,
    gap: 4,
  },
  pressed: { opacity: 0.7 },
});
