import { actionTypesFromStrings } from '../../helpers';

import axios from 'axios';

// Makes action types and action creators for querying data at an API endpoint
//
// params:
//   prefix :: String : used to name action types
//   endpoint :: String : the URL for the query
//   paramsTransformer (optional) :: params -> Object : a function
//     that transforms API request params into action object
//     fields. The results of paramsTransformer(params) will be
//     spliced into action objects returned by the returned action
//     creators.
//
// returns: {
//   actionTypes: action types object with requested, returned, error types
//   queryActions: {
//     doQuery(params): async action creator that performs complete request/response cycle
//     requested(params): action creator for request
//     returned(params, data): action creator for returned data
//     error(params): action creator for response error
//       where params is an object describing (axios) request parameters for the API, e.g.,
//       { id: some_id } or { lexUnitId: some_id }
//   }
// }
export function makeQueryActions(prefix, endpoint,
                                 paramsTransformer = (params) => undefined,
                                ) {

    const requested = prefix + '_REQUESTED';
    const returned = prefix + '_RETURNED';
    const errored = prefix + '_FETCH_ERROR';
    const actionTypes = actionTypesFromStrings([
        requested,
        returned,
        errored
    ]);

    function queryRequested(params) {
        return { type: actionTypes[requested], params, ...paramsTransformer(params) };
    }
    function queryReturned(params, data) {
        return { type: actionTypes[returned], params, ...paramsTransformer(params), data };
    }
    function queryError(params, error) {
        return { type: actionTypes[errored], params, ...paramsTransformer(params), error };
    }

    function doQuery(params) {
        return function (dispatch) {
            const config = { params };
            dispatch(queryRequested(params));

            return axios.get(endpoint, config).then(
                response => dispatch(queryReturned(params, response.data.data)),
                err => dispatch(queryError(params, err)));
        }
    }

    return {
        actionTypes,
        queryActions: {
            doQuery,
            requested: queryRequested,
            returned: queryReturned,
            error: queryError,
        }
    };
}


