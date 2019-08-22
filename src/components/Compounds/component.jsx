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
const COMPOUND_FIELD_MAP = [
    // id === lexUnitId; see comment in reducer
    ['id', 'Id'], 
    ['lexUnitId', 'LexUnit Id'],  
    ['splits', 'Compound?'], // TODO: reasonable field and display names
    // 'id' below refers to the id of the lexunit corresponding to the
    // head or modifier.
    // the 'root' of the compound, to which modifiers are added:
    ['head', 'Head'], 
    ['modifier1', 'Modifier 1'], 
    ['modifier2', 'Modifier 2'], 
];
const COMPOUND_ALL_FIELDS = COMPOUND_FIELD_MAP.map(entry => entry[0]);

// Display components for individual compound constituents:

function ConstituentAsDefList(props) {
    const item = props.data;
    if (props.isHead)
        return (<DefList terms={['Lemma', 'Property']} defs={[item.lemma, item.property]}/>);
    else
        return (<DefList terms={['Lemma', 'Property', 'Category']} defs={[item.lemma, item.property, item.category]}/>);
}

// Display components for individual compounds:

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
function CompoundAsGrid(props) {
    if (!(props.data.splits)) return null;
    const fieldMap = [['title', ''],
                      ['lemma', 'Lemma'],
                      ['property', 'Property'],
                      ['category', 'Category']];
    const displayFields = fieldMap.map(field => field[0]);

    const head = props.data.head.merge({title: 'Head'});
    const mod1 = props.data.modifier1.merge({title: 'Modifier 1'});
    const mod2 = props.data.modifier2.merge({title: 'Modifier 2'});
    const constituents = [head, mod1, mod2];
    
    return (
        <DataTable data={constituents} idFor={obj => obj.id}
                   fieldMap={fieldMap} displayFields={displayFields}
                   extras='compound-detail'/>
    );
}

// Display components for an array of compound objects:

// props:
//   data :: [ DataObject ], the compounds 
function CompoundsAsList(props) {
    return (
        <DataList data={props.data} idFor={props.idFor}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  displayItemAs={props.displayItemAs || CompoundAsGrid}
                  extras='compounds-container'/>
    );
}

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
                   displayItemAs={props.displayItemAs || CompoundAsTableRow}
                   extras='compounds-container'/>
    );
}
 
// props:
//   queryParams :: { lexUnitId: ... }
var CompoundsContainer = dataContainerFor('Compounds', selectCompounds, compound => compound.id);
CompoundsContainer = connectWithApiQuery(CompoundsContainer, compoundsQueries.queryActions);

export { CompoundsContainer,
         CompoundsAsList,
         CompoundsAsTable }; 

