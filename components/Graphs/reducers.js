import { hnymPathQueries } from './actions';
import { makeByIdReducer } from '../../helpers';

import SI from 'seamless-immutable';

const actionTypes = hnymPathQueries.actionTypes;

const defaultPrivState = SI([]);

// helper to munge the directions of edges after the LCS, which are
// currently returned with from and to reversed:
function flipAfterLcs(graph) {
    var afterLcs = false;
    const newEdges = graph.edges.map(edge => {
        // assuming here that the edges come back in order... 
        if (edge.from === graph.lcsId) {
            afterLcs = true;
        }
        if (afterLcs) {
            return { from: edge.to, to: edge.from };
        }
        return edge;
    })

    return { ...graph, edges: newEdges };
}

function hnymPathsInnerReducer(state = defaultPrivState, action) {
    switch (action.type) {
    case actionTypes.HNYM_PATH_REQUESTED: {
        return state; // no op for now
    }
    case actionTypes.HNYM_PATH_RETURNED: {
        return SI(action.data);
    }
    case actionTypes.HNYM_PATH_ERROR: {
        return state; // no op for now
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

