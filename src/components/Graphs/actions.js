import { actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

import axios from 'axios';

export const actionTypes = actionTypesFromStrings([
    'GRAPH_REQUESTED',
    'GRAPH_RETURNED',
    'GRAPH_ERROR'
]);

function graphRequested(synsetId) {
    return { type: actionTypes.GRAPH_REQUESTED, synsetId };
}
function graphReturned(synsetId, data) {
    return { type: actionTypes.GRAPH_RETURNED, synsetId, data };
}
function graphError(synsetId, error) {
    return { type: actionTypes.GRAPH_ERROR, synsetId, error };
}

export function doGraphRetrieval(synsetId) {
    return function (dispatch) {
        dispatch(graphRequested(synsetId));

        function validateResponse(response) {
            if (!(response.data && response.data.root && response.data.hyponyms)) {
                dispatch(graphError(synsetId, 'Server returned a response with invalid graph data'));
            } else {
                dispatch(graphReturned(synsetId, response.data));
            }
        }

        // TODO: I think the 'right' endpoint for this would be
        // /synsets/<id>/graph or similar: a graph is a subresource
        // for a particular synset.  But it appears that would require
        // significant backend changes, and this is not that
        // important.  Maybe this can change later if the backend is
        // ever overhauled.
        return axios.get(`${apiPath.graphs}/${synsetId}`).then(
            validateResponse, 
            err => dispatch(graphError(synsetId, err)));
    }
}
