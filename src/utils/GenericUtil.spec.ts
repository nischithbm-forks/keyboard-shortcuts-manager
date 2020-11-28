import { isArrayNotEmpty } from '../../src/utils/GenericUtil';

describe('GenericUtil', () => {
    test('isArrayNotEmpty', () => {
        expect(isArrayNotEmpty()).toBe(false);
    });
});
