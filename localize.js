export default (subclass) => class extends subclass {
  localize(key) {
    if (this.resources && this.language
      && this.resources[this.language] && this.resources[this.language][key]) {
      return this.resources[this.language][key];
    }
    return '';
  }
};
