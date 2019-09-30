// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

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
export const EXAMPLE_FIELD_MAP = [
    ['exampleId', 'Example Id'],
    ['text', 'Text'],
    ['frameType', 'Frame Type'],
];
export const EXAMPLE_ALL_FIELDS = EXAMPLE_FIELD_MAP.map(entry => entry[0]);

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
// These props, if given, will also be passed on to DataTable:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function ExamplesAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || EXAMPLE_FIELD_MAP}
                   displayFields={props.displayFields || EXAMPLE_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   className={props.className} extras={props.extras}
                   headClassName={props.headClassName} headExtras={props.headExtras}
                   bodyClassName={props.bodyClassName} bodyExtras={props.bodyExtras} />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var ExamplesContainer = dataContainerFor('Examples', selectExamples, example => example.exampleId);
ExamplesContainer = connectWithApiQuery(ExamplesContainer, examplesQueries.queryActions);

export { ExamplesContainer,
         ExamplesAsDefList,
         ExamplesAsList,
         ExamplesAsTable }; 

