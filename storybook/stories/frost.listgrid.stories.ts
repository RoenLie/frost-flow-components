import { Story, Meta } from "@storybook/web-components";
import { html } from "lit";
import { VirtualScrollApi } from "../../lit-components/src/components/frost-list-grid/FrostListGridApi";
import { FrostListGrid } from "../../lit-components/index";
FrostListGrid;

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
   // success( {
   //    rowData: [ {} ],
   //    lastRow: 1,
   // } );
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
      actions: [
         { icon: 'eye_regular' },
         { icon: 'box_open_solid' }
      ]
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


const Template: Story = () => html`
   <frost-listgrid .api=${ api }></frost-listgrid>
`;

export const Default = Template.bind( {} );
Default.args = {
   mode: 'ssr'
};