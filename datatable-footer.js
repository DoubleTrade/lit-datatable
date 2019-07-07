import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';

import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from './iron-flex-import';

class DatatableFooter extends LitElement {
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

      .size paper-dropdown-menu {
        --paper-input-container-underline: {
          display: none;
        }

        ;

        --paper-input-container-input: {
          text-align: right;
          font-size: 12px;
          font-weight: 500;
          color: var(--paper-datatable-navigation-bar-text-color, rgba(0, 0, 0, .54));
        }

        ;

        --paper-dropdown-menu-icon: {
          color: var(--paper-datatable-navigation-bar-text-color, rgba(0, 0, 0, .54));
        }

        ;
      }`;
    return [mainStyle, ironFlexLayoutAlignTheme, ironFlexLayoutTheme];
  }

  static get is() {
    return 'datatable-footer';
  }

  render() {
    return html`
      <div class="layout horizontal center foot ${this._computePosition(this.footerPosition)}">
        <div class="${this.footerPosition}">
          <div class="layout horizontal end-justified center">
            <div class="layout horizontal center">
              <div>
                Lignes par page
              </div>
              <div class="size">
                <paper-dropdown-menu no-label-float vertical-align="bottom">
                  <paper-listbox attr-for-selected="size" @iron-select="${this._newSizeIsSelected}" selected="${this.size}" slot="dropdown-content">
                    ${this.availableSize && this.availableSize.map(size => html`
                      <paper-item size="${size}">${size}</paper-item>
                    `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            </div>
            <div class="status">
              ${this._computeCurrentSize(this.page, this.size)}-${this._computeCurrentMaxSize(this.page, this.size, this.totalElements)}
              sur
              ${this.totalElements}
            </div>
            <paper-icon-button id="previousPageBtn" icon="chevron-left" ?disabled="${this._prevButtonDisabled(this.page)}" @tap="${this._prevPage}"></paper-icon-button>
            <paper-tooltip for="previousPageBtn" position="top">Page précédente</paper-tooltip>
            <paper-icon-button id="nextPageBtn" icon="chevron-right" ?disabled="${this._nextButtonDisabled(this.page, this.totalPages)}" @tap="${this._nextPage}"></paper-icon-button>
            <paper-tooltip for="nextPageBtn" position="top">Page suivante</paper-tooltip>
          </div>
        </div>
      </div>
      `;
  }

  updated(properties) {
    console.log(properties);
  }

  constructor() {
    super();
    this.footerPosition = 'left';
    this.language = 'fr';
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
      oldPage: { type: Number },
      totalElements: { type: Number },
      totalPages: { type: Number },
      availableSize: { type: Array },
      language: { type: String },
      resources: { type: Object },
    };
  }

  _computeCurrentSize(page, size) {
    return (page * size) + 1;
  }

  _computeCurrentMaxSize(page, size, totalElements) {
    const maxSize = size * (page + 1);
    return maxSize > totalElements ? totalElements : maxSize;
  }

  _nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page = this.page + 1;
      this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
    }
  }

  _prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
    }
  }

  _nextButtonDisabled(page, totalPages) {
    return page + 1 === totalPages;
  }

  _prevButtonDisabled(page) {
    return page === 0;
  }

  _newSizeIsSelected({ currentTarget }) {
    const newSize = currentTarget.selected;
    if (newSize) {
      if (this.oldPage !== null && this.oldPage !== undefined) {
        this.page = 0;
        this.dispatchEvent(new CustomEvent('page-changed', { detail: this.page }));
      }
      this.size = newSize;
      this.dispatchEvent(new CustomEvent('size-changed', { detail: this.size }));
    }
  }

  _computePosition(position) {
    if (position === 'right') {
      return 'end-justified';
    }
    return '';
  }
}

customElements.define(DatatableFooter.is, DatatableFooter);
