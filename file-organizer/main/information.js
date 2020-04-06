
const messenger = require('../../main/messenger.js');
const { TYPE_INFO } = require('../../constants.js');

module.exports = class Information {
    constructor(file, title, initialValue) {
        this.id = messenger.getEntityId();
        this.file = file;
        this.title = title;
        this.initialValue = initialValue;
        this.newValue = undefined;
        this.simulatedValue = undefined;
        this.notify(STATUS_CREATED);
    }

    notify(status) {
        this.status = status;
        messenger.notify({
            id: this.id,
            type: TYPE_INFO,
            file: this.file.id,
            status: this.status,
            title: this.title,
            initialValue: this.initialValue,
            simulatedValue: this.simulatedValue,
            newValue: this.newValue
        });
    }

    simulate(simulatedValue) {
        this.simulatedValue = simulatedValue;
    }

    getSimulatedValue() {
        if (this.simulatedValue !== undefined) {
            return this.simulatedValue;
        }
        if (this.newValue !== undefined) {
            return this.newValue;
        }
        return this.simulatedValue;
    }

    update(newValue) {
        this.newValue = newValue;
        this.simulatedValue = undefined;
    }
};
