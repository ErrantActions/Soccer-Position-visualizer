import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecommendedPosition } from '@soccer-position-visualizer/core/engine/positioningEngine';
import type {
  DisplaySettings,
  NormalizedPoint,
  PlayerPosition,
} from '@soccer-position-visualizer/core/types/soccer';
import NativeSoccerField from './components/NativeSoccerField';

const POSITIONS: PlayerPosition[] = ['LB', 'LCB', 'RCB', 'RB', 'CDM'];

const createCenterBall = (): NormalizedPoint => ({ x: 0.5, y: 0.5 });

const defaultSettings: DisplaySettings = {
  showHeatmap: true,
  showBoundaries: true,
  showGuides: true,
  showBallLine: true,
};

const TOGGLE_LABELS: Record<keyof DisplaySettings, string> = {
  showHeatmap: 'Heatmap',
  showBoundaries: 'Boundaries',
  showGuides: 'Guides',
  showBallLine: 'Ball line',
};

const App = () => {
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition>('LB');
  const [ball, setBall] = useState<NormalizedPoint>(createCenterBall);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const positioning = useMemo(
    () => getRecommendedPosition({ ball, position: selectedPosition }),
    [ball, selectedPosition],
  );

  const layoutStyle = isWide ? styles.desktopLayout : styles.mobileLayout;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.eyebrow}>Shared TypeScript core + native shell</Text>
        <Text style={styles.title}>Soccer Position Visualizer</Text>
        <Text style={styles.subtitle}>
          Native coaching UI for iPhone, Android, tablets, and Windows using the same positioning engine as the web app.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.positionRow}>
          {POSITIONS.map((position) => {
            const active = position === selectedPosition;
            return (
              <Pressable
                key={position}
                onPress={() => setSelectedPosition(position)}
                style={[styles.positionChip, active && styles.positionChipActive]}
              >
                <Text style={[styles.positionChipText, active && styles.positionChipTextActive]}>{position}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={layoutStyle}>
          <NativeSoccerField
            ball={ball}
            onBallChange={setBall}
            position={selectedPosition}
            positioning={positioning}
            settings={settings}
            isWide={isWide}
          />

          <View style={styles.sidePanel}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Display</Text>
              <View style={styles.toggleGrid}>
                {(Object.keys(TOGGLE_LABELS) as Array<keyof DisplaySettings>).map((key) => {
                  const enabled = settings[key];
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSettings((current) => ({ ...current, [key]: !current[key] }))}
                      style={[styles.toggleTile, enabled && styles.toggleTileActive]}
                    >
                      <Text style={styles.toggleLabel}>{TOGGLE_LABELS[key]}</Text>
                      <Text style={[styles.toggleState, enabled && styles.toggleStateActive]}>
                        {enabled ? 'On' : 'Off'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable onPress={() => setBall(createCenterBall())} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset ball</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Guidance</Text>
              <Text style={styles.metricLabel}>Recommended spot</Text>
              <Text style={styles.metricValue}>
                X {Math.round(positioning.idealPosition.x * 100)}% · Y {Math.round(positioning.idealPosition.y * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>{Math.round(positioning.confidence)}%</Text>
              {positioning.isOutsideNormalBoundary ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>Covering outside the usual {selectedPosition} area.</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
  },
  positionRow: {
    gap: 10,
    paddingVertical: 4,
  },
  positionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  positionChipActive: {
    borderColor: '#22d3ee',
    backgroundColor: '#164e63',
  },
  positionChipText: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
  positionChipTextActive: {
    color: '#ecfeff',
  },
  mobileLayout: {
    gap: 16,
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  sidePanel: {
    flex: 1,
    gap: 16,
    minWidth: 280,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleGrid: {
    gap: 10,
  },
  toggleTile: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTileActive: {
    borderColor: '#4ade80',
    backgroundColor: '#052e16',
  },
  toggleLabel: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleState: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  toggleStateActive: {
    color: '#86efac',
  },
  resetButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#ecfeff',
    fontWeight: '700',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  warningBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
    backgroundColor: '#78350f',
    padding: 12,
  },
  warningText: {
    color: '#fde68a',
    fontWeight: '600',
  },
});

export default App;
