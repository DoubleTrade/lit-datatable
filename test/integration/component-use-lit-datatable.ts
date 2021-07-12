import {
  LitElement, html
} from 'lit';

import { property, customElement } from 'lit/decorators.js';
import type { Conf } from '../../lit-datatable';
import '../../lit-datatable';
import '../../lit-datatable-column';

@customElement('component-use-lit-datatable')
export class ComponentUseLitDatatable extends LitElement {
  @property({ type: Array }) testString = 'test';

  @property({ type: Array }) data: Array<any> = [
    { fruit: 'apple', color: 'green', weight: '100gr' },
    { fruit: 'banana', color: 'yellow', weight: '140gr' },
  ];

  @property({ type: Array }) conf: Array<Conf> = [
    { property: 'fruit', header: 'Fruit', hidden: false },
    { property: 'color', header: 'Color', hidden: false },
    { property: 'weight', header: 'Weight', hidden: false },
  ];

  render() {
    const fruitRenderer = (value: string) => html`
      ${value} <div>${this.testString}</div> 
    `;

    return html`
      <lit-datatable .conf="${this.conf}" .data="${this.data}">
        <lit-datatable-column column property="fruit" .html="${fruitRenderer}"></lit-datatable-column>
      </lit-datable>
    `;
  }
}
