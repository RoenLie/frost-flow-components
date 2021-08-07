import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";


@customElement( "frost-preview-or-open" )
export class FrostPreviewOrOpen extends LitElement {
   @property( { type: Object } ) rowData: { data: { [ key: string ]: any; }, field: '', index: 0; };
   private _emitOpen() {
      const options = {
         detail: this.rowData,
         bubbles: true,
         composed: true
      };

      this.dispatchEvent( new CustomEvent( "onOpen", options ) );
   }
   private _emitPreview() {
      const options = {
         detail: this.rowData,
         bubbles: true,
         composed: true
      };

      this.dispatchEvent( new CustomEvent( "onPreview", options ) );
   }

   render() {
      return html`
      <div class="icons">
         <div class="icon" @click=${ this._emitPreview }>
            <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye" class="svg-inline--fa fa-eye fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
               <path fill="currentColor" d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"></path>
            </svg>
         </div>
         <div class="icon" @click=${ this._emitOpen }>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="box-open" class="svg-inline--fa fa-box-open fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
               <path fill="currentColor" d="M425.7 256c-16.9 0-32.8-9-41.4-23.4L320 126l-64.2 106.6c-8.7 14.5-24.6 23.5-41.5 23.5-4.5 0-9-.6-13.3-1.9L64 215v178c0 14.7 10 27.5 24.2 31l216.2 54.1c10.2 2.5 20.9 2.5 31 0L551.8 424c14.2-3.6 24.2-16.4 24.2-31V215l-137 39.1c-4.3 1.3-8.8 1.9-13.3 1.9zm212.6-112.2L586.8 41c-3.1-6.2-9.8-9.8-16.7-8.9L320 64l91.7 152.1c3.8 6.3 11.4 9.3 18.5 7.3l197.9-56.5c9.9-2.9 14.7-13.9 10.2-23.1zM53.2 41L1.7 143.8c-4.6 9.2.3 20.2 10.1 23l197.9 56.5c7.1 2 14.7-1 18.5-7.3L320 64 69.8 32.1c-6.9-.8-13.5 2.7-16.6 8.9z"></path>
            </svg>
         </div>
      </div>
      `;
   }

   static styles = css`
   * {
      box-sizing: border-box;
   }
   .icons {
      display: flex;
      flex-flow: row;
   }
   .icon {
      display: grid;
      place-items: center;
      opacity: 0.4;
      margin-right: 0.4rem;
      transition: opacity 0.2s linear;
      width: 1rem;
      height: 1rem;
   }
   .icon:hover {
      opacity: 1;
      cursor: pointer;
   }
   `;
}