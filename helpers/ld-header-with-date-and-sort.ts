import {
  LitElement, css, html, PropertyValues
} from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@doubletrade/lit-datepicker/lit-datepicker-input';
import { ironFlexLayoutAlignTheme, ironFlexLayoutTheme } from '../iron-flex-import';
import './ld-header-with-sort';
import { Language } from '../localize';

@customElement('ld-header-with-date-and-sort')
export class LdHeaderWithDateAndSort extends LitElement {
  @property({ type: String }) header = '';

  language: Language | null = 'en';

  @property({ type: String }) dateFormat = '';

  @property({ type: String }) property = '';

  @property({ type: String }) direction: '' | 'asc' | 'desc' = '';

  @property({ type: Boolean }) active = false;

  @property({ type: String }) dateFrom: string | null = null;

  @property({ type: String }) dateTo: string | null = null;

  @property({ type: Boolean }) noRange = false;

  @property({ type: String }) horizontalAlign: 'left' | 'right' = 'right';

  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }
      .actions {
        padding-left: 8px;
      }
      paper-icon-button {
        padding: 0;
        min-width: 24px;
        min-height: 24px;
        width: 24px;
        height: 24px;
        --paper-icon-button: {
          color: var(--paper-icon-button-color);
        }

        --paper-icon-button-hover: {
          color: var(--paper-icon-button-color-hover);
        }
      }`;
    return [mainStyle, ironFlexLayoutTheme, ironFlexLayoutAlignTheme];
  }

  render() {
    const input = (dateFrom: string, dateTo: string, noRange: boolean) => html`
      <style>
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
      </style>

      <paper-input
        no-label-float
        placeholder="${this.header}"
        value="${this.computeDate(dateFrom, dateTo, noRange)}"
        readonly>
      </paper-input>`;
    return html`
      ${this.active ? html`
        <ld-header-with-sort @direction-changed="${this.directionChanged.bind(this)}" .direction="${this.direction}" .language="${this.language}">
          <div class="layout horizontal center">
            <lit-datepicker-input
              .html="${input}"
              .noRange="${this.noRange}"
              .horizontalAlign="${this.horizontalAlign}"
              .dateFormat="${this.dateFormat}"
              .locale="${this.language}"
              .dateFrom="${this.dateFrom}"
              .dateTo="${this.dateTo}"
              @date-from-changed="${this.dateFromChanged}"
              @date-to-changed="${this.dateToChanged}"
              forceNarrow>
            </lit-datepicker-input>
            <paper-icon-button icon="clear" @tap="${this.clearDate.bind(this)}"></paper-icon-button>
          </div>
        </ld-header-with-sort>` : html`
        <ld-header-with-sort @direction-changed="${this.directionChanged.bind(this)}" .direction="${this.direction}" .language="${this.language}">
          <div @tap="${this.toggleActive.bind(this)}">
            ${this.header}
          </div>
          <div class="actions" slot="actions">
            <paper-icon-button icon="icons:date-range" @tap="${this.toggleActive.bind(this)}"></paper-icon-button>
          </div>
        </ld-header-with-sort>`}`;
  }

  updated(properties: PropertyValues) {
    if (properties.has('direction')) {
      this.dispatchEvent(new CustomEvent('direction-changed', { detail: { value: this.direction } }));
    }

    if (properties.has('active')) {
      this.dispatchEvent(new CustomEvent('active-changed', { detail: { value: this.active } }));
    }
  }

  dateToChanged({ detail }: CustomEvent<{value: string}>) {
    if (this.dateFrom && detail.value) {
      this.dateTo = detail.value;
      this.dispatchEvent(new CustomEvent('filter', {
        detail: {
          dateFrom: parseInt(this.dateFrom, 10),
          dateTo: parseInt(detail.value, 10),
          property: this.property,
        },
      }));
    }
  }

  dateFromChanged({ detail }: CustomEvent<{value: string}>) {
    if (detail.value) {
      this.dateFrom = detail.value;
      if (this.noRange) {
        this.dispatchEvent(new CustomEvent('filter', {
          detail: {
            dateFrom: parseInt(detail.value, 10),
            property: this.property,
          },
        }));
      }
    }
  }

  async toggleActive() {
    this.active = !this.active;
    if (!this.active) {
      this.dateFrom = null;
      this.dateTo = null;
    }
    await this.updateComplete;
    if (this.shadowRoot) {
      const paperInput = this.shadowRoot.querySelector('paper-input');
      if (paperInput) {
        paperInput.setAttribute('tabindex', '1');
        await this.updateComplete;
        paperInput.focus();
      }
    }
  }

  computeDate(dateFrom: string | null, dateTo: string | null, noRange: boolean) {
    if (dateFrom && dateTo) {
      return `${dateFrom} ${dateTo}`;
    }
    if (noRange && dateFrom) {
      return dateFrom;
    }
    return '';
  }

  clearDate() {
    this.toggleActive();
    this.dispatchEvent(new CustomEvent('filter', {
      detail: {
        dateFrom: null,
        dateTo: null,
        property: this.property,
      },
    }));
  }

  directionChanged({ detail }: CustomEvent<{value: '' | 'asc' | 'desc'}>) {
    this.direction = detail.value;
  }
}
