import axios from 'axios';

import { getSessionToken } from '@/lib/session-client';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000';

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = getSessionToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
