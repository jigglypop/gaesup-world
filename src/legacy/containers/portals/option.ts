import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import getFontSize from "./device";

export default function initHeaderOptionEffect() {
  const location = useLocation();
  const { fontSize, size } = getFontSize();
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (location.pathname === "/aggjack/room") {
      setIsOn(false);
    } else {
      setIsOn(true);
    }
  }, [location.pathname]);

  return {
    isOn,
    setIsOn,
    fontSize,
    size,
  };
}
