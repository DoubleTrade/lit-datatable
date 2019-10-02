import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import Localize from '../localize';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';

class LdHeaderWithFilter extends Localize(LitElement) {
  static get is() {
    return 'ld-header-with-filter';
  }

  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }

      paper-input {
        min-width: var(--paper-datatable-api-min-width-input-filter, 120px);
        --paper-input-container-underline-focus: {
          display: block;
        }
        ;
        --paper-input-container-label: {
          position: initial;
        }
        ;
        --paper-input-container: {
          padding: 0;
        }
        ;
        --paper-input-container-input: {
          font-size: 12px;
        }
        ;
      }

      paper-icon-button {
        padding: 0;
        width: 24px;
        height: 24px;
        --paper-icon-button: {
          color: var(--paper-icon-button-color);
        }

        --paper-icon-button-hover: {
          color: var(--paper-icon-button-color-hover);
        }
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

  constructor() {
    super();
    this.resources = {
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
    this.language = 'en';
    this.active = false;
  }

  static get properties() {
    return {
      header: String,
      direction: {
        type: String,
      },
      active: {
        type: Boolean,
      },
      filterValue: {
        type: String,
      },
      language: {
        type: String,
      },
      resources: {
        type: Object,
      },
    };
  }

  async toggleActive() {
    this.active = !this.active;
    this.dispatchEvent(new CustomEvent('active-changed', { detail: { value: this.active } }));
    if (!this.active && this.filterValue) {
      this.filterValue = null;
      this.dispatchFilterEvent();
    } else {
      await this.updateComplete;
      const paperInput = this.shadowRoot.querySelector('paper-input');
      if (paperInput) {
        paperInput.setAttribute('tabindex', 1);
        paperInput.focus();
      }
    }
  }

  directionChanged({ detail }) {
    if (this.direction !== detail.value) {
      this.direction = detail.value;
      this.dispatchEvent(new CustomEvent('direction-changed', { detail: { value: this.direction } }));
    }
  }

  valueChanged({ detail }) {
    if (this.filterValue !== detail.value) {
      this.filterValue = detail.value;
      this.dispatchFilterEvent();
    }
  }

  dispatchFilterEvent() {
    this.dispatchEvent(new CustomEvent('filter-value-changed', { detail: { value: this.filterValue } }));
  }
}

window.customElements.define(LdHeaderWithFilter.is, LdHeaderWithFilter);
