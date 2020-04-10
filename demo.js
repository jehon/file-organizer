
const options = require('./file-organizer/options.js');

const File = require('./file-organizer/main/file.js');
const Task = require('./file-organizer/main/task.js');

async function wait(secs) {
    return new Promise((resolve) => setTimeout(() => resolve(), secs * 1000));
}

options.headless = false;
options.debug = true;

require('./file-organizer/gui.js').then(() => {
    const t = 0.1;

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
                .withAnalyse(() => f2.createAndRun(Task, 'analyse 2.1', () => w(2))
                    .then(() => f2.createAndRun(Task, 'analyse 2.2', () => { throw 'euh'; }))
                )
                .runAnalyse()
                .catch(() => { }),

            f3
                .withAnalyse(() => f3.createAndRun(Task, 'analyse 3.1', () => w(2))
                    .then(() => f3.createAndRun(Task, 'analyse 3.2', () => w(2)))
                )
                .runAnalyse(),
            f4
                .withAnalyse(() => f4.enqueueAct(new Task('F4 task', true)))
                .runAnalyse(),

            f5
                .withAnalyse(() => f5.enqueueAct(new Task('F5 task never end', () => new Promise(() => { }))))
                .runAnalyse(),

            f6
                .withAnalyse(() => f6.enqueueAct(new Task('F6 task ok', () => w(1))))
                .runAnalyse(),
            f7
                .withAnalyse(() => f7.enqueueAct(new Task('F7 task error', () => { throw 'euh'; })))
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