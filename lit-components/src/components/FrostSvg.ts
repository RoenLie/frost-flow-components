import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";


@customElement( "frost-svg" )
export class FrostSvg extends LitElement {
   @property( { type: String } ) name: string = "icon-bars-solid";
   baseUrl = "./spritesheet.svg";
   createRenderRoot() {
      return this;
   }

   render() {
      return html`
         <template id="my-icon">
            <svg>
               <!-- <use id="use" xlink:href=${ this.baseUrl }#icon-${ this.name }></use> -->
               <use id="use" xlink:href="#icon-bars-solid"></use>
            </svg>
         </template>
      `;
   }
}