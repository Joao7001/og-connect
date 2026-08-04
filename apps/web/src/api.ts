const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ApiRecord = Record<string, unknown> & {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  status?: string;
  role?: string;
  wins?: number;
  losses?: number;
  url?: string;
  type?: string;
};
export type AdminResource =
  | "members"
  | "projects"
  | "players"
  | "articles"
  | "media"
  | "battles"
  | "seasons";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const body = await response
    .json()
    .catch(() => ({ message: "A API retornou uma resposta inválida." }));
  if (!response.ok)
    throw new Error(body.message ?? "Não foi possível concluir a operação.");
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  list: (resource: AdminResource) => request<ApiRecord[]>(`/api/${resource}`),
  overview: (token: string) =>
    request<ApiRecord>("/api/admin/overview", {}, token),
  siteSummary: () => request<Record<string, number>>("/api/site/summary"),
  liveChannels: () => request<ApiRecord[]>("/api/live/channels"),
  currentSeason: () => request<ApiRecord | null>("/api/championship/current"),
  siteSettings: () => request<ApiRecord>("/api/site/settings"),
  updateSiteSettings: (values: Record<string, unknown>, token: string) => request<ApiRecord>("/api/site/settings", { method: "PATCH", body: JSON.stringify(values) }, token),
  adminUsers: (token: string) => request<ApiRecord[]>("/api/admin/users", {}, token),
  createAdmin: (email: string, password: string, token: string) => request<ApiRecord>("/api/admin/users", { method: "POST", body: JSON.stringify({ email, password }) }, token),
  changePassword: (currentPassword: string, newPassword: string, token: string) => request<{ ok: boolean }>("/api/admin/password", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) }, token),
  youtubeMetadata: (url: string) =>
    request<{ title: string; thumbnailUrl: string }>(
      `/api/youtube/metadata?url=${encodeURIComponent(url)}`,
    ),
  trackProjectVisit: (id: string) =>
    request<{ clicks: number }>(`/api/projects/${id}/visit`, {
      method: "POST",
    }),
  create: (
    resource: AdminResource,
    values: Record<string, unknown>,
    token: string,
  ) =>
    request<ApiRecord>(
      `/api/${resource}`,
      { method: "POST", body: JSON.stringify(values) },
      token,
    ),
  update: (
    resource: AdminResource,
    id: string,
    values: Record<string, unknown>,
    token: string,
  ) =>
    request<ApiRecord>(
      `/api/${resource}/${id}`,
      { method: "PATCH", body: JSON.stringify(values) },
      token,
    ),
  remove: (resource: AdminResource, id: string, token: string) =>
    request<void>(`/api/${resource}/${id}`, { method: "DELETE" }, token),
  uploadImage: async (file: File, token: string) => {
    const response = await fetch(`${apiUrl}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: (() => {
        const form = new FormData();
        form.append("file", file);
        return form;
      })(),
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.message ?? "Não foi possível enviar a imagem.");
    return body as { url: string };
  },
};
