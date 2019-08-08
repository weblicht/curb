import { iliActions } from './actions';
import { selectIliRecs } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

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

export { ILIRecordsContainer, ILIRecordsAsDefList }; 



