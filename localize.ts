import { LitElement } from 'lit-element';

export type Language = 'en' | 'fr' | 'en-en' | 'en-US' | 'en-us' | 'fr-fr';

interface Resource {
  [key: string]: string;
}

export interface Resources {
  en: Resource;
  'en-en': Resource;
  'en-US': Resource;
  'en-us': Resource;
  fr: Resource;
  'fr-fr': Resource;
}

export default (superclass: typeof LitElement) => class Localize extends superclass {
  language: Language | null = null;

  resources: Resources | null = null;

  static get properties() {
    return {
      language: { type: String },
      resources: { type: Object },
    };
  }

  localize(key: string) {
    if (this.resources && this.language
      && this.resources[this.language] && this.resources[this.language][key]) {
      return this.resources[this.language][key];
    }
    return '';
  }
};
