import { n3 } from "@store/update/type";
import { FC } from "react";

export type DeleteTagProps = {
  onClick: () => void;
  position: n3;
  scale?: n3;
};

export type DeleteTagComponent = FC<DeleteTagProps>;
