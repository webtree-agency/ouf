CREATE TABLE "review_undos" (
	"review_id" uuid PRIMARY KEY NOT NULL,
	"undone_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"deck_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"status_before" text NOT NULL,
	"scheduled_days" double precision NOT NULL,
	"due_after" timestamp with time zone NOT NULL,
	"duration_ms" integer NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"before" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_undos" ADD CONSTRAINT "review_undos_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reviews_user_time_idx" ON "reviews" USING btree ("user_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "reviews_schedule_idx" ON "reviews" USING btree ("schedule_id");