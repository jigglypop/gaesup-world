interface RangeInputProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  formatter?: (value: number) => string;
  onChange: (value: number) => void;
}
export function RangeInput({
  label,
  min,
  max,
  step,
  value,
  suffix = '',
  formatter,
  onChange,
}: RangeInputProps) {
  const displayValue = formatter ? formatter(value) : value.toString();
  return (
    <div className="input-row">
      <span>{label}:</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{displayValue}{suffix}</span>
    </div>
  );
} 