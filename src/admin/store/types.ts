export interface userType {
  id: string;
  username: string;
  roles: string[];
}

export interface loginFormType {
  username: string;
  password: string;
}

export interface registerFormType {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface tileType {
  id: string;
  position: [number, number, number];
  type: string;
  color?: string;
}

export interface wallType {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  type: string;
}

export interface threeObjectType {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  url: string;
}

export interface npcType {
  id: string;
  position: [number, number, number];
  name: string;
  type: string;
}

export interface portalType {
  id: string;
  position: [number, number, number];
  targetUrl: string;
  name: string;
}

export interface boardRequestType {
  username: string;
  content: string;
}

export interface saveRequestType {
  tile: tileType[];
  wall: wallType[];
  threeObject: threeObjectType[];
  npc: npcType[];
}

export interface saveResponseType {
  success: boolean;
  message: string;
} 