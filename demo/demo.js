/* eslint no-unused-vars: off */

import { LitElement, html, css } from 'lit-element';

import '../lit-datatable';
import '../lit-datatable-column';
import '../lit-datatable-footer';
import '../helpers/ld-header-with-sort';

class LitDatatableDemo extends LitElement {
  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }

      .content > lit-datatable:not(:last-of-type) {
        margin-bottom: 24px;
      }
    `;
    return [mainStyle];
  }

  render() {
    // Data from api
    const data = [{ fruit: 'apple', color: 'green', weight: '100gr' }, { fruit: 'banana', color: 'yellow', weight: '140gr' }];
    // Conf to set order of column
    const conf = [{ property: 'fruit', header: 'Fruit', hidden: false }, { property: 'color', header: 'Color', hidden: true }, { property: 'weight', header: 'Weight', hidden: false }];

    // Customized header (get value and property fields)
    const headerOfFruit = (value, property) => html`<div style="color: red;">${value}</div>`;

    // Customized body (get value and property fields)
    const bodyOfFruit = (value, property) => html`<div style="color: red;">${value}</div>`;

    // Sorter on column
    const sort = (value, property) => html`
      <ld-header-with-sort
        language="en"
        direction="desc"
        data-property="${property}">
        ${value}
      </ld-header-with-sort>
    `;

    return html`
      <div class="content">
        <!-- Simple demo -->
        <lit-datatable .data="${data}" .conf="${conf}"></lit-datatable>

        <!-- With html header -->
        <lit-datatable .data="${data}" .conf="${conf}">
          <lit-datatable-column header="${true}" property="fruit" .html="${headerOfFruit}"></lit-datatable-column>
        </lit-datatable>

        <!-- With html data -->
        <lit-datatable .data="${data}" .conf="${conf}">
          <lit-datatable-column column="${true}" property="fruit" .html="${bodyOfFruit}"></lit-datatable-column>
        </lit-datatable>

        <!-- With html data and footer -->
        <lit-datatable .data="${data}" .conf="${conf}">
          <lit-datatable-column column="${true}" property="fruit" .html="${bodyOfFruit}"></lit-datatable-column>
        </lit-datatable>
        <lit-datatable-footer
          .availableSize="${[5, 10, 25]}"
          totalPages="10"
          totalElements="24"
          size="25"
          page="0"
          language="en">
        </lit-datatable-footer>

        <!-- With html data and sorter -->
        <lit-datatable .data="${data}" .conf="${conf}">
          <lit-datatable-column header="${true}" property="fruit" .html="${sort}"></lit-datatable-column>
          <lit-datatable-column column="${true}" property="fruit" .html="${bodyOfFruit}"></lit-datatable-column>
        </lit-datatable>
        <lit-datatable-footer
          .availableSize="${[5, 10, 25]}"
          totalPages="10"
          totalElements="24"
          size="25"
          page="0"
          language="en">
        </lit-datatable-footer>
      </div>`;
  }
}

window.customElements.define('lit-datatable-demo', LitDatatableDemo);
