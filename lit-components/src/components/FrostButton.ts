import { css, html, LitElement } from "lit";
import { property, customElement } from "lit/decorators";


@customElement( "frost-button" )
export class FrostButton extends LitElement {

   @property( { type: String } ) label = "";

   render() {
      return html`
      <button class="frost-button">${ this.label }</button>
    `;
   }

   static styles = css`
   button {
     font-size: var(--frost-button-font-size, 1.2rem);
     /* background-color: var(--frost-button-bg-color, rgba(43,150,205, 0.5)); */
     background-color: var(--frost-button-bg-color, hsl(200, 62%, 74%));
     margin: var(--frost-button-margin, 0rem);
     padding: var(--frost-button-padding, 0.5rem);
     border-radius: var(--frost-button-border-radius, 0.4rem);
     border: var(--frost-button-border, 2px solid rgba(30,30,30, 0.5));
     color: var(--frost-button-text-color, #FFF);
     --outline-color: hsl(0, 0%, 20%);
      text-shadow:
         -1px -1px 1px var(--outline-color),
         1px -1px 1px var(--outline-color),
         -1px 1px 1px var(--outline-color),
         1px 1px 1px var(--outline-color);
   }
   .frost-button:hover {
     background-color: var(--frost-button-hover, hsl(200, 65%, 48%))
   }
 `;
}
