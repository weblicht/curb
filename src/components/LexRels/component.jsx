import { lexRelsQueries } from './actions';
import { selectLexRels } from './selectors';
import { DataList, DataTable, ListItem } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApiQuery } from '../APIWrapper';

import React from 'react';

const LEX_REL_FIELD_MAP = [
    ['id', 'LexRel Id'],
    ['lexRelType', 'Type'],
    ['orthForm', 'Orth Form'],
    ['originatingLexUnitId', 'From Lex Unit'],
    ['relatedLexUnitId', 'To Lex Unit'],
];
const LEX_REL_ALL_FIELDS = LEX_REL_FIELD_MAP.map( entry => entry[0] );

function LexRelAsListItem(props) {
    // TODO: is there a more sensible default to provide here?
    const relDisplay = props.data.lexRelType.replace('_', ' ');
    return (
        <ListItem id={props.data.id}>
          {`LexUnit ${props.data.originatingLexUnitId} ${relDisplay} LexUnit ${props.data.relatedLexUnitId}`}
        </ListItem>
    ); 
}


// props:
//   data :: [ DataObject ], the lexrels
//   ordered :: Bool, whether the list should be ordered
//   displayItemAs (optional) :: Component to render a LexRel as a list item
//      Defaults to LexRelAsListItem
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function LexRelsAsList(props) {
    return (
        <DataList data={props.data}
                  ordered={props.ordered}
                  choose={props.choose} unchoose={props.unchoose}
                  select={props.select} unselect={props.unselect}
                  displayItemAs={props.displayItemAs || LexRelAsListItem}
                  extras='lexrels-container'
        />
    );
}

// props:
//   data :: [ DataObject ], the lexrels
//   fieldMap (optional) :: [ [String, String] ], maps LexRel field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render a LexRel as a table row
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function LexRelsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || LEX_REL_FIELD_MAP}
                   displayFields={props.displayFields || LEX_REL_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras='lexrels-container'
        />
    );
}

// props:
//   queryParams :: { lexUnitId: ... }
var LexRelsContainer = dataContainerFor('LexRels', selectLexRels);
LexRelsContainer = connectWithApiQuery(LexRelsContainer, lexRelsQueries.queryActions);

export { LexRelsContainer,
         LexRelsAsList,
         LexRelsAsTable
       };

