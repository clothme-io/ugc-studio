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
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string; services: { openai: boolean; heygen: boolean } }>('/health'),
  accounts: {
    list: () => request<unknown[]>('/accounts'),
    create: (body: unknown) =>
      request('/accounts', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },
  videos: {
    list: () => request<unknown[]>('/videos'),
    ingest: (body: { url: string; caption?: string; accountId?: string }) =>
      request('/videos/ingest', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request(`/videos/${id}`),
  },
  analysis: {
    create: (sourceVideoId: string) =>
      request('/analysis', { method: 'POST', body: JSON.stringify({ sourceVideoId }) }),
    get: (id: string) => request(`/analysis/${id}`),
    getByVideo: (sourceVideoId: string) => request(`/analysis/video/${sourceVideoId}`),
  },
  scripts: {
    remix: (analysisId: string, brandContext?: string) =>
      request('/scripts/remix', {
        method: 'POST',
        body: JSON.stringify({ analysisId, brandContext }),
      }),
    get: (id: string) => request(`/scripts/${id}`),
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
};
