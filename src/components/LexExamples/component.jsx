import { examplesQueries } from './actions';
import { selectExamples } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         DefList,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Example objects to their display names.
const EXAMPLE_FIELD_MAP = [
    ['exampleId', 'Example Id'],
    ['text', 'Text'],
    ['frameType', 'Frame Type'],
];
const EXAMPLE_ALL_FIELDS = EXAMPLE_FIELD_MAP.map(entry => entry[0]);

// Display components for individual examples:

// props:
//   data :: DataObject, an example 
function ExampleAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem id={props.data.exampleId}
                  extras="examples-detail">
          {props.data.frameType} &ndash; {props.data.text}  
        </ListItem>
    );
}

// Display components for an array of example objects:

// props:
//   data :: [ DataObject ], the examples
function ExamplesAsDefList(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples-container" terms={terms} defs={defs}/>
    );
}


// props:
//   data :: [ DataObject ], the examples
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render an example as a list item
//      Defaults to ExampleAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function ExamplesAsList(props) {
    return (
        <DataList data={props.data} idFor={props.idFor}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  ordered={props.ordered}
                  extras="examples-container"
                  displayItemAs={props.displayItemAs || ExampleAsListItem}/>
    );
}


// props:
//   data :: [ DataObject ], the examples 
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
var ExamplesContainer = dataContainerFor('Examples', selectExamples, example => example.exampleId);
ExamplesContainer = connectWithApiQuery(ExamplesContainer, examplesQueries.queryActions);

export { ExamplesContainer,
         ExamplesAsDefList,
         ExamplesAsList,
         ExamplesAsTable }; 

