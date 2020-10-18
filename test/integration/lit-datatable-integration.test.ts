import {
  fixture, html, expect, elementUpdated
} from '@open-wc/testing';
import sinon from 'sinon';
import './component-use-lit-datatable';
import type { ComponentUseLitDatatable } from './component-use-lit-datatable';
import type { LitDatatableColumn } from '../../lit-datatable-column';

class LitDatatableIntegrationTest {
  el!: ComponentUseLitDatatable;

  async init() {
    const litDatatable = html`
      <component-use-lit-datatable></component-use-lit-datatable>
    `;
    this.el = await fixture(litDatatable);
    return this.elementUpdated();
  }

  elementUpdated() {
    return elementUpdated(this.el);
  }

  getDatatableColumn(type: 'header' | 'column') {
    if (this?.el?.shadowRoot) {
      return this.el.shadowRoot.querySelectorAll<LitDatatableColumn>(`lit-datatable-column[${type}]`);
    }
    return null;
  }
}

describe('lit-datatable', () => {
  it('check events on columns', async () => {
    const litDatatableWithColumn = new LitDatatableIntegrationTest();
    await litDatatableWithColumn.init();
    await litDatatableWithColumn.elementUpdated();
    const datatableColumns = litDatatableWithColumn.getDatatableColumn('column');

    expect(datatableColumns).to.be.not.equal(null);
    if (datatableColumns && datatableColumns[0]) {
      expect(datatableColumns.length).to.be.not.equal(0);
      expect(datatableColumns[0]).to.be.not.equal(null);
      const htmlChangedEvent = sinon.spy();
      datatableColumns[0].addEventListener('html-changed', htmlChangedEvent);
      expect(htmlChangedEvent.callCount).to.be.equal(0);
      litDatatableWithColumn.el.testString = 'newTest';
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(1);
      litDatatableWithColumn.el.testString = 'test';
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(2);
    }
  });

  it('check events on columns on change data', async () => {
    const litDatatableWithColumn = new LitDatatableIntegrationTest();
    await litDatatableWithColumn.init();
    await litDatatableWithColumn.elementUpdated();
    const datatableColumns = litDatatableWithColumn.getDatatableColumn('column');

    expect(datatableColumns).to.be.not.equal(null);
    if (datatableColumns && datatableColumns[0]) {
      expect(datatableColumns.length).to.be.not.equal(0);
      expect(datatableColumns[0]).to.be.not.equal(null);
      const htmlChangedEvent = sinon.spy();
      datatableColumns[0].addEventListener('html-changed', htmlChangedEvent);
      expect(htmlChangedEvent.callCount).to.be.equal(0);
      litDatatableWithColumn.el.data = [
        { fruit: 'apple', color: 'green', weight: '100gr' },
        { fruit: 'banana', color: 'yellow', weight: '140gr' },
      ];
      litDatatableWithColumn.el.conf = [
        { property: 'weight', header: 'Weight', hidden: false },
        { property: 'color', header: 'Color', hidden: false },
        { property: 'fruit', header: 'Fruit', hidden: false },
      ];
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(1);
      litDatatableWithColumn.el.testString = 'newtest';
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(2);
    }
  });

  it('check events on columns on change conf', async () => {
    const litDatatableWithColumn = new LitDatatableIntegrationTest();
    await litDatatableWithColumn.init();
    await litDatatableWithColumn.elementUpdated();
    const datatableColumns = litDatatableWithColumn.getDatatableColumn('column');

    expect(datatableColumns).to.be.not.equal(null);
    if (datatableColumns && datatableColumns[0]) {
      expect(datatableColumns.length).to.be.not.equal(0);
      expect(datatableColumns[0]).to.be.not.equal(null);
      const htmlChangedEvent = sinon.spy();
      datatableColumns[0].addEventListener('html-changed', htmlChangedEvent);
      expect(htmlChangedEvent.callCount).to.be.equal(0);
      litDatatableWithColumn.el.conf = [
        { property: 'weight', header: 'Weight', hidden: false },
        { property: 'color', header: 'Color', hidden: false },
        { property: 'fruit', header: 'Fruit', hidden: false },
      ];
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(1);
      litDatatableWithColumn.el.testString = 'newtest';
      await litDatatableWithColumn.elementUpdated();
      expect(htmlChangedEvent.callCount).to.be.equal(2);
    }
  });
});
