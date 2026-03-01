import { type RoomsBackendData } from '@/types/rooms';

export const roomsBackendData: RoomsBackendData = {
  rooms: [
    {
      id: 's-992-xf4-29k-8x2',
      title: 'SEC-402-DELTA',
      sessionStatus: 'Live Session',
      countdown: '08:45',
      connectionState: 'Secure Connection Active',
      latencyLabel: '12ms latency',
      operator: 'admin_user',
      systemBanner:
        'SYSTEM: Ephemeral session established. All data stored in RAM.',
      alert: 'Alert: 5 minutes remaining before automatic room purge.',
      assets: [
        {
          id: 'asset-1',
          name: 'auth_handler.rs',
          meta: 'Snippet - 2.4KB',
          ttl: '01:42',
          kind: 'snippet',
        },
        {
          id: 'asset-2',
          name: 'deploy_manifest.pdf',
          meta: 'Encrypted PDF - 1.1MB',
          ttl: '04:12',
          kind: 'document',
        },
        {
          id: 'asset-3',
          name: 'rsa_public.key',
          meta: 'Key File - 512B',
          ttl: '00:15',
          kind: 'key',
        },
      ],
      securityRules: [
        {
          id: 'disable-screenshots',
          label: 'Disable Screenshots',
          detail: 'Kernel-level block',
          enabled: true,
        },
        {
          id: 'mask-ip-addresses',
          label: 'Mask IP Addresses',
          detail: 'Node relay enabled',
          enabled: true,
        },
        {
          id: 'burn-on-read',
          label: 'Burn on Read',
          detail: 'Atomic destruction',
          enabled: false,
        },
      ],
      messages: [
        {
          id: 'msg-1',
          author: 'dev_null',
          time: '14:02:45',
          message:
            'Handshake established. Connection is secure. Are the deployment keys ready for transfer?',
        },
        {
          id: 'msg-2',
          author: 'admin_user',
          time: '14:03:12',
          variant: 'primary',
          message:
            'Acknowledged. Initiating ephemeral session. Keys will be available for 60 seconds once decrypted.',
        },
        {
          id: 'msg-3',
          author: 'void_walker',
          time: '14:05:01',
          message:
            'Replying to admin_user: "Initiating ephemeral session..." Standing by for decryption sequence. Monitoring traffic on node-4.',
        },
      ],
      logs: [
        { id: 'log-1', time: '14:05:44', message: 'Handshake verified' },
        { id: 'log-2', time: '14:05:40', message: 'Buffer cleared (2kb)' },
        { id: 'log-3', time: '14:05:36', message: 'Key rotation pending' },
        { id: 'log-4', time: '14:05:35', message: 'Ping: 12ms to server' },
        { id: 'log-5', time: '14:05:32', message: 'Integrity check: PASS' },
        { id: 'log-6', time: '14:05:20', message: 'User void_walker joined' },
      ],
      users: [
        { id: 'user-1', name: 'admin_user', state: 'Owner', active: true },
        {
          id: 'user-2',
          name: 'dev_null',
          state: 'Active 2m ago',
          active: true,
        },
        { id: 'user-3', name: 'void_walker', state: 'Typing...', active: true },
        { id: 'user-4', name: 'ghost_ops', state: 'Idle', active: false },
      ],
      encryption: 'AES-256-GCM',
      autoDestruct: 'Enabled',
      autoWipeEnabled: true,
      composerDraft: '',
      composerPlaceholder: 'Type a secure message...',
    },
  ],
};
