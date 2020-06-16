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

import { lexUnitsQueries } from './actions';
import { dataContainerFor } from '../DataContainer/component';
import { selectLexUnits } from './selectors';
import { DataTable,
         DataTableRow,
         DataList,
         DataSelect,
         ListItem } from '../GenericDisplay/component';
import { connectWithApiQuery } from '../APIWrapper';
import { withNullAsString } from '../../helpers';

import React from 'react';
import { connect } from 'react-redux';

// Constants:

// Maps all data fields in lex unit objects to their display names.
export const LU_FIELD_MAP = [
    ['id', 'Lex Unit Id'],
    ['synsetId', 'Synset Id'],
    ['orthForm', 'Orth Form'],
    ['orthVar', 'Orth Var'],
    ['oldOrthForm', 'Old Orth Form'],
    ['oldOrthVar', 'Old Orth Var'],
    ['source', 'Source'],
    ['namedEntity', 'Named Entity'],
    ['artificial', 'Artificial'],
    ['styleMarking', 'Style Marking'],
    ['comment', 'Comment']
];
// All data field names:
export const LU_ALL_FIELDS = LU_FIELD_MAP.map( entry => entry[0] );

// Display components for individual lex units:

// props:
//   data :: Object, a lex unit
function LexUnitAsOption(props) {
    return (
        <option key={props.data.id} value={props.data.id} className="lexunit-detail">
          { withNullAsString(props.data.orthForm) } 
        </option>
    );

}

// props:
//   data :: Object, a lex unit
// className and extras props, if given, will be passed on to ListItem
function LexUnitAsListItem(props) {
    return (
        <ListItem key={props.data.id} 
                  className={props.className}
                  extras={props.extras}>
          {props.data.orthForm}
        </ListItem>
    );
}

// Display components for an array of lex unit objects:

// props:
//   data :: [ Object ], the lex units 
//   orderd :: Bool, whether or not to display the 
//   displayItemAs (optional) :: Component to render a lexunit as a list item
//     Defaults to LexUnitAsListItem.
//     Data container control props (.choose, etc.), if given, will be passed on
//     to this component.
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function LexUnitsAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || LexUnitAsListItem} />
    );
}
                                 
// props:
//   data :: [ Object ], the lex units 
//   displayItemAs (optional) :: Component to render a lexunit as an option
//     Defaults to LexUnitAsOption
// Other props will also be passed on to DataSelect
function LexUnitsAsSelect(props) {
    return (
        <DataSelect {...props}
                    disabledOption='Select a lexical unit'
                    displayAs={props.displayItemAs || LexUnitAsOption} />
    );
}

// props:
//   data :: [ Object ], the lex units 
//   fieldMap
//   displayFields 
//   displayItemAs (optional) :: Component to render a lexunit as a table row
//     Data container control props (.choose, etc.), if given, will be passed on
//     to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function LexUnitsAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || LU_FIELD_MAP}
                   displayFields={props.displayFields || LU_ALL_FIELDS} />
    );
}


// props:
//   queryParams :: { synsetId: ... }
//   displayAs :: Component to render a list of lex units
//   displayItemAs (optional) :: Component to render each lex unit
var LexUnitsContainer = dataContainerFor('LexUnits', selectLexUnits);
LexUnitsContainer = connectWithApiQuery(LexUnitsContainer, lexUnitsQueries.queryActions);


export { LexUnitsContainer,
         LexUnitsAsList,
         LexUnitsAsSelect,
         LexUnitsAsTable
       };
