import { Cache } from '../cache';
import { ReadRequest } from '../request';
import { Response } from '../response';
import { uncached as query } from './uncached';

export async function cached(
  request: ReadRequest,
  cache: Cache,
): Promise<Response> {
  let response = cache.get<Promise<Response>>(`response:${request.path}`);

  if (response === undefined) {
    response = query(request);
    cache.set<Promise<Response>>(`response:${request.path}`, response);
  }

  return response;
}
