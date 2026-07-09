CREATE TABLE "avatar_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"age" integer,
	"job_title" text,
	"company" text,
	"location" text,
	"bio" text,
	"heygen_avatar_id" text,
	"photo_url" text,
	"voice_style" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_ugc_jobs" ADD COLUMN "avatar_profile_id" uuid;
--> statement-breakpoint
ALTER TABLE "ai_ugc_jobs" ADD CONSTRAINT "ai_ugc_jobs_avatar_profile_id_avatar_profiles_id_fk" FOREIGN KEY ("avatar_profile_id") REFERENCES "public"."avatar_profiles"("id") ON DELETE no action ON UPDATE no action;
