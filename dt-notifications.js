import {
  LitElement, html, css
} from 'lit-element';


class DatatableTest extends LitElement {
  static get styles() {
    const mainStyle = css`
      :host {
        display: block;
      }
      `;

    return [mainStyle];
  }

  render() {
    return html`rzerzerzerze toto`;
  }

  static get is() { return 'datatable-test'; }

  static get properties() {
    return {
      language: String,
    };
  }
}

window.customElements.define(DatatableTest.is, DatatableTest);
