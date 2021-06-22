class EsIntegerInput extends HTMLElement {

   static get observedAttributes() {
      return ['value'];
   }

   constructor() {
      // Always call super first in constructor
      super();

      this._value = null;
   }

   /* Life cycle events */
   connectedCallback() {
      this.value = parseInt(this.getAttribute('value'));
      this.inputEl = this.createInputElement();
      this.append(this.inputEl);
      this.inputEl.addEventListener('input', e => this.onInput());
   }

   attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
         return;
      }

      if (name == 'value')
         this.value = parseInt(newValue);
   }

   /* End life cycle events */

   createInputElement() {
      let el = document.createElement('input');
      for (var i = this.attributes.length - 1; i >= 0; i--) {
         let attr = this.attributes[i];
         el.setAttribute(attr.name, attr.value);
      }
      return el;
   }

   get value() {
      return this._value;
   }

   set value(value) {
      this._value = Number.isInteger(value) ? value : null;
      this.updateInputValue();
   }

   get text() {
      return this._value === null ? '' : this._value.toString();
   }

   onInput() {
      var val = parseInt(this.inputEl.value);
      if (this.inputEl.value == '')
         val = null;
      else if (!Number.isInteger(val))
         this.inputEl.value = this.text;
      else
         this.inputEl.value = val.toString();

      if (val !== this._value) {
         this._value = val;
         this.setAttribute('value', this.text);
      }
   }

   updateInputValue() {
      if (this.inputEl)
         this.inputEl.value = this.text;
   }
}

customElements.define('es-integer-input', EsIntegerInput);