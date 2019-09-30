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

import { wiktDefsQueries } from './actions';
import { selectWiktDefs } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         DefList,
         ListItem } from '../GenericDisplay/component';
import { connectWithApiQuery } from '../APIWrapper';
import { dataContainerFor } from '../DataContainer/component';

import React from 'react';

// Maps all data fields in wiktionary def objects to their display names.
export const WIKTDEF_FIELD_MAP = [
    ['wikiRecordId', 'Wiki Id'],
    ['lexUnitId', 'LexUnit Id'],
    ['orthForm', 'Orth Form'],
    ['wknId', 'WKN Id'],
    ['wknSenseId', 'WKN Sense Id'],
    ['wknParaphrase', 'WKN Paraphrase'],
    ['edited', 'Edited']
];
export const WIKTDEF_ALL_FIELDS = WIKTDEF_FIELD_MAP.map(entry => entry[0]);


// Display components for individual wiktdefs:

// props:
//   data :: DataObject, a wiktdef
// className and extras props, if given, will be passed on to ListItem
function WiktDefAsListItem(props) {
    return (
        // TODO: is this a reasonable default?
        <ListItem id={props.data.wikiRecordId}
                  className={props.className}
                  extras={props.extras}>
          {props.data.orthForm}: {props.data.wknParaphrase}
        </ListItem>
    );
}

// Display components for an array of wiktdef objects:

// props:
//   data :: [ DataObject ], the wiktdefs 
function WiktDefsAsDefList(props) {
    const terms = props.data.map( d => d.orthForm );
    const defs = props.data.map( d => d.wknParaphrase ); 
    return (
        <DefList className="wiktionary-container" terms={terms} defs={defs}/>
    );
}

// props:
//   data :: [ DataObject ], the wiktdefs
//   ordered (optional) :: Bool, whether the list should be ordered or unordered
//   displayItemAs (optional) :: Component to render a wiktdef as a list item
//      Defaults to WiktDefAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// These props, if given, will also be passed on to DataList:
//   className, extras, itemClassName, itemExtras   
function WiktDefsAsList(props) {
    return (
        <DataList data={props.data} idFor={props.idFor}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  ordered={props.ordered}
                  displayItemAs={props.displayItemAs || WiktDefAsListItem}
                  className={props.className}
                  extras={props.extras}
                  itemClassName={props.itemClassName}
                  itemExtras={props.itemExtras} />
    );
}

// props:
//   data :: [ DataObject ], the wiktdefs 
//   fieldMap (optional) :: [ [String, String] ], maps wiktdef field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an wiktdef as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// These props, if given, will also be passed on to DataTable:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function WiktDefsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || WIKTDEF_FIELD_MAP}
                   displayFields={props.displayFields || WIKTDEF_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   className={props.className} extras={props.extras}
                   headClassName={props.headClassName} headExtras={props.headExtras}
                   bodyClassName={props.bodyClassName} bodyExtras={props.bodyExtras} />
    );
}


// props:
//   queryParams :: { lexUnitId: ... }
var WiktionaryDefsContainer = dataContainerFor('WiktionaryDefs', selectWiktDefs,
                                               wd => wd.wikiRecordId); // TODO: is this the right id field?? 
WiktionaryDefsContainer = connectWithApiQuery(WiktionaryDefsContainer, wiktDefsQueries.queryActions);

export { WiktionaryDefsContainer,
         WiktDefsAsDefList,
         WiktDefsAsList,
         WiktDefsAsTable };
