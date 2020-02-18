import { hnymPathQueries } from './actions';
import { makeByIdReducer } from '../../helpers';

import SI from 'seamless-immutable';

const actionTypes = hnymPathQueries.actionTypes;

const defaultPrivState = SI({
    fetching: false,
    data: undefined,
    error: undefined
});


function hnymPathsInnerReducer(state = defaultPrivState, action) {
    switch (action.type) {
    case actionTypes.HNYM_PATH_REQUESTED: {
        return state.merge({ fetching: true }); 
    }
    case actionTypes.HNYM_PATH_RETURNED: {
        return state.merge({ fetching: false, data: action.data, error: undefined });
    }
    case actionTypes.HNYM_PATH_QUERY_ERROR: {
        return state.merge({ fetching: false, data: undefined, error: action.error }); 
    }
    default:
        return state;
    }
}

// We can't use makeSimpleApiReducer at the moment because there is no
// single request parameter that identifies the path.
// Instead we use makeByIdeReducer.
// params transformer in actions.js adds an ID based on the fromId and
// toId parameters that we're relying on here:
export const hnymPaths = makeByIdReducer(hnymPathsInnerReducer, actionTypes);

