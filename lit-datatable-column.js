import { LitElement, html, css } from 'lit-element';
import './helpers/ld-header-with-sort';
import './helpers/ld-header-with-filter';
import './helpers/ld-header-with-date-and-sort';
import './helpers/ld-header-with-choices';

class LitDatatableColumn extends LitElement {
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

  static get is() { return 'lit-datatable-column'; }

  static get properties() {
    return {
      column: { type: Boolean },
      header: { type: Boolean },
      property: { type: String },
      otherProperties: { type: Array },
      columnStyle: { type: String },
      html: { type: Function },
      eventsForDom: { type: Array },
      sort: { type: String },
      type: { type: String },
      language: { type: String },
      sortEvent: { type: Function },
      choicesEvent: { type: Function },
      dateSortEvent: { type: Function },
      filterEvent: { type: Function },
      filterValue: { type: String },
      choices: { type: Array },
      selectedChoices: { type: Array },
      start: { type: String },
      end: { type: String },
    };
  }

  constructor() {
    super();
    this.eventsForDom = [];
    this.sort = '';
  }

  updated(properties) {
    if (properties.has('html')) {
      this.dispatchEvent(new CustomEvent('html-changed'));
    }

    if (properties.has('type') || properties.has('sort')) {
      if (this.type === 'sort') {
        this.html = (value, property) => html`
          <ld-header-with-sort
            .language="${this.language}"
            data-property="${property}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this)}"
            .direction="${this.getSortDirection(this.sort, property)}">
            ${value}
          </ld-header-with-sort>`;
      }
    }

    if (properties.has('type') || properties.has('filterValue')) {
      if (this.type === 'filter') {
        this.html = (value, property) => html`
          <ld-header-with-filter
            .active="${!!this.filterValue}"
            .filterValue="${this.filterValue}"
            .language="${this.language}"
            .header="${value}"
            .property="${property}"
            @filter-value-changed="${this.handleFilterTextChanged.bind(this)}">
            ${value}
          </ld-header-with-filter>`;
      }
    }

    if (properties.has('type') || properties.has('choices') || properties.has('selectedChoices')) {
      if (this.type === 'choices') {
        this.html = (value, property) => html`
          <ld-header-with-choices
            .choices="${this.choices}"
            .selectedChoices="${this.selectedChoices}"
            .property="${property}"
            @selected-choices-changed="${this.handleFilterChoiceChanged.bind(this)}">
            ${value}
          </ld-header-with-choices>`;
      }
    }

    if (properties.has('type') || properties.has('choices') || properties.has('selectedChoices') || properties.has('sort')) {
      if (this.type === 'dateSort') {
        this.html = (value, property) => html`
          <ld-header-with-date-and-sort
            horizontal-align="left"
            dateFormat="dd/MM/yyyy"
            data-property="${property}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this)}"
            .direction="${this.getSortDirection(this.sort, property)}"
            .locale="${this.language}"
            .language="${this.language}"
            .active="${this.start}"
            .dateFrom="${this.start}"
            .dateTo="${this.end}"
            .header="${value}"
            @filter="${this.dateChanged.bind(this)}">
          </ld-header-with-date-and-sort>`;
      }
    }
    if (properties.has('type') || properties.has('sort') || properties.has('filterValue')) {
      if (this.type === 'filterSort') {
        this.html = (value, property) => html`
          <ld-header-with-filter-and-sort
            .active="${!!this.filterValue}"
            .filterValue="${this.filterValue}"
            .language="${this.language}"
            data-property="${property}"
            .property="${property}"
            @direction-changed="${this.handleSortDirectionChanged.bind(this)}"
            .direction="${this.getSortDirection(this.sort, property)}"
            .header="${value}"
            @filter-value-changed="${this.handleFilterTextChanged.bind(this)}">
          </ld-header-with-filter-and-sort>`;
      }
    }
  }

  getSortDirection(sort, property) {
    if (sort) {
      const splittedSort = this.sort.split(',');
      if (splittedSort) {
        if (splittedSort[0] === property) {
          return splittedSort[1];
        }
      }
    }
    return '';
  }

  handleSortDirectionChanged({ currentTarget, detail }) {
    const splittedSort = this.sort.split(',');
    if (detail.value) {
      this.sort = `${currentTarget.dataset.property},${detail.value}`;
      this.dispatchEvent(new CustomEvent('sort', { detail: { value: this.sort } }));
    } else if (splittedSort && splittedSort[0] === currentTarget.dataset.property) {
      this.sort = '';
      this.dispatchEvent(new CustomEvent('sort', { detail: { value: this.sort } }));
    }
  }

  handleFilterTextChanged({ detail }) {
    if (this.timeoutFilterText) {
      clearTimeout(this.timeoutFilterText);
    }

    this.timeoutFilterText = setTimeout(
      () => this.dispatchEvent(new CustomEvent('filter', { detail })),
      1000,
    );
  }

  handleFilterChoiceChanged({ detail }) {
    this.dispatchEvent(new CustomEvent('choices', { detail }));
  }

  dateChanged({ detail }) {
    this.dispatchEvent(new CustomEvent('dates', { detail }));
  }
}

window.customElements.define(LitDatatableColumn.is, LitDatatableColumn);
