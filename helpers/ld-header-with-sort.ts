import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons/iron-icons';
import type { Language, Resources } from '../localize';
import Localize from '../localize';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';

@customElement('ld-header-with-sort')
export class LdHeaderWithSort extends Localize(LitElement) {
  @property({ type: String }) direction: '' | 'asc' | 'desc' = '';

  language: Language | null = 'en';

  resources: Resources | null = {
    en: {
      sortAZ: 'Sort A-Z',
      sortZA: 'Sort Z-A',
      sortCancel: 'Cancel sort',
    },
    'en-en': {
      sortAZ: 'Sort A-Z',
      sortZA: 'Sort Z-A',
      sortCancel: 'Cancel sort',
    },
    'en-US': {
      sortAZ: 'Sort A-Z',
      sortZA: 'Sort Z-A',
      sortCancel: 'Cancel sort',
    },
    'en-us': {
      sortAZ: 'Sort A-Z',
      sortZA: 'Sort Z-A',
      sortCancel: 'Cancel sort',
    },
    fr: {
      sortAZ: 'Trier de A à Z',
      sortZA: 'Trier de Z à A',
      sortCancel: 'Annuler le tri',
    },
    'fr-fr': {
      sortAZ: 'Trier de A à Z',
      sortZA: 'Trier de Z à A',
      sortCancel: 'Annuler le tri',
    },
  };

  static get styles() {
    const main = css`
      :host {
        display: block;
      }

      .desc, .asc {
        transition: transform 0.2s;
      }

      .desc {
        color: var(--lit-datatable-api-arrow-color, var(--paper-light-green-600));
        transform: rotate(0deg);
      }

      .asc {
        color: var(--lit-datatable-api-arrow-color, var(--paper-light-green-600));
        transform: rotate(180deg);
      }
    `;
    return [main, ironFlexLayoutTheme, ironFlexLayoutAlignTheme];
  }

  render() {
    return html`
      <div class="layout horizontal center">
        <div class="flex">
          <slot></slot>
        </div>
        <slot name="actions"></slot>
        <paper-icon-button id="sortBtn" icon="arrow-downward" @tap="${this.handleSort.bind(this)}" class="${this.direction}"></paper-icon-button>
        <paper-tooltip for="sortBtn">${this.getTooltipText(this.direction)}</paper-tooltip>
      </div>
  `;
  }

  handleSort() {
    switch (this.direction) {
      case '':
        this.direction = 'desc';
        break;
      case 'desc':
        this.direction = 'asc';
        break;
      default:
        this.direction = '';
        break;
    }

    this.dispatchEvent(new CustomEvent('direction-changed', { detail: { value: this.direction } }));
  }

  getTooltipText(direction: 'asc' | 'desc' | '') {
    if (direction === 'asc') {
      return this.localize('sortCancel');
    } if (direction === 'desc') {
      return this.localize('sortAZ');
    }
    return this.localize('sortZA');
  }
}
