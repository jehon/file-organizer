
import './x-icon.js';
import '../../node_modules/css-inherit/css-inherit.js';

export default class XCounter extends HTMLElement {
    static get observedAttributes() {
        return ['x-icon', 'value'];
    }

    /** @type {HTMLElement} */
    #elIcon;

    /** @type {HTMLElement} */
    #elText;


    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
<css-inherit></css-inherit>
<x-icon></x-icon><span></span>
`;
        this.style.display = 'none';

        this.#elIcon = this.shadowRoot.querySelector('x-icon');
        this.#elText = this.shadowRoot.querySelector('span');
    }

    /**
     * @override
     */
    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'value':
                if (newValue) {
                    this.style.display = 'initial';
                } else {
                    this.style.display = 'none';
                }
                this.#elText.innerHTML = newValue;
                break;
            case 'x-icon':
                this.#elIcon.setAttribute('value', newValue);
                break;
        }
    }
}

customElements.define('x-counter', XCounter);
