
import { t } from '../test-helper.js';

import messenger from '../../file-organizer/main/messenger.js';

describe(t(import.meta), function () {
    // beforeEach(() => {
    //     spyOn(messenger, 'notify').and.returnValue(true);
    // });

    it('should generate differents id', () => {
        const n = 1000;
        const res = new Set();
        for (let i = 0; i < n; i++) {
            res.add(messenger.getEntityId());
        }
        expect(res.size).toBe(n);
    });

    it('should require some fields', () => {
        expect(() => messenger.notify({})).toThrow();
        expect(() => messenger.notify({ id: 123 })).toThrow();
        expect(() => messenger.notify({ type: 123 })).toThrow();
        expect(() => messenger.notify({ id: 123, type: 123 })).not.toThrow();
    });

    it('should send data on registered callback', (done) => {
        const ID = 124;
        messenger.register((data) => {
            if (data.id != ID) {
                return;
            }
            expect(data).toBeDefined();
            expect(data.id).toBe(ID);
            expect(data.type).toBe('test');
            expect(data.info).toBe('yes');
            done();
        });
        messenger.notify({ id: 124, type: 'test', info: 'yes' });
    });

    it('should receive history on registered callback', (done) => {
        const ID = 125;
        messenger.notify({ id: ID, type: 'history', info: 'some' });

        messenger.register((data) => {
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
