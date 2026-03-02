import axios from 'axios';

const SESSION_TOKEN_KEY = 'ghostchat.session.token';

type GuestSessionResponse = {
  token: string;
  user: {
    id: string;
    username: string;
  };
};

export function getSessionToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export async function ensureGuestSessionToken() {
  const existingToken = getSessionToken();
  if (existingToken) {
    return existingToken;
  }

  const baseURL =
    process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000';

  const { data } = await axios.post<GuestSessionResponse>(
    `${baseURL}/api/auth/guest`
  );
  setSessionToken(data.token);
  return data.token;
}
