import { iliActions } from './actions';
import { selectIliRecs } from './selectors';
import { DataTable, DefList } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

// Maps all data fields in ILI record objects to their display names.
const ILIREC_FIELD_MAP = [
    ['iliId', 'ILI Id'],
    ['lexUnitId', 'LexUnit Id'],
    ['relation', 'Relation'],
    ['englishEquivalent', 'English Equivalent'],
    ['pwn20Id', 'PWN 2.0 Id'],
    ['pwn30Id', 'PWN 3.0 Id'],
    ['pwn20Synonyms', 'PWN 2.0 Synonyms'],
    ['pwn20Paraphrase', 'PWN 2.0 Paraphrase'],
    ['source', 'Source']
];
const ILIREC_ALL_FIELDS = ILIREC_FIELD_MAP.map(entry => entry[0]);

// props:
//   data :: [ Object ], the ilirecs 
//   fieldMap (optional) :: [ [String, String] ], maps ilirec field names to their display names
//   displayFields (optional) :: [ String ], the field names to be displayed
//   displayItemAs (optional) :: Component to render an ilirec as a table row
//      Defaults to DataTableRow.
//      Data container control props (.choose, etc.), if given, will be passed on
//      to this component.
function ILIRecordsAsTable(props) {
    return (
        <DataTable data={props.data} idFor={props.idFor}
                   choose={props.choose} unchoose={props.unchoose}
                   select={props.select} unselect={props.unselect}
                   fieldMap={props.fieldMap || ILIREC_FIELD_MAP}
                   displayFields={props.displayFields || ILIREC_ALL_FIELDS}
                   displayItemAs={props.displayItemAs}
                   extras="ilirecs-container"
        />
    );
}

// props:
//   fetchParams :: { lexUnitId: ... }
function ILIRecordsAsDefList(props) {
    const terms = props.data.map( d => `${d.englishEquivalent} (${d.relation.replace('_', ' ')})`);
    const defs = props.data.map( d => d.pwn20Paraphrase );
    return ( <DefList className="ili" terms={terms} defs={defs} /> );
}

var ILIRecordsContainer = dataContainerFor('ILIRecords', selectIliRecs,
                                           ilirec => ilirec.iliId);
ILIRecordsContainer = connectWithApi(iliActions.fetchActions)(ILIRecordsContainer);

export { ILIRecordsContainer, ILIRecordsAsDefList, ILIRecordsAsTable }; 



