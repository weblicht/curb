import { iliActions } from './actions';
import { selectIliDefs } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { connectWithApi } from '../../helpers';

import React from 'react';

// props:
//   fetchParams :: { lexUnitId: ... }
function ILIDefs(props) {
    const terms = props.data.map( d => d.relation.replace('_', ' '));
    const defs = props.data.map( d => d.pwn20Paraphrase );
    return ( <DefList className="ili" terms={terms} defs={defs} /> );
}
ILIDefs = connectWithApi(selectIliDefs, iliActions.fetchActions)(ILIDefs);
export { ILIDefs };



