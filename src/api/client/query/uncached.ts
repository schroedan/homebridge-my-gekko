import { get } from 'http';
import { receive } from '../receive';
import { Request } from '../request';
import { Response } from '../response';

export async function uncached(request: Request): Promise<Response> {
  return new Promise((resolve, reject) => {
    get(request.url(), (res) => {
      receive(res)
        .then((data) => {
          resolve(new Response(request, data));
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
