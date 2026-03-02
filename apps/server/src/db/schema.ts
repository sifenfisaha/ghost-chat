import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  email: text('email').unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const rooms = pgTable(
  'rooms',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    sessionStatus: text('session_status').notNull().default('Live Session'),
    passwordHash: text('password_hash'),
    ownerUserId: text('owner_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    connectionState: text('connection_state')
      .notNull()
      .default('Secure Connection Active'),
    encryption: text('encryption').notNull().default('AES-256-GCM'),
    autoDestructMinutes: integer('auto_destruct_minutes').notNull().default(10),
    autoWipeEnabled: boolean('auto_wipe_enabled').notNull().default(true),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('rooms_owner_user_id_idx').on(table.ownerUserId)]
);

export const roomMembers = pgTable(
  'room_members',
  {
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'),
    stateLabel: text('state_label').notNull().default('Active'),
    active: boolean('active').notNull().default(true),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.userId] }),
    index('room_members_user_id_idx').on(table.userId),
  ]
);

export const roomMessages = pgTable(
  'room_messages',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    senderUserId: text('sender_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    senderSocketId: text('sender_socket_id'),
    author: text('author').notNull(),
    message: text('message').notNull(),
    variant: text('variant').notNull().default('default'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('room_messages_room_id_created_at_idx').on(
      table.roomId,
      table.createdAt
    ),
  ]
);

export const roomTypingStates = pgTable(
  'room_typing_states',
  {
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isTyping: boolean('is_typing').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomId, table.userId] })]
);

export const roomAssets = pgTable(
  'room_assets',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    meta: text('meta').notNull(),
    ttlLabel: text('ttl_label').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('room_assets_room_id_idx').on(table.roomId)]
);

export const roomSecurityRules = pgTable(
  'room_security_rules',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    detail: text('detail').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('room_security_rules_room_id_idx').on(table.roomId)]
);

export const roomLogs = pgTable(
  'room_logs',
  {
    id: text('id').primaryKey(),
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('room_logs_room_id_created_at_idx').on(table.roomId, table.createdAt),
  ]
);
