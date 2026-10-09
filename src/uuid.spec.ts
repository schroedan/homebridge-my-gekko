import { PLUGIN_IDENTIFIER } from './platform';
import { mockAPI } from './test/mocks';
import { UUID } from './uuid';

describe('UUID', () => {
  it('should generate UUID', async () => {
    const generate = jest.fn();
    const api = mockAPI({ hap: { uuid: { generate } } });

    generate.mockReturnValue('__uuid__');

    const uuid = new UUID(api);

    expect(uuid.generate('foo/bar')).toEqual('__uuid__');
    expect(generate).toHaveBeenCalledWith(`${PLUGIN_IDENTIFIER}/foo/bar`);
  });
});
