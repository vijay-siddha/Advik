import type { User, UserInsert, UserUpdate } from '@shared/types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

function headers(token?: string, extra?: Record<string, string>, body?: any) {
  const h: Record<string, string> = { ...(extra || {}) }
  if (!(typeof FormData !== 'undefined' && body instanceof FormData)) {
    h['Content-Type'] = 'application/json'
  }
  if (token) h['Authorization'] = 'Bearer ' + token
  return h
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(API_BASE + path, { ...init, headers: headers(token, init.headers as Record<string, string> | undefined, init.body) })
  const text = await res.text()
  let json: any = {}
  try { json = text ? JSON.parse(text) : {} } catch { json = {} }
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json as T
}

export const Api = {
  register: (data: UserInsert) => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: (token: string) => request<{ user: User }>('/api/me', {}, token),
  listUsers: (token: string) => request<{ users: User[] }>('/api/users', {}, token),
  addUser: (token: string, data: UserInsert) => request<{ user: User }>('/api/users', { method: 'POST', body: JSON.stringify(data) }, token),
  updateUser: (token: string, id: string, data: UserUpdate) => request<{ user: User }>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteUser: (token: string, id: string) => request<{ user: User }>(`/api/users/${id}`, { method: 'DELETE' }, token),
  passwordResetRequest: (email: string) => request<{ ok: boolean; token?: string }>(`/api/auth/password/reset-request`, { method: 'POST', body: JSON.stringify({ email }) }),
  passwordResetConfirm: (token: string, password: string) => request<{ ok: boolean }>(`/api/auth/password/reset-confirm`, { method: 'POST', body: JSON.stringify({ token, password }) }),
  listComponents: (token: string, parent_id?: string, status?: string, includeChildren?: boolean) =>
    request<{ items: any[] }>(
      `/api/components${parent_id ? `?parent_id=${encodeURIComponent(parent_id)}` : ''}${status ? `${parent_id ? '&' : '?'}status=${encodeURIComponent(status)}` : ''}${includeChildren && !parent_id ? `${parent_id || status ? '&' : '?'}include_children=true` : ''}`,
      {},
      token
    ),
  createComponent: (token: string, form: FormData) => request<{ item: any }>(`/api/components`, { method: 'POST', body: form }, token),
  updateComponent: (token: string, id: string, form: FormData) => request<{ item: any }>(`/api/components/${id}`, { method: 'PUT', body: form }, token),
  cloneComponent: (token: string, id: string) => request<{ item: any }>(`/api/components/${id}/clone`, { method: 'POST' }, token),
  listAttributeKeys: (token: string) => request<{ keys: string[] }>(`/api/components/attribute-keys`, {}, token),
}
