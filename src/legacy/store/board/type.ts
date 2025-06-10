export type boardRequestType = Partial<"title" | "content">;
export type boardMap = {
  [key: number]: boardType;
};

export type boardAtomType = {
  boardMap: boardMap;
  current?: boardRequestType | null;
};

export type boardType = {
  id?: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
