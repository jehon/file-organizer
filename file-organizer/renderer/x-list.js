
const { listenerForType } = require('./listener.js');

class XList extends HTMLElement {
    constructor(refType) {
        super();
        this.counters = {};
        this.history = {};
        this.refType = refType;

        const updateCounter = (status) => {
            this.querySelectorAll(`[counter=${status}]`).forEach(
                el => el.innerHTML = '' + this.counters[status]
            );
        }

        listenerForType(this.refType, (id, status, data) => {
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
            }

            // We update 
            this.history[id] = data;
            this.counters[status]++;

            updateCounter(status);
        });
    }

    onCreate(_id) { }
}

window.customElements.define('x-list', XList);

module.exports = XList;