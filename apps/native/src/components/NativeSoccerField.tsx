import { useCallback, useMemo, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { POSITION_BOUNDARIES } from '@soccer-position-visualizer/core/engine/positionBoundaries';
import type {
  DisplaySettings,
  NormalizedPoint,
  PlayerPosition,
  PositioningResult,
} from '@soccer-position-visualizer/core/types/soccer';
import HeatmapOverlay from './HeatmapOverlay';

type NativeSoccerFieldProps = {
  ball: NormalizedPoint;
  onBallChange: (point: NormalizedPoint) => void;
  position: PlayerPosition;
  positioning: PositioningResult;
  settings: DisplaySettings;
  isWide: boolean;
};

type FieldLayout = {
  width: number;
  height: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toViewBoxX = (x: number) => x * 120;
const toViewBoxY = (y: number) => y * 80;

const boundaryPathFor = (points: NormalizedPoint[]) =>
  points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toViewBoxX(point.x)} ${toViewBoxY(point.y)}`)
    .join(' ') + ' Z';

const NativeSoccerField = ({
  ball,
  onBallChange,
  position,
  positioning,
  settings,
  isWide,
}: NativeSoccerFieldProps) => {
  const [layout, setLayout] = useState<FieldLayout>({ width: 0, height: 0 });

  const updateBallFromTouch = useCallback(
    (event: GestureResponderEvent) => {
      if (layout.width === 0 || layout.height === 0) {
        return;
      }

      const { locationX, locationY } = event.nativeEvent;
      onBallChange({
        x: clamp01(locationX / layout.width),
        y: clamp01(locationY / layout.height),
      });
    },
    [layout.height, layout.width, onBallChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: updateBallFromTouch,
        onPanResponderMove: updateBallFromTouch,
        onPanResponderRelease: updateBallFromTouch,
      }),
    [updateBallFromTouch],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setLayout({ width, height: width * (2 / 3) });
  };

  const boundaryPath = boundaryPathFor(POSITION_BOUNDARIES[position].points);
  const fieldHeight = layout.height || undefined;

  return (
    <View style={[styles.card, isWide && styles.wideCard]}>
      <Text style={styles.title}>Interactive field</Text>
      <Text style={styles.subtitle}>Drag anywhere on the field to move the ball and update the recommendation.</Text>
      <View style={styles.fieldFrame} onLayout={handleLayout}>
        <View style={[styles.fieldSurface, fieldHeight ? { height: fieldHeight } : styles.fieldPlaceholder]} {...panResponder.panHandlers}>
          {layout.width > 0 && layout.height > 0 ? (
            <>
              <Svg width="100%" height="100%" viewBox="0 0 120 80" style={StyleSheet.absoluteFill}>
                <Rect x="1" y="1" width="118" height="78" fill="#15803d" stroke="#dcfce7" strokeWidth="0.8" />
                <Line x1="60" y1="1" x2="60" y2="79" stroke="#dcfce7" strokeWidth="0.7" />
                <Circle cx="60" cy="40" r="9" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Circle cx="60" cy="40" r="0.7" fill="#dcfce7" />
                <Rect x="1" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Rect x="1" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Circle cx="13" cy="40" r="0.7" fill="#dcfce7" />
                <Path d="M 19 34 A 6 6 0 0 1 19 46" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Rect x="0" y="34" width="1" height="12" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Rect x="101" y="22" width="18" height="36" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Rect x="112" y="30" width="7" height="20" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Circle cx="107" cy="40" r="0.7" fill="#dcfce7" />
                <Path d="M 101 34 A 6 6 0 0 0 101 46" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Rect x="119" y="34" width="1" height="12" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Path d="M 1 1 A 3 3 0 0 1 4 4" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Path d="M 1 79 A 3 3 0 0 0 4 76" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Path d="M 119 1 A 3 3 0 0 0 116 4" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                <Path d="M 119 79 A 3 3 0 0 1 116 76" fill="none" stroke="#dcfce7" strokeWidth="0.7" />
                {settings.showBoundaries ? (
                  <Path d={boundaryPath} fill="rgba(34, 197, 94, 0.18)" stroke="rgba(187, 247, 208, 0.75)" strokeDasharray="2 2" />
                ) : null}
                {settings.showGuides ? (
                  <G>
                    <Line
                      x1={toViewBoxX(ball.x)}
                      y1={toViewBoxY(ball.y)}
                      x2={toViewBoxX(positioning.idealPosition.x)}
                      y2={toViewBoxY(positioning.idealPosition.y)}
                      stroke="rgba(226, 232, 240, 0.5)"
                      strokeDasharray="2 2"
                      strokeWidth="0.8"
                    />
                    <Circle
                      cx={toViewBoxX(positioning.idealPosition.x)}
                      cy={toViewBoxY(positioning.idealPosition.y)}
                      r="6"
                      fill="rgba(34, 197, 94, 0.15)"
                      stroke="rgba(134, 239, 172, 0.9)"
                      strokeWidth="0.8"
                    />
                  </G>
                ) : null}
                {settings.showBallLine ? (
                  <Line
                    x1={toViewBoxX(ball.x)}
                    y1={toViewBoxY(ball.y)}
                    x2={toViewBoxX(positioning.idealPosition.x)}
                    y2={toViewBoxY(positioning.idealPosition.y)}
                    stroke="rgba(226, 232, 240, 0.82)"
                    strokeDasharray="2 2"
                    strokeWidth="0.9"
                  />
                ) : null}
              </Svg>

              <HeatmapOverlay
                ball={ball}
                position={position}
                width={layout.width}
                height={layout.height}
                visible={settings.showHeatmap}
              />

              <View
                pointerEvents="none"
                style={[
                  styles.marker,
                  styles.recommendedMarker,
                  {
                    left: `${positioning.idealPosition.x * 100}%`,
                    top: `${positioning.idealPosition.y * 100}%`,
                  },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.marker,
                  styles.ballMarker,
                  {
                    left: `${ball.x * 100}%`,
                    top: `${ball.y * 100}%`,
                  },
                ]}
              >
                <View style={styles.ballCore} />
              </View>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
    gap: 12,
  },
  wideCard: {
    minWidth: 520,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  fieldFrame: {
    width: '100%',
  },
  fieldSurface: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#166534',
  },
  fieldPlaceholder: {
    aspectRatio: 1.5,
  },
  marker: {
    position: 'absolute',
    marginLeft: -14,
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedMarker: {
    borderWidth: 3,
    borderColor: '#86efac',
    backgroundColor: 'rgba(22, 163, 74, 0.22)',
  },
  ballMarker: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  ballCore: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    shadowColor: '#020617',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

export default NativeSoccerField;
