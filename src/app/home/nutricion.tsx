import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useMacros } from '@/context/macros-context';
import { useShoppingList } from '@/context/shopping-list-context';
import { useMeals } from '@/context/meal-context';
import { useSupplements } from '@/context/supplements-context';
import { getCurrentPhase } from '@/data/program';
import { useTheme } from '@/hooks/use-theme';

const toneMap = {
  primary: 'primary',
  gold: 'gold',
  teal: 'teal',
} as const;

export default function NutricionScreen() {
  const theme = useTheme();
  const { client } = useClient();
  const { macros, loading: macrosLoading, error: macrosError } = useMacros();
  const {
    shoppingList,
    loading: shoppingLoading,
    saving: shoppingSaving,
    error: shoppingError,
    toggleItemDone,
    addItem,
    removeItem,
    createEmptyList,
    deleteList,
  } = useShoppingList();
  const {
    supplements,
    loading: supplementsLoading,
    error: supplementsError,
  } = useSupplements();
  const {
    meal,
    loading: mealsLoading,
    error: mealsError,
  } = useMeals();
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const toggleSlot = useCallback(
    (label: string) => setExpandedSlot((prev) => (prev === label ? null : label)),
    [],
  );
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('');

  if (!client) return null;

  const phase = getCurrentPhase(client.phase);
  const items = shoppingList?.list ?? [];
  const doneCount = items.filter((i) => i.done).length;

  const confirmDeleteList = () => {
    const message = '¿Seguro que quieres eliminar toda la lista de la compra?';

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined' ? window.confirm(message) : true;
      if (confirmed) void deleteList();
      return;
    }

    Alert.alert('Eliminar lista', message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void deleteList();
        },
      },
    ]);
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    await addItem(newItem, newQty);
    setNewItem('');
    setNewQty('');
  };

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow={`Área nutrición · Fase ${phase.id}`}
          title="Tu planificación"
          subtitle={`${phase.name}: menú personalizado, lista de la compra y suplementación`}
          gradient={Brand.gradientNavy}
        />
      }>
      <View>
        <SectionHeader title="Macros del día" />
        <Card>
          {macrosLoading ? (
            <ThemedText type="body" themeColor="textSecondary">
              Cargando macros…
            </ThemedText>
          ) : macrosError ? (
            <ThemedText type="body" themeColor="textSecondary">
              {macrosError}
            </ThemedText>
          ) : !macros ? (
            <ThemedText type="body" themeColor="textSecondary">
              Aún no hay macros registrados.
            </ThemedText>
          ) : (
            <>
              <View style={styles.macroTop}>
                <View style={styles.calorieGoal}>
                  <ThemedText type="display" style={styles.calorieValue}>
                    {macros.target}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    kcal
                  </ThemedText>
                </View>
                <View style={styles.macroInfo}>
                  <ThemedText type="h3">Objetivo diario</ThemedText>
                  <ThemedText type="body" themeColor="textSecondary">
                    Recomposición corporal
                  </ThemedText>
                  <Badge label={`Fase ${phase.id} · Semana ${client.week}`} tone="gold" />
                </View>
              </View>
              <View style={styles.macrosRow}>
                {macros.items.map((m) => {
                  const toneKey = (m.tone in toneMap ? m.tone : 'primary') as keyof typeof toneMap;
                  const tone = toneMap[toneKey];
                  const color = theme[tone];
                  const pct = m.target > 0 ? m.grams / m.target : 0;
                  return (
                    <View key={m.key} style={styles.macroItem}>
                      <ProgressRing
                        progress={pct}
                        size={72}
                        strokeWidth={7}
                        colors={[color, color]}>
                        <ThemedText type="smallBold" style={styles.macroPct}>
                          {Math.round(pct * 100)}%
                        </ThemedText>
                      </ProgressRing>
                      <View style={styles.macroMeta}>
                        <ThemedText type="smallBold" style={styles.macroLabel} numberOfLines={2}>
                          {m.shortLabel}
                        </ThemedText>
                        <ThemedText type="caption" themeColor="textMuted" style={styles.macroTarget}>
                          {m.grams} / {m.target} g
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </Card>
      </View>

      <View>
        <SectionHeader title="Comidas de hoy" />
        {mealsLoading ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Cargando comidas…
            </ThemedText>
          </Card>
        ) : mealsError ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">{mealsError}</ThemedText>
          </Card>
        ) : !meal?.slots.length ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay plan de comidas configurado.
            </ThemedText>
          </Card>
        ) : (
          <View style={styles.meals}>
            {meal.slots.map((slot) => {
              const isOpen = expandedSlot === slot.label;
              const optionCount = slot.options.length;
              return (
                <Card key={slot.label} style={styles.mealCard}>
                  <Pressable
                    style={({ pressed }) => [styles.mealRow, pressed && styles.pressed]}
                    onPress={() => toggleSlot(slot.label)}>
                    <IconBadge
                      name={slot.icon}
                      color={theme.gold}
                      background={theme.goldSoft}
                      size={42}
                    />
                    <View style={styles.mealBody}>
                      <View style={styles.mealTop}>
                        <ThemedText type="h3">{slot.label}</ThemedText>
                        <Badge
                          label={`${optionCount} opción${optionCount !== 1 ? 'es' : ''}`}
                          tone="gold"
                        />
                      </View>
                    </View>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.textMuted}
                    />
                  </Pressable>
                  {isOpen && (
                    <View style={styles.mealItems}>
                      {slot.options.map((option, idx) => (
                        <View
                          key={`${option.name}-${idx}`}
                          style={[
                            styles.mealOptionRow,
                            { borderTopColor: theme.border },
                          ]}>
                          <View style={styles.mealOptionBody}>
                            <ThemedText type="smallBold">{option.name}</ThemedText>
                            {!!option.description && (
                              <ThemedText type="caption" themeColor="textMuted">
                                {option.description}
                              </ThemedText>
                            )}
                          </View>
                          <Badge label={`${option.kcal} kcal`} tone="gold" />
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </View>

      <View>
        <SectionHeader title="Lista de la compra" />
        <Card>
          {shoppingLoading ? (
            <ThemedText type="body" themeColor="textSecondary">
              Cargando lista…
            </ThemedText>
          ) : shoppingError ? (
            <ThemedText type="body" themeColor="textSecondary">
              {shoppingError}
            </ThemedText>
          ) : !shoppingList ? (
            <View style={styles.shopEmpty}>
              <ThemedText type="body" themeColor="textSecondary">
                No tienes lista de la compra. Crea una nueva para empezar.
              </ThemedText>
              <Button
                title="Crear nueva lista"
                icon="add-outline"
                onPress={() => void createEmptyList()}
                disabled={shoppingSaving}
              />
            </View>
          ) : (
            <>
              {items.length > 0 ? (
                <>
                  <View style={styles.shopProgress}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {doneCount} de {items.length} productos
                    </ThemedText>
                    <View style={[styles.track, { backgroundColor: theme.track }]}>
                      <View
                        style={[
                          styles.fill,
                          {
                            width: `${(doneCount / items.length) * 100}%`,
                            backgroundColor: theme.gold,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  {items.map((item) => (
                    <View key={item.item} style={styles.shopRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.shopItemPress,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => void toggleItemDone(item.item)}
                        disabled={shoppingSaving}>
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
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.removeBtn,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => void removeItem(item.item)}
                        disabled={shoppingSaving}
                        hitSlop={8}
                        accessibilityLabel={`Eliminar ${item.item}`}>
                        <Ionicons name="trash-outline" size={18} color={theme.coral} />
                      </Pressable>
                    </View>
                  ))}
                </>
              ) : (
                <ThemedText type="body" themeColor="textSecondary" style={styles.shopHint}>
                  La lista está vacía. Añade productos abajo.
                </ThemedText>
              )}

              <View style={styles.addRow}>
                <TextInput
                  style={[
                    styles.addInput,
                    styles.addItemInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}
                  value={newItem}
                  onChangeText={setNewItem}
                  placeholder="Producto"
                  placeholderTextColor={theme.textMuted}
                  editable={!shoppingSaving}
                />
                <TextInput
                  style={[
                    styles.addInput,
                    styles.addQtyInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}
                  value={newQty}
                  onChangeText={setNewQty}
                  placeholder="Cant."
                  placeholderTextColor={theme.textMuted}
                  editable={!shoppingSaving}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.addBtn,
                    { backgroundColor: theme.gold },
                    (pressed || shoppingSaving || !newItem.trim()) && styles.pressed,
                  ]}
                  onPress={() => void handleAddItem()}
                  disabled={shoppingSaving || !newItem.trim()}>
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.shopActions}>
                <Button
                  title="Eliminar lista"
                  icon="trash-outline"
                  variant="ghost"
                  onPress={confirmDeleteList}
                  disabled={shoppingSaving}
                />
              </View>
            </>
          )}
        </Card>
      </View>

      <View>
        <SectionHeader title="Suplementación" />
        {supplementsLoading ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Cargando suplementos…
            </ThemedText>
          </Card>
        ) : supplementsError ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              {supplementsError}
            </ThemedText>
          </Card>
        ) : !supplements?.elements.length ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay suplementos configurados.
            </ThemedText>
          </Card>
        ) : (
          <View style={styles.supplements}>
            {supplements.elements.map((s) => (
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
        )}
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
  calorieGoal: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  calorieValue: {
    lineHeight: 48,
  },
  macroInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: Spacing.two,
  },
  macroMeta: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  macroLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  macroTarget: {
    textAlign: 'center',
  },
  macroPct: {
    fontSize: 14,
    lineHeight: 18,
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
  mealItems: { marginTop: Spacing.two },
  mealOptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mealOptionBody: { flex: 1, gap: 2 },
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
  shopItemPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopEmpty: { gap: Spacing.three },
  shopHint: { marginBottom: Spacing.three },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  addInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 15,
    fontWeight: '600',
  },
  addItemInput: { flex: 1 },
  addQtyInput: { width: 72 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopActions: { marginTop: Spacing.three },
  pressed: { opacity: 0.75 },
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
