import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const platformEnum = pgEnum('platform', ['tiktok', 'instagram', 'youtube']);
export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: platformEnum('platform').notNull(),
  handle: text('handle').notNull(),
  displayName: text('display_name'),
  followerCount: integer('follower_count'),
  refreshIntervalDays: integer('refresh_interval_days').default(3),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sourceVideos = pgTable('source_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: platformEnum('platform').notNull(),
  externalUrl: text('external_url').notNull(),
  accountId: uuid('account_id').references(() => socialAccounts.id),
  accountHandle: text('account_handle'),
  caption: text('caption'),
  viewCount: integer('view_count'),
  likeCount: integer('like_count'),
  viralScore: real('viral_score'),
  thumbnailUrl: text('thumbnail_url'),
  storagePath: text('storage_path'),
  status: jobStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const videoAnalyses = pgTable('video_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceVideoId: uuid('source_video_id')
    .references(() => sourceVideos.id)
    .notNull(),
  analysis: jsonb('analysis').notNull(),
  transcript: text('transcript'),
  status: jobStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const remixScripts = pgTable('remix_scripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id')
    .references(() => videoAnalyses.id)
    .notNull(),
  script: jsonb('script').notNull(),
  brandContext: text('brand_context'),
  status: jobStatusEnum('status').default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const avatarProfiles = pgTable('avatar_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  age: integer('age'),
  jobTitle: text('job_title'),
  company: text('company'),
  location: text('location'),
  bio: text('bio'),
  heygenAvatarId: text('heygen_avatar_id'),
  photoUrl: text('photo_url'),
  voiceStyle: text('voice_style'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const editProjects = pgTable('edit_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  sourceVideoId: uuid('source_video_id').references(() => sourceVideos.id),
  remixScriptId: uuid('remix_script_id').references(() => remixScripts.id),
  editState: jsonb('edit_state').notNull(),
  outputPath: text('output_path'),
  status: jobStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiUgcJobs = pgTable('ai_ugc_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  remixScriptId: uuid('remix_script_id').references(() => remixScripts.id),
  avatarProfileId: uuid('avatar_profile_id').references(() => avatarProfiles.id),
  avatarId: text('avatar_id').notNull(),
  avatarName: text('avatar_name'),
  productAssetPath: text('product_asset_path'),
  externalJobId: text('external_job_id'),
  outputPath: text('output_path'),
  status: jobStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ugcExports = pgTable('ugc_exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  editProjectId: uuid('edit_project_id').references(() => editProjects.id),
  aiUgcJobId: uuid('ai_ugc_job_id').references(() => aiUgcJobs.id),
  outputPath: text('output_path').notNull(),
  caption: text('caption'),
  hashtags: text('hashtags'),
  targetAccountIds: jsonb('target_account_ids'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
