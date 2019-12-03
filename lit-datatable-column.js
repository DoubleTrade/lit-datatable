import { LitElement, html, css } from 'lit-element';
import './helpers/ld-header-with-sort';

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
      sortEvent: { type: Function },
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
          ${console.log(this.sort, property, this._getSortDirection(this.sort, property))}
          <ld-header-with-sort
            .language="${this.language}"
            data-property="${property}"
            @direction-changed="${this._handleSortDirectionChanged.bind(this)}"
            .direction="${this._getSortDirection(this.sort, property)}">
            ${value}
          </ld-header-with-sort>`;
      }
    }
  }

  _getSortDirection(sort, property) {
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

  _handleSortDirectionChanged({ currentTarget, detail }) {
    const splittedSort = this.sort.split(',');
    let sort;
    console.log('sortDirectionChanged')
    if (detail.value) {
      this.sort = `${currentTarget.dataset.property},${detail.value}`;
      this.dispatchEvent(new CustomEvent('sort', {detail: {value: this.sort}}));
    } else if (splittedSort && splittedSort[0] === currentTarget.dataset.property) {
      this.sort = '';
      this.dispatchEvent(new CustomEvent('sort', {detail: {value: this.sort}}));
    }
  }
}

window.customElements.define(LitDatatableColumn.is, LitDatatableColumn);
