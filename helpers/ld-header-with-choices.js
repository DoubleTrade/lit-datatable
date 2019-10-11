
import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
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

      paper-menu-button {
        padding: 0;
      }

      iron-icon[icon="check-box"] {
        color: var(--paper-datatable-api-checked-checkbox-color, --primary-color);
      }

      iron-icon[icon="check-box-outline-blank"] {
        color: var(--paper-datatable-api-unchecked-checkbox-color, --primary-text-color);
      }

      .selected {
        font-style: italic;
        margin-left: 4px;
        color: #1E73BE;
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
        <paper-menu-button ignore-select vertical-align="top" dynamic-align no-overlap>
          <div slot="dropdown-trigger" class="layout horizontal center">
            <span class="flex layout horizontal">
              <slot></slot>
              ${this.selectedChoices && this.selectedChoices.length > 0 ? html`
                <div class="selected">${this.countSelected(this.selectedChoices)}</div>` : null}
            </span>
            <paper-icon-button icon="arrow-drop-down"></paper-icon-button>
          </div>
          <div slot="dropdown-content">
            ${this.choices && this.choices.map(choice => html`
              <paper-icon-item data-name="${choice.key}" @tap="${this.tapChoice.bind(this)}">
                <iron-icon slot="item-icon" icon="${this.computeIconName(choice.key, this.selectedChoices)}"></iron-icon>
                <paper-item-body style="${choice.style}">
                  ${choice.label}
                </paper-item-body>
                ${choice.icon ? html`<iron-icon class="choice-icon" style="${choice.iconStyle}" icon="${choice.icon}"></iron-icon>` : null}
              </paper-icon-item>`)}
          </div>
        </paper-menu-button>
      </div>
  `;
  }

  static get properties() {
    return {
      choices: { type: Array },
      selectedChoices: { type: Array },
    };
  }

  constructor() {
    super();
    this.selectedChoices = [];
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
      { detail: { value: selectedChoices } },
    ));
  }
}

window.customElements.define(LdHeaderWithChoices.is, LdHeaderWithChoices);
