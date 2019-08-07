import { examplesActions } from './actions';
import { selectExamples } from './selectors';
import { DefList } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';
import { connectWithApi } from '../APIWrapper';

import React from 'react';

// props:
//   fetchParams :: { lexUnitId: ... }
function ExamplesAsDefList(props) {
    const terms = props.data.map( d => d.frameType );
    const defs = props.data.map( d => d.text );
    return (
          <DefList className="examples" terms={terms} defs={defs}/>
    );
}

var ExamplesContainer = dataContainerFor('Examples', selectExamples);
ExamplesContainer = connectWithApi(examplesActions.fetchActions)(ExamplesContainer);
export { ExamplesContainer as Examples, ExamplesAsDefList }; // TODO: finish renaming

