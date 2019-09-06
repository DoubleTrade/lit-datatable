import { PolymerElement } from '@polymer/polymer/polymer-element';
import { html } from '@polymer/polymer/lib/utils/html-tag';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom';
import { microTask } from '@polymer/polymer/lib/utils/async';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@doubletrade/range-datepicker/range-datepicker-input';
import './ld-header-with-sort';

class LdHeaderWithDateAndSort extends PolymerElement {
  static get is() {
    return 'ld-header-with-date-and-sort';
  }

  static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }

        paper-input {
          min-width: var(--paper-datatable-api-min-width-input-filter, 120px);
          --paper-input-container-underline-focus: {
            display: block;
          }
          ;
          --paper-input-container-label: {
            position: initial;
          }
          ;
          --paper-input-container: {
            padding: 0;
          }
          ;
          --paper-input-container-input: {
            font-size: 12px;
          }
          ;
        }

        paper-icon-button[icon="search"] {
          padding: 0;
          width: 24px;
          height: 24px;
          --paper-icon-button: {
            color: var(--paper-icon-button-color);
          }

          --paper-icon-button-hover: {
            color: var(--paper-icon-button-color-hover);
          }
        }
      </style>
        <dom-if if="[[active]]">
          <template>
            <ld-header-with-sort direction="{{direction}}">
              <div class="layout horizontal center">
                <range-datepicker-input
                  no-range="[[noRange]]"
                  horizontal-align="[[horizontalAlign]]"
                  date-format="[[dateFormat]]"
                  locale="[[locale]]"
                  date-from="{{dateFrom}}"
                  date-to="{{dateTo}}"
                  force-narrow>
                  <template>
                    <paper-input no-label-float placeholder="[[header]]" value="[[_computeDate(dateFrom, dateTo, noRange)]]" readonly>
                    </paper-input>
                  </template>
                </range-datepicker-input>
                <paper-icon-button icon="clear" on-tap="_clearDate"></paper-icon-button>
              </div>
            </ld-header-with-sort>
          </template>
        </dom-if>
        <dom-if if="[[!active]]">
          <template>
            <ld-header-with-sort direction="{{direction}}">
              <div on-tap="toggleActive">
                [[header]]
              </div>
              <div slot="actions">
                <paper-icon-button icon="search" on-tap="toggleActive"></paper-icon-button>
              </div>
            </ld-header-with-sort>
          </template>
        </dom-if>
  `;
  }

  static get properties() {
    return {
      header: String,
      direction: {
        type: String,
        notify: true,
      },
      active: {
        type: Boolean,
        value: false,
        notify: true,
      },
      dateFrom: {
        type: String,
        observer: '_dateFromChanged',
      },
      dateTo: {
        type: String,
        observer: '_dateToChanged',
      },
      locale: String,
      noRange: {
        type: Boolean,
        value: false,
      },
      horizontalAlign: {
        type: String,
        value: 'right',
      },
    };
  }

  _dateToChanged(dateTo) {
    if (this.dateFrom && dateTo) {
      this.dispatchEvent(new CustomEvent('filter', {
        detail: {
          dateFrom: parseInt(this.dateFrom, 10),
          dateTo: parseInt(dateTo, 10),
        },
      }));
    }
  }

  _dateFromChanged(dateFrom) {
    if (dateFrom && this.noRange) {
      this.dispatchEvent(new CustomEvent('filter', {
        detail: {
          dateFrom: parseInt(dateFrom, 10),
        },
      }));
    }
  }

  toggleActive() {
    this.set('active', !this.active);
    if (!this.active) {
      this.set('dateFrom', null);
      this.set('dateTo', null);
    }
    flush();
    const paperInput = this.shadowRoot.querySelector('paper-input');
    if (paperInput) {
      paperInput.setAttribute('tabindex', 1);
      microTask.run(() => {
        paperInput.focus();
      });
    }
  }

  _computeDate(dateFrom, dateTo, noRange) {
    if (dateFrom && dateTo) {
      return `${dateFrom} ${dateTo}`;
    }
    if (noRange && dateFrom) {
      return dateFrom;
    }
    return null;
  }

  _clearDate() {
    this.toggleActive();
    this.dispatchEvent(new CustomEvent('filter', {
      detail: {
        dateFrom: null,
        dateTo: null,
      },
    }));
  }
}

window.customElements.define(LdHeaderWithDateAndSort.is, LdHeaderWithDateAndSort);
