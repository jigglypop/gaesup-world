import React from 'react';

type FieldRowProps = {
  label: string;
  children: React.ReactNode;
};

export function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="editor-field-row">
      <span className="editor-field-row__label">{label}</span>
      <div className="editor-field-row__control">{children}</div>
    </div>
  );
}

type FieldToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function FieldToggle({ value, onChange }: FieldToggleProps) {
  return (
    <button
      type="button"
      className={`editor-field-toggle ${value ? 'editor-field-toggle--on' : ''}`}
      onClick={() => onChange(!value)}
    >
      {value ? 'ON' : 'OFF'}
    </button>
  );
}

type FieldColorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function FieldColor({ value, onChange }: FieldColorProps) {
  return (
    <div className="editor-field-color">
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      <span>{value}</span>
    </div>
  );
}
