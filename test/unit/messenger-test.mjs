
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
        const id = getEntityId();
        expect(() => notify({})).toThrow();
        expect(() => notify({ id: id })).toThrow();
        expect(() => notify({ type: 'messenger-test' })).toThrow();
        expect(() => notify({ id: id, type: 'messenger-test' })).not.toThrow();
    });

    it('should send data on registered callback', (done) => {
        const id = getEntityId;
        register((data) => {
            if (data.id != id) {
                return;
            }
            expect(data).toBeDefined();
            expect(data.id).toBe(id);
            expect(data.type)
                .withContext(JSON.stringify(data))
                .toBe('test');
            expect(data.info).toBe('yes');
            done();
        });
        notify({ id, type: 'test', info: 'yes' });
    });

    it('should receive history on registered callback', (done) => {
        const id = getEntityId();
        notify({ id: id, type: 'history', info: 'some' });

        register((data) => {
            if (data.id != id) {
                return;
            }
            expect(data).toBeDefined();
            expect(data.id).toBe(id);
            expect(data.type)
                .withContext(JSON.stringify(data))
                .toBe('history');
            expect(data.info).toBe('some');
            done();
        });
    });

});
