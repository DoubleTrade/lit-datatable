import {
  LitElement, css, html, PropertyValues, TemplateResult
} from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-icon-item';
import '@polymer/paper-item/paper-item-body';
import '@polymer/iron-icons/iron-icons';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';
import './ld-header-with-sort';

export interface Choice {
  key: string;
  label: string;
  style?: string;
  icon?: string;
  iconStyle?: string;
  prefix?: TemplateResult;
}

@customElement('ld-header-with-choices')
export class LdHeaderWithChoices extends LitElement {
  @property({ type: Array }) choices: Array<Choice> = [];

  @property({ type: Boolean }) enableFilter = false;

  @property({ type: String }) filterValue = '';

  @query('#filterInput') filterInput!: HTMLInputElement;

  @property({ type: Array }) filteredChoices: Array<Choice> = [];

  @property({ type: Array }) selectedChoices: Array<string> = [];

  @property({ type: String }) property = '';

  @property({ type: Boolean }) opened = false;

  @query('.dropdown') dropdown!: HTMLDivElement;

  static get styles() {
    const main = css`
      :host {
        display: block;
      }

      .dropdown {
        position: fixed;
        background: var(--ld-header-with-choices-background-color, white);
        transform-origin: 50% 0;
        transition: transform 0.1s;
        transform: scaleY(1);
        box-shadow: var(--ld-header-with-choices-box-shadown, 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24));
        width: var(--dt-dropdown-choice-dropdown-width, max-content);
        z-index: 99;
        max-height: 300px;
        overflow: auto;
        margin: var(--dt-dropdown-choice-dropdown-margin, 0);
        color: var(--primary-text-color, black);
        border-radius: var(--dt-dropdown-choice-dropdown-border-radius, 0);
        box-shadow: var(--dt-dropdown-choice-dropdown-box-shadow, 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24));
      }

      .dropdown.hide {
        transform: scaleY(0);
      }

      paper-icon-button[icon="check-box"] {
        min-width: 40px;
        color: var(--paper-datatable-api-checked-checkbox-color, --primary-color);
      }

      paper-icon-button[icon="check-box-outline-blank"] {
        min-width: 40px;
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

      .label {
        font-size: 13px;
        font-family: Roboto;
        font-weight: 400;
        margin-right: 16px;
      }

      .prefix {
        margin-right: 10px;
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

      #search-container {
        padding: 6px 6px 6px 10px;
        border-bottom: 1px solid #E0E0E0;
      }

      #search-container input{
          border: none;
          font-size: var(--header-filter-input-font-size, 16px);
          width: calc(100% - 30px);
          outline: none;
          background: transparent;
          height: 24px;
          padding: 0;
          color: var(--dt-input-text-color, black);
          box-shadow: none;
          min-width: 0;
      }
      #search-container input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
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
          ${this.enableFilter ? html`
            <div id="search-container">
              <input id="filterInput"
                @input=${this.filterValueChanged.bind(this)}
                @change=${this.filterValueChanged.bind(this)} 
                .value="${this.filterValue}" />
              <iron-icon icon="icons:search"></iron-icon>
            </div>
          ` : null}
          ${this.filteredChoices && this.filteredChoices.map((choice) => html`
            <div class="layout horizontal center" @tap="${this.tapChoice.bind(this, choice.key)}">
              <paper-icon-button icon="${this.computeIconName(choice.key, this.selectedChoices)}">
              </paper-icon-button>
              ${choice.prefix ? html`<div class="prefix">${choice.prefix}</div>` : null}
              <div class="label" .style="${choice.style}">
                ${choice.label}
              </div>
              ${choice.icon ? html`
                <iron-icon class="choice-icon" .style="${choice.iconStyle}" icon="${choice.icon}"></iron-icon>
              ` : null}
            </div>
          `)}
        </div>
      
      </div>
  `;
  }

  static get properties() {
    return {
    };
  }

  constructor() {
    super();
    this.selectedChoices = [];
    this.opened = false;
  }

  computeIconName(choice: string, selectedChoices: Array<string>) {
    if (selectedChoices.indexOf(choice) === -1) {
      return 'check-box-outline-blank';
    }
    return 'check-box';
  }

  countSelected(selectedChoices: Array<string>) {
    return selectedChoices.length > 0 ? ` (${selectedChoices.length})` : '';
  }

  tapChoice(name: string) {
    const selectedChoices = [...this.selectedChoices];
    const indexOfChoice = selectedChoices.indexOf(name);
    if (indexOfChoice === -1) {
      selectedChoices.push(name);
    } else {
      selectedChoices.splice(indexOfChoice, 1);
    }
    this.dispatchEvent(new CustomEvent(
      'selected-choices-changed',
      { detail: { value: selectedChoices, property: this.property } }
    ));
  }

  updated(properties: PropertyValues<LdHeaderWithChoices>) {
    if (properties.has('opened')) {
      if (this.opened) {
        this.dropdown.classList.remove('hide');
        if (this.enableFilter) {
          this.filterInput.focus();
          this.filterValue = '';
        }
      } else {
        this.dropdown.classList.add('hide');
      }
      this.fitToBorder();
    }
    if (properties.has('enableFilter') || properties.has('choices') || properties.has('filterValue')) {
      this.updateFilteredChoices();
    }
  }

  openDropdown() {
    this.opened = !this.opened;
  }

  fitToBorder() {
    if (this.shadowRoot) {
      if (this.dropdown) {
        this.dropdown.style.left = '0';
        const dropdownWidth = this.dropdown.offsetWidth;
        const viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const thisX = this.getBoundingClientRect().x;
        const thisY = this.getBoundingClientRect().y;
        if ((dropdownWidth + thisX) > viewPortWidth) {
          this.dropdown.style.left = `${viewPortWidth - dropdownWidth}px`;
        } else {
          this.dropdown.style.left = `${thisX}px`;
        }
        this.dropdown.style.top = `${thisY + this.offsetHeight + 9}px`;
      }
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

  filterValueChanged(event: InputEvent) {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.filterValue = target.value;
  }

  updateFilteredChoices() {
    this.filteredChoices = (this.enableFilter && this.choices)
      ? this.choices.filter((c) => c?.label?.toLowerCase().includes(this.filterValue?.toLowerCase()))
      : this.choices;
  }
}
