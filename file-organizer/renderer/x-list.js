
const { listenerForType } = require('./listener.js');

const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

function uz(val, def = 0) {
    if (val === undefined || val === null) {
        return def;
    }
    return val;
}

class XList extends HTMLElement {
    constructor(refType) {
        super();
        this.counters = {};
        this.history = {};
        this.refType = refType;
        this.total = 0;

        const updateCounter = (status) => {
            this.querySelectorAll(`[counter=${status}]`).forEach(
                el => el.innerHTML = '' + this.counters[status]
            );

            this.querySelectorAll('progress[category=total]').forEach(e => {
                const p = uz(this.counters[STATUS_ACTED_SUCCESS])
                    + uz(this.counters[STATUS_ACTED_FAILURE])
                    + uz(this.counters[STATUS_SUCCESS])
                    + uz(this.counters[STATUS_FAILURE]);

                e.setAttribute('max', this.total);
                e.setAttribute('value', p);
            });
        }

        listenerForType(this.refType, (id, status, data) => {
            if (!this.filter(id, status, data)) {
                return;
            }
            if (!(status in this.counters)) {
                this.counters[status] = 0;
            }

            if (id in this.history) {
                // We had that value before...
                const oldStatus = this.history[id].status;
                this.counters[oldStatus]--;
                updateCounter(oldStatus);
            } else {
                this.onCreate(id, status, data);
                this.total++;
            }

            // We update 
            this.history[id] = data;
            this.counters[status]++;

            updateCounter(status);
        });
    }

    filter(_id, _status, _data) {
        return true;
    }

    onCreate(_id) { }
}

window.customElements.define('x-list', XList);

module.exports = XList;