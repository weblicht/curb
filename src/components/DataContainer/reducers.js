// DataContainer/reducers.js
// State management for DataContainer state 

import { actionTypes } from './actions';
import { makeByIdReducer } from '../../helpers';
import { InternalError } from '../../errors';

import SI from 'seamless-immutable';

const dataContainerPrivState = SI({
    // id and type are recorded for easier debugging, though they don't matter much:
    id: '',
    type: '', 
    // the actual data lives in records:
    records: [],
});


// state should look like this:
// ...(global)
//    .synsetsContainers
//       .byID
//         .<some-id>
//           .source: other-id
//           .records: []
//    

// Manages a private state tree as a data container
export function dataContainer(state = SI({}), action) {
    switch (action.type) {

    case actionTypes.DATA_CONTAINER_UPDATE_DATA: {
        if (action.source === state.source)
            return state.merge({
                records: action.data
            });
        
    }
    default:
        return state;
    }
}

// wrapper for other private reducer functions to turn them into data container reducers
// Use it like this:
// makeByIdReducer(withDataContainer(privateReducer)
//                   some_create_action,
//                   withDataActions(privateActions)
// )
export function withDataContainer(reducer) {
    return function(state, action) {
        console.log('inside withDataContainer wrapper');
        if (action.type in actionTypes) {
            return dataContainer(state, action);
        } else {
            return reducer(state, action);
        }
    }
}
            
    
