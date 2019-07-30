import { lexUnitsActions } from './actions';
import { selectLexUnits } from './selectors';
import { DataTable, DataTableRow, DataList, DataSelect, makeDisplayableContainer } from '../GenericDisplay/component';
import { WiktionaryDefs } from '../WiktionaryDefs/component';
import { ILIDefs } from '../ILIDefs/component';
import { Examples } from '../LexExamples/component';
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
        <li key={luId} className="lexunit-detail">
          {props.data.orthForm}
          <Examples fetchParams={{lexUnitId: luId}}/>
          <WiktionaryDefs fetchParams={{lexUnitId: luId}}/>
          <ILIDefs fetchParams={{lexUnitId: luId}}/>
        </li>
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

// TODO: 
// present a lexunit in a form for editing
// function LexUnitAsForm 

// props:
//   displayAs :: Component to render a lex unit object for display
const LexUnitDetail = makeDisplayableContainer('LexUnitDetail');

// TODO: there is a hole in the API. We can't at present request lex
// unit details by ID.  So we need to pass data= directly from a
// parent, e.g., LexUnitsContainer, and can't wrap LexUnitDetail with
// connectWithApi().

// Display components for an array of lex unit objects:

// props:
//   data :: [ Object ], the lex units 
//   orderd :: Bool, whether or not to display the 
//   unitsDisplayAs (optional) :: Component to render a lexunit as a list item
//     Defaults to LexUnitAsListItem.
function LexUnitsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  className='lexunits-container'
                  displayItemAs={props.unitsDisplayAs || LexUnitAsListItem} />
    );
}
                                 
// props:
//   data :: [ Object ], the lex units 
//   unitsDisplayAs (optional) :: Component to render a lexunit as an option
//     Defaults to LexUnitAsOption
function LexUnitsAsSelect(props) {
    return (
        <DataSelect data={props.data}
                    disabledOption='Select a lexical unit'
                    className='lexunits-container'
                    displayAs={props.unitsDisplayAs || LexUnitAsOption} />
    );
}

// props:
//   data :: [ Object ], the lex units 
//   fieldMap
//   displayFields 
//   unitsDisplayAs (optional) :: Component to render a lexunit as a table row
//     Defaults to LexUnitAsTableRow
function LexUnitsAsTable(props) {
    const fieldMap = props.fieldMap || LU_FIELD_MAP;
    const displayFields = props.displayFields || LU_ALL_FIELDS;
    const RowComponent = props.unitsDisplayAs || LexUnitAsTableRow;
    
    return (
        <DataTable className='lexunits-container'
                   data={props.data}
                   fieldMap={fieldMap}
                   displayFields={displayFields}
                   displayRowAs={RowComponent}
        />
    );
}


// props:
//   fetchParams :: { synsetId: ... }
//   displayAs :: Component to render a list of lex units
//   unitsDisplayAs (optional) :: Component to render each lex unit
var LexUnitsContainer = makeDisplayableContainer('LexUnitsContainer');
LexUnitsContainer = connectWithApi(selectLexUnits,
                                   lexUnitsActions.fetchActions
                                  )(LexUnitsContainer);


export { LexUnitsContainer,
         LexUnitsAsList,
         LexUnitsAsSelect,
         LexUnitsAsTable
       };
