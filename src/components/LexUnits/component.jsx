import { lexUnitsActions } from './actions';
import { dataContainerFor } from '../DataContainer/component';
import { selectLexUnits } from './selectors';
import { DataTable,
         DataTableRow,
         DataList,
         DataSelect,
         ListItem } from '../GenericDisplay/component';
import { connectWithApi } from '../APIWrapper';
import { withNullAsString } from '../../helpers';

import React from 'react';
import { connect } from 'react-redux';

// Constants:

// Maps all data fields in lex unit objects to their display names.
const LU_FIELD_MAP = [
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
const LU_ALL_FIELDS = LU_FIELD_MAP.map( entry => entry[0] );

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

// props:
//   data :: Object, a lex unit
//   displayFields :: [ String ], a list of field names in the lex unit object to display
function LexUnitAsTableRow(props) {
    // display all data fields by default:
    const displayFields = props.displayFields || LU_ALL_FIELDS;

    return (
        <DataTableRow data={props.data} displayFields={displayFields}
                      className="lexunit-detail" />
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
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
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
//     Defaults to LexUnitAsTableRow
function LexUnitsAsTable(props) {
    const fieldMap = props.fieldMap || LU_FIELD_MAP;
    const displayFields = props.displayFields || LU_ALL_FIELDS;
    const RowComponent = props.displayItemAs || LexUnitAsTableRow;
    
    return (
        <DataTable data={props.data}
                   fieldMap={fieldMap}
                   displayFields={displayFields}
                   displayItemAs={RowComponent}
                   extras='lexunits-container' 
        />
    );
}


// props:
//   fetchParams :: { synsetId: ... }
//   displayAs :: Component to render a list of lex units
//   displayItemAs (optional) :: Component to render each lex unit
var LexUnitsContainer = dataContainerFor('LexUnits', selectLexUnits);
LexUnitsContainer = connectWithApi(lexUnitsActions.fetchActions)(LexUnitsContainer);


export { LexUnitsContainer,
         LexUnitsAsList,
         LexUnitsAsSelect,
         LexUnitsAsTable
       };
