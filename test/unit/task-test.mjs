
import { t } from '../test-helper.js';

import Task, { _TaskSuccessFactory, _TaskFailureFactory } from '../../src/main/task.js';
import { listenForItemNotify, getStatusHistoryForItem } from './help-functions.mjs';

import {
    TYPE_TASK,
    STATUS_CREATED,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../../src/common/constants.js';

describe(t(import.meta), function () {
    beforeEach(() => {
        listenForItemNotify();
    });

    it('should have the correct type', function () {
        const t = new Task('task test', () => true);
        expect(t.type).toBe(TYPE_TASK);
    });

    it('should run a simple task', async function () {
        const t = new Task('task test', () => true);
        await expectAsync(t.run())
            .toBeResolvedTo(true);

        expect(getStatusHistoryForItem(t)).toEqual([
            STATUS_CREATED,
            STATUS_NEED_ACTION,
            STATUS_ACTING,
            STATUS_ACTED_SUCCESS
        ]);
    });

    it('should run a simple task with true', async function () {
        const t = new Task('task test',
            () => true
        );
        await expectAsync(t.run())
            .toBeResolvedTo(true);

        expect(getStatusHistoryForItem(t)).toEqual([
            STATUS_CREATED,
            STATUS_NEED_ACTION,
            STATUS_ACTING,
            STATUS_ACTED_SUCCESS
        ]);
    });

    it('should run a simple task with error', async function () {
        const t = new Task('task test', () => { throw 'new error'; });

        await expectAsync(t.run()).toBeRejected();

        // Should be rejected
        expect(getStatusHistoryForItem(t)).toEqual([
            STATUS_CREATED,
            STATUS_NEED_ACTION,
            STATUS_ACTING,
            STATUS_ACTED_FAILURE
        ]);
    });

    it('should run a simple task with message', async function () {
        const t = new Task('task test', () => 'euh');
        await expectAsync(t.run()).toBeResolvedTo('euh');

        expect(getStatusHistoryForItem(t)).toEqual([
            STATUS_CREATED,
            STATUS_NEED_ACTION,
            STATUS_ACTING,
            STATUS_ACTED_SUCCESS
        ]);
    });

    it('should work with subs', async function () {
        await expectAsync(_TaskSuccessFactory('').run())
            .toBeResolvedTo('');
        await expectAsync(_TaskSuccessFactory('euh').run())
            .toBeResolvedTo('euh');

        await expectAsync(_TaskFailureFactory('').run())
            .toBeRejectedWithError();
        await expectAsync(_TaskFailureFactory('euh').run())
            .toBeRejectedWithError('euh');
    });
});
