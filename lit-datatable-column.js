import { LitElement, css } from 'lit-element';

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
    };
  }

  constructor() {
    super();
    this.eventsForDom = [];
  }

  updated(properties) {
    if (properties.has('html')) {
      this.dispatchEvent(new CustomEvent('html-changed'));
    }
  }
}

window.customElements.define(LitDatatableColumn.is, LitDatatableColumn);
