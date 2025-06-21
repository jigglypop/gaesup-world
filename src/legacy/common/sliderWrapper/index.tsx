'use client';

import { ReactNode, useState } from 'react';

export default function SliderWrapper({
  children,
  openStyle = {},
  openStyleRecipe = '',
  isDisplay = false,
  closeChildren,
}: {
  children: ReactNode;
  openStyle?: Record<string, string | null | undefined>;
  openStyleRecipe?: string;
  isDisplay?: boolean;
  closeChildren?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSlider = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {!isOpen && <span onClick={toggleSlider}>{closeChildren}</span>}
      {isOpen && (
        <div
          className={openStyleRecipe}
          style={
            !isDisplay && !isOpen
              ? {
                  display: 'none',
                }
              : openStyle
          }
        >
          <span onClick={toggleSlider}>{closeChildren}</span>
          {children}
        </div>
      )}
    </>
  );
}
