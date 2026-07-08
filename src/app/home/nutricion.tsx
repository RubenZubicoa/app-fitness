import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { macros, meals, shoppingList, supplements } from '@/data/mock';

const toneMap = {
  primary: 'primary',
  gold: 'gold',
  teal: 'teal',
} as const;

export default function NutricionScreen() {
  const theme = useTheme();
  const calorieProgress = macros.calories / macros.target;

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow="Área nutrición"
          title="Tu planificación"
          subtitle="Menú personalizado, lista de la compra y suplementación"
          gradient={Brand.gradientNavy}
        />
      }>
      <View>
        <SectionHeader title="Macros del día" />
        <Card>
          <View style={styles.macroTop}>
            <ProgressRing
              progress={calorieProgress}
              size={120}
              strokeWidth={11}
              colors={Brand.gradientGold}
              value={`${macros.calories}`}
              label="kcal"
            />
            <View style={styles.macroInfo}>
              <ThemedText type="h3">Objetivo diario</ThemedText>
              <ThemedText type="body" themeColor="textSecondary">
                {macros.target} kcal · Recomposición corporal
              </ThemedText>
              <Badge label="Plan activo · Semana 6" tone="gold" />
            </View>
          </View>
          <View style={styles.macrosRow}>
            {macros.items.map((m) => {
              const tone = toneMap[m.tone];
              const color = theme[tone];
              const pct = m.grams / m.target;
              return (
                <View key={m.key} style={styles.macroItem}>
                  <ProgressRing
                    progress={pct}
                    size={76}
                    strokeWidth={7}
                    colors={[color, color]}
                    value={`${m.grams}g`}
                    label={m.label}
                  />
                  <ThemedText type="caption" themeColor="textMuted">
                    / {m.target}g
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      <View>
        <SectionHeader title="Comidas de hoy" actionLabel="Ver plan completo" />
        <View style={styles.meals}>
          {meals.map((meal) => (
            <Card key={meal.name} style={styles.mealCard}>
              <View style={styles.mealRow}>
                <IconBadge
                  name={meal.icon}
                  color={theme.gold}
                  background={theme.goldSoft}
                  size={42}
                />
                <View style={styles.mealBody}>
                  <View style={styles.mealTop}>
                    <ThemedText type="h3">{meal.name}</ThemedText>
                    <Badge label={`${meal.kcal} kcal`} tone="gold" />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {meal.time} · {meal.items}
                  </ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View>
        <SectionHeader title="Lista de la compra" actionLabel="Descargar PDF" />
        <Card>
          <View style={styles.shopProgress}>
            <ThemedText type="small" themeColor="textSecondary">
              {shoppingList.filter((i) => i.done).length} de {shoppingList.length} productos
            </ThemedText>
            <View style={[styles.track, { backgroundColor: theme.track }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${(shoppingList.filter((i) => i.done).length / shoppingList.length) * 100}%`,
                    backgroundColor: theme.gold,
                  },
                ]}
              />
            </View>
          </View>
          {shoppingList.map((item) => (
            <View key={item.item} style={styles.shopRow}>
              <View
                style={[
                  styles.checkbox,
                  item.done && { backgroundColor: theme.gold, borderColor: theme.gold },
                ]}>
                {item.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <ThemedText
                type="body"
                style={[styles.shopText, item.done && styles.doneText]}
                themeColor={item.done ? 'textMuted' : 'text'}>
                {item.item}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {item.qty}
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      <View>
        <SectionHeader title="Suplementación" />
        <View style={styles.supplements}>
          {supplements.map((s) => (
            <Card key={s.name} style={styles.supCard}>
              <IconBadge name={s.icon} color={theme.primary} background={theme.primarySoft} />
              <ThemedText type="smallBold">{s.name}</ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                {s.dose}
              </ThemedText>
              <Badge label={s.when} tone="primary" />
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  macroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.four,
  },
  macroInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.two,
  },
  macroItem: {
    alignItems: 'center',
    gap: 4,
  },
  meals: { gap: Spacing.two },
  mealCard: { paddingVertical: Spacing.two + 4 },
  mealRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  mealBody: { flex: 1, gap: 4 },
  mealTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  shopProgress: { gap: Spacing.two, marginBottom: Spacing.three },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E9F1',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C5CEDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopText: { flex: 1 },
  doneText: { textDecorationLine: 'line-through' },
  supplements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  supCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
});
