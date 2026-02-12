import React from 'react';
import styles from './Controls.module.scss';

interface ControlsProps {
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onPlayPause,
  onReset,
}) => {
  return (
    <div className={styles.controls}>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={onPlayPause}
        aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
      >
        {isRunning ? (
          <>
            <span className={styles.icon}>⏸</span>
            Pause
          </>
        ) : (
          <>
            <span className={styles.icon}>▶</span>
            Play
          </>
        )}
      </button>
      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={onReset}
        aria-label="Reset simulation"
      >
        <span className={styles.icon}>↻</span>
        Reset
      </button>
    </div>
  );
};
