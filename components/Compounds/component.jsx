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

import { compoundsQueries } from './actions';
import { selectCompounds } from './selectors';
import { DataList,
         DataTable,
         DefList,
         List,
         ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';
import { withNullAsString } from '../../helpers';

import React from 'react';

// Maps all data fields in Compound objects to their display names.
export const COMPOUND_FIELD_MAP = [
    // id === lexUnitId; see comment in reducer
    ['id', 'Id'], 
    ['lexUnitId', 'LexUnit Id'],  
    ['splits', 'Compound?'],
    ['head', 'Head'], 
    ['modifier1', 'Modifier 1'], 
    ['modifier2', 'Modifier 2'], 
];
export const COMPOUND_ALL_FIELDS = COMPOUND_FIELD_MAP.map(entry => entry[0]);

// Display components for individual compound constituents:

function ConstituentAsDefList(props) {
    const item = props.data;
    if (props.isHead)
        return (<DefList terms={['Orth Form', 'Property']} defs={[item.orthForm, item.property]}/>);
    else
        return (<DefList terms={['Orth Form', 'Property', 'Category']} defs={[item.orthForm, item.property, item.category]}/>);
}

// Display components for individual compounds:
//   data :: DataObject, the compound 
function CompoundAsTableRow(props) {
    const displayFields = props.displayFields || COMPOUND_ALL_FIELDS;
    return (
        <tr id={props.data.id} key={props.data.id}>
          {displayFields.map(
              function(field) {
                  switch(field) {
                  case 'head':
                      return <td><ConstituentAsDefList isHead={true} data={props.data.head}/></td>;
                  case 'modifier1':
                      return <td><ConstituentAsDefList isHead={false} data={props.data.modifier1}/></td>;
                  case 'modifier2':
                      return <td><ConstituentAsDefList isHead={false} data={props.data.modifier2}/></td>;
                  default:
                      return <td>{withNullAsString( props.data[field] )}</td>;
                  }
              }
          )}
        </tr>
    );
}

// props:
//   data :: DataObject, the compound 
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function CompoundAsGrid(props) {
    if (!(props.data.splits)) return null;
    const fieldMap = [['title', ''],
                      ['orthForm', 'Orth Form'],
                      ['property', 'Property'],
                      ['category', 'Category']];
    const displayFields = fieldMap.map(field => field[0]);

    const head = props.data.head.merge({title: 'Head'});
    const mod1 = props.data.modifier1.merge({title: 'Modifier 1'});
    const mod2 = props.data.modifier2.merge({title: 'Modifier 2'});
    const constituents = [head, mod1, mod2];
    
    return (
        <DataTable {...props}
                   data={constituents} idFor={obj => obj.id}
                   fieldMap={fieldMap} displayFields={displayFields} />
    );
}

// Display components for an array of compound objects:

// props:
//   data :: [ DataObject ], the compounds 
// Other props will also be passed on to DataList, including:
//   className, extras, itemClassName, itemExtras   
function CompoundsAsList(props) {
    return (
        <DataList {...props} displayItemAs={props.displayItemAs || CompoundAsGrid} />
    );
}

// props:
//   data :: [ DataObject ], the compounds 
//   fieldMap (optional) :: [ [String, String] ], maps compound field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   sortFields (optional) :: [ String ], field names to display sort buttons for
//   sortWith (required for sortFields) :: callback that receives sort comparison function
//   displayItemAs (optional) :: Component to render a compound as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
// Other props will also be passed on to DataTable, including:
//   className, extras
//   headClassName, headExtras
//   bodyClassName, bodyExtras 
function CompoundsAsTable(props) {
    return (
        <DataTable {...props}
                   fieldMap={props.fieldMap || COMPOUND_FIELD_MAP}
                   displayFields={props.displayFields || COMPOUND_ALL_FIELDS}
                   displayItemAs={props.displayItemAs || CompoundAsTableRow} />
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var CompoundsContainer = dataContainerFor('Compounds', selectCompounds, compound => compound.id);
CompoundsContainer = connectWithApiQuery(CompoundsContainer, compoundsQueries.queryActions);

export { CompoundsContainer,
         CompoundsAsList,
         CompoundsAsTable,
         CompoundAsGrid
       }; 

