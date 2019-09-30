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
function LexUnitAsListItem(props) {
    const luId = props.data.id;

    return (
        <ListItem id={luId} extras="lexunit-detail">
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
function LexUnitsAsList(props) {
    return (
        <DataList data={props.data} idFor={props.idFor}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  ordered={props.ordered}
                  extras='lexunits-container'
                  displayItemAs={props.displayItemAs || LexUnitAsListItem} />
    );
}
                                 
// props:
//   data :: [ Object ], the lex units 
//   displayItemAs (optional) :: Component to render a lexunit as an option
//     Defaults to LexUnitAsOption
function LexUnitsAsSelect(props) {
    return (
        <DataSelect data={props.data}
                    disabledOption='Select a lexical unit'
                    extras='lexunits-container'
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
// These props, if given, will also be passed on to DataTable:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function LexUnitsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || LU_FIELD_MAP}
                   displayFields={props.displayFields || LU_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   className={props.className} extras={props.extras}
                   headClassName={props.headClassName} headExtras={props.headExtras}
                   bodyClassName={props.bodyClassName} bodyExtras={props.bodyExtras} />
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
