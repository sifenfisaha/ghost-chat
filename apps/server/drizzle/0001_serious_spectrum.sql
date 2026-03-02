CREATE TABLE "room_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"meta" text NOT NULL,
	"ttl_label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"state_label" text DEFAULT 'Active' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "room_members_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "room_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"sender_user_id" text,
	"sender_socket_id" text,
	"author" text NOT NULL,
	"message" text NOT NULL,
	"variant" text DEFAULT 'default' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_security_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"label" text NOT NULL,
	"detail" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_typing_states" (
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_typing" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_typing_states_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"session_status" text DEFAULT 'Live Session' NOT NULL,
	"password_hash" text,
	"owner_user_id" text,
	"connection_state" text DEFAULT 'Secure Connection Active' NOT NULL,
	"encryption" text DEFAULT 'AES-256-GCM' NOT NULL,
	"auto_destruct_minutes" integer DEFAULT 10 NOT NULL,
	"auto_wipe_enabled" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "name" TO "username";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "room_assets" ADD CONSTRAINT "room_assets_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_logs" ADD CONSTRAINT "room_logs_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_security_rules" ADD CONSTRAINT "room_security_rules_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_typing_states" ADD CONSTRAINT "room_typing_states_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_typing_states" ADD CONSTRAINT "room_typing_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "room_assets_room_id_idx" ON "room_assets" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "room_logs_room_id_created_at_idx" ON "room_logs" USING btree ("room_id","created_at");--> statement-breakpoint
CREATE INDEX "room_members_user_id_idx" ON "room_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "room_messages_room_id_created_at_idx" ON "room_messages" USING btree ("room_id","created_at");--> statement-breakpoint
CREATE INDEX "room_security_rules_room_id_idx" ON "room_security_rules" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "rooms_owner_user_id_idx" ON "rooms" USING btree ("owner_user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");