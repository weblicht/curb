import { wiktDefsActions } from './actions';
import { selectWiktDefs } from './selectors';
import { DataTable, DefList } from '../GenericDisplay/component';
import { connectWithApi } from '../APIWrapper';
import { dataContainerFor } from '../DataContainer/component';

import React from 'react';

// Maps all data fields in wiktionary def objects to their display names.
const WIKTDEF_FIELD_MAP = [
    ['wikiRecordId', 'Wiki Id'],
    ['lexUnitId', 'LexUnit Id'],
    ['orthForm', 'Orth Form'],
    ['wknId', 'WKN Id'],
    ['wknSenseId', 'WKN Sense Id'],
    ['wknParaphrase', 'WKN Paraphrase'],
    ['edited', 'Edited']
];
const WIKTDEF_ALL_FIELDS = WIKTDEF_FIELD_MAP.map(entry => entry[0]);

// props:
//   data :: [ Object ], the wiktdefs 
//   fieldMap (optional) :: [ [String, String] ], maps wiktdef field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an wiktdef as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function WiktDefsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || WIKTDEF_FIELD_MAP}
                   displayFields={props.displayFields || WIKTDEF_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras="wiktdefs-container"
        />
    );
}


// props:
//   fetchParams :: { lexUnitId: ... }
function WiktDefsAsDefList(props) {
    const terms = props.data.map( d => d.orthForm );
    const defs = props.data.map( d => d.wknParaphrase ); 
    return (
        <DefList className="wiktionary" terms={terms} defs={defs}/>
    );
}

var WiktionaryDefsContainer = dataContainerFor('WiktionaryDefs', selectWiktDefs,
                                               wd => wd.wikiRecordId); // TODO: is this the right id field?? 
WiktionaryDefsContainer = connectWithApi(wiktDefsActions.fetchActions)(WiktionaryDefsContainer);

export { WiktionaryDefsContainer, WiktDefsAsDefList, WiktDefsAsTable };

