export type {
  SourceVideo,
  VideoDetail,
  AnalyzedVideoOption,
  AvatarProfile,
  VideoAnalysisRecord,
  RemixScriptRecord,
} from '@ugc-studio/shared';

import { mockApi } from './mock-api';

const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text) as { message?: string | string[] };
      const msg = json.message;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg ?? text || res.statusText);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
      throw new Error(text || res.statusText);
    }
  }
  return res.json() as Promise<T>;
}

const realApi = {
  health: () =>
    request<{ status: string; services: { database: string; openai: boolean; heygen: boolean } }>('/health'),
  accounts: {
    list: () => request<unknown[]>('/accounts'),
    create: (body: unknown) =>
      request('/accounts', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },
  videos: {
    list: () => request<import('@ugc-studio/shared').SourceVideo[]>('/videos'),
    ingest: (body: { url: string; caption?: string; accountId?: string }) =>
      request<import('@ugc-studio/shared').SourceVideo>('/videos/ingest', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    get: (id: string) => request<import('@ugc-studio/shared').SourceVideo>(`/videos/${id}`),
    detail: (id: string) =>
      request<import('@ugc-studio/shared').VideoDetail>(`/videos/${id}/detail`),
  },
  analysis: {
    listCompleted: () =>
      request<import('@ugc-studio/shared').AnalyzedVideoOption[]>('/analysis'),
    create: (sourceVideoId: string) =>
      request<import('@ugc-studio/shared').VideoAnalysisRecord>('/analysis', {
        method: 'POST',
        body: JSON.stringify({ sourceVideoId }),
      }),
    get: (id: string) => request(`/analysis/${id}`),
    getByVideo: (sourceVideoId: string) => request(`/analysis/video/${sourceVideoId}`),
  },
  scripts: {
    list: () => request<import('@ugc-studio/shared').RemixScriptRecord[]>('/scripts'),
    listByAnalysis: (analysisId: string) =>
      request<import('@ugc-studio/shared').RemixScriptRecord[]>(`/scripts/analysis/${analysisId}`),
    remix: (analysisId: string, brandContext?: string) =>
      request<import('@ugc-studio/shared').RemixScriptRecord>('/scripts/remix', {
        method: 'POST',
        body: JSON.stringify({ analysisId, brandContext }),
      }),
    get: (id: string) => request<import('@ugc-studio/shared').RemixScriptRecord>(`/scripts/${id}`),
  },
  avatars: {
    list: () => request<import('@ugc-studio/shared').AvatarProfile[]>('/avatars'),
    create: (
      body: Omit<import('@ugc-studio/shared').AvatarProfile, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
        isActive?: boolean;
      },
    ) =>
      request<import('@ugc-studio/shared').AvatarProfile>('/avatars', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    get: (id: string) =>
      request<import('@ugc-studio/shared').AvatarProfile>(`/avatars/${id}`),
    update: (id: string, body: Partial<import('@ugc-studio/shared').AvatarProfile>) =>
      request<import('@ugc-studio/shared').AvatarProfile>(`/avatars/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (id: string) => request(`/avatars/${id}`, { method: 'DELETE' }),
  },
  editor: {
    create: (body: unknown) =>
      request('/editor', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request(`/editor/${id}`),
    update: (id: string, editState: unknown) =>
      request(`/editor/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ editState }),
      }),
    render: async (id: string, file: File) => {
      const form = new FormData();
      form.append('video', file);
      const res = await fetch(`${API_URL}/editor/${id}/render`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  aiUgc: {
    avatars: () => request<{ id: string; name: string }[]>('/ai-ugc/avatars'),
    list: () => request<unknown[]>('/ai-ugc'),
    create: (body: unknown) =>
      request('/ai-ugc', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request(`/ai-ugc/${id}`),
  },
  exports: {
    list: () => request<unknown[]>('/exports'),
    create: (body: unknown) =>
      request('/exports', { method: 'POST', body: JSON.stringify(body) }),
  },
  activity: {
    list: () =>
      request<Array<{ id: string; type: string; label: string; href: string; createdAt: string }>>(
        '/activity',
      ),
  },
};

/** Mock by default. Set NEXT_PUBLIC_USE_MOCK=false to use the real API. */
export const api = USE_MOCK ? mockApi : realApi;

export const isMockMode = USE_MOCK;
