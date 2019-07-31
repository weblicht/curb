import { wiktDefsActions } from './actions';
import { selectWiktDefs } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

// props:
//   fetchParams :: { lexUnitId: ... }
function WiktionaryDefs(props) {
    const terms = props.data.map( d => d.orthForm );
    const defs = props.data.map( d => d.wknParaphrase ); 
    return (
        <DefList className="wiktionary" terms={terms} defs={defs}/>
    );
}
WiktionaryDefs = connectWithApi(selectWiktDefs, wiktDefsActions.fetchActions)(WiktionaryDefs);
export { WiktionaryDefs };

