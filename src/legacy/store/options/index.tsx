import useModal from "@store/modal";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { blockOptionAtom, clickerOptionAtom } from "./atom";

export const initBlockOption = () => {
  const [blockOption, setBlockOption] = useAtom(blockOptionAtom);
  const { isOpen } = useModal();
  const setBlock = useCallback(() => {
    setBlockOption(() => ({
      camera: false,
      control: true,
      animation: true,
      scroll: false,
    }));
  }, [isOpen]);

  const setUnBlock = useCallback(() => {
    setBlockOption(() => ({
      camera: false,
      control: false,
      animation: false,
      scroll: false,
    }));
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) {
      setUnBlock();
    } else {
      setBlock();
    }
  }, [isOpen]);
  return {
    blockOption,
  };
};

export const initClickerOption = () => {
  const [clickerOption] = useAtom(clickerOptionAtom);

  return {
    clickerOption,
  };
};
