
import options from '../../file-organizer/options.js';

import File from '../main/file-types/file.js';
import Task from '../main/task.js';
import gui from '../gui.js';
import loadFileTypes from '../main/loadFileTypes.js';

/**
 * @param secs
 */
async function wait(secs) {
    return new Promise((resolve) => setTimeout(() => resolve(), secs * 1000));
}

options.headless = false;
options.debug = true;

loadFileTypes()
    .then(() => gui)
    .then(() => {
        const t = 0.1;

        /**
         * @param secs
         */
        async function w(secs) {
            return new Promise(resolve => setTimeout(() => resolve(1), secs * t * 1000));
        }

        class DemoFile extends File {
            withAnalyse(fn) {
                this.fnAnalyse = fn;
                return this;
            }

            async analyse() {
                return super.analyse()
                    .then(this.fnAnalyse);
            }
        }

        (async function () {
            const f1 = new DemoFile('test (stay in analysis)');
            const f2 = new DemoFile('test2 (status_failure)');
            const f3 = new DemoFile('test3 (status_success)');
            const f4 = new DemoFile('test4 (need action)');
            const f5 = new DemoFile('test5 (acting)');
            const f6 = new DemoFile('test6 (act success)');
            const f7 = new DemoFile('test7 (act ko)');

            await wait(2);
            console.info('Analysing...');

            f1
                .withAnalyse(() => new Promise(() => { }))
                .runAnalyse();

            await Promise.all([
                f2
                    .withAnalyse(
                        () => w(2)
                            .then(() => { throw 'euh'; })
                    )
                    .runAnalyse()
                    .catch(() => { }),

                f3
                    .withAnalyse(
                        () => w(2)
                            .then(() => w(2))
                    )
                    .runAnalyse(),

                f4
                    .withAnalyse(
                        () => f4.analysisAddProblem('Problem')
                    )
                    .runAnalyse(),

                f5
                    .withAnalyse(() => f5.analysisAddFixAct(new Task('F5 task never end', () => new Promise(() => { }))))
                    .runAnalyse(),

                f6
                    .withAnalyse(() => f6.analysisAddFixAct(new Task('F6 task ok', () => w(1))))
                    .runAnalyse(),

                f7
                    .withAnalyse(() => f7.analysisAddFixAct(new Task('F7 task error', () => { throw 'euh'; })))
                    .runAnalyse(),
            ]);
            console.info('Analysing done');

            await wait(2);

            console.info('Acting...');
            await Promise.all([
                f2.act(), // do nothing
                f3.act(), // do nothing
                f5.act(),
                f6.act(),
                f7.act().catch(() => { })
            ]);
            console.info('Acting done');
        })();
    });