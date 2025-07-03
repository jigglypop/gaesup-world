import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ColorPickerProps } from './types';
import './styles.css';

const DEFAULT_PRESET_COLORS = [
  '#ff0000', '#ff8800', '#ffff00', '#00ff00',
  '#00ffff', '#0000ff', '#8800ff', '#ff00ff',
  '#ffffff', '#cccccc', '#888888', '#444444',
  '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1',
];

function hexToHsl(hex: string): { h: number; s: number; l: number; a: number } {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex.length === 4 && hex[1] && hex[2] && hex[3]) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else if (hex.length === 9) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
    a = parseInt(hex.slice(7, 9), 16) / 255;
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100, a };
}

function hslToHex(h: number, s: number, l: number, a: number = 1): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return hex + alphaHex;
  }
  return hex;
}

export function ColorPicker({
  color,
  onChange,
  onClose,
  presetColors = DEFAULT_PRESET_COLORS,
  showAlpha = false,
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hsl, setHsl] = useState(() => hexToHsl(color));
  const popupRef = useRef<HTMLDivElement>(null);
  const slidersRef = useRef<{ [key: string]: HTMLDivElement | null }>(null);

  useEffect(() => {
    if (!slidersRef.current) {
      slidersRef.current = {};
    }
  }, []);

  useEffect(() => {
    setHsl(hexToHsl(color));
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSliderChange = useCallback((type: 'h' | 's' | 'l' | 'a', event: React.MouseEvent | MouseEvent) => {
    if (!slidersRef.current) return;
    const slider = slidersRef.current[type];
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newHsl = { ...hsl };
    switch (type) {
      case 'h': newHsl.h = percentage * 360; break;
      case 's': newHsl.s = percentage * 100; break;
      case 'l': newHsl.l = percentage * 100; break;
      case 'a': newHsl.a = percentage; break;
    }
    setHsl(newHsl);
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l, newHsl.a));
  }, [hsl, onChange]);

  const handleSliderMouseDown = (type: 'h' | 's' | 'l' | 'a') => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSliderChange(type, e);

    const handleMouseMove = (event: MouseEvent) => handleSliderChange(type, event);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const currentColor = hslToHex(hsl.h, hsl.s, hsl.l, hsl.a);
  const hueColor = hslToHex(hsl.h, 100, 50, 1);

  return (
    <div className={`color-picker ${className}`}>
      <div
        className="color-picker__trigger"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="color-picker__popup" ref={popupRef}>
          <div className="color-picker__header">
            <span className="color-picker__title">Color Picker</span>
            <button
              className="color-picker__close"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
            >
              ×
            </button>
          </div>

          <div className="color-picker__content">
            <div className="color-picker__sliders">
              <div className="color-picker__slider-row">
                <span className="color-picker__slider-label">H</span>
                <div
                  ref={el => {
                    if (slidersRef.current) {
                      slidersRef.current["h"] = el;
                    }
                  }}
                  className="color-picker__slider color-picker__slider--hue"
                  onMouseDown={handleSliderMouseDown('h')}
                >
                  <div
                    className="color-picker__slider-thumb"
                    style={{ left: `${(hsl.h / 360) * 100}%` }}
                  />
                </div>
              </div>

              <div className="color-picker__slider-row">
                <span className="color-picker__slider-label">S</span>
                <div
                  ref={el => {
                    if (slidersRef.current) {
                      slidersRef.current["s"] = el;
                    }
                  }}
                  className="color-picker__slider color-picker__slider--saturation"
                  style={{ '--current-hue-color': hueColor } as React.CSSProperties}
                  onMouseDown={handleSliderMouseDown('s')}
                >
                  <div
                    className="color-picker__slider-thumb"
                    style={{ left: `${hsl.s}%` }}
                  />
                </div>
              </div>

              <div className="color-picker__slider-row">
                <span className="color-picker__slider-label">L</span>
                <div
                  ref={el => {
                    if (slidersRef.current) {
                      slidersRef.current["l"] = el;
                    }
                  }}
                  className="color-picker__slider color-picker__slider--lightness"
                  style={{ '--current-hsl-color': hslToHex(hsl.h, hsl.s, 50, 1) } as React.CSSProperties}
                  onMouseDown={handleSliderMouseDown('l')}
                >
                  <div
                    className="color-picker__slider-thumb"
                    style={{ left: `${hsl.l}%` }}
                  />
                </div>
              </div>

              {showAlpha && (
                <div className="color-picker__slider-row">
                  <span className="color-picker__slider-label">A</span>
                  <div
                    ref={el => {
                      if (slidersRef.current) {
                        slidersRef.current["a"] = el;
                      }
                    }}
                    className="color-picker__slider color-picker__slider--alpha"
                    style={{ '--current-color': hslToHex(hsl.h, hsl.s, hsl.l, 1) } as React.CSSProperties}
                    onMouseDown={handleSliderMouseDown('a')}
                  >
                    <div
                      className="color-picker__slider-thumb"
                      style={{ left: `${hsl.a * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="color-picker__preview">
              <div
                className="color-picker__preview-color"
                style={{ '--preview-color': `linear-gradient(${currentColor}, ${currentColor})` } as React.CSSProperties}
              />
              <span className="color-picker__preview-text">{currentColor}</span>
            </div>

            <div className="color-picker__presets">
              {presetColors.map((presetColor) => (
                <div
                  key={presetColor}
                  className="color-picker__preset"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setHsl(hexToHsl(presetColor));
                    onChange(presetColor);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker; 