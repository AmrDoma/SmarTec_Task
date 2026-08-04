import type { ApiSuccess } from '../types/shared/api'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiSuccess<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  const body = (await res.json()) as ApiSuccess<T> & {
    detail?: string
    message?: string
  }

  if (!res.ok) {
    throw new ApiError(res.status, body.detail ?? body.message ?? res.statusText)
  }

  return body
}
