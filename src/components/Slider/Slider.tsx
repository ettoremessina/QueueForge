import React from 'react';
import styles from './Slider.module.scss';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  tooltip?: string;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  tooltip,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className={styles.slider}>
      <label>
        <span className={styles.labelText}>
          {label}
          {tooltip && (
            <span className={styles.tooltip} title={tooltip}>
              ⓘ
            </span>
          )}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={styles.input}
        />
        <span className={styles.value}>
          {value}
          {unit}
        </span>
      </label>
    </div>
  );
};
