import { Icon } from '../icon';

interface SelectionOption {
  value: string;
  label: string;
  isSelected: boolean;
}

interface SelectionTooltipProps {
  options: SelectionOption[];
  onSelect: (value: string) => void;
  currentLabel: string;
}

export function SelectionTooltip({ options, onSelect, currentLabel }: SelectionTooltipProps) {
  return (
    <Icon
      ToolTip={
        <>
          {options.map((option) => (
            <p
              key={option.value}
              className={`p-recipe ${option.isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </p>
          ))}
        </>
      }
    >
      <button className="glass-button">
        {currentLabel}
      </button>
    </Icon>
  );
} 