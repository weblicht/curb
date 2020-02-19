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

import { conRelsQueries } from './actions';
import { selectConRels } from './selectors';
import { DataList, DataTable, ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';
import SI from 'seamless-immutable';

export const CON_REL_FIELD_MAP = [
    ['id', 'ConRel Id'],
    ['relType', 'Type'],
    ['fromOrthForms', 'From Orth Forms'],
    ['toOrthForms', 'To Orth Forms'],
    ['numHyponyms', 'Hyponyms'],
    ['canBeDeleted', 'Can be deleted'],
    ['fromSynsetId', 'From Synset'],
    ['toSynsetId', 'To Synset'],
];
export const CON_REL_ALL_FIELDS = CON_REL_FIELD_MAP.map( entry => entry[0] );

// props:
//   data :: DataObject, a conrel
// className and extras props, if given, will be passed on to ListItem
function ConRelAsListItem(props) {
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.relType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}
                  className={props.className}
                  extras={props.extras}>
          {`Synset ${props.data.fromSynsetId} ${relDisplay} Synset ${props.data.toSynsetId}`}
        </ListItem>
    ); 
}


// props:
//   data :: [ DataObject ], the conrels
//   ordered :: Bool, whether the list should be ordered
//   displayItemAs (optional) :: Component to render a ConRel as a list item
//      Defaults to ConRelAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function ConRelsAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || ConRelAsListItem} />
    );
}

// props:
//   data :: [ DataObject ], the conrels
//   fieldMap (optional) :: [ [String, String] ], maps ConRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   sortFields (optional) :: [ String ], field names to display sort buttons for
//   sortWith (required for sortFields) :: callback that receives sort comparison function
//   displayItemAs (optional) :: Component to render a ConRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function ConRelsAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || CON_REL_FIELD_MAP}
                   displayFields={props.displayFields || CON_REL_ALL_FIELDS} />
    );
}

// props:
//   queryParams :: { synsetId: ... }
var ConRelsContainer = dataContainerFor('ConRels', selectConRels);
ConRelsContainer = connectWithApiQuery(ConRelsContainer, conRelsQueries.queryActions);

export { ConRelsContainer,
         ConRelsAsList,
         ConRelsAsTable,
       }; 

