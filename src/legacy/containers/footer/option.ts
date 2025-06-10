import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function initFooterOptionEffect() {
  const location = useLocation();
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
  };
}
