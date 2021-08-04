import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { FrostListGrid, VirtualScrollApi } from "../../lit-components/src/components/frost-list-grid/FrostListGrid";
import { FrostPreviewOrOpen } from "../../lit-components/src/components/frost-list-grid/field-renderers/FrostPreviewOrOpen";
FrostListGrid;
FrostPreviewOrOpen;

export default {
   title: "Frostflow/ListGrid",
   argTypes: {
      mode: {
         options: [ 'normal', 'ssr' ],
         control: { type: 'select' }
      }
   }
} as Meta;


async function asyncRes( promise: Promise<any>, finallyCb?: Function ) {
   try {
      const data = await promise;
      return [ data, null ];
   } catch ( error ) {
      console.error( error );
      return [ null, error ];
   } finally {
      if ( finallyCb )
         finallyCb();
   }
}

const getRowsAsync = async ( { request, fail, success }: any ) => {
   const url: RequestInfo = `//localhost:8025/postgres/olympic_winners`;
   const fetchRequest: RequestInit = {
      method: "post",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify( request )
   };

   const [ res, err ] = await asyncRes( fetch( url, fetchRequest ) );
   if ( err ) { console.error( err ); fail(); return; }

   const response = await res.json();

   success( {
      rowData: response.rows || [],
      lastRow: response.lastRow || 0,
   } );
};

const defaultColDefs = {
   minWidth: 100,
   sortable: true,
   resizable: true,
   menu: true
};

const colDefs = [
   {
      label: '',
      field: '',
      minWidth: 80,
      resizable: false,
      moveable: false,
      menu: true,
      checkbox: true,
      renderer: ( rowData ) => html`
         <frost-preview-or-open
            .rowData=${ rowData }
            @onOpen=${ ( e ) => console.log( 'on open event', e ) }
            @onPreview=${ ( e ) => console.log( 'on preview event', e ) }
         ></frost-preview-or-open>`
      // renderer: ( rowData ) => html`
      // <div>
      //    <style>
      //       .icon {
      //          height: 1rem;
      //          width: 1rem;
      //          opacity: 0.4;
      //          transition: opacity 0.2s linear;
      //          color: pink;
      //       }
      //       .icon:hover {
      //          opacity: 1
      //       }
      //    </style>
      //    <div class="icon">
      //       <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      //          <path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
      //       </svg>
      //    </div>
      // </div>
      // `
   },
   {
      label: 'AthleteLongLableTestAthleteLongLableTest',
      field: 'athlete',
      minWidth: 150,
      menu: false,
   },
   {
      label: 'Sport',
      field: 'sport',
   },
   {
      label: 'Country',
      field: 'country'
   },
   {
      label: 'Age',
      field: 'age',
   },
   {
      label: 'Year',
      field: 'year',
   },
   {
      label: 'Date',
      field: 'date',
   },
   {
      label: 'Gold',
      field: 'gold',
   },
   {
      label: 'Silver',
      field: 'silver',
   },
   {
      label: 'Bronze',
      field: 'bronze',
   },
   {
      label: 'Total',
      field: 'total',
   },
   {
      label: '1',
      field: '1',
   },
   {
      label: '2',
      field: '2',
   },
   {
      label: '3',
      field: '3',
   },
   {
      label: '4',
      field: '4',
   },
   {
      label: '5',
      field: '5',
   },
   {
      label: '6',
      field: '6',
   },
   {
      label: '7',
      field: '7',
   },
   {
      label: '8',
      field: '8',
   },
   {
      label: '9',
      field: '9',
   },
   {
      label: '10',
      field: '10',
   },
   {
      label: '11',
      field: '11',
   },
   {
      label: '12',
      field: '12',
   },
   {
      label: '13',
      field: '13',
   },
   {
      label: '14',
      field: '14',
   },
   {
      label: '15',
      field: '15',
   },
   {
      label: '16',
      field: '16',
   }
];

const api = new VirtualScrollApi();
api.listApi.setColumnDefinitions( defaultColDefs, colDefs );
api.listApi.setDatasource( { getRows: getRowsAsync } );

// api.publishers.rowClick.subscribe( ( rowData ) => {
//    console.log( 'from subscription', rowData );
// } );


const Template: Story = () => html`
   <div style="display: grid;height:92vh;">
      <frost-list-grid .api=${ api }></frost-list-grid>
   </div>
`;

export const Default = Template.bind( {} );
Default.args = {
   mode: 'ssr'
};