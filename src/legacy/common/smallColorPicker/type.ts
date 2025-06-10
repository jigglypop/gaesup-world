export type ClientPortalInterface = {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  selector: string;
};

export type messageType = {
  username: string;
  message: string;
};
