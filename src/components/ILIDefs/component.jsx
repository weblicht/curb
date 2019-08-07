import { iliActions } from './actions';
import { selectIliDefs } from './selectors';
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

var ILIRecords = dataContainerFor('ILIRecords', selectIliDefs,
                                 ilirec => ilirec.iliId);
ILIRecords = connectWithApi(iliActions.fetchActions)(ILIRecords);
export { ILIRecords as ILIDefs, ILIRecordsAsDefList }; // TODO: complete renaming



