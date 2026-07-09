import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { avatarProfiles } from '../../db/schema';

@Injectable()
export class AvatarsService {
  constructor(@Inject(DB) private db: Database) {}

  async list() {
    return this.db.select().from(avatarProfiles).orderBy(avatarProfiles.createdAt);
  }

  async create(input: {
    firstName: string;
    lastName: string;
    age?: number;
    jobTitle?: string;
    company?: string;
    location?: string;
    bio?: string;
    heygenAvatarId?: string;
    photoUrl?: string;
    voiceStyle?: string;
  }) {
    const [row] = await this.db
      .insert(avatarProfiles)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        age: input.age,
        jobTitle: input.jobTitle,
        company: input.company,
        location: input.location,
        bio: input.bio,
        heygenAvatarId: input.heygenAvatarId,
        photoUrl: input.photoUrl,
        voiceStyle: input.voiceStyle,
      })
      .returning();
    return row;
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(avatarProfiles)
      .where(eq(avatarProfiles.id, id));
    if (!row) throw new NotFoundException('Avatar not found');
    return row;
  }

  async update(
    id: string,
    input: Partial<{
      firstName: string;
      lastName: string;
      age: number;
      jobTitle: string;
      company: string;
      location: string;
      bio: string;
      heygenAvatarId: string;
      photoUrl: string;
      voiceStyle: string;
      isActive: boolean;
    }>,
  ) {
    const [row] = await this.db
      .update(avatarProfiles)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(avatarProfiles.id, id))
      .returning();
    if (!row) throw new NotFoundException('Avatar not found');
    return row;
  }

  async remove(id: string) {
    await this.db.delete(avatarProfiles).where(eq(avatarProfiles.id, id));
    return { deleted: true };
  }
}
