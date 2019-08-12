import { conRelsActions } from './actions';
import { selectConRels } from './selectors';
import { DataList, DataTable, ListItem } from '../GenericDisplay/component';
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
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.conRelType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}>
          {`Synset ${props.data.originatingSynsetId} ${relDisplay} Synset ${props.data.relatedSynsetId}`}
        </ListItem>
    ); 
}


// props:
//   data :: [ Object ], the conrels
//   ordered :: Bool, whether the list should be ordered
//   displayItemAs (optional) :: Component to render a ConRel as a list item
//      Defaults to ConRelAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function ConRelsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  displayItemAs={props.displayItemAs || ConRelAsListItem} />
    );
}

// props:
//   data :: [ Object ], the conrels
//   fieldMap (optional) :: [ [String, String] ], maps ConRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a ConRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function ConRelsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || CON_REL_FIELD_MAP}
                   displayFields={props.displayFields || CON_REL_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras='conrels-container'
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

