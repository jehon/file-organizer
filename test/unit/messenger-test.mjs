
import { t } from '../test-helper.js';

import { getEntityId, notify, register } from '../../src/main/messenger.js';

describe(t(import.meta), function () {
    it('should generate differents id', () => {
        const n = 1000;
        const res = new Set();
        for (let i = 0; i < n; i++) {
            res.add(getEntityId());
        }
        expect(res.size).toBe(n);
    });

    it('should require some fields', () => {
        expect(() => notify({})).toThrow();
        expect(() => notify({ id: 123 })).toThrow();
        expect(() => notify({ type: 123 })).toThrow();
        expect(() => notify({ id: 123, type: 123 })).not.toThrow();
    });

    it('should send data on registered callback', (done) => {
        const ID = 124;
        register((data) => {
            if (data.id != ID) {
                return;
            }
            expect(data).toBeDefined();
            expect(data.id).toBe(ID);
            expect(data.type)
                .withContext(data)
                .toBe('test');
            expect(data.info).toBe('yes');
            done();
        });
        notify({ id: 124, type: 'test', info: 'yes' });
    });

    it('should receive history on registered callback', (done) => {
        const ID = 125;
        notify({ id: ID, type: 'history', info: 'some' });

        register((data) => {
            if (data.id != ID) {
                return;
            }
            expect(data).toBeDefined();
            expect(data.id).toBe(ID);
            expect(data.type).toBe('history');
            expect(data.info).toBe('some');
            done();
        });
    });

});
