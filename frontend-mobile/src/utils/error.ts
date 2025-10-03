import { AxiosError } from 'axios';

type ErrorShape = { detail?: string } | { message?: string } | string;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getErrorMessage = (error: unknown, fallback = 'Unexpected error occurred'): string => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorShape | undefined;
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload;
    }
    if (isRecord(payload)) {
      const detail =
        (('detail' in payload && typeof payload.detail === 'string' && payload.detail) ||
        ('message' in payload && typeof payload.message === 'string' && payload.message)) ??
        undefined;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return detail;
      }
    }
    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (isRecord(error) && typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};
