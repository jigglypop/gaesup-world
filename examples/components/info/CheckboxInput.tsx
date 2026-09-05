interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
export function CheckboxInput({ label, checked, onChange }: CheckboxInputProps) {
  return (
    <div className="checkbox-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </div>
  );
} 