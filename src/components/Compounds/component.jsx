import { compoundsQueries } from './actions';
import { selectCompounds } from './selectors';
import { DataList,
         DataSelect,
         DataTable,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

// Maps all data fields in Compound objects to their display names.
const COMPOUND_FIELD_MAP = [
    // id === lexUnitId; see comment in reducer
    ['id', 'Id'], 
    ['lexUnitId', 'LexUnit Id'],  
    ['splits', 'Compound?'], // TODO: reasonable field and display names
    // 'id' below refers to the id of the lexunit corresponding to the
    // head or modifier.
    // the 'root' of the compound, to which modifiers are added:
    ['head', 'Head'], 
    ['idHead', 'Head Id'],
    ['propertyHead', 'Head Property'],
    // up to 2 modifiers, which may each have up to 3 corresponding lexunits:
    ['mod1', 'Modifier 1'],
    ['categoryMod1', 'Modifier 1 Category'],
    ['propertyMod1', 'Modifier 1 Property'],
    ['idMod1', 'Modifier 1 Id'],
    ['id2Mod1', 'Modifier 1 Id 2'],
    ['id3Mod1', 'Modifier 1 Id 3'],
    ['mod2', 'Modifier 2'],
    ['categoryMod2', 'Modifier 2 Category'],
    ['propertyMod2', 'Modifier 2 Property'],
    ['idMod2', 'Modifier 2 Id'],
    ['id2Mod2', 'Modifier 2 Id 2'],
    ['id3Mod2', 'Modifier 2 Id 3'],
];
const COMPOUND_ALL_FIELDS = COMPOUND_FIELD_MAP.map(entry => entry[0]);

// TODO: are these correct?
const COMPOUND_NOT_SPLIT_VALUES =
      { 0: 'Undecided',
        1: 'Do not split',
        2: 'Split'
      };

// Display components for individual compounds:

// Display components for an array of compound objects:

// props:
//   data :: [ DataObject ], the compounds 
//   fieldMap (optional) :: [ [String, String] ], maps compound field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a compound as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function CompoundsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || COMPOUND_FIELD_MAP}
                   displayFields={props.displayFields || COMPOUND_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras="compounds-container"
        />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var CompoundsContainer = dataContainerFor('Compounds', selectCompounds, compound => compound.id);
CompoundsContainer = connectWithApiQuery(CompoundsContainer, compoundsQueries.queryActions);

export { CompoundsContainer,
         CompoundsAsTable }; 

