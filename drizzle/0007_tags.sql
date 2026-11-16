CREATE TYPE "public"."tag_color" AS ENUM('blue', 'green', 'amber', 'red', 'gray');--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"name" text NOT NULL,
	"emoji" text,
	"color" "tag_color" DEFAULT 'gray' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_language_name_idx" ON "tags" USING btree ("language_id","name");--> statement-breakpoint
-- Was Karten schon tragen, wird ein Tag ohne Emoji, in Grau.
INSERT INTO "tags" ("user_id", "language_id", "name")
SELECT DISTINCT d."user_id", d."language_id", unnest(c."tags")
FROM "cards" c JOIN "decks" d ON d."id" = c."deck_id"
ON CONFLICT DO NOTHING;
