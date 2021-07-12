import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import type { Language, Resources } from '../localize';
import Localize from '../localize';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';

@customElement('ld-header-with-filter')
export default class LdHeaderWithFilter extends Localize(LitElement) {
  @property({ type: String }) header = '';

  @property({ type: String }) direction: '' | 'asc' | 'desc' = '';

  @property({ type: Boolean }) active = false;

  @property({ type: String }) filterValue: string | null = null;

  @property({ type: String }) property = '';

  language: Language | null = 'en';

  resources: Resources | null = {
    en: {
      search: 'Search',
      clear: 'Clear',
    },
    'en-en': {
      search: 'Search',
      clear: 'Clear',
    },
    'en-US': {
      search: 'Search',
      clear: 'Clear',
    },
    'en-us': {
      search: 'Search',
      clear: 'Clear',
    },
    fr: {
      search: 'Rechercher',
      clear: 'Effacer',
    },
    'fr-fr': {
      search: 'Rechercher',
      clear: 'Effacer',
    },
  };

  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }

      paper-input {
        min-width: var(--paper-datatable-api-min-width-input-filter, 120px);
      }

      paper-icon-button {
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .header {
        margin-right: 16px;
      }`;
    return [mainStyle, ironFlexLayoutTheme, ironFlexLayoutAlignTheme];
  }

  render() {
    let content = html`
      <div class="layout horizontal center">
        <div class="header" @tap="${this.toggleActive.bind(this)}">
          ${this.header}
        </div>
        <paper-icon-button id="searchBtn" slot="actions" icon="search" @tap="${this.toggleActive.bind(this)}"></paper-icon-button>
        <paper-tooltip for="searchBtn" slot="actions">${this.localize('search')}</paper-tooltip>
      </div>
    `;
    if (this.active) {
      content = html`
        <style>
          paper-input {
            --paper-input-container-underline-focus: {
              display: block;
            };
            --paper-input-container-label: {
              position: initial;
            };
            --paper-input-container: {
              padding: 0;
            };
            --paper-input-container-input: {
              font-size: 7px;
            };
          }

          paper-icon-button {
            --paper-icon-button: {
              color: var(--paper-icon-button-color);
            }

            --paper-icon-button-hover: {
              color: var(--paper-icon-button-color-hover);
            }
          }
        </style>
        <paper-input
          no-label-float
          .placeholder="${this.header}"
          .value="${this.filterValue}"
          @value-changed="${this.valueChanged.bind(this)}">
          <paper-icon-button
            id="clearBtn"
            icon="clear"
            slot="suffix"
            @tap="${this.toggleActive.bind(this)}"></paper-icon-button>
          <paper-tooltip
            for="clearBtn"
            slot="suffix">
            ${this.localize('clear')}
          </paper-tooltip>
        </paper-input>`;
    }
    return content;
  }

  async toggleActive() {
    this.active = !this.active;
    this.dispatchEvent(new CustomEvent('active-changed', { detail: { value: this.active } }));
    if (!this.active && this.filterValue) {
      this.filterValue = null;
      this.dispatchFilterEvent();
    } else {
      await this.updateComplete;
      if (this.shadowRoot) {
        const paperInput = this.shadowRoot.querySelector('paper-input');
        if (paperInput) {
          paperInput.setAttribute('tabindex', '1');
          paperInput.focus();
        }
      }
    }
  }

  directionChanged({ detail }: CustomEvent<{value: 'asc' | 'desc' | ''}>) {
    if (this.direction !== detail.value) {
      this.direction = detail.value;
      this.dispatchEvent(new CustomEvent('direction-changed', { detail: { value: this.direction } }));
    }
  }

  valueChanged({ detail }: CustomEvent<{value: string}>) {
    if (this.filterValue !== detail.value) {
      this.filterValue = detail.value;
      this.dispatchFilterEvent();
    }
  }

  dispatchFilterEvent() {
    this.dispatchEvent(new CustomEvent('filter-value-changed', { detail: { value: this.filterValue, property: this.property } }));
  }
}
