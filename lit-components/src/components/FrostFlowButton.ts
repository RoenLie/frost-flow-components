import { css, html, LitElement } from "lit";
import { property, customElement } from "lit/decorators";


@customElement( "frost-flow-button" )
export class FrostFlowButton extends LitElement {
   static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--frost-flow-button-text-color, #000);
    }
  `;

   @property( { type: String } ) title = 'Hey there';

   @property( { type: Number } ) counter = 5;

   __increment() {
      this.counter += 1;
   }

   render() {
      return html`
      <h2>${ this.title } Nr. ${ this.counter }!</h2>
      <button @click=${ this.__increment }>increment</button>
    `;
   }
}
