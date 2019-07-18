import { wiktDefsActions } from './actions';
import { selectWiktDefs } from './selectors';
import { DefList } from '../GenericWrappers/component';
import { connectWithApi } from '../../helpers';

import React from 'react';

// props:
//   lexUnit :: String
//   fetchParams :: { lexUnitId: ... }
function WiktionaryDefs(props) {
    const terms = props.data.map( _ => props.lexUnit );
    const defs = props.data.map( d => d.wknParaphrase ); 
    return (
        <DefList className="wiktionary" terms={terms} defs={defs}/>
    );
}
WiktionaryDefs = connectWithApi(selectWiktDefs, wiktDefsActions.fetchActions)(WiktionaryDefs);
export { WiktionaryDefs };

