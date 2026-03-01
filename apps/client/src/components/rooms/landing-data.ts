import { type RoomsLandingData } from '@/types/rooms';

export const roomsLandingData: RoomsLandingData = {
  title: 'SEC-402-DELTA',
  status: 'System Operational',
  navItems: ['Docs', 'Security', 'API'],
  protocolTitle: 'Initialize Secure Protocol',
  protocolDescription:
    'Establish an ephemeral, end-to-end encrypted communication channel. Room data self-destructs after 10 minutes.',
  generateButton: 'Generate Private Session',
  joinButton: 'Join Existing Room',
  footerVersion: 'v2.4.6-stable',
  footerStatus: 'Status: Connected',
  footerEncryption: 'AES-256-GCM Encryption',
  footerEphemerality: '10m Ephemerality',
};
