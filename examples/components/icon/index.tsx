import { CSSProperties, MouseEvent, useState } from 'react';
import './styles.css';

export const Icon = ({
  children,
  ToolTip,
  onClick,
  id,
  toolTipStyles,
  iconStyle,
}: {
  children: React.ReactNode;
  ToolTip: React.ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  id?: string;
  toolTipStyles?: CSSProperties;
  iconStyle?: CSSProperties;
}) => {
  const [closet, setCloset] = useState(true);
  return (
    <div
      className="icon"
      onMouseOver={() => setCloset(false)}
      onMouseLeave={() => setCloset(true)}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      style={iconStyle}
      id={id}
    >
      <div className="icon-inner">{children}</div>
      <div
        className="tooltip"
        style={{
          opacity: closet ? '0' : '1',
          ...toolTipStyles,
        }}
      >
        {ToolTip}
      </div>
    </div>
  );
};
