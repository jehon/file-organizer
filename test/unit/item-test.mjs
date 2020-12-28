
import { t } from './help-functions.mjs';

import Item from '../../src/main/item.js';
import {
    STATUS_CREATED
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';
import Value from '../../src/main/value.js';

describe(t(import.meta), function () {
    describe('with properties', function () {
        it('should handle properties', () => {
            const i = new Item('my title');
            expect(i.title).toBe('my title');
            expect(i.type).toBe('Item');
            expect(i.subType).toBe('Item');
            const i2 = new Item('2');
            i.setParent(i2);
            expect(i.parent.id).toBe(i2.id);


            const t2 = new Item();
            expect(t2.title).toBeUndefined();
        });

        it('should be built with parent', function () {
            const i2 = new Item('2');
            const i = new Item('2');
            i.setParent(i2);
            expect(i.parent.id).toBe(i2.id);
        });

        it('should allow creating info', () => {
            const i = new Item('test');
            i.set('key', new Value('value'));
            expect(i.get('key').initial).toBe('value');
        });

        it('should allow adding problems', () => {
            const p = 'test';

            const i = new Item('test');
            expect(i.hasProblem(p)).toBeFalse();

            i.addProblem(p);
            expect(i.hasProblem(p)).toBeTrue();

            i.resolveProblem(p);
            expect(i.hasProblem(p)).toBeFalse();
        });
    });

    describe('on notify', function () {
        beforeEach(() => {
            spyOn(Item.prototype, 'notify').and.callThrough();
        });

        it('should be always good', async function () {
            const t = new Item('my title');

            expect(getStatusChangesForItem(t)).toEqual([
                STATUS_CREATED
            ]);
        });
    });
});
