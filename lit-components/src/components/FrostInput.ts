import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";


@customElement( "frost-input" )
export class FrostInput extends LitElement {
   @property() label: any = "";
   @property() value: any = "";

   render = () => html`
   <label>${ this.label }</label>
   <input value=${ this.value } />
   `;

   static styles = css`
   :host {
      display: grid;
      row-gap: 0.25rem;
   }
   label {
      font-size: var(--frost-inputlabel-font-size, 1rem);
      opacity: var(--frost-inputlabel-opacity, 0.75);
      background-color: var(--frost-inputlabel-bg-color, inherit);
      margin: var(--frost-inputlabel-margin, 0rem);
      padding: var(--frost-inputlabel-padding, 0rem);
      border-radius: var(--frost-inputlabel-border-radius, none);
      border: var(--frost-inputlabel-border, none);
      color: var(--frost-inputlabel-text-color, rgba(43,150,205, 0.75));
      font-weight: var(--frost-inputlabel-font-weight, bold);

      /* --outline-color: #000;
      text-shadow:
         -1px -1px 1px var(--outline-color),
         1px -1px 1px var(--outline-color),
         -1px 1px 1px var(--outline-color),
         1px 1px 1px var(--outline-color); */
   }
   input {
      font-size: var(--frost-input-font-size, 1.2rem);
      background-color: var(--frost-input-bg-color, hsl(200, 62%, 74%));
      margin: var(--frost-input-margin, 0rem);
      padding: var(--frost-input-padding, 0.5rem);
      border-radius: var(--frost-input-border-radius, 0.4rem);
      border: var(--frost-button-border, 2px solid rgba(30,30,30, 0.5));
      color: var(--frost-input-text-color, #FFF);
      min-width: 0;
      --outline-color: hsl(0, 0%, 20%);
      text-shadow:
         -1px -1px 1px var(--outline-color),
         1px -1px 1px var(--outline-color),
         -1px 1px 1px var(--outline-color),
         1px 1px 1px var(--outline-color);
   }
   `;
}