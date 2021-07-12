import {
  LitElement, css, html
} from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import type { PaperDropdownMenuElement } from '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import type { PaperListboxElement } from '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import type { Language, Resources } from './localize';
import Localize from './localize';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from './iron-flex-import';

type FooterPosition = 'right' | 'left';

@customElement('lit-datatable-footer')
export class LitDatatableFooter extends Localize(LitElement) {
  language: Language | null = 'en';

  resources: Resources | null = {
    en: {
      nextPage: 'Next page',
      previousPage: 'Previous page',
      linesPerPage: 'Lines per page',
      of: 'of',

    },
    'en-en': {
      nextPage: 'Next page',
      previousPage: 'Previous page',
      linesPerPage: 'Lines per page',
      of: 'of',
    },
    'en-US': {
      nextPage: 'Next page',
      previousPage: 'Previous page',
      linesPerPage: 'Lines per page',
      of: 'of',
    },
    'en-us': {
      nextPage: 'Next page',
      previousPage: 'Previous page',
      linesPerPage: 'Lines per page',
      of: 'of',
    },
    fr: {
      nextPage: 'Page suivante',
      previousPage: 'Page précédente',
      linesPerPage: 'Lignes par page',
      of: 'sur',
    },
    'fr-fr': {
      nextPage: 'Page suivante',
      previousPage: 'Page précédente',
      linesPerPage: 'Lignes par page',
      of: 'sur',
    },
  };

  @property({ type: String }) footerPosition: FooterPosition = 'left';

  @property({ type: Number }) size = 0;

  @property({ type: Number }) page = 0;

  @property({ type: Number }) totalElements = 0;

  @property({ type: Number }) totalPages = 0;

  @property({ type: Array }) availableSize: Array<number> = [];

  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }

      .foot {
        font-size: 12px;
        font-weight: normal;
        height: 55px;
        border-top: 1px solid;
        border-color: var(--lit-datatable-divider-color, rgba(0, 0, 0, var(--dark-divider-opacity)));
        padding: 0 14px 0 0;
        color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
      }

      .foot .left {
        padding: 0 0 0 14px;
      }

      .foot paper-icon-button {
        width: 24px;
        height: 24px;
        padding: 0;
        margin-left: 24px;
      }

      .foot .status {
        margin: 0 8px 0 32px;
      }

      .foot .size {
        width: 64px;
        text-align: right;
      }

      paper-dropdown-menu {
        color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
      }
      `;
    return [mainStyle, ironFlexLayoutAlignTheme, ironFlexLayoutTheme];
  }

  render() {
    return html`
      <style>
        paper-dropdown-menu {
          --paper-dropdown-menu: {
            color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
          --paper-input-container-color: var(--lit-datatable-footer-color);
          --paper-input-container-input-color: var(--lit-datatable-footer-color);
          }
          --paper-dropdown-menu-input: {
            color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
          }
          --paper-input-container-input: {
            color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
          }
          --paper-listbox-background-color: var(--lit-datatable-footer-background, white);
          --paper-dropdown-menu-icon: {
            color: var(--lit-datatable-footer-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
          }
        }
      </style>
      <div class="layout horizontal center foot ${this.computePosition(this.footerPosition)}">
        <div class="${this.footerPosition}">
          <div class="layout horizontal end-justified center">
            <div class="layout horizontal center">
              <div>
                ${this.localize('linesPerPage')}
              </div>
              <div class="size">
                <paper-dropdown-menu no-label-float vertical-align="bottom">
                  <paper-listbox attr-for-selected="size" @iron-select="${this.newSizeIsSelected}" selected="${this.size}" slot="dropdown-content">
                    ${this.availableSize && this.availableSize.map((size) => html`
                      <paper-item size="${size}">${size}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            </div>
            <div class="status">
              ${this.computeCurrentSize(this.page, this.size, this.totalElements)}-${this.computeCurrentMaxSize(this.page, this.size, this.totalElements)}
              ${this.localize('of')}
              ${this.totalElements}
            </div>
            <paper-icon-button id="previousPageBtn" icon="chevron-left" .disabled="${this.prevButtonDisabled(this.page)}" @tap="${this.prevPage}"></paper-icon-button>
            <paper-tooltip for="previousPageBtn" position="top">${this.localize('previousPage')}</paper-tooltip>
            <paper-icon-button id="nextPageBtn" icon="chevron-right" .disabled="${this.nextButtonDisabled(this.page, this.totalPages)}" @tap="${this.nextPage}"></paper-icon-button>
            <paper-tooltip for="nextPageBtn" position="top">${this.localize('nextPage')}</paper-tooltip>
          </div>
        </div>
      </div>
      `;
  }

  computeCurrentSize(page: number, size: number, totalElements: number) {
    if (totalElements) {
      return (page * size) + 1;
    }
    return 0;
  }

  computeCurrentMaxSize(page: number, size: number, totalElements: number) {
    const maxSize = size * (page + 1);
    return maxSize > totalElements ? totalElements : maxSize;
  }

  launchEvent() {
    this.dispatchEvent(new CustomEvent('page-or-size-changed', { detail: { page: this.page, size: this.size } }));
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page += 1;
      this.launchEvent();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page -= 1;
      this.launchEvent();
    }
  }

  nextButtonDisabled(page: number, totalPages: number) {
    return totalPages === 0 || page + 1 === totalPages;
  }

  prevButtonDisabled(page: number) {
    return page === 0;
  }

  newSizeIsSelected({ currentTarget }: CustomEvent) {
    const paperListBox = currentTarget as PaperListboxElement;
    let newSize = paperListBox.selected;
    if (newSize) {
      if (typeof newSize === 'string') {
        newSize = parseInt(newSize, 10);
      }
      if (newSize !== this.size) {
        this.page = 0;
        this.size = newSize;
        this.launchEvent();
      }
    }
  }

  computePosition(position: FooterPosition) {
    if (position === 'right') {
      return 'end-justified';
    }
    return '';
  }

  async firstUpdated() {
    await this.updateComplete;
    if (this.shadowRoot) {
      const paperDropdownMenu = this.shadowRoot.querySelector<PaperDropdownMenuElement>('paper-dropdown-menu');
      if (paperDropdownMenu) {
        paperDropdownMenu.updateStyles({
          '--paper-input-container-underline_-_display': 'none',
          '--paper-input-container-shared-input-style_-_font-weight': '500',
          '--paper-input-container-shared-input-style_-_text-align': 'right',
          '--paper-input-container-shared-input-style_-_font-size': '12px',
          '--paper-input-container-shared-input-style_-_color': 'var(--paper-datatable-navigation-bar-text-color, rgba(0, 0, 0, .54))',
          '--paper-input-container-input-color': 'var(--paper-datatable-navigation-bar-text-color, rgba(0, 0, 0, .54))',
          '--disabled-text-color': 'var(--paper-datatable-navigation-bar-text-color, rgba(0, 0, 0, .54))',
        });
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-datatable-footer': LitDatatableFooter;
  }
}
