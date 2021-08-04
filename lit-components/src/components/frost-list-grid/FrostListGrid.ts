import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { IColDefs, VirtualScrollApi } from "./FrostListGridApi";
export { VirtualScrollApi } from "./FrostListGridApi";


interface FlexibleHTMLElement extends HTMLElement { [ key: string ]: any; };

@customElement( "frost-list-grid" )
export class FrostListGrid extends LitElement {
   @property( { type: Object } ) api: VirtualScrollApi;
   initialized = false;
   hostId = Math.floor( Math.random() * 999 );
   visibleHeaders = html``;
   visibleRows = html``;
   headerMenu = html``;
   columnGhost = html``;
   subscribers: [ FlexibleHTMLElement | Window, keyof WindowEventMap, any ][] = [];

   connectedCallback() {
      super.connectedCallback();
      if ( this.api?.mode )
         setTimeout( () => this.initialize( this.api ) );
   }
   disconnectedCallback() {
      super.disconnectedCallback();
      this.unsubscribe();
   }

   initialize( api: VirtualScrollApi ) {
      this.api = api;
      this.api.rerender = this.requestUpdate.bind( this ) as any;

      setTimeout( () => this.subscribe() );
   }
   subscribe() {
      if ( this.initialized ) return;
      this.initialized = true;

      const { listWrapperApi, scrollApi } = this.api.listApi;
      listWrapperApi.element = this.renderRoot.querySelector(
         `#listRowWrapper-${ this.hostId }`
      );
      scrollApi.element = this.renderRoot.querySelector(
         `#viewportWrapper-${ this.hostId }`
      );
      listWrapperApi.subscribe();
      scrollApi.subscribe();
      listWrapperApi.calcWrapperHeight();

      // this.subscribers.push( [ viewmoverEl, 'click', this.onRowClick.bind( this ) ] );
      // this.subscribers.forEach( s => s[ 0 ].addEventListener( s[ 1 ], s[ 2 ] ) );
   }
   unsubscribe() {
      const { listWrapperApi, scrollApi } = this.api.listApi;
      listWrapperApi.unsubscribe();
      scrollApi.unsubscribe();

      // this.subscribers.forEach( s => s[ 0 ].removeEventListener( s[ 1 ], s[ 2 ] ) );
      // this.subscribers.length = 0;
   }
   onRowClick( e: Event ) {
      const path = e.composedPath();

      const dataAssignment = [
         [ 'data-row-index', 'index' ],
         [ 'data-field', 'field' ]
      ];

      /* goes through the composed path and extracts the attributes
      from data assignment variable and returns them in an object */
      const row = path.reduce( ( a, _el ) => {
         const el = _el as HTMLElement;
         if ( !el.getAttribute ) return a;

         const dataAttr = dataAssignment.reduce( ( _a, _c ) => {
            const attr = el.getAttribute( _c[ 0 ] );
            if ( attr ) _a[ 0 ] = _c[ 1 ], _a[ 1 ] = attr;
            return _a;
         }, [] );

         if ( dataAttr.length ) a[ dataAttr[ 0 ] ] = dataAttr[ 1 ];

         return a;
      }, {} as any );

      const rowData = {
         data: this.api.listApi.rowData[ row.index ],
         field: row.field,
         index: Number( row.index )
      };

      this.api.publishers.rowClick.next( rowData );
   }

   ListRow = ( rowIndex: number ) => {
      const { listApi, columnApi } = this.api;

      const rowStyle = {
         height: `${ listApi.childHeight }px`
      };
      const rowClasses = {
         listRow: true,
         even: rowIndex % 2 == 1,
         odd: rowIndex % 2 != 1,
         checked: listApi.checkedRows[ rowIndex ]
      };

      /* @click=${ ( e: any ) => this.onRowClick( e, this.api.listApi.rowData[ rowIndex ] ) } */
      return html`
         <div class=${ classMap( rowClasses ) } style=${ styleMap( rowStyle ) }
            data-row-index=${ rowIndex }
         >
            ${ columnApi.colDefs.merged
            .filter( def => !def.hidden )
            .map( ( def ) => this.ListRowField( def, rowIndex ) ) }
         </div>
      `;
   };
   ListRowField = ( def: IColDefs, rowIndex: number ) => {
      const { listApi } = this.api;

      const fieldStyle = {
         willChange: 'width',
         width: `${ def.width || def.minWidth }px`,
         minWidth: `${ def.minWidth }px`
      };

      const fieldText = listApi.rowData[ rowIndex ]?.[ def.field ];

      const rowData = {
         data: listApi.rowData[ rowIndex ],
         field: def.field,
         index: rowIndex
      };

      return html`
         <div class="rowField" style=${ styleMap( fieldStyle ) }
            data-field=${ def.field }
         >
            <!-- checkbox area -->
            ${ !def.checkbox ? '' : html`
               <div class="checkbox">
                  <input
                     title="select row"
                     type="checkbox"
                     .checked=${ listApi.checkedRows[ rowIndex ] }
                     @change=${ () => listApi.checkRow( rowIndex ) }
                  />
               </div>
            `}
            <!-- field renderer -->
            ${ def.renderer ? def.renderer( rowData ) : html`
               ${ !fieldText ? '' : html`<div class="fieldText">${ fieldText }</div>` }
            `}
         </div>
      `;
   };

   render = () => {
      if ( !this.api ) return html``;

      const { listApi, columnApi, styleApi } = this.api;
      const { moveColumnApi, resizeColumnApi, columnMenuApi } = this.api.columnApi;
      const { viewportWrapperStyle, viewportStyle, viewMoverStyle, listHeaderStyle } = styleApi;

      this.visibleHeaders = !columnApi.colDefs.merged ? html`` : html`
      ${ columnApi.colDefs.merged
            .filter( def => !def.hidden )
            .map( ( def ) => {
               const fieldId = 'fieldHeader-' + def.field;

               const columnStyle = {
                  willChange: 'width',
                  width: `${ def.width || def.minWidth }px`,
                  minWidth: `${ def.minWidth }px`,
               };

               return html`
               <div
                  id=${ fieldId }
                  style=${ styleMap( columnStyle ) }
                  class="headerField"
                  @mouseover=${ ( e: any ) => moveColumnApi.mouseenter( e, def.field ) }
                  >
                     <!-- check all rows -->
                     ${ def.checkbox ? html`
                     <div class="checkbox">
                        <input type="checkbox"
                        .checked=${ listApi.allRowsChecked }
                        @change=${ listApi.checkAllRows.bind( listApi ) }
                        />
                     </div>`: '' }

                     <!-- header field text and functionality -->
                     <div class="headerFieldLabel">
                        ${ def.label ? html`<span>${ def.label || def.field }</span>` : '' }
                        <span
                           class="columnMover"
                           @mousedown=${ ( e: any ) => moveColumnApi.mousedown( e, def.field, fieldId ) }
                           @mouseup=${ ( e: any ) => listApi.sortRows( def.field ) }
                        ></span>
                     </div>

                     <!-- header field menu area -->
                     <div class="columnMenuWrapper">
                        ${ def.sort == 'asc' ? html`
                           <div class="columnSort"
                              @mouseup=${ ( e: any ) => listApi.sortRows( def.field ) }>
                              <svg class="icon">
                                 <use id="use" xlink:href="#icon-chevron-up"></use>
                              </svg>
                           </div>
                        `: def.sort == 'desc' ? html`
                           <div class="columnSort"
                              @mouseup=${ ( e: any ) => listApi.sortRows( def.field ) }>
                              <svg class="icon">
                                 <use id="use" xlink:href="#icon-chevron-down"></use>
                              </svg>
                           </div>
                        `: '' }

                        ${ def.menu !== true ? '' : html`
                           <div class="columnMenu"
                              @click=${ ( e: any ) => columnMenuApi.openMenu( e ) }>
                              <svg class="icon">
                                 <use id="use" xlink:href="#icon-bars-solid"></use>
                              </svg>
                           </div>
                        `}
                     </div>

                     <!-- header field resize functionality -->
                     <div class="columnResizer">
                     ${ def.resizable !== false ? html`
                        <span @mousedown=${ ( e: any ) =>
                        resizeColumnApi.mousedown( e, def.field ) }></span>`
                     : null }
                     </div>
               </div>
               `;
            } ) }
      `;

      this.visibleRows = !listApi.rowCount || !listApi.visibleNodeCount ? html`` : html`
      ${ new Array( listApi.visibleNodeCount )
            .fill( null )
            .map( ( _, index ) => {
               const rowIndex = index + listApi.startNode;
               return this.ListRow( rowIndex );
            } ) }
      `;

      this.columnGhost = !moveColumnApi.moving ? html`` : html`
         <div class="columnGhost" style=${ styleMap( this.api.styleApi.columnGhostStyle ) }>
            <div class="label">
               ${ this.api.columnApi.moveColumnApi.label }
            </div>
         </div>
      `;

      this.headerMenu = !columnMenuApi.open ? html`` : html`
         <div class="headerMenuWrapper" style=${ styleMap( styleApi.headerMenuStyle ) }
            id="fieldHeader-menu"
         >
            <div class="menu">
               <div class="fieldList">
                  ${ columnApi.colDefs.merged.map( ( def, i ) => html`
                     <div class="field">
                        <input
                           id=${ def.field + i }
                           type="checkbox"
                           ?disabled=${ i == 0 }
                           ?checked=${ !def.hidden }
                           @change=${ () => columnApi.toggleColumn( def.field ) }
                        />
                        <label for=${ def.field + i }>${ def.label }</label>
                     </div>
                  `) }
               </div>
            </div>
         </div>
      `;


      return html`
      <div class="host" id=${ `listGridHost-${ this.hostId }` }>
         <div class="wrapper">
            <!-- Header -->
            <div class="listHeaderWrapper">
               <div class="listHeader" style=${ styleMap( listHeaderStyle ) }>
                  ${ this.visibleHeaders }
               </div>
            </div>

            <!-- Rows -->
            <div class="listRowWrapper" id=${ `listRowWrapper-${ this.hostId }` }>
               <div class="viewportWrapper" style=${ styleMap( viewportWrapperStyle ) }
                  id=${ `viewportWrapper-${ this.hostId }` }
               >
                  <div class="viewport" style=${ styleMap( viewportStyle ) }
                  >
                     <div class="viewMover" style=${ styleMap( viewMoverStyle ) }
                        @click=${ this.onRowClick }
                        id=${ `viewmover-${ this.hostId }` } data-name="viewmover"
                     >
                        ${ this.visibleRows }
                     </div>
                  </div>
               </div>
            </div>
         </div>

         ${ this.headerMenu }
         ${ this.columnGhost }
      </div>

      <svg class="iconHost" xmlns="http://www.w3.org/2000/svg">
         <defs>
            <symbol id="icon-bars-solid" viewBox="0 0 448 512">
               <path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
            </symbol>
            <symbol id="icon-chevron-down" viewBox="0 0 448 512">
               <path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
            </symbol>
            <symbol id="icon-chevron-up" viewBox="0 0 448 512">
               <path fill="currentColor" d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"></path>
            </symbol>
         </defs>
      </svg>
      `;
   };

   static styles = css`
   * {
      box-sizing: border-box;
   }

   /*  */

   :host {
      --ff-listgrid-text-color: white;
      --ff-listgrid-header-wrapper-bg: hsla(200, 8%, 15%, 1);
      --ff-listgrid-header-border: hsla(240, 3%, 42%, 1);
      --ff-listgrid-header-field-bg: hsla(200, 8%, 15%, 1);
      --ff-listgrid-column-menu-highlight: hsla(187, 71%, 82%, 1);
      --ff-listgrid-header-menu-wrapper-bg: rgba(81, 35, 35, 1);
      --ff-listgrid-row-border: hsla(240, 3%, 42%, 0.2);
      --ff-listgrid-row-odd: hsla(200,8%,15%,1);
      --ff-listgrid-row-even: hsla(197,13%,11%,1);
      --ff-listgrid-row-checked-border: hsla(240, 3%, 42%, 1);
      --ff-listgrid-row-checked-bg: hsla(201, 97%, 13%, 1);
      --ff-listgrid-row-hover-bg: hsla(201, 96%, 11%,1);
      --ff-listgrid-column-ghost-bg: rgba(81, 35, 35, 1);
      --ff-listgrid-column-ghost-shadow: rgba(35, 35, 35, 1);
      --ff-listgrid-column-ghost-border-radius: 0.2rem;
      --ff-listgrid-header-menu-wrapper-shadow: rgba(35, 35, 35, 1);
      --ff-listgrid-header-menu-wrapper-border-radius: 0.2rem;
      --ff-listgrid-scrollbar-height: 0.75rem;
      --ff-listgrid-scrollbar-width: 0.75rem;
      --ff-listgrid-scrollbar-track: rgba(0, 0, 0, 0.15);
      --ff-listgrid-scrollbar-thumb: rgba(255, 255, 255, 0.09);
      --ff-listgrid-scrollbar-corner: rgba(0, 0, 0, 0);

      display: grid;
      grid-template-areas: "listgrid";
      grid-template-rows: 1fr;
      grid-template-columns: 1fr;
      color: var(--ff-listgrid-text-color);
   }

   /*  */

   .host {
      display: grid;
      grid-area: listgrid;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
   }

   /*  */

   .iconHost {
      display: none;
   }

   /*  */

   .icon {
      width: 1rem;
      height: 1rem;
   }

   /*  */
   
   .wrapper {
      overflow: hidden;
      display: grid;
      grid-template-rows: 3rem 1fr;
      position: relative;
   }

   /*  */

   .listHeaderWrapper {
      position: relative;
      display: grid;
      grid-auto-flow: row;
      background-color: var(--ff-listgrid-header-wrapper-bg);
      border-bottom: 2px solid var(--ff-listgrid-header-border);
   }
   .listHeaderWrapper .listHeader {
      position: absolute;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      height: 100%;
   }
   .listHeaderWrapper .listHeader .headerField .checkbox {
      display: grid;
      place-items: center;
   }
   .listHeaderWrapper .listHeader .headerField {
      overflow: hidden;
      background-color: var(--ff-listgrid-header-field-bg);
      position: relative;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      padding-inline: 1rem;
   }
   .listHeaderWrapper .listHeader .headerField .headerFieldLabel {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      position: relative;
      overflow: hidden;
   }
   .listHeaderWrapper .listHeader .headerField .headerFieldLabel >span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
   }
   .listHeaderWrapper .listHeader .headerField .columnMover {
      position: absolute;
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      z-index: 1;
      cursor: grab;
   }
   .listHeaderWrapper .listHeader .headerField .columnMenuWrapper {
      display: grid;
      grid-auto-flow: column dense;
      column-gap: 0.25rem;
   }
   .listHeaderWrapper .listHeader .headerField .columnMenuWrapper .columnMenu,
   .listHeaderWrapper .listHeader .headerField .columnMenuWrapper .columnSort {
      cursor:pointer;
      display: grid;
      place-items: center;
   }
   .listHeaderWrapper .listHeader .headerField .columnMenuWrapper .columnMenu:hover,
   .listHeaderWrapper .listHeader .headerField .columnMenuWrapper .columnSort:hover {
      color: var(--ff-listgrid-column-menu-highlight)
   }
   .listHeaderWrapper .listHeader .headerField .columnResizer {
      position: absolute;
      right: 0;
      display: grid;
      place-items: center;
      height: 50%;
      border: 1px solid var(--ff-listgrid-header-border);
   }
   .listHeaderWrapper .listHeader .headerField .columnResizer >* {
      position: absolute;
      cursor: ew-resize;
      user-select: none;
      z-index: 1;
      width: 20px;
      height: 30px;
      left: -10px;
   }

   /*  */
   
   .listRowWrapper {
      overflow: hidden;
      display: grid;
      background-color: hsl(202, 9%, 17%);
   }
   .listRowWrapper .viewportWrapper {
      overflow: auto;
   }
   .listRowWrapper .viewportWrapper::-webkit-scrollbar {
      height: var(--ff-listgrid-scrollbar-height);
      width: var(--ff-listgrid-scrollbar-width);
   }
   .listRowWrapper .viewportWrapper::-webkit-scrollbar-track {
      background: var(--ff-listgrid-scrollbar-track);
   }
   .listRowWrapper .viewportWrapper::-webkit-scrollbar-thumb {
      background: var(--ff-listgrid-scrollbar-thumb);
   }
   .listRowWrapper .viewportWrapper::-webkit-scrollbar-corner {
      background: var(--ff-listgrid-scrollbar-corner);
   }
   .listRowWrapper .viewportWrapper .viewport {
      position: absolute;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover {
      display: grid;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      border-top: 1px solid var(--ff-listgrid-row-border);
      border-bottom: 1px solid var(--ff-listgrid-row-border);
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow.odd {
      background-color: var(--ff-listgrid-row-odd);
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow.even {
      background-color: var(--ff-listgrid-row-even);
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow.checked {
      border-top: 1px solid var(--ff-listgrid-row-checked-border);
      border-bottom: 1px solid var(--ff-listgrid-row-checked-border);
      background-color: var(--ff-listgrid-row-checked-bg);
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow.checked .rowField .checkbox {
      opacity: 1;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow:hover {
      background-color: var(--ff-listgrid-row-hover-bg);
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField {
      display: flex;
      align-items: center;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField .checkbox {
      display: grid;
      place-items: center;
      padding-right: 0.4rem;
      opacity: 0.4;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField .icons {
      display: flex;
      flex-flow: row;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField .icons>* {
      display: grid;
      place-items: center;
      opacity: 0.4;
      margin-right: 0.4rem;
      transition: opacity 0.2s linear;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField .icons>*:hover {
      opacity: 1;
      cursor: pointer;
   }
   .listRowWrapper .viewportWrapper .viewport .viewMover .listRow .rowField .fieldText {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
   }

   /*  */
   
   .columnGhost {
      overflow: hidden;
      position: fixed;
      pointer-events: none;
      display: flex;
      z-index: 1;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      width: 7rem;
      height: 3rem;
      opacity: 0.9;

      background-color: var(--ff-listgrid-column-ghost-bg);
      box-shadow: 0 0 5px 5px var(--ff-listgrid-column-ghost-shadow);
      border-radius: var(--ff-listgrid-column-ghost-border-radius);
   }
   .columnGhost .label {
      margin: 0.5rem;
      pointer-events: all;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }

   /*  */
   
   .headerMenuWrapper {
      overflow: hidden;
      position: fixed;
      display: grid;
      height: 13rem;
      width: 12rem;
      background-color: var(--ff-listgrid-header-menu-wrapper-bg);
      box-shadow: 0 0 5px 5px var(--ff-listgrid-header-menu-wrapper-shadow);
      border-radius: var(--ff-listgrid-header-menu-wrapper-border-radius);
   }
   .headerMenuWrapper .menu {
      display: grid;
      overflow: hidden;
   }
   .headerMenuWrapper .menu .fieldList {
      overflow: auto;
      display: grid;
   }
   .headerMenuWrapper .menu .fieldList::-webkit-scrollbar {
      height: var(--ff-listgrid-scrollbar-height);
      width: var(--ff-listgrid-scrollbar-width);
   }
   .headerMenuWrapper .menu .fieldList::-webkit-scrollbar-track {
      background: var(--ff-listgrid-scrollbar-track);
   }
   .headerMenuWrapper .menu .fieldList::-webkit-scrollbar-thumb {
      background: var(--ff-listgrid-scrollbar-thumb);
   }
   .headerMenuWrapper .menu .fieldList::-webkit-scrollbar-corner {
      background: var(--ff-listgrid-scrollbar-corner);
   }
   .headerMenuWrapper .menu .fieldList .field {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
   }
   .headerMenuWrapper .menu .fieldList .field label{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }
   `;
}