import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { DragState, NormalizedPoint } from '../types/soccer';
import { clamp01 } from '../utils/clamp';
import { toNormalizedPoint } from '../utils/coordinates';

const KEYBOARD_STEP = 0.02;

type UseBallDragArgs = {
  fieldRef: RefObject<HTMLElement | null>;
  ball: NormalizedPoint;
  onBallChange: (point: NormalizedPoint) => void;
};

type UseBallDragResult = {
  dragState: DragState;
  handlePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handlePointerCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleLostPointerCapture: () => void;
  handleKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
};

export const useBallDrag = ({ fieldRef, ball, onBallChange }: UseBallDragArgs): UseBallDragResult => {
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, pointerId: null });
  const pendingPointRef = useRef<NormalizedPoint | null>(null);
  const frameRef = useRef<number | null>(null);

  const flushPoint = useCallback(() => {
    if (pendingPointRef.current) {
      onBallChange(pendingPointRef.current);
      pendingPointRef.current = null;
    }
    frameRef.current = null;
  }, [onBallChange]);

  const queuePointUpdate = useCallback(
    (point: NormalizedPoint) => {
      pendingPointRef.current = point;
      if (frameRef.current !== null) {
        return;
      }
      frameRef.current = requestAnimationFrame(flushPoint);
    },
    [flushPoint],
  );

  const updateFromEvent = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const field = fieldRef.current;
      if (!field) {
        return;
      }
      const point = toNormalizedPoint(event.clientX, event.clientY, field.getBoundingClientRect());
      queuePointUpdate(point);
    },
    [fieldRef, queuePointUpdate],
  );

  const stopDragging = useCallback(() => {
    setDragState({ isDragging: false, pointerId: null });
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragState({ isDragging: true, pointerId: event.pointerId });
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      updateFromEvent(event);
    },
    [updateFromEvent],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!dragState.isDragging || dragState.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      updateFromEvent(event);
    },
    [dragState.isDragging, dragState.pointerId, updateFromEvent],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (dragState.pointerId !== event.pointerId) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      updateFromEvent(event);
      stopDragging();
    },
    [dragState.pointerId, stopDragging, updateFromEvent],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (dragState.pointerId !== event.pointerId) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      stopDragging();
    },
    [dragState.pointerId, stopDragging],
  );

  const handleLostPointerCapture = useCallback(() => {
    stopDragging();
  }, [stopDragging]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      let dx = 0;
      let dy = 0;

      if (event.key === 'ArrowLeft') dx = -KEYBOARD_STEP;
      if (event.key === 'ArrowRight') dx = KEYBOARD_STEP;
      if (event.key === 'ArrowUp') dy = -KEYBOARD_STEP;
      if (event.key === 'ArrowDown') dy = KEYBOARD_STEP;

      if (dx === 0 && dy === 0) {
        return;
      }

      event.preventDefault();
      onBallChange({ x: clamp01(ball.x + dx), y: clamp01(ball.y + dy) });
    },
    [ball.x, ball.y, onBallChange],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, []);

  return {
    dragState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
    handleKeyDown,
  };
};
