import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators";
import { classMap } from 'lit/directives/class-map.js';


@customElement( "frost-input" )
export class FrostInput extends LitElement {
   @property( { type: String } ) label: any = "";
   @property() value: any = "";
   @property( { type: String } ) theme: string = "dark";
   @property( { type: Array } ) state: string[] = [];
   @query( 'input', true ) _input!: HTMLInputElement;

   private _emitValue() {
      const options = {
         detail: this._input.value,
         bubbles: true,
         composed: true
      };

      this.dispatchEvent( new CustomEvent( "value", options ) );
   }

   render = () => {
      const classes: any = {
         ...this.state.reduce( ( obj: any, val ) => {
            obj[ val ] = true;
            return obj;
         }, {} )
      };
      classes[ this.theme ] = true;

      return html`
      <label class=${ classMap( classes ) }>${ this.label }</label>
      <!-- <input .value=${ this.value } class=${ classMap( classes ) } /> -->
      <input @input=${ this._emitValue } .value=${ this.value } class=${ classMap( classes ) } />
      `;
   };

   static styles = css`
   :host {
      display: grid;
      row-gap: 0.25rem;
   }
   label {
      font-size: 1rem;
      margin: 0rem;
      padding: 0rem;
      font-weight: bold;
      
   }
   input { 
      font-size: 1.2rem;
      margin: 0rem;
      padding: 0.5rem;
      text-overflow: ellipsis;
      min-width: 0;
      outline: none;
   }
   input:disabled,
   input.disabled {
      opacity: 0.5; user-select: none;
   }

   label.frost {
      color: var(--frost-inputlabel-text-color, rgba(43,150,205, 0.75));
   }
   input.frost {
      color: var(--frost-input-text-color, hsla(0, 0%, 100%, 100%));
      background-color: var(--frost-input-bg-color, hsl(200, 62%, 74%));
      border: var(--frost-input-border, 2px solid rgba(30,30,30, 0.5));
      border-radius: var(--frost-input-border-radius, 0.1rem);
      text-shadow: var(--frost-input-text-shadow,
         -1px -1px 0 hsl(0, 0%, 20%),
         1px -1px 0 hsl(0, 0%, 20%),
         -1px 1px 0 hsl(0, 0%, 20%),
         1px 1px 0 hsl(0, 0%, 20%));
   }
   input.frost:hover:not(.disabled),
   input.frost:focus-within:not(.disabled),
   input.frost.active:not(.disabled) {
      box-shadow: var(--frost-input-box-shadow-active, 0px 0px 2px 2px hsla(0, 0%, 100%, 0.5));
   }

   label.dark {
      color: var(--frost-inputlabel-text-color, hsla(0, 0%, 100%, 25%));
      -webkit-text-stroke: var(--frost-inputlabel-text-stroke, 0.5px hsla(0, 0%, 0%, 75%));
   }
   input.dark {
      color: var(--frost-input-text-color, hsla(0, 0%, 100%, 0.8));
      -webkit-text-stroke: var(--frost-input-text-stroke, 0.5px hsl(0, 0%, 20%));

      background-color: var(--frost-input-bg-color, hsla(0, 0%, 15.7%, 1));
      border-radius: var(--frost-input-border-radius, 0.1rem);
      border: var(--frost-input-border, 2px solid hsla(0, 0%, 15.7%, 1));
      box-shadow: var(--frost-input-box-shadow,
         0 1px 1px hsla(0, 0%, 0%, 0.1),
         0 2px 2px hsla(0, 0%, 0%, 0.1),
         0 4px 4px hsla(0, 0%, 0%, 0.1),
         0 6px 6px hsla(0, 0%, 0%, 0.1));
   }
   input.dark:hover:not(.disabled),
   input.dark:focus-within:not(.disabled),
   input.dark.active:not(.disabled) {
      box-shadow: var(--frost-input-box-shadow-active, 0px 0px 2px 2px hsla(0, 0%, 100%, 0.5));
   }
   `;
}