import { isAxiosError } from 'axios';

export function describeError(reason: unknown): string {
  if (isAxiosError(reason)) {
    const method = (reason.config?.method ?? 'get').toUpperCase();
    // neither the params nor the query are logged, as they may carry credentials
    const url =
      `${reason.config?.baseURL ?? ''}${reason.config?.url ?? ''}`.split(
        '?',
      )[0];
    const status =
      reason.response === undefined ? '' : ` (HTTP ${reason.response.status})`;

    if (url === '') {
      return `${reason.message}${status}`;
    }

    return `${reason.message}${status}: ${method} ${url}`;
  }

  if (reason instanceof Error) {
    return reason.message;
  }

  return String(reason);
}
