import { wiktDefsActions } from './actions';
import { selectWiktDefs } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { connectWithApi } from '../APIWrapper';
import { dataContainerFor } from '../DataContainer/component';

import React from 'react';

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

export { WiktionaryDefsContainer, WiktDefsAsDefList };

