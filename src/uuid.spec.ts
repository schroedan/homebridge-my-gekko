import { API } from 'homebridge';
import { mock } from 'jest-mock-extended';
import { PLUGIN_IDENTIFIER } from './platform';
import { UUID } from './uuid';

describe('UUID', () => {
  it('should generate UUID', async () => {
    const generate = jest.fn();
    const api = mock<API>({ hap: { uuid: { generate } } });

    generate.mockReturnValue('__uuid__');

    const uuid = new UUID(api);

    expect(uuid.generate('foo/bar')).toEqual('__uuid__');
    expect(generate).toHaveBeenCalledWith(`${PLUGIN_IDENTIFIER}/foo/bar`);
  });
});
