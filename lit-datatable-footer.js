import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import Localize from './localize';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from './iron-flex-import';

class LitDatatableFooter extends Localize(LitElement) {
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
        border-color: rgba(0, 0, 0, var(--dark-divider-opacity));
        padding: 0 14px 0 0;
        color: rgba(0, 0, 0, var(--dark-secondary-opacity));
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
      `;
    return [mainStyle, ironFlexLayoutAlignTheme, ironFlexLayoutTheme];
  }

  static get is() {
    return 'lit-datatable-footer';
  }

  render() {
    return html`
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

  constructor() {
    super();
    this.footerPosition = 'left';
    this.language = 'en';
    this.resources = {
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
    this.availableSize = [];
  }

  static get properties() {
    return {
      footerPosition: { type: String },
      size: { type: Number },
      page: { type: Number },
      totalElements: { type: Number },
      totalPages: { type: Number },
      availableSize: { type: Array },
      language: { type: String },
      resources: { type: Object },
    };
  }

  computeCurrentSize(page, size, totalElements) {
    if (totalElements) {
      return (page * size) + 1;
    }
    return 0;
  }

  computeCurrentMaxSize(page, size, totalElements) {
    const maxSize = size * (page + 1);
    return maxSize > totalElements ? totalElements : maxSize;
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page = this.page + 1;
      this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
    }
  }

  nextButtonDisabled(page, totalPages) {
    return totalPages === 0 || page + 1 === totalPages;
  }

  prevButtonDisabled(page) {
    return page === 0;
  }

  newSizeIsSelected({ currentTarget }) {
    let newSize = currentTarget.selected;
    if (newSize) {
      newSize = parseInt(newSize, 10);
      if (newSize !== this.size) {
        this.page = 0;
        this.size = parseInt(newSize, 10);
        this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
        this.dispatchEvent(new CustomEvent('size-changed', { detail: this.size }));
      }
    }
  }

  computePosition(position) {
    if (position === 'right') {
      return 'end-justified';
    }
    return '';
  }

  async firstUpdated() {
    await this.updateComplete;
    const paperDropdownMenu = this.shadowRoot.querySelector('paper-dropdown-menu');
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

customElements.define(LitDatatableFooter.is, LitDatatableFooter);
