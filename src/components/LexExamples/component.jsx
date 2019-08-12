import { examplesActions } from './actions';
import { selectExamples } from './selectors';
import { DataTable, DefList } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Example objects to their display names.
const EXAMPLE_FIELD_MAP = [
    ['exampleId', 'Example Id'],
    ['text', 'Text'],
    ['frameType', 'Frame Type'],
];
const EXAMPLE_ALL_FIELDS = EXAMPLE_FIELD_MAP.map(entry => entry[0]);

// props:
//   data :: [ Object ], the examples 
//   fieldMap (optional) :: [ [String, String] ], maps example field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an example as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function ExamplesAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || EXAMPLE_FIELD_MAP}
                   displayFields={props.displayFields || EXAMPLE_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras="examples-container"
        />
    );
}
 
// props:
//   fetchParams :: { lexUnitId: ... }
function ExamplesAsDefList(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples" terms={terms} defs={defs}/>
    );
}

var ExamplesContainer = dataContainerFor('Examples', selectExamples);
ExamplesContainer = connectWithApi(examplesActions.fetchActions)(ExamplesContainer);

export { ExamplesContainer, ExamplesAsDefList, ExamplesAsTable }; 

