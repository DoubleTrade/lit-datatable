
import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/iron-icons/iron-icons';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';
import './ld-header-with-sort';

class LdHeaderWithChoices extends LitElement {
  static get is() {
    return 'ld-header-with-choices';
  }

  static get styles() {
    const main = css`
      :host {
        display: block;
      }

      .dropdown {
        position: fixed;
        background: white;
        transform-origin: 50% 0;
        transition: transform 0.1s;
        transform: scaleY(1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        width: var(--dt-dropdown-choice-dropdown-width, max-content);
        z-index: 99;
        max-height: 300px;
        overflow: auto;
        margin: var(--dt-dropdown-choice-dropdown-margin, 0);
        border-radius: var(--dt-dropdown-choice-dropdown-border-radius, 0);
        box-shadow: var(--dt-dropdown-choice-dropdown-box-shadow, 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24));
      }

      .dropdown.hide {
        transform: scaleY(0);
      }

      paper-icon-button[icon="check-box"] {
        color: var(--paper-datatable-api-checked-checkbox-color, --primary-color);
      }

      paper-icon-button[icon="check-box-outline-blank"] {
        color: var(--paper-datatable-api-unchecked-checkbox-color, --primary-text-color);
      }

      .selected {
        color: var(--primary-color, #1E73BE);
        font-style: italic;
        margin-left: 4px;
      }

      .choice-icon {
        margin-left: 24px;
      }

      paper-icon-button {
        --paper-icon-button: {
          color: var(--paper-icon-button-color);
          transition: color 0.3s;
        }

        --paper-icon-button-hover: {
          color: var(--paper-icon-button-color-hover);
        }
      }
    `;
    return [main, ironFlexLayoutTheme, ironFlexLayoutAlignTheme];
  }

  render() {
    return html`
      <div class="layout horizontal center">

        <div class="layout horizontal center">
          <span class="flex layout horizontal">
            <slot></slot>
            ${this.selectedChoices && this.selectedChoices.length > 0 ? html`
              <div class="selected">
                ${this.countSelected(this.selectedChoices)}
              </div>` : null}
          </span>
          <paper-icon-button icon="arrow-drop-down" @tap="${this.openDropdown.bind(this)}"></paper-icon-button>
        </div>

        <div class="dropdown">
          ${this.choices && this.choices.map((choice) => html`
            <paper-icon-item data-name="${choice.key}" @tap="${this.tapChoice.bind(this)}">
              <paper-icon-button slot="item-icon" icon="${this.computeIconName(choice.key, this.selectedChoices)}"></paper-icon-button>
              <paper-item-body style="${choice.style}">
                ${choice.label}
              </paper-item-body>
              ${choice.icon ? html`<iron-icon class="choice-icon" style="${choice.iconStyle}" icon="${choice.icon}"></iron-icon>` : null}
            </paper-icon-item>
          `)}
        </div>

      </div>
  `;
  }

  static get properties() {
    return {
      choices: { type: Array },
      selectedChoices: { type: Array },
      property: { type: String },
      opened: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.selectedChoices = [];
    this.opened = false;
  }

  computeIconName(choice, selectedChoices) {
    if (selectedChoices.indexOf(choice) === -1) {
      return 'check-box-outline-blank';
    }
    return 'check-box';
  }

  countSelected(selectedChoices) {
    return selectedChoices.length > 0 ? ` (${selectedChoices.length})` : '';
  }

  tapChoice({ currentTarget }) {
    const { name } = currentTarget.dataset;
    const selectedChoices = [...this.selectedChoices];
    const indexOfChoice = selectedChoices.indexOf(name);
    if (indexOfChoice === -1) {
      selectedChoices.push(name);
    } else {
      selectedChoices.splice(indexOfChoice, 1);
    }
    this.dispatchEvent(new CustomEvent(
      'selected-choices-changed',
      { detail: { value: selectedChoices, property: this.property } },
    ));
  }

  updated(properties) {
    if (properties.has('opened')) {
      if (this.opened) {
        this.shadowRoot.querySelector('.dropdown').classList.remove('hide');
      } else {
        this.shadowRoot.querySelector('.dropdown').classList.add('hide');
      }
      this.fitToBorder();
    }
  }

  openDropdown() {
    this.opened = !this.opened;
  }

  fitToBorder() {
    const dropdownElement = this.shadowRoot.querySelector('.dropdown');
    if (dropdownElement) {
      dropdownElement.style.left = '0';
      const dropdownWidth = dropdownElement.offsetWidth;
      const viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const thisX = this.getBoundingClientRect().x;
      const thisY = this.getBoundingClientRect().y;
      if ((dropdownWidth + thisX) > viewPortWidth) {
        dropdownElement.style.left = `${viewPortWidth - dropdownWidth}px`;
      } else {
        dropdownElement.style.left = `${thisX}px`;
      }
      dropdownElement.style.top = `${thisY + this.offsetHeight}px`;
    }
  }

  firstUpdated() {
    window.addEventListener('resize', () => {
      this.fitToBorder();
    });
    window.addEventListener('keyup', (event) => {
      if (this.opened && event.key === 'Escape') {
        this.opened = false;
      }
    });
    window.addEventListener('click', (event) => {
      const path = event.composedPath && event.composedPath();
      if (path.includes(this)) {
        event.preventDefault();
      } else if (this.opened) {
        this.opened = false;
      }
    });
  }
}

window.customElements.define(LdHeaderWithChoices.is, LdHeaderWithChoices);
