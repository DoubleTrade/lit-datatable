import {
  fixture, html, expect, elementUpdated
} from '@open-wc/testing';
import { TemplateResult } from 'lit-element';
import type { LitDatatable, Conf } from '../../lit-datatable';
import '../../lit-datatable';
import '../../lit-datatable-column';

interface PropertyColumn {
  property: string;
  html: ((value: string, otherValues?: any) => TemplateResult) | null;
  otherProperties: Array<string>;
  columnStyle?: string;
}

class LitDatatableWithColumnTest {
  el!: LitDatatable;

  async init(conf: Array<Conf>, data: Array<unknown>, columns: Array<PropertyColumn>, headers: Array<PropertyColumn>): Promise<LitDatatable> {
    const litDatatable = html`
      <lit-datatable .conf="${conf}" .data="${data}">
        ${columns.map((column) => html`
          <lit-datatable-column
            .html="${column.html}"
            .property="${column.property}"
            .otherProperties="${column.otherProperties}"
            column
            .columnStyle="${column.columnStyle || ''}"
          ></lit-datatable-column>
        `)}
        ${headers.map((header) => html`
          <lit-datatable-column
            .html="${header.html}"
            .property="${header.property}"
            .otherProperties="${header.otherProperties}"
            header
            .columnStyle="${header.columnStyle || ''}"
          ></lit-datatable-column>
        `)}
      </lit-datatable>
    `;
    this.el = await fixture(litDatatable);
    return this.elementUpdated();
  }

  elementUpdated(): Promise<LitDatatable> {
    return elementUpdated(this.el);
  }

  get bodyTrs() {
    if (this?.el?.shadowRoot) {
      return this.el.shadowRoot.querySelectorAll<HTMLTableRowElement>('tbody tr');
    }
    return null;
  }

  get bodyTds() {
    if (this?.el?.shadowRoot) {
      return this.el.shadowRoot.querySelectorAll<HTMLTableDataCellElement>('tbody td');
    }
    return null;
  }

  get headTrs() {
    if (this?.el?.shadowRoot) {
      return this.el.shadowRoot.querySelectorAll<HTMLTableRowElement>('thead tr');
    }
    return null;
  }

  get headThs() {
    if (this?.el?.shadowRoot) {
      return this.el.shadowRoot.querySelectorAll<HTMLTableRowElement>('thead th');
    }
    return null;
  }
}

const basicData = [
  { fruit: 'apple', color: 'green', weight: '100gr' },
  { fruit: 'banana', color: 'yellow', weight: '140gr' },
];

const basicConf: Array<Conf> = [
  { property: 'fruit', header: 'Fruit', hidden: false },
  { property: 'color', header: 'Color', hidden: false },
  { property: 'weight', header: 'Weight', hidden: false },
];

describe('lit-datatable', () => {
  it('counts', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} test`,
        property: 'fruit',
        otherProperties: [],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    const {
      bodyTrs, bodyTds, headTrs, headThs,
    } = litDatatableWithColumn;
    expect(headTrs?.length).to.be.equal(1);
    expect(headThs?.length).to.be.equal(3);
    expect(bodyTrs?.length).to.be.equal(2);
    expect(bodyTds?.length).to.be.equal(6);
  });

  it('header values', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} <div>test</div>`,
        property: 'fruit',
        otherProperties: [],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, [], columns);
    await litDatatableWithColumn.elementUpdated();
    const { bodyTds, headThs } = litDatatableWithColumn;
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple');
      expect(bodyTds[1]?.textContent).to.be.equal('green');
      expect(bodyTds[2]?.textContent).to.be.equal('100gr');
      expect(bodyTds[3]?.textContent).to.be.equal('banana');
      expect(bodyTds[4]?.textContent).to.be.equal('yellow');
      expect(bodyTds[5]?.textContent).to.be.equal('140gr');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit test');
      expect(headThs[1]?.textContent).to.be.equal('Color');
      expect(headThs[2]?.textContent).to.be.equal('Weight');
    }
  });

  it('body values', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} <div>test</div>`,
        property: 'fruit',
        otherProperties: [],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    const { bodyTds, headThs } = litDatatableWithColumn;
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple test');
      expect(bodyTds[1]?.textContent).to.be.equal('green');
      expect(bodyTds[2]?.textContent).to.be.equal('100gr');
      expect(bodyTds[3]?.textContent).to.be.equal('banana test');
      expect(bodyTds[4]?.textContent).to.be.equal('yellow');
      expect(bodyTds[5]?.textContent).to.be.equal('140gr');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit');
      expect(headThs[1]?.textContent).to.be.equal('Color');
      expect(headThs[2]?.textContent).to.be.equal('Weight');
    }
  });

  it('body other values', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value, otherValues) => html`${value} <div>${otherValues.color}</div>`,
        property: 'fruit',
        otherProperties: ['color'],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    const { bodyTds, headThs } = litDatatableWithColumn;
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple green');
      expect(bodyTds[1]?.textContent).to.be.equal('green');
      expect(bodyTds[2]?.textContent).to.be.equal('100gr');
      expect(bodyTds[3]?.textContent).to.be.equal('banana yellow');
      expect(bodyTds[4]?.textContent).to.be.equal('yellow');
      expect(bodyTds[5]?.textContent).to.be.equal('140gr');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit');
      expect(headThs[1]?.textContent).to.be.equal('Color');
      expect(headThs[2]?.textContent).to.be.equal('Weight');
    }
  });

  it('body values change conf', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} <div>test</div>`,
        property: 'fruit',
        otherProperties: [],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    let bodyTds;
    let headThs;
    ({ bodyTds, headThs } = litDatatableWithColumn);
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple test');
      expect(bodyTds[1]?.textContent).to.be.equal('green');
      expect(bodyTds[2]?.textContent).to.be.equal('100gr');
      expect(bodyTds[3]?.textContent).to.be.equal('banana test');
      expect(bodyTds[4]?.textContent).to.be.equal('yellow');
      expect(bodyTds[5]?.textContent).to.be.equal('140gr');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit');
      expect(headThs[1]?.textContent).to.be.equal('Color');
      expect(headThs[2]?.textContent).to.be.equal('Weight');
    }

    const newConf: Array<Conf> = [
      { property: 'fruit', header: 'Fruit', hidden: false },
      { property: 'weight', header: 'Weight', hidden: false },
      { property: 'color', header: 'Color', hidden: false },
    ];
    litDatatableWithColumn.el.conf = newConf;
    await litDatatableWithColumn.elementUpdated();

    ({ bodyTds, headThs } = litDatatableWithColumn);
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple test');
      expect(bodyTds[1]?.textContent).to.be.equal('100gr');
      expect(bodyTds[2]?.textContent).to.be.equal('green');
      expect(bodyTds[3]?.textContent).to.be.equal('banana test');
      expect(bodyTds[4]?.textContent).to.be.equal('140gr');
      expect(bodyTds[5]?.textContent).to.be.equal('yellow');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit');
      expect(headThs[1]?.textContent).to.be.equal('Weight');
      expect(headThs[2]?.textContent).to.be.equal('Color');
    }
  });

  it('header styles', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} <div>test</div>`,
        property: 'fruit',
        otherProperties: [],
        columnStyle: 'background: red;',
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, [], columns);
    await litDatatableWithColumn.elementUpdated();
    const { headThs } = litDatatableWithColumn;
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(/.*red.*/.test(headThs[0]?.style.background)).to.be.equal(true);
    }
  });

  it('body styles', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: (value) => html`${value} <div>test</div>`,
        property: 'fruit',
        otherProperties: [],
        columnStyle: 'background: red;',
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    const { bodyTds } = litDatatableWithColumn;
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(/.*red.*/.test(bodyTds[0]?.style.background)).to.be.equal(true);
      expect(/.*red.*/.test(bodyTds[3]?.style.background)).to.be.equal(true);
    }
  });

  it('body values', async () => {
    const columns: Array<PropertyColumn> = [
      {
        html: null,
        property: 'fruit',
        otherProperties: [],
      },
    ];
    const litDatatableWithColumn = new LitDatatableWithColumnTest();
    await litDatatableWithColumn.init(basicConf, basicData, columns, []);
    await litDatatableWithColumn.elementUpdated();
    const { bodyTds, headThs } = litDatatableWithColumn;
    expect(bodyTds).to.be.not.equal(null);
    if (bodyTds) {
      expect(bodyTds[0]?.textContent).to.be.equal('apple');
      expect(bodyTds[1]?.textContent).to.be.equal('green');
      expect(bodyTds[2]?.textContent).to.be.equal('100gr');
      expect(bodyTds[3]?.textContent).to.be.equal('banana');
      expect(bodyTds[4]?.textContent).to.be.equal('yellow');
      expect(bodyTds[5]?.textContent).to.be.equal('140gr');
    }
    expect(headThs).to.be.not.equal(null);
    if (headThs) {
      expect(headThs[0]?.textContent).to.be.equal('Fruit');
      expect(headThs[1]?.textContent).to.be.equal('Color');
      expect(headThs[2]?.textContent).to.be.equal('Weight');
    }
  });
});
