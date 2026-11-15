CREATE TYPE "public"."direction" AS ENUM('forward', 'reverse');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('m', 'f');--> statement-breakpoint
CREATE TABLE "card_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"direction" "direction" NOT NULL,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_review_at" timestamp with time zone,
	"stability" double precision DEFAULT 0 NOT NULL,
	"difficulty" double precision DEFAULT 0 NOT NULL,
	"state" smallint DEFAULT 0 NOT NULL,
	"schedule_status" text DEFAULT 'new' NOT NULL,
	"scheduled_days" double precision DEFAULT 0 NOT NULL,
	"learning_step" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" uuid NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"example" text,
	"note" text,
	"gender" "gender",
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"reverse" boolean DEFAULT false NOT NULL,
	"front_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"name" text NOT NULL,
	"new_per_day" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_language_id" uuid;--> statement-breakpoint
ALTER TABLE "card_schedules" ADD CONSTRAINT "card_schedules_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "languages" ADD CONSTRAINT "languages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "card_schedules_card_direction_idx" ON "card_schedules" USING btree ("card_id","direction");--> statement-breakpoint
CREATE INDEX "card_schedules_due_idx" ON "card_schedules" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "cards_deck_idx" ON "cards" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "cards_front_key_idx" ON "cards" USING btree ("front_key");--> statement-breakpoint
CREATE INDEX "cards_tags_idx" ON "cards" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "decks_language_name_idx" ON "decks" USING btree ("language_id",lower("name"));--> statement-breakpoint
CREATE INDEX "decks_user_idx" ON "decks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_user_code_idx" ON "languages" USING btree ("user_id","code");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_language_id_languages_id_fk" FOREIGN KEY ("active_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action;