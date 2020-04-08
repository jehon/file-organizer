
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/main/messenger.js');
const {
    TYPE_TASK,
    TYPE_FILE,
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('./file-organizer/constants.js');

const File = require('./file-organizer/main/file.js');
const Task = require('./file-organizer/main/task.js');

async function wait(secs) {
    return new Promise((resolve) => setTimeout(() => resolve(), secs * 1000));
}

options.headless = false;

require('./file-organizer/gui.js');

const history = new Map();

function wh(id, status, data = {}) {
    if (history.has(id)) {
        const old = history.get(id);
        data = { ...old, ...data };
    }
    history.set(id, data);
    notify({ id, status, ...data });
}

async function w(secs) {
    return new Promise(resolve => setTimeout(() => resolve(1), secs * 1000))
}

class DemoFile extends File {
    async analyse() {
        return super.analyse()
            .then(this.createAndRun(Task, "analyse 1", () => w(1)))
            .then(this.createAndRun(Task, "analyse 2", () => w(1)));
    }
}


(async function () {
    const f = new DemoFile("test");

    // const t3 = new Task(f, "erroneous", () => w(1).then(() => Promise.reject("rejected reason")));

    await wait(2);
    console.log("Analysing...");
    await f.analyse();
    console.log("Analysing done");

    await wait(2);
    console.log("Acting...");
    await f.act();
    console.log("Acting done");

    // t3.run().catch(() => { });
})();
