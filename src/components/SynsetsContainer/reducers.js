// SynsetsContainer/reducers.js
// State management for SynsetsContainer state 

import { byIdActionTypes } from './actions';
import { dataContainer } from '../DataContainer/reducers';
import { broadcastActionTypes as dataActionTypes } from '../DataContainer/actions';
import { makeByIdReducer, makeBroadcastingReducer } from '../../helpers';

import SI from 'seamless-immutable';

// for now, the dataContainer reducer is all we need for a private reducer:
function synsetsContainerByIdReducer (state = SI({}), action) {
    switch (action.type) {

    // record a container's source (normally at component
    // creation). We have to do this by handling an action because we
    // don't know the source until the component is instantiated by a
    // consuming application:
    case byIdActionTypes.SYNSETS_CONTAINER_REGISTER_SOURCE: {
        return state.merge({ source: action.source });
    }
    default:
        return state;
    }
}

const defaultSynsetsContainersState = SI({});
const byIdReducer = makeByIdReducer(synsetsContainerByIdReducer, 
                                    byIdActionTypes);

const dataUpdatesReducer = makeBroadcastingReducer(dataContainer,
                                                   dataActionTypes);
                                                    

function synsetsContainers (state = defaultSynsetsContainersState, action) {
    if (action.type in byIdActionTypes) {
        return byIdReducer(state, action);
    } else if (action.type in dataActionTypes) {
        return dataUpdatesReducer(state, action)
    }
    //}
    // everything else 
    // switch (action.type) {
    // case sharedActions.FOO: {
    //     // update shared state per FOO, etc.
    // }

    else {
        return state;
    }
}

export { synsetsContainers };

