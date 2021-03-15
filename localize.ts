export type Language = 'en' | 'fr' | 'en-en' | 'en-US' | 'en-us' | 'fr-fr';

interface Resource {
  [key: string]: string;
}

type Constructor<T> = {
  new (...args: any[]): T;
};

export interface Resources {
  en: Resource;
  'en-en': Resource;
  'en-US': Resource;
  'en-us': Resource;
  fr: Resource;
  'fr-fr': Resource;
}

export default <C extends Constructor<HTMLElement>>(subclass: C) => class extends subclass {
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
