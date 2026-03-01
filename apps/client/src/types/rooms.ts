export type SecurityRule = {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
};

export type RoomAssetKind = 'snippet' | 'document' | 'key';

export type RoomAsset = {
  id: string;
  name: string;
  meta: string;
  ttl: string;
  kind: RoomAssetKind;
};

export type RoomMessage = {
  id: string;
  author: string;
  time: string;
  message: string;
  variant?: 'default' | 'primary';
};

export type RoomLog = {
  id: string;
  time: string;
  message: string;
};

export type RoomUser = {
  id: string;
  name: string;
  state: string;
  active: boolean;
};

export type RoomDetailData = {
  id: string;
  title: string;
  sessionStatus: string;
  countdown: string;
  connectionState: string;
  latencyLabel: string;
  operator: string;
  systemBanner: string;
  alert: string;
  assets: RoomAsset[];
  securityRules: SecurityRule[];
  messages: RoomMessage[];
  logs: RoomLog[];
  users: RoomUser[];
  encryption: string;
  autoDestruct: string;
  autoWipeEnabled: boolean;
  composerDraft: string;
  composerPlaceholder: string;
};

export type RoomsLandingData = {
  title: string;
  status: string;
  navItems: string[];
  protocolTitle: string;
  protocolDescription: string;
  generateButton: string;
  joinButton: string;
  footerVersion: string;
  footerStatus: string;
  footerEncryption: string;
  footerEphemerality: string;
};

export type RoomsBackendData = {
  rooms: RoomDetailData[];
};
