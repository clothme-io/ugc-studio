CREATE TYPE "public"."platform" AS ENUM('tiktok', 'instagram', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "platform" NOT NULL,
	"handle" text NOT NULL,
	"display_name" text,
	"follower_count" integer,
	"refresh_interval_days" integer DEFAULT 3,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "platform" NOT NULL,
	"external_url" text NOT NULL,
	"account_id" uuid,
	"account_handle" text,
	"caption" text,
	"view_count" integer,
	"like_count" integer,
	"viral_score" real,
	"thumbnail_url" text,
	"storage_path" text,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_video_id" uuid NOT NULL,
	"analysis" jsonb NOT NULL,
	"transcript" text,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remix_scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"script" jsonb NOT NULL,
	"brand_context" text,
	"status" "job_status" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edit_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_video_id" uuid,
	"remix_script_id" uuid,
	"edit_state" jsonb NOT NULL,
	"output_path" text,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_ugc_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remix_script_id" uuid,
	"avatar_id" text NOT NULL,
	"avatar_name" text,
	"product_asset_path" text,
	"external_job_id" text,
	"output_path" text,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ugc_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edit_project_id" uuid,
	"ai_ugc_job_id" uuid,
	"output_path" text NOT NULL,
	"caption" text,
	"hashtags" text,
	"target_account_ids" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "source_videos" ADD CONSTRAINT "source_videos_account_id_social_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."social_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_analyses" ADD CONSTRAINT "video_analyses_source_video_id_source_videos_id_fk" FOREIGN KEY ("source_video_id") REFERENCES "public"."source_videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remix_scripts" ADD CONSTRAINT "remix_scripts_analysis_id_video_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."video_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edit_projects" ADD CONSTRAINT "edit_projects_source_video_id_source_videos_id_fk" FOREIGN KEY ("source_video_id") REFERENCES "public"."source_videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edit_projects" ADD CONSTRAINT "edit_projects_remix_script_id_remix_scripts_id_fk" FOREIGN KEY ("remix_script_id") REFERENCES "public"."remix_scripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_ugc_jobs" ADD CONSTRAINT "ai_ugc_jobs_remix_script_id_remix_scripts_id_fk" FOREIGN KEY ("remix_script_id") REFERENCES "public"."remix_scripts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ugc_exports" ADD CONSTRAINT "ugc_exports_edit_project_id_edit_projects_id_fk" FOREIGN KEY ("edit_project_id") REFERENCES "public"."edit_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ugc_exports" ADD CONSTRAINT "ugc_exports_ai_ugc_job_id_ai_ugc_jobs_id_fk" FOREIGN KEY ("ai_ugc_job_id") REFERENCES "public"."ai_ugc_jobs"("id") ON DELETE no action ON UPDATE no action;
