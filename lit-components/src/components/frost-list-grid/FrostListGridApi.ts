import { createCSSSelector } from "./createCSSSelector";
import { Publisher } from "./Publisher";
import { debounce } from "./debounce";


export type TSuccessParams = {
   rowData: any[],
   lastRow: number;
};
export type TRequest = {
   startRow: number;
   endRow?: number;
   filterModel?: any;
   groupKeys?: any[];
   pivotCols?: any[];
   pivotMode?: boolean;
   rowGroupCols?: any[];
   sortModel?: any[];
   valueCols?: any[];
};
export interface IGetRowsParams {
   request: TRequest;
   fail: () => void;
   success: ( { rowData, lastRow }: TSuccessParams ) => void;
}
export interface IDatasource {
   getRows: ( { }: IGetRowsParams ) => Promise<any>;
}
export interface IDefaultColDefs {
   [ key: string ]: any;
}
export interface IColDefs {
   [ key: string ]: any;
   label: string;
   field: string;
   minWidth?: number;
   resizable?: boolean;
   moveable?: boolean;
   menu?: boolean;
   renderer?: any;
}
export type ListGridMode = 'ssr' | 'normal';
export interface FlexibleHTMLElement extends HTMLElement { [ key: string ]: any; };
export type TEventSubscription = [ FlexibleHTMLElement | Window, keyof WindowEventMap, any ][];
class EventApi {
   subscriptions: TEventSubscription = [];
   subscribe() {
      this.subscriptions.forEach( ( sub ) => sub[ 0 ].addEventListener( sub[ 1 ], sub[ 2 ] ) );
   };
   unsubscribe() {
      this.subscriptions.forEach( sub => sub[ 0 ].removeEventListener( sub[ 1 ], sub[ 2 ] ) );
      this.subscriptions.length = 0;
   }
}

class ColumnApi {
   root: ListGridApi;

   constructor ( root: ListGridApi ) { this.root = root; }

   toggleColumn( field: string ) {
      const { columnDefinitions } = this.root;
      const value = columnDefinitions.custom[ field ].hidden;

      columnDefinitions.custom = {
         ...columnDefinitions.custom,
         [ field ]: {
            ...columnDefinitions.custom[ field ],
            hidden: value ? false : true
         }
      };

      this.root.publishers.hideColumn.publish();
      this.root.rerender();
   }
}

class ColumnDefinitions {
   default: IDefaultColDefs;
   base: any[];
   #custom: IColDefs;
   get custom() { return this.#custom; }
   set custom( v: IColDefs ) {
      this.#custom = v;

      this.merged = this.base.map( ( def ) => {
         return {
            ...this.default,
            ...def,
            ...this.custom[ def.field ]
         };
      } ).sort( ( a, b ) => a.order - b.order );
   }
   merged: IColDefs[] = [];

   createCustomColDefs() {
      return this.base.reduce( ( acc: any, def: any, index: any ) => {
         const width = def.width || def.minWidth || this.default.minWidth || 100;
         const order = index;
         acc[ def.field ] = { ...this.default, ...def, width, order };
         return acc;
      }, {} );
   }
}

class ColumnMenuApi extends EventApi {
   root: ListGridApi;
   open = false;
   xy = [ 150, 150 ];

   constructor ( root: ListGridApi ) { super(); this.root = root; }

   openMenu( e: MouseEvent ) {
      this.open = true;
      this.xy = [ e.clientX - 15, e.clientY - 15 ];
      this.subscriptions.push( [ window, 'mousedown', this.closeMenu.bind( this ) ] );
      this.root.rerender();
      super.subscribe();
   }
   closeMenu( e: MouseEvent ) {
      const insideMenu = e.composedPath()
         .some( ( path: any ) => path.id == 'fieldHeader-menu' );

      if ( insideMenu ) return;

      this.open = false;
      this.xy = [ 0, 0 ];
      this.root.rerender();
      super.unsubscribe();
   }
}

class MoveColumnApi extends EventApi {
   root: ListGridApi;
   field = '';
   label = '';
   moving = false;
   startPos = [ 100, 100 ];
   offset = [ 0, 0 ];
   frameQueue = false;

   constructor ( root: ListGridApi ) { super(); this.root = root; }

   mousedown( e: MouseEvent, field: string, id: string ) {
      e.preventDefault();

      if ( e.buttons !== 1 ) return;

      this.startPos = [ e.clientX, e.clientY ];
      this.field = field;
      this.label = this.root.columnDefinitions.merged
         .find( d => d.field == field )?.label || '';

      this.subscribe();
   }
   mousemove( e: MouseEvent ) {
      e.preventDefault();

      if ( e.buttons !== 1 ) {
         this.unsubscribe();
         return;
      }

      if ( !this.moving ) {
         const travelDistance = [
            Math.abs( e.clientX - this.startPos[ 0 ] ),
            Math.abs( e.clientY - this.startPos[ 1 ] )
         ];

         const sufficientDistance = travelDistance.some( d => d > 15 );
         if ( !sufficientDistance ) return;

         this.moving = true;

         createCSSSelector( '.cursorMove *', 'cursor:move !important;' );
         document.body.classList.add( 'cursorMove' );
      }

      requestAnimationFrame( ( () => {
         if ( this.frameQueue ) return;
         this.frameQueue = true;

         const offset = [ e.clientX - this.startPos[ 0 ], e.clientY - this.startPos[ 1 ] ];
         this.offset = offset;

         this.root.rerender();

         this.frameQueue = false;
      } ) );
   }
   mouseenter( e: MouseEvent, field: string ) {
      if ( e.buttons !== 1 ) {
         this.unsubscribe();
         return;
      }

      const { columnDefinitions: colDefs } = this.root;

      let moveable = colDefs.custom[ field ].moveable;
      moveable = moveable === undefined ? true : moveable;

      if ( !this.moving || !moveable || this.field == field ) return;

      const order1 = colDefs.custom[ this.field ].order;
      const order2 = colDefs.custom[ field ].order;

      colDefs.custom = {
         ...colDefs.custom,
         [ this.field ]: {
            ...colDefs.custom[ this.field ],
            order: order2
         },
         [ field ]: {
            ...colDefs.custom[ field ],
            order: order1
         }
      };

      this.root.rerender();
   }
   mouseup() {
      this.unsubscribe();
   }
   subscribe() {
      this.subscriptions.push(
         [ window, 'mousemove', this.mousemove.bind( this ) ],
         [ window, 'mouseup', this.mouseup.bind( this ) ]
      );
      super.subscribe();
   }
   unsubscribe() {
      const { publishers } = this.root;
      if ( this.moving ) publishers.moveColumn.publish();

      this.field = '';
      this.moving = false;

      document.body.classList.remove( 'cursorMove' );

      super.unsubscribe();
      this.root.rerender();
   }
}

class ResizeColumnApi extends EventApi {
   root: ListGridApi;
   field: string | null = null;
   resizing = false;
   element = null as HTMLElement | null;
   frameQueue = false;

   constructor ( root: ListGridApi ) { super(); this.root = root; }

   getRects() { return this.element?.getBoundingClientRect(); }
   mousedown( e: MouseEvent, field: string ) {
      const target = e.target as HTMLElement;
      this.element = target.parentElement?.parentElement as HTMLElement;
      this.field = field;
      this.subscribe();
   }
   mousemove( e: MouseEvent ) {
      e.preventDefault();

      requestAnimationFrame( () => {
         if ( this.frameQueue ) return;
         this.frameQueue = true;

         if ( e.buttons !== 1 || this.field === null ) {
            this.unsubscribe();
            return;
         }

         const rects = this.getRects();
         if ( !rects ) return;

         this.resizing = true;

         const { columnDefinitions: colDefs } = this.root;
         const width = e.x - rects.left;

         colDefs.custom = {
            ...colDefs.custom,
            [ this.field ]: {
               ...colDefs.custom[ this.field ],
               width
            }
         };

         this.root.rerender();
         this.frameQueue = false;
      } );
   }
   mouseup() {
      this.unsubscribe();
   }
   subscribe() {
      this.subscriptions.push(
         [ window, 'mousemove', this.mousemove.bind( this ) ],
         [ window, 'mouseup', this.mouseup.bind( this ) ]
      );
      super.subscribe();
   }
   unsubscribe() {
      const { publishers } = this.root;
      if ( this.resizing ) publishers.resizeColumn.publish();

      super.unsubscribe();
      this.field = null;
      this.resizing = false;
      this.frameQueue = false;
      this.root.rerender();
   }
}

class ListApi {
   root: ListGridApi;
   get startNode() {
      const min = 0;
      const max = Math.floor( this.root.scrollApi.scrollTop
         / this.root.options.rowHeight )
         - this.availableHeight;
      return Math.max( min, max );
   };
   get visibleNodeCount() {
      let min = this.rowData.length - this.startNode; min = min > 0 ? min : 0;
      const max = Math.floor( this.availableHeight * 2 );
      return Math.min( min, max );
   }
   get totalHeight() {
      return this.rowCount * this.root.options.rowHeight || 0;
   };
   get availableHeight() {
      return Math.ceil( this.wrapperHeight / this.root.options.rowHeight ) || 0;
   }
   get offsetY() {
      const baseOffset = this.startNode * this.root.options.rowHeight;

      let extra = this.root.scrollApi.scrollTop > this.wrapperHeight
         ? Math.ceil( this.wrapperHeight / 2 )
         : 0;

      return baseOffset + extra || 0;
   }
   get startColumn() {
      return 0;
   }
   get visibleColumnCount() {
      return 0;
   }
   get totalWidth() {
      return 0;
   }
   get availableWidth() {
      return 0;
   }
   get offsetX() {
      return 0;
   }
   get viewSaturated() {
      return ( this.rowCount > this.availableHeight ) || this.lastRow > -1;
   }
   get sortModel() {
      return Object
         .entries( this.root.columnDefinitions.custom )
         .filter( ( o: any ) => o[ 1 ].sort )
         .map( ( def: any ) => ( { sort: def[ 1 ].sort, colId: def[ 1 ].field } ) );
   }
   get rowCount() {
      return this.rowData.length;
   }
   wrapperWidth = 0;
   #wrapperHeight = 0;
   get wrapperHeight() { return this.#wrapperHeight; }
   set wrapperHeight( v: number ) {
      this.#wrapperHeight = v;

      if ( this.viewSaturated ) return;
      this.getRows( { startRow: 0 } );
   }
   datasource: IDatasource;
   querying = false;
   rowData: any[] = [];
   lastRow: number = -1;
   checkedRows: any = {};
   allRowsChecked = false;
   cachedRequest: TRequest;

   constructor ( root: ListGridApi ) { this.root = root; }

   checkAllRows( e: any, override?: boolean ) {
      const v = override !== undefined ? override : e.target.checked;
      this.allRowsChecked = v;

      if ( !v ) this.checkedRows = {};
      else {
         this.checkedRows = this.rowData.reduce( ( a, c, i ) => {
            a[ i ] = true;
            return a;
         }, {} );
      }

      this.root.rerender();
   }
   checkRow( rowIndex: number, override?: boolean ) {
      let value = override !== undefined ? override : this.checkedRows[ rowIndex ];
      value = value === undefined ? true : !value;

      if ( !this.root.options.multiSelect ) {
         if ( this.allRowsChecked ) value = true;
         this.allRowsChecked = false;
         this.checkedRows = {};
      }

      this.checkedRows[ rowIndex ] = value;
      this.checkedRows = { ...this.checkedRows };

      if ( !value && this.allRowsChecked )
         this.allRowsChecked = false;

      if ( Object
         .values( this.checkedRows )
         .filter( Boolean ).length == this.rowCount )
         this.allRowsChecked = true;

      this.root.rerender();
   }
   clickRow( e: Event ) {
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
         data: this.rowData[ row.index ],
         field: row.field,
         index: Number( row.index )
      };

      this.root.publishers.rowClick.next( rowData );

      if ( this.root.options.selectOnClick ) {
         this.checkRow( rowData.index );
      }
   }
   sortRows( field: string ) {
      const { moveColumnApi, resizeColumnApi } = this.root;
      if ( moveColumnApi.moving || resizeColumnApi.resizing ) return;

      const sort = this.root.columnDefinitions.custom[ field ].sort;
      const newSort = !sort ? 'asc' : sort == 'asc' ? 'desc' : null;

      this.root.columnDefinitions.custom = {
         ...this.root.columnDefinitions.custom,
         [ field ]: {
            ...this.root.columnDefinitions.custom[ field ],
            sort: newSort
         }
      };

      this.rowData = [];

      this.getRows( {
         startRow: 0,
         sortModel: this.sortModel
      } );

      this.root.publishers.sortColumn.publish();
   }
   getRows( request: TRequest ) {
      if ( !this.datasource ) return;

      const baseRequestRows = {
         startRow: request.startRow || 0,
         endRow: ( request.startRow || 0 ) + this.root.options.batchSize,
      };

      const baseRequestMisc = {
         sortModel: [],
         filterModel: {},
         /* not sure if this functionality will be implemented
         groupKeys: [],
         pivotCols: [],
         pivotMode: false,
         rowGroupCols: [],
         valueCols: [] */
      };

      request = {
         ...baseRequestMisc,
         ...this.cachedRequest,
         ...baseRequestRows,
         ...request
      };

      if ( this.querying || this.lastRow > -1 ) return;

      ( async () => {
         this.datasource.getRows( {
            request,
            success: this.getRowsSuccess.bind( this ),
            fail: this.getRowsFail.bind( this )
         } );
      } )();

      this.querying = true;
      this.cachedRequest = { ...this.cachedRequest, ...request };
   }
   getRowsSuccess( { rowData, lastRow }: TSuccessParams ) {
      this.lastRow = lastRow;
      this.querying = false;

      this.rowData = [ ...this.rowData, ...rowData ];

      if ( this.allRowsChecked ) {
         this.checkedRows = this.rowData.reduce( ( a, c, i ) => {
            a[ i ] = true;
            return a;
         }, {} );
      }

      this.root.publishers.rowData.next( { rowData, lastRow } );
      this.root.publishers.query.next( this.rowCount );

      this.root.rerender();

      // repeat the request untill view is saturated
      // or last row has been fetched
      if ( lastRow > 0 || this.viewSaturated ) return;
      this.getRows( { startRow: this.rowCount } );
   }
   getRowsFail() {
      throw 'VirtualScrollApi FAILED, method not implemented';
   }
}

class ListWrapperApi extends EventApi {
   root: ListGridApi;
   element: HTMLDivElement | null;
   frameQueue = false;
   resizing = false;
   debounceResize = debounce( this.resizeEnd.bind( this ) );

   constructor ( root: ListGridApi ) { super(); this.root = root; }

   resizeEnd() {
      this.resizing = false;
      this.root.rerender();
   }
   calcWrapperHeight = () => {
      const el = this.element;
      if ( !el ) return;

      requestAnimationFrame( () => {
         if ( this.frameQueue ) return;
         this.frameQueue = true;

         if ( !this.resizing ) {
            this.resizing = true;
            this.root.rerender();
         }

         this.debounceResize();

         const rects = el.getBoundingClientRect();
         this.root.listApi.wrapperWidth = rects.width;
         this.root.listApi.wrapperHeight = rects.height;

         this.frameQueue = false;
      } );
   };
   subscribe() {
      this.subscriptions.push( [ window, 'resize', this.calcWrapperHeight.bind( this ) ] );
      super.subscribe();
   }
}

class ScrollApi extends EventApi {
   root: ListGridApi;
   scrollTop = 0;
   scrollLeft = 0;
   scrollYDirection = 0;
   element: FlexibleHTMLElement | null;
   frameQueue = false;
   get bottomTrigger() {
      if ( this.root.mode == 'normal' ) return false;

      const el = this.element;
      if ( !el ) return false;

      const trigger = Math.ceil(
         el.offsetHeight + this.scrollTop + ( this.root.options.rowHeight * 2 )
      );

      return trigger > el.scrollHeight && this.scrollYDirection > 0;
   }

   constructor ( root: ListGridApi ) { super(); this.root = root; }

   onScroll( e: Event ) {
      requestAnimationFrame( () => {
         if ( this.frameQueue ) return;
         this.frameQueue = true;

         const el = this.element;
         if ( !el ) return;

         const { listApi } = this.root;

         this.scrollYDirection = Math.sign( el.scrollTop - el.lastScrollTop );
         this.scrollTop = el.scrollTop;
         this.scrollLeft = el.scrollLeft;

         /* rerender if scrolling in the X axis */
         if ( el.lastScrollLeft != el.scrollLeft ) {
            this.root.rerender();

            el.lastScrollLeft = el.scrollLeft;
            el.lastScrollTop = el.scrollTop;
            this.frameQueue = false;
            return;
         }

         /* request more data as it hits the bottom of the scroll area */
         if ( this.bottomTrigger ) {
            listApi.getRows( { startRow: listApi.rowData.length } );
            el.lastScrollLeft = el.scrollLeft;
            el.lastScrollTop = el.scrollTop;
            this.frameQueue = false;
            return;
         }

         /* trigger rerender when reaching end of visible rows */
         const moverEl = el.querySelector( '#viewmover' );
         const wrapperRects = el.getBoundingClientRect();
         const moverRects = moverEl?.getBoundingClientRect();
         const rerenderer = this.root.options.listScrollDebounce
            ? this.root.debounceRender
            : this.root.rerender;

         if ( wrapperRects.top < Number( moverRects?.top ) && this.scrollTop > 0 ) {
            rerenderer();
         }

         if ( wrapperRects.bottom > Number( moverRects?.bottom ) ) {
            rerenderer();
         }

         el.lastScrollLeft = el.scrollLeft;
         el.lastScrollTop = el.scrollTop;
         this.frameQueue = false;
      } );
   };
   subscribe() {
      const el = this.element;
      if ( !el ) return;

      el.lastScrollTop = el.scrollTop;
      this.scrollTop = el.scrollTop;
      this.scrollLeft = el.scrollLeft;

      this.subscriptions.push( [ el, 'scroll', this.onScroll.bind( this ) ] );
      super.subscribe();
   }
}

class StyleApi {
   root: ListGridApi;
   get viewportWrapperStyle() {
      const { listApi, listWrapperApi } = this.root;
      if ( listWrapperApi.resizing )
         return { height: 'auto' };

      return {
         willChange: 'height',
         height: `${ listApi.wrapperHeight || 300 }px`,
         contentVisibility: 'auto',
         containIntrinsicSize: `${ listApi.wrapperHeight }px`
      };
   }
   get viewportStyle() {
      const { listApi } = this.root;

      return {
         willChange: 'height',
         height: `${ listApi.totalHeight }px`
      };
   }
   get viewMoverStyle() {
      const { listApi } = this.root;
      return {
         willChange: 'transform',
         transform: `translateY(${ listApi.offsetY }px)`
      };
   }
   get listHeaderStyle() {
      const { scrollApi } = this.root;
      return {
         willChange: 'transform',
         transform: `translateX(${ -scrollApi.scrollLeft }px)`
      };
   }
   get headerMenuStyle() {
      const { columnMenuApi } = this.root;
      return {
         left: `${ columnMenuApi.xy[ 0 ] }px`,
         top: `${ columnMenuApi.xy[ 1 ] }px`,
      };
   }
   get columnGhostStyle() {
      const { moveColumnApi } = this.root;
      return {
         top: `${ moveColumnApi.startPos[ 1 ] - 5 }px`,
         left: `${ moveColumnApi.startPos[ 0 ] - 15 }px`,
         willChange: 'translate',
         transform: `translateX(${ moveColumnApi.offset[ 0 ] }px)` +
            ` translateY(${ moveColumnApi.offset[ 1 ] }px)` +
            ` translateZ(0)`
      };
   }

   constructor ( root: ListGridApi ) { this.root = root; }
}

class SetupApi {
   root: ListGridApi;

   constructor ( root: ListGridApi ) { this.root = root; }

   initialize() {
      const { listWrapperApi, scrollApi } = this.root;
      listWrapperApi.element = this.root.hostEl.querySelector( '#listRowWrapper' );
      scrollApi.element = this.root.hostEl.querySelector( '#viewportWrapper' );
      scrollApi.subscribe();
      listWrapperApi.subscribe();
      listWrapperApi.calcWrapperHeight();
   }
   datasource( datasource: IDatasource ) {
      this.root.listApi.datasource = datasource;
   }
   columnDefinitions( defaultColDefs: IDefaultColDefs, colDefs: IColDefs[] ) {
      const { columnDefinitions } = this.root;
      columnDefinitions.default = defaultColDefs;
      columnDefinitions.base = colDefs;
      columnDefinitions.custom = columnDefinitions.createCustomColDefs();
   }
}

export class ListGridApi {
   mode: ListGridMode = 'ssr';
   hostEl: HTMLElement | ShadowRoot;
   rerender: () => void = () => { };
   debounceRender = debounce( () => this.rerender(), 100 ).bind( this );
   setupApi = new SetupApi( this );
   listApi = new ListApi( this );
   scrollApi = new ScrollApi( this );
   listWrapperApi = new ListWrapperApi( this );
   columnApi = new ColumnApi( this );
   columnDefinitions = new ColumnDefinitions();
   columnMenuApi = new ColumnMenuApi( this );
   moveColumnApi = new MoveColumnApi( this );
   resizeColumnApi = new ResizeColumnApi( this );
   styleApi = new StyleApi( this );
   publishers = {
      moveColumn: new Publisher<any[]>( [] ),
      resizeColumn: new Publisher<any[]>( [] ),
      hideColumn: new Publisher<any[]>( [] ),
      sortColumn: new Publisher<any[]>( [] ),
      rowData: new Publisher<TSuccessParams>( { rowData: [], lastRow: -1 } ),
      query: new Publisher( 0 ),
      rowClick: new Publisher( { data: {}, field: '', index: 0 } )
   };
   options = {
      listScrollDebounce: false,
      multiSelect: false,
      selectOnClick: false,
      batchSize: 100,
      rowHeight: 45
   };
}