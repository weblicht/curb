import { examplesActions } from './actions';
import { selectExamples } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { connectWithApi } from '../../helpers';

import React from 'react';

// props:
//   fetchParams :: { lexUnitId: ... }
function Examples(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples" terms={terms} defs={defs}/>
    );
}
Examples = connectWithApi(selectExamples, examplesActions.fetchActions)(Examples);
export { Examples };

