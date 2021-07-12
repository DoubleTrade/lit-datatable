import {
  LitElement, css, html, PropertyValues, render
} from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { deepEqual } from 'fast-equals';

import type { LitDatatableColumn } from './lit-datatable-column';

export interface Conf {
  header: string;
  property: string;
  hidden?: boolean;
}

interface EventOfTr {
  type: string;
  event: (item: any) => void;
}

interface TableElement {
  element: HTMLTableRowElement;
  columns: Array<HTMLTableCellElement>;
  events: Array<EventOfTr>;
}

@customElement('lit-datatable')
export class LitDatatable extends LitElement {
  @property({ type: Array }) data: Array<unknown> = [];

  @property({ type: Array }) conf: Array<Conf> = [];

  @property({ type: Array }) table: Array<TableElement> = [];

  @property({ type: String }) sort = '';

  @property({ type: Array }) headers: Array<HTMLTableHeaderCellElement> = [];

  @property({ type: Boolean, attribute: 'sticky-header' }) stickyHeader = false;

  @property({ type: Object }) datatableColumns: Map<string, LitDatatableColumn> = new Map();

  @property({ type: Object }) datatableHeaders: Map<string, LitDatatableColumn> = new Map();

  @property({ type: Number }) lastConfSize = 0;

  @property({ type: Number }) lastDataSize = 0;

  /**
    * The property's name that is a unique key for each element in "data"
    * (e.g. "productId" or "id")
    *
   */
  @property({ type: String }) key?:string;

  debounceGenerate = 0;

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
        background: var(--lit-datatable-th-background, white);
        color: var(--lit-datatable-th-color, rgba(0, 0, 0, var(--dark-secondary-opacity)));
        text-align: left;
        white-space: nowrap;

        font-weight: var(--lit-datatable-api-header-weight, 500);
        font-size: var(--lit-datatable-api-header-font-size, 12px);
        padding: var(--lit-datatable-api-header-padding, 6px 26px);

        border-bottom: 1px solid;
        border-color: var(--lit-datatable-divider-color, rgba(0, 0, 0, var(--dark-divider-opacity)))
      }

      th.sticky {
        position: sticky;
        background: var(--lit-datatable-th-background, white);
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

      tbody tr.is-currently-highlight {
        background: var(--lit-datatable-api-tr-highlight-background-color, none);
      }

      tbody tr.selected {
        background-color: var(--lit-datatable-api-tr-selected-background, var(--paper-grey-100));
      }

      td {
        font-size: var(--lit-datatable-td-font-size, 13px);
        font-weight: normal;
        color: var(--lit-datatable-td-color, rgba(0, 0, 0, var(--dark-primary-opacity)));
        padding: var(--lit-datatable-api-td-padding, 6px var(--lit-datatable-api-horizontal-padding, 26px));
        cursor: var(--lit-datatable-api-td-cursor, inherit);
        height: 36px;
      }

      tbody tr:not(:first-child) td {
        border-top: var(--lit-datatable-api-td-border-top, 1px solid);
        border-color: var(--lit-datatable-divider-color, rgba(0, 0, 0, var(--dark-divider-opacity)))
      }
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

  updated(properties: PropertyValues<{ data: Array<unknown>; conf: Array<Conf>; sort: string, stickyHeader: boolean }>) {
    // Data or conf change we have to generate the table
    if ((properties.has('data') && !deepEqual(properties.get('data'), this.data))
      || (properties.has('conf') && !deepEqual(properties.get('conf'), this.conf))) {
      this.deleteAllEvents();
      this.generateData();
    }

    if (properties.has('conf') || properties.has('stickyHeader')) {
      const confs = [...this.conf].filter((c) => !c.hidden);
      this.updateHeaders(confs);
    }

    if (properties.has('sort')) {
      this.updateSortHeaders();
    }
  }

  updateSortHeaders() {
    if (this.sort !== undefined && this.sort !== null) {
      this.datatableHeaders.forEach((d) => { d.sort = this.sort; });
    }
  }

  firstUpdated() {
    if (this.shadowRoot) {
      const slot = this.shadowRoot.querySelector('slot');
      if (slot) {
        const assignedNodes = slot.assignedNodes() as Array<LitDatatableColumn>;
        this.datatableColumns = new Map(assignedNodes
          .filter((a) => a.tagName === 'LIT-DATATABLE-COLUMN' && a.column)
          .map((a) => [a.property, a]));
        this.datatableHeaders = new Map(assignedNodes
          .filter((a) => a.tagName === 'LIT-DATATABLE-COLUMN' && a.header)
          .map((a) => [a.property, a]));
      }
    }
  }

  deleteAllEvents() {
    this.datatableColumns.forEach((datatableColumn) => {
      datatableColumn.eventsForDom.forEach((renderer) => {
        datatableColumn.removeEventListener('html-changed', renderer);
      });
    });
  }

  renderCell(item: any, td: HTMLTableCellElement, confProperty: string, event?: Event, litDatatableColumn?: LitDatatableColumn) {
    if (event) {
      litDatatableColumn = event.currentTarget as LitDatatableColumn;
    }
    if (litDatatableColumn) {
      const otherProperties = this.getOtherValues(litDatatableColumn, item);
      if (litDatatableColumn?.html) {
        render(litDatatableColumn.html(
          this.extractData(item, litDatatableColumn.property), otherProperties
        ), td);
      } else if (litDatatableColumn) {
        render(this.extractData(item, litDatatableColumn.property), td);
      }
    } else if (confProperty) {
      render(this.extractData(item, confProperty), td);
    }
  }

  setEventListener(datatableColumn: LitDatatableColumn, lineIndex: number, renderer: EventListener) {
    if (datatableColumn) {
      if (datatableColumn.eventsForDom[lineIndex]) {
        datatableColumn.removeEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
      }
      datatableColumn.eventsForDom[lineIndex] = renderer;
      datatableColumn.addEventListener('html-changed', datatableColumn.eventsForDom[lineIndex]);
    }
  }

  getOtherValues(datatableColumn: LitDatatableColumn, item: any) {
    let otherProperties = {};
    if (datatableColumn && datatableColumn.otherProperties) {
      otherProperties = datatableColumn.otherProperties.reduce((obj: any, key: string) => {
        obj[key] = item[key];
        return obj;
      }, {});
    }
    return otherProperties;
  }

  renderHtml(conf: Conf, lineIndex: number, item: any, td: HTMLTableCellElement, tr: HTMLTableRowElement) {
    const p = conf.property;
    const datatableColumn = this.datatableColumns.get(p);
    if (datatableColumn) {
      this.setEventListener(datatableColumn, lineIndex, this.renderCell.bind(this, item, td, p));
    }
    this.renderCell(item, td, p, undefined, datatableColumn);
    tr.appendChild(td);
  }

  cleanEventsOfTr(item: any) {
    item.events.forEach((event: EventOfTr) => item.element.removeEventListener(event.type, event.event));
  }

  createEventsOfTr(tr: HTMLTableRowElement, item: any): Array<EventOfTr> {
    const trTapEvent = this.trTap.bind(this, item);
    const trOverEvent = this.trHover.bind(this, item);
    const trOutEvent = this.trOut.bind(this, item);
    tr.addEventListener('tap', trTapEvent);
    tr.addEventListener('mouseover', trOverEvent);
    tr.addEventListener('mouseout', trOutEvent);
    return [{ type: 'mouseover', event: trOverEvent }, { type: 'mouseout', event: trOutEvent }, { type: 'tap', event: trTapEvent }];
  }

  cleanTrElements() {
    const splices = this.table.splice(this.data.length);

    splices.forEach((line: TableElement) => {
      this.cleanEventsOfTr(line);
      if (line?.element?.parentNode) {
        line.element.parentNode.removeChild(line.element);
      }
    });
  }

  cleanTdElements(confs: Array<Conf>) {
    [...this.table].forEach((line) => {
      const splicedColumns = line.columns.splice(confs.length);

      splicedColumns.forEach((column) => {
        line.element.removeChild(column);
      });
    });
  }

  updateHeaders(confs: Array<Conf>) {
    if (this.shadowRoot) {
      let tr = this.shadowRoot.querySelector<HTMLTableRowElement>('table thead tr');
      if (!tr) {
        tr = document.createElement('tr');
      }
      if (this.lastConfSize > confs.length) {
        [...this.headers].forEach((header, i) => {
          if (i <= (this.lastConfSize - 1)) {
            if (tr) {
              tr.removeChild(header);
            }
            this.headers.splice(i, 1);
          }
        });
      }
      confs.forEach((conf: Conf, i: number) => {
        const p = conf.property;
        const datatableHeader = this.datatableHeaders.get(p);
        let th: HTMLTableHeaderCellElement;
        if (this.headers[i]) {
          th = this.headers[i];
        } else {
          th = document.createElement('th');
          this.headers.push(th);
        }
        th.classList.toggle('sticky', this.stickyHeader);
        if (datatableHeader && datatableHeader.columnStyle) {
          th.setAttribute('style', datatableHeader.columnStyle);
        } else {
          th.setAttribute('style', '');
        }
        if (this.stickyHeader) {
          th.style.zIndex = `${confs.length - i}`;
        }
        if (datatableHeader) {
          th.dataset.property = p;
          this.setEventListener(datatableHeader, 0,
            () => {
              if (th.dataset.property === datatableHeader.property) {
                render(datatableHeader.html ? datatableHeader.html(conf.header, datatableHeader.property) : null, th);
              }
            });
          if (datatableHeader.type === 'sort' || datatableHeader.type === 'filterSort') {
            if (datatableHeader.sortEvent) {
              datatableHeader.removeEventListener('sort', datatableHeader.sortEvent as EventListener);
            }
            datatableHeader.sortEvent = this.dispatchCustomEvent.bind(this, 'sort') as EventListener;
            datatableHeader.addEventListener('sort', datatableHeader.sortEvent as EventListener);
          }
          if (datatableHeader.type === 'filter' || datatableHeader.type === 'filterSort') {
            if (datatableHeader.filterEvent) {
              datatableHeader.removeEventListener('filter', datatableHeader.filterEvent as EventListener);
            }
            datatableHeader.filterEvent = this.dispatchCustomEvent.bind(this, 'filter') as EventListener;
            datatableHeader.addEventListener('filter', datatableHeader.filterEvent as EventListener);
          }
          if (datatableHeader.type === 'choices') {
            if (datatableHeader.choicesEvent) {
              datatableHeader.removeEventListener('choices', datatableHeader.choicesEvent as EventListener);
            }
            datatableHeader.choicesEvent = this.dispatchCustomEvent.bind(this, 'choices') as EventListener;
            datatableHeader.addEventListener('choices', datatableHeader.choicesEvent as EventListener);
          }
          if (datatableHeader.type === 'dateSort' || datatableHeader.type === 'dateSortNoRange') {
            if (datatableHeader.dateSortEvent) {
              datatableHeader.removeEventListener('dates', datatableHeader.dateSortEvent as EventListener);
            }
            datatableHeader.dateSortEvent = this.dispatchCustomEvent.bind(this, 'dates') as EventListener;
            datatableHeader.addEventListener('dates', datatableHeader.dateSortEvent as EventListener);
            if (datatableHeader.sortEvent) {
              datatableHeader.removeEventListener('sort', datatableHeader.sortEvent as EventListener);
            }
            datatableHeader.sortEvent = this.dispatchCustomEvent.bind(this, 'sort') as EventListener;
            datatableHeader.addEventListener('sort', datatableHeader.sortEvent as EventListener);
          }
        }
        if (datatableHeader && datatableHeader.html) {
          render(datatableHeader.html(conf.header, datatableHeader.property), th);
        } else {
          render(conf.header, th);
        }
        if (tr) {
          tr.appendChild(th);
        }
      });
      if (this.shadowRoot) {
        const thead = this.shadowRoot.querySelector('thead');
        if (thead) {
          thead.appendChild(tr);
        }
      }
    }
  }

  dispatchCustomEvent(key: string, { detail }: CustomEvent): any {
    this.dispatchEvent(new CustomEvent(key, { detail }));
  }

  trCreated(tr: HTMLTableRowElement, lineIndex: number, item: any) {
    this.dispatchEvent(new CustomEvent('tr-create', { detail: { tr, lineIndex, item } }));
  }

  trTap(item: any) {
    this.dispatchEvent(new CustomEvent('tap-tr', { detail: item }));
  }

  trHover(item: any) {
    this.dispatchEvent(new CustomEvent('tr-mouseover', { detail: item }));
  }

  trOut(item: any) {
    this.dispatchEvent(new CustomEvent('tr-mouseout', { detail: item }));
  }

  createTr(lineIndex: number, item: any) {
    const tr = this.setKeyToTr(document.createElement('tr'), item);
    if (!this.table[lineIndex]) {
      this.table[lineIndex] = { element: tr, columns: [], events: this.createEventsOfTr(tr, item) };
    }
    return tr;
  }

  createTd(lineIndex: number) {
    const td = document.createElement('td') as HTMLTableCellElement;
    this.table[lineIndex].columns.push(td);
    return td;
  }

  setKeyToTr(tr: HTMLTableRowElement, item: any) {
    if (this.key && Object.prototype.hasOwnProperty.call(item, this.key)) {
      const data = this.extractData(item, this.key);
      tr.classList.add(`key-${data}`);
    }
    return tr;
  }

  updateBody(confs: Array<Conf>) {
    if (this.data !== undefined) {
      if (this.lastConfSize > confs.length) {
        this.cleanTdElements(confs);
      }
      if (this.lastDataSize > this.data.length) {
        this.cleanTrElements();
      }
      this.data.forEach((item, lineIndex: number) => {
        let tr: HTMLTableRowElement;
        if (this.table[lineIndex]) {
          this.cleanEventsOfTr(this.table[lineIndex]);
          tr = this.table[lineIndex].element;
          tr.className = '';
          tr = this.setKeyToTr(tr, item);
          this.table[lineIndex].events = this.createEventsOfTr(tr, item);
        } else {
          tr = this.createTr(lineIndex, item);
        }

        this.trCreated(tr, lineIndex, item);

        confs.forEach((conf, columnIndex) => {
          let td;
          if (this.table[lineIndex].columns[columnIndex]) {
            td = this.table[lineIndex].columns[columnIndex];
          } else {
            td = this.createTd(lineIndex);
          }

          const datatableColumn = this.datatableColumns.get(conf.property);
          if (datatableColumn && datatableColumn.columnStyle) {
            td.setAttribute('style', datatableColumn.columnStyle);
          } else {
            td.setAttribute('style', '');
          }

          this.renderHtml(conf, lineIndex, item, td, tr);
        });
        if (this.shadowRoot) {
          const tbody = this.shadowRoot.querySelector('tbody');
          if (tbody) {
            tbody.appendChild(tr);
          }
        }
      });
    }
  }

  setLoading(loading: boolean) {
    this.dispatchEvent(new CustomEvent('loading', { detail: { value: loading } }));
  }

  async generateData() {
    this.setLoading(true);
    await this.updateComplete;
    const confs = [...this.conf].filter((c) => !c.hidden);
    this.updateBody(confs);
    if (this.data !== undefined) {
      this.lastDataSize = this.data.length;
      this.lastConfSize = confs.length;
    }
    this.setLoading(false);
  }

  extractData(item: any, columnProperty: string) {
    if (columnProperty) {
      const splittedProperties = columnProperty.split('.');
      if (splittedProperties.length > 1) {
        return splittedProperties.reduce((prevRow: any, p: string) => {
          if (typeof prevRow === 'string' && item[prevRow] !== undefined && item[prevRow][p] !== undefined) {
            return item[prevRow][p];
          }

          return prevRow[p] || '';
        });
      }
      return item[columnProperty];
    }
    return null;
  }

  /**
    * Scroll to a tr with the key
    * The key property have to be set
    *
   */
  async scrollOnTr(key: string) {
    if (this.shadowRoot && key) {
      await this.updateComplete;
      const classPrimaryDisplayed = 'is-currently-highlight';
      this.shadowRoot.querySelectorAll(`.${classPrimaryDisplayed}`).forEach((tr) => {
        tr.classList.remove(classPrimaryDisplayed);
      });
      const trToScroll = this.shadowRoot.querySelector(`tr.key-${key}`);
      if (trToScroll) {
        trToScroll.scrollIntoView({ block: 'center', inline: 'nearest' });
        trToScroll.classList.add(classPrimaryDisplayed);
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-datatable': LitDatatable;
  }
}
