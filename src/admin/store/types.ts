export type userType = {
  id: string;
  username: string;
  roles: string[];
};

export type loginFormType = {
  username: string;
  password: string;
};

export type registerFormType = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type tileType = {
  id: string;
  position: [number, number, number];
  type: string;
  color?: string;
};

export type wallType = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  type: string;
};

export type threeObjectType = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  url: string;
};

export type npcType = {
  id: string;
  position: [number, number, number];
  name: string;
  type: string;
};

export type portalType = {
  id: string;
  position: [number, number, number];
  targetUrl: string;
  name: string;
};

export type boardRequestType = {
  username: string;
  content: string;
};

export type saveRequestType = {
  tile: tileType[];
  wall: wallType[];
  threeObject: threeObjectType[];
  npc: npcType[];
};

export type saveResponseType = {
  success: boolean;
  message: string;
}; 