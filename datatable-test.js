import { LitElement, html, css } from 'lit-element';

import { render } from 'lit-html';

class DatatableTest extends LitElement {
  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }

      slot {
        display: none;
      }

      table {
        width: 100%;
        border-spacing: 0px;
        border-collapse: seperate;
      }

      th {
        color: rgba(0, 0, 0, var(--dark-secondary-opacity));
        text-align: left;
        white-space: nowrap;

        font-weight: var(--paper-datatable-api-header-weight, 500);
        font-size: var(--paper-datatable-api-header-font-size, 12px);
        padding: var(--paper-datatable-api-header-padding, 6px 26px);

        border-bottom: 1px solid;
        border-color: rgba(0, 0, 0, var(--dark-divider-opacity));
      }

      tbody td {
        height: var(--paper-datatable-api-body-td-height, 43px);
      }

      tbody tr {
        height: var(--paper-datatable-api-body-tr-height, 43px);
      }

      thead tr {
        height: var(--paper-datatable-api-header-tr-height, 43px);
      }

      thead th {
        height: var(--paper-datatable-api-header-th-height, 43px);
      }

      tbody tr:nth-child(even) {
        background-color: var(--paper-datatable-api-tr-even-background-color, none);
      }

      tbody tr:nth-child(odd) {
        background-color: var(--paper-datatable-api-tr-odd-background-color, none);
      }

      tbody tr:hover {
        background: var(--paper-datatable-api-tr-hover-background-color, none);
      }

      tbody tr.selected {
        background-color: var(--paper-datatable-api-tr-selected-background, var(--paper-grey-100));
      }

      td {
        font-size: 13px;
        font-weight: normal;
        color: rgba(0, 0, 0, var(--dark-primary-opacity));
        padding: 6px var(--paper-datatable-api-horizontal-padding, 26px);
        cursor: var(--paper-datatable-api-td-cursor, inherit);
        height: 36px;
      }

      tbody tr:not(:first-child) td {
        border-top: 1px solid;
        border-color: rgba(0, 0, 0, var(--dark-divider-opacity));
      }

      thead th.customTd,
      tbody td.customTd {}
      `;

    return [mainStyle];
  }

  render() {
    return html`
      <slot></slot>
      <table id="table">
        <thead></thead>
        <tbody></tbody>
      </table>
    `;
  }

  static get is() { return 'datatable-test'; }

  static get properties() {
    return {
      data: { type: Array },
      conf: { type: Array },
      table: { type: Array },
      headers: { type: Array },
    };
  }

  constructor() {
    super();
    this.table = [];
    this.headers = [];
  }

  updated(properties) {
    // Data or conf change we have to generate the table
    if (properties.has('data') || properties.has('conf')) {
      this._generateData();
    }
  }

  firstUpdated() {
    const assignedNodes = this.shadowRoot.querySelector('slot').assignedNodes();
    this.datatableColumns = new Map(assignedNodes
      .filter(a => a.tagName === 'DATATABLE-COLUMN' && a.column)
      .map(a => [a.property, a]));
    this.datatableHeaders = new Map(assignedNodes
      .filter(a => a.tagName === 'DATATABLE-COLUMN' && a.header)
      .map(a => [a.property, a]));
  }

  _remove(type) {
    const pgTrs = this.shadowRoot.querySelectorAll(`${type} tr`);
    pgTrs.forEach(pgTr => this.shadowRoot.querySelector(type).removeChild(pgTr));
  }

  renderCell(item, td, { currentTarget }) {
    const otherProperties = this._getOtherValues(currentTarget, item);
    if (currentTarget.html) {
      render(currentTarget.html(this._extractData(item, currentTarget.property), otherProperties), td);
    } else {
      render(this._extractData(item, currentTarget.property), td);
    }
  }

  setEventListener(datatableColumn, lineIndex, item, td) {
    if (datatableColumn.eventsForDom[lineIndex]) {
      datatableColumn.removeEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
    }
    datatableColumn.eventsForDom[lineIndex] = this.renderCell.bind(this, item, td);
    datatableColumn.addEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
  }

  _getOtherValues(datatableColumn, item) {
    let otherProperties = {};
    if (datatableColumn.otherProperties) {
      otherProperties = datatableColumn.otherProperties.reduce((obj, key) => {
        obj[key] = item[key];
        return obj;
      }, {});
    }
    return otherProperties;
  }

  renderHtml(conf, lineIndex, item, td, tr) {
    const { property } = conf;
    const datatableColumn = this.datatableColumns.get(property);
    this.setEventListener(datatableColumn, lineIndex, item, td);
    this.renderCell(item, td, { currentTarget: datatableColumn });
    tr.appendChild(td);
  }

  cleanTrElements() {
    this.table.forEach((line, i) => {
      if (i >= (this.lastDataSize - 1)) {
        this.shadowRoot.querySelector('tbody').removeChild(line.element);
      }
    });
  }

  cleanTdElements() {
    this.table.forEach((line, lineNumber) => {
      line.columns.forEach((column, i) => {
        if (i >= (this.lastConfSize - 1)) {
          line.element.removeChild(column);
          this.table[lineNumber].columns.splice(i, 1);
        }
      });
    });
  }

  _updateHeaders(confs) {
    let tr = this.shadowRoot.querySelector('table thead tr');
    if (!tr) {
      tr = document.createElement('tr');
    }
    if (this.lastConfSize > confs.length) {
      this.headers.forEach((header, i) => {
        if (i >= (this.lastConfSize - 1)) {
          tr.removeChild(header);
          this.headers.splice(i, 1);
        }
      });
    }
    confs.forEach((conf, i) => {
      const { property } = conf;
      const datatableHeader = this.datatableHeaders.get(property);
      let th;
      if (this.headers[i]) {
        th = this.headers[i];
      } else {
        th = document.createElement('th');
        if (datatableHeader && datatableHeader.columnStyle) {
          th.setAttribute('style', datatableHeader.columnStyle);
        }
        this.headers.push(th);
      }
      if (datatableHeader && datatableHeader.html) {
        render(datatableHeader.html(conf.header, datatableHeader.property), th);
      } else {
        render(conf.header, th);
      }
      tr.appendChild(th);
    });
    this.shadowRoot.querySelector('thead').appendChild(tr);
  }

  _createTr(lineIndex) {
    const tr = document.createElement('tr');
    if (!this.table[lineIndex]) {
      this.table[lineIndex] = { element: tr, columns: [] };
    }
    return tr;
  }

  _createTd(lineIndex, property) {
    const datatableColumn = this.datatableColumns.get(property);
    const td = document.createElement('td');
    if (datatableColumn && datatableColumn.columnStyle) {
      td.setAttribute('style', datatableColumn.columnStyle);
    }
    this.table[lineIndex].columns.push(td);
    return td;
  }

  _updateBody(confs) {
    if (this.lastDataSize > this.data.length) {
      this.cleanTrElements();
    }
    if (this.lastConfSize > confs.length) {
      this.cleanTdElements();
    }
    this.data.forEach((item, lineIndex) => {
      let tr;
      if (this.table[lineIndex]) {
        tr = this.table[lineIndex].element;
      } else {
        tr = this._createTr(lineIndex);
      }
      confs.forEach((conf, columnIndex) => {
        let td;
        if (this.table[lineIndex].columns[columnIndex]) {
          td = this.table[lineIndex].columns[columnIndex];
        } else {
          td = this._createTd(lineIndex, conf.property);
        }
        this.renderHtml(conf, lineIndex, item, td, tr);
      });
      this.shadowRoot.querySelector('tbody').appendChild(tr);
    });
  }

  async _generateData() {
    await this.updateComplete;
    if (this.debounceGenerate) {
      clearTimeout(this.debounceGenerate);
    }
    this.debounceGenerate = setTimeout(() => {
      const confs = [...this.conf].filter(c => !c.hidden);
      this._updateHeaders(confs);
      this._updateBody(confs);
      this.lastDataSize = this.data.length;
      this.lastConfSize = confs.length;
    });
  }

  _extractData(item, columnProperty) {
    if (columnProperty) {
      const splittedProperties = columnProperty.split('.');
      if (splittedProperties.length > 1) {
        return splittedProperties.reduce((prevRow, property) => {
          if (typeof prevRow === 'string' && item[prevRow] !== undefined && item[prevRow][property] !== undefined) {
            return item[prevRow][property];
          }

          return prevRow[property] || '';
        });
      }
      return item[columnProperty];
    }
    return null;
  }
}

window.customElements.define(DatatableTest.is, DatatableTest);
