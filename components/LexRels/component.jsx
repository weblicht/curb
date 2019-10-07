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

import { lexRelsQueries } from './actions';
import { selectLexRels } from './selectors';
import { DataList, DataTable, ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

export const LEX_REL_FIELD_MAP = [
    ['id', 'LexRel Id'],
    ['relType', 'Type'],
    ['orthForm', 'Orth Form'],
    ['fromLexUnitId', 'From Lex Unit'],
    ['toLexUnitId', 'To Lex Unit'],
];
export const LEX_REL_ALL_FIELDS = LEX_REL_FIELD_MAP.map( entry => entry[0] );

// props:
//   data: DataObject, a lexrel
// className and extras props, if given, will be passed on to ListItem
function LexRelAsListItem(props) {
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.relType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {`LexUnit ${props.data.fromLexUnitId} ${relDisplay} LexUnit ${props.data.toLexUnitId}`}
        </ListItem>
    ); 
}


// props:
//   data :: [ DataObject ], the lexrels
//   ordered :: Bool, whether the list should be ordered
//   displayItemAs (optional) :: Component to render a LexRel as a list item
//      Defaults to LexRelAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// These props, if given, will also be passed on to DataList:
//   className, extras, itemClassName, itemExtras   
function LexRelsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  displayItemAs={props.displayItemAs || LexRelAsListItem}
                  className={props.className}
                  extras={props.extras}
                  itemClassName={props.itemClassName}
                  itemExtras={props.itemExtras} />
    );
}

// props:
//   data :: [ DataObject ], the lexrels
//   fieldMap (optional) :: [ [String, String] ], maps LexRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a LexRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// These props, if given, will also be passed on to DataTable:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function LexRelsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || LEX_REL_FIELD_MAP}
                   displayFields={props.displayFields || LEX_REL_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   className={props.className} extras={props.extras}
                   headClassName={props.headClassName} headExtras={props.headExtras}
                   bodyClassName={props.bodyClassName} bodyExtras={props.bodyExtras} />
    );
}

// props:
//   queryParams :: { lexUnitId: ... }
var LexRelsContainer = dataContainerFor('LexRels', selectLexRels);
LexRelsContainer = connectWithApiQuery(LexRelsContainer, lexRelsQueries.queryActions);

export { LexRelsContainer,
         LexRelsAsList,
         LexRelsAsTable
       };

