import { useCallback, useEffect, useState } from "react";
import { isDesktop, isMobile, isTablet } from "react-device-detect";

export default function getFontSize() {
  // 화면 크기게 따라 로고의 크기와 위치를 조정합니다.
  const [size, setSize] = useState(1440);
  const [fontSize, setFontSize] = useState("5rem");

  const resize = useCallback(() => {
    setSize(window.innerWidth);
  }, [setSize]);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (isDesktop) {
      if (size > 1024) {
        setFontSize("10.5rem");
      } else if (size > 768) {
        setFontSize("8.5rem");
      } else {
        setFontSize("6rem");
      }
    } else if (isTablet) {
      if (size > 1024) {
        setFontSize("6rem");
      } else if (size > 768) {
        setFontSize("5rem");
      } else {
        setFontSize("4rem");
      }
    } else if (isMobile) {
      if (size > 1024) {
        setFontSize("5.5rem");
      } else if (size > 768) {
        setFontSize("4.5rem");
      } else {
        setFontSize("4rem");
      }
    }
  }, [isDesktop, isMobile, isTablet, size]);
  return { fontSize, size };
}
