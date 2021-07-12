import {
  LitElement, css, html, PropertyValues
} from 'lit';
import { property, customElement } from 'lit/decorators.js';
import './helpers/ld-header-with-sort';
import './helpers/ld-header-with-filter';
import './helpers/ld-header-with-date-and-sort';
import './helpers/ld-header-with-filter-and-sort';
import './helpers/ld-header-with-choices';
import { Language } from './localize';
import type { Choice } from './helpers/ld-header-with-choices';

type TypeOfColumn = 'sort' | 'filter' | 'choices' | 'dateSortNoRange' | 'dateSort' | 'filterSort';

@customElement('lit-datatable-column')
export class LitDatatableColumn extends LitElement {
  @property({ type: String }) property = '';

  @property({ type: Array }) otherProperties: Array<string> = [];

  @property({ attribute: false }) html: ((value: any, otherValues?: any) => any) | null = null;

  @property({ type: Array }) eventsForDom: Array<EventListener> = [];

  @property({ type: String }) sort = '';

  @property({ type: Boolean }) enableFilter = false;

  @property({ type: String }) type?: TypeOfColumn = undefined;

  @property({ type: String }) language: Language = 'en';

  @property({ attribute: false }) sortEvent: EventListener | null = null;

  @property({ attribute: false }) choicesEvent: EventListener | null = null;

  @property({ attribute: false }) dateSortEvent: EventListener | null = null;

  @property({ attribute: false }) filterEvent: EventListener | null = null;

  @property({ type: String }) filterValue = '';

  @property({ type: Array }) choices: Array<Choice> = [];

  @property({ type: Array }) selectedChoices: Array<string> = [];

  @property({ type: String }) start = '';

  @property({ type: String }) end = '';

  @property({ type: String }) horizontalAlign: 'left' | 'right' = 'left';

  @property({ type: Boolean }) column = false;

  @property({ type: Boolean }) header = false;

  @property({ type: String }) columnStyle = '';

  timeoutFilterText = 0;

  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }
    `;

    return [mainStyle];
  }

  render() {
    return null;
  }

  updated(properties: PropertyValues) {
    if (properties.has('html')) {
      this.dispatchEvent(new CustomEvent('html-changed'));
    }

    if (properties.has('type') || properties.has('sort')) {
      if (this.type === 'sort') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-sort
            .language="${this.language}"
            data-property="${p}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this, p)}"
            .direction="${this.getSortDirection(this.sort, p)}">
            ${value}
          </ld-header-with-sort>`;
      }
    }

    if (properties.has('type') || properties.has('filterValue')) {
      if (this.type === 'filter') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-filter
            .active="${!!this.filterValue}"
            .filterValue="${this.filterValue}"
            .language="${this.language}"
            .header="${value}"
            .property="${p}"
            @filter-value-changed="${this.handleFilterTextChanged.bind(this)}">
            ${value}
          </ld-header-with-filter>`;
      }
    }

    if (properties.has('type') || properties.has('choices') || properties.has('selectedChoices')) {
      if (this.type === 'choices') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-choices
            .choices="${this.choices}"
            .enableFilter=${this.enableFilter}
            .selectedChoices="${this.selectedChoices}"
            .property="${p}"
            @selected-choices-changed="${this.handleFilterChoiceChanged.bind(this)}">
            ${value}
          </ld-header-with-choices>`;
      }
    }

    if (properties.has('type') || properties.has('start') || properties.has('stop') || properties.has('sort')) {
      if (this.type === 'dateSort') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-date-and-sort
            .horizontalAlign="${this.horizontalAlign}"
            dateFormat="dd/MM/yyyy"
            data-property="${p}"
            .property="${p}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this, p)}"
            .direction="${this.getSortDirection(this.sort, p)}"
            .locale="${this.language}"
            .language="${this.language}"
            .active="${this.start}"
            .dateFrom="${this.start}"
            .dateTo="${this.end}"
            .header="${value}"
            @filter="${this.dateChanged.bind(this)}">
          </ld-header-with-date-and-sort>`;
      } else if (this.type === 'dateSortNoRange') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-date-and-sort
            .horizontalAlign="${this.horizontalAlign}"
            dateFormat="dd/MM/yyyy"
            data-property="${p}"
            .property="${p}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this, p)}"
            .direction="${this.getSortDirection(this.sort, p)}"
            .language="${this.language}"
            .active="${this.start}"
            .dateFrom="${this.start}"
            .dateTo="${this.end}"
            .header="${value}"
            .noRange="${true}"
            @filter="${this.dateChanged.bind(this)}">
          </ld-header-with-date-and-sort>`;
      }
    }
    if (properties.has('type') || properties.has('sort') || properties.has('filterValue')) {
      if (this.type === 'filterSort') {
        this.html = (value: string, p: string) => html`
          <ld-header-with-filter-and-sort
            .active="${!!this.filterValue}"
            .filterValue="${this.filterValue}"
            .language="${this.language}"
            data-property="${p}"
            .property="${p}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this, p)}"
            .direction="${this.getSortDirection(this.sort, p)}"
            .header="${value}"
            @filter-value-changed="${this.handleFilterTextChanged.bind(this)}">
          </ld-header-with-filter-and-sort>`;
      }
    }
  }

  getSortDirection(sort: string, p: string) {
    if (sort) {
      const splittedSort = this.sort.split(',');
      if (splittedSort) {
        if (splittedSort[0] === p) {
          return splittedSort[1];
        }
      }
    }
    return '';
  }

  handleSortDirectionChanged(p: string, { detail }: CustomEvent<{value: string}>) {
    const splittedSort = this.sort.split(',');
    if (detail.value) {
      this.sort = `${p},${detail.value}`;
      this.dispatchEvent(new CustomEvent('sort', { detail: { value: this.sort } }));
    } else if (splittedSort && splittedSort[0] === p) {
      this.sort = '';
      this.dispatchEvent(new CustomEvent('sort', { detail: { value: this.sort } }));
    }
  }

  handleFilterTextChanged({ detail }: CustomEvent) {
    if (this.timeoutFilterText) {
      clearTimeout(this.timeoutFilterText);
    }

    this.timeoutFilterText = window.setTimeout(
      () => this.dispatchEvent(new CustomEvent('filter', { detail })),
      1000
    );
  }

  handleFilterChoiceChanged({ detail }: CustomEvent) {
    this.dispatchEvent(new CustomEvent('choices', { detail }));
  }

  dateChanged({ detail }: CustomEvent) {
    this.dispatchEvent(new CustomEvent('dates', { detail }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-datatable-column': LitDatatableColumn;
  }
}
