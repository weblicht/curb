import { conRelsActions } from './actions';
import { selectConRels } from './selectors';
import { DataList, DataTable } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

const CON_REL_FIELD_MAP = [
    ['id', 'ConRel Id'],
    ['conRelType', 'Type'],
    ['allOrthForms', 'All Orth Forms'],
    ['numHyponyms', 'Hyponyms'],
    ['canBeDeleted', 'Can be deleted'],
    ['originatingSynsetId', 'From Synset'],
    ['relatedSynsetId', 'To Synset'],
];
const CON_REL_ALL_FIELDS = CON_REL_FIELD_MAP.map( entry => entry[0] );

function ConRelAsListItem(props) {
    // TODO: what is a sensible default to provide here?
    return null; 
}

function ConRelAsTableRow(props) {
    // TODO: what is a sensible default to provide here?
    return null;
}

// props:
//   data :: [ Object ], the conrels
//   ordered :: Bool, whether the list should be ordered
//   unitsDisplayAs (optional) :: Component to render a ConRel as a list item
//      Defaults to ConRelAsListItem
function ConRelsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  displayItemAs={props.unitsDisplayAs || ConRelAsListItem} />
    );
}

// props:
//   data :: [ Object ], the conrels
//   fieldMap (optional) :: [ [String, String] ], maps ConRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   unitsDisplayAs (optional) :: Component to render a ConRel as a table row
//      Defaults to ConRelAsTableRow
function ConRelsAsTable(props) {
    return (
        <DataTable data={props.data}
                   className='conrels-container'
                   fieldMap={props.fieldMap || CON_REL_FIELD_MAP}
                   displayFields={props.displayFields || CON_REL_ALL_FIELDS}
                   displayRowAs={props.unitsDisplayAs || ConRelAsTableRow}
        />
    );
}

// props:
//   fetchParams :: { synsetId: ... }
var ConRelsContainer = dataContainerFor('ConRels', selectConRels);
ConRelsContainer = connectWithApi(conRelsActions.fetchActions)(ConRelsContainer);

export { ConRelsContainer,
         ConRelsAsList
       };

