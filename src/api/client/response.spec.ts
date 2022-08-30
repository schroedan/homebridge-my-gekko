import { mock } from 'jest-mock-extended';
import { Request } from './request';
import { Response } from './response';

describe('Response', () => {
  it('should provide request', () => {
    const request = mock<Request>();
    const response = new Response(request, '__data__');

    expect(response.request).toBe(request);
  });
  it('should provide data', () => {
    const request = mock<Request>();
    const response = new Response(request, '__data__');

    expect(response.data).toEqual('__data__');
  });
  it('should parse JSON', () => {
    const request = mock<Request>();
    const response = new Response(request, '{"__key__":"__value__"}');
    const data = response.json() as Record<string, string>;

    expect(data.__key__).toBe('__value__');
  });
  it('should parse JSON only once', () => {
    const request = mock<Request>();
    const response = new Response(request, '{"__key__":"__value__"}');
    const parse = jest.spyOn(JSON, 'parse');

    response.json();
    response.json();

    expect(parse).toHaveBeenCalledTimes(1);
  });
  it('should not parse JSON when response is OK', () => {
    const request = mock<Request>();
    const response = new Response(request, 'OK');

    expect(response.data).toBe('OK');
    expect(response.json()).toBeUndefined();
  });
});
