import { unsafeCSS } from 'lit-element/lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

const ironFlexLayoutThemeTemplate = customElements.get('dom-module').import('iron-flex', 'template');
const ironFlexLayoutAlignThemeTemplate = customElements.get('dom-module').import('iron-flex-alignment', 'template');

export const ironFlexLayoutTheme = unsafeCSS(
  ironFlexLayoutThemeTemplate.content.firstElementChild.textContent,
);
export const ironFlexLayoutAlignTheme = unsafeCSS(
  ironFlexLayoutAlignThemeTemplate.content.firstElementChild.textContent,
);
