import { LitElement, html, css } from 'lit-element';

import { render } from 'lit-html';

class LitDatatable extends LitElement {
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

        font-weight: var(--lit-datatable-api-header-weight, 500);
        font-size: var(--lit-datatable-api-header-font-size, 12px);
        padding: var(--lit-datatable-api-header-padding, 6px 26px);

        border-bottom: 1px solid;
        border-color: rgba(0, 0, 0, var(--dark-divider-opacity));
      }

      th.sticky {
        position: sticky;
        background: white;
        top: 0;
        z-index: 1;
      }

      tbody td {
        height: var(--lit-datatable-api-body-td-height, 43px);
      }

      tbody tr {
        height: var(--lit-datatable-api-body-tr-height, 43px);
      }

      thead tr {
        height: var(--lit-datatable-api-header-tr-height, 43px);
      }

      thead th {
        height: var(--lit-datatable-api-header-th-height, 43px);
      }

      tbody tr:nth-child(even) {
        background-color: var(--lit-datatable-api-tr-even-background-color, none);
      }

      tbody tr:nth-child(odd) {
        background-color: var(--lit-datatable-api-tr-odd-background-color, none);
      }

      tbody tr:hover {
        background: var(--lit-datatable-api-tr-hover-background-color, none);
      }

      tbody tr.selected {
        background-color: var(--lit-datatable-api-tr-selected-background, var(--paper-grey-100));
      }

      td {
        font-size: 13px;
        font-weight: normal;
        color: rgba(0, 0, 0, var(--dark-primary-opacity));
        padding: 6px var(--lit-datatable-api-horizontal-padding, 26px);
        cursor: var(--lit-datatable-api-td-cursor, inherit);
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

  static get is() { return 'lit-datatable'; }

  static get properties() {
    return {
      data: { type: Array },
      conf: { type: Array },
      table: { type: Array },
      headers: { type: Array },
      stickyHeader: { type: Boolean },
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
      this.generateData();
    }
  }

  firstUpdated() {
    const assignedNodes = this.shadowRoot.querySelector('slot').assignedNodes();
    this.datatableColumns = new Map(assignedNodes
      .filter(a => a.tagName === 'LIT-DATATABLE-COLUMN' && a.column)
      .map(a => [a.property, a]));
    this.datatableHeaders = new Map(assignedNodes
      .filter(a => a.tagName === 'LIT-DATATABLE-COLUMN' && a.header)
      .map(a => [a.property, a]));
  }

  renderCell(item, td, confProperty, { currentTarget }) {
    const otherProperties = this.getOtherValues(currentTarget, item);
    if (currentTarget && currentTarget.html) {
      render(currentTarget.html(
        this.extractData(item, currentTarget.property), otherProperties,
      ), td);
    } else if (currentTarget) {
      render(this.extractData(item, currentTarget.property), td);
    } else if (confProperty) {
      render(this.extractData(item, confProperty), td);
    }
  }

  setEventListener(datatableColumn, lineIndex, item, td, property) {
    if (datatableColumn) {
      if (datatableColumn.eventsForDom[lineIndex]) {
        datatableColumn.removeEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
      }
      datatableColumn.eventsForDom[lineIndex] = this.renderCell.bind(this, item, td, property);
      datatableColumn.addEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
    }
  }

  getOtherValues(datatableColumn, item) {
    let otherProperties = {};
    if (datatableColumn && datatableColumn.otherProperties) {
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
    this.setEventListener(datatableColumn, lineIndex, item, td, property);
    this.renderCell(item, td, property, { currentTarget: datatableColumn });
    tr.appendChild(td);
  }

  cleanEventsOfTr(item) {
    item.events.forEach(event => item.element.removeEventListener(event.type, event.event));
  }

  createEventsOfTr(tr, item) {
    const trOverEvent = this.trHover.bind(this, item);
    const trOutEvent = this.trOut.bind(this, item);
    tr.addEventListener('mouseover', trOverEvent);
    tr.addEventListener('mouseout', trOutEvent);
    return [{ type: 'mouseover', event: trOverEvent }, { type: 'mouseout', event: trOutEvent }];
  }

  cleanTrElements() {
    [...this.table].forEach((line, lineNumber) => {
      if (lineNumber >= (this.data.length - 1)) {
        this.cleanEventsOfTr(line);
        this.shadowRoot.querySelector('tbody').removeChild(line.element);
        this.table.splice(lineNumber, 1);
      }
    });
  }

  cleanTdElements() {
    [...this.table].forEach((line, lineNumber) => {
      line.columns.forEach((column, columnNumber) => {
        if (columnNumber >= (this.lastConfSize - 1)) {
          line.element.removeChild(column);
          this.table[lineNumber].columns.splice(columnNumber, 1);
        }
      });
    });
  }

  updateHeaders(confs) {
    let tr = this.shadowRoot.querySelector('table thead tr');
    if (!tr) {
      tr = document.createElement('tr');
    }
    if (this.lastConfSize > confs.length) {
      [...this.headers].forEach((header, i) => {
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
        if (this.stickyHeader) {
          th.classList.add('sticky');
        }
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

  trHover(item) {
    this.dispatchEvent(new CustomEvent('tr-mouseover', { detail: item }));
  }

  trOut(item) {
    this.dispatchEvent(new CustomEvent('tr-mouseout', { detail: item }));
  }

  createTr(lineIndex, item) {
    const tr = document.createElement('tr');
    if (!this.table[lineIndex]) {
      this.table[lineIndex] = { element: tr, columns: [], events: this.createEventsOfTr(tr, item) };
    }
    return tr;
  }

  createTd(lineIndex, property) {
    const datatableColumn = this.datatableColumns.get(property);
    const td = document.createElement('td');
    if (datatableColumn && datatableColumn.columnStyle) {
      td.setAttribute('style', datatableColumn.columnStyle);
    }
    this.table[lineIndex].columns.push(td);
    return td;
  }

  updateBody(confs) {
    if (this.data !== undefined) {
      if (this.lastConfSize > confs.length) {
        this.cleanTdElements();
      }
      if (this.lastDataSize > this.data.length) {
        this.cleanTrElements();
      }
      this.data.forEach((item, lineIndex) => {
        let tr;
        if (this.table[lineIndex]) {
          this.cleanEventsOfTr(this.table[lineIndex]);
          tr = this.table[lineIndex].element;
          this.table[lineIndex].events = this.createEventsOfTr(tr, item);
        } else {
          tr = this.createTr(lineIndex, item);
        }
        confs.forEach((conf, columnIndex) => {
          let td;
          if (this.table[lineIndex].columns[columnIndex]) {
            td = this.table[lineIndex].columns[columnIndex];
          } else {
            td = this.createTd(lineIndex, conf.property);
          }
          this.renderHtml(conf, lineIndex, item, td, tr);
        });
        this.shadowRoot.querySelector('tbody').appendChild(tr);
      });
    }
  }

  async generateData() {
    await this.updateComplete;
    if (this.debounceGenerate) {
      clearTimeout(this.debounceGenerate);
    }
    this.debounceGenerate = setTimeout(() => {
      const confs = [...this.conf].filter(c => !c.hidden);
      this.updateHeaders(confs);
      this.updateBody(confs);
      if (this.data !== undefined) {
        this.lastDataSize = this.data.length;
        this.lastConfSize = confs.length;
      }
    });
  }

  extractData(item, columnProperty) {
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

window.customElements.define(LitDatatable.is, LitDatatable);
