import { actionTypesFromStrings } from '../../helpers';

import axios from 'axios';

// makeApiActions
// Makes action types, action creators, and async actions for
// interacting with data via an API
// params:
//   prefix :: String : used to name action types
//   endpoints :: { get: URL, ... } : object mapping HTTP method names to endpoint URLs
//   paramsTransformer (optional) :: params -> Object : a function
//     that transforms API request params into action object
//     fields. The results of paramsTransformer(params) will be
//     spliced into action objects returned by the returned action
//     creators.
//
// returns: {
//   actionTypes: action types object with requested, returned, error types
//   fetchActions: {
//     doFetch(params): async action creator that performs complete request/response cycle
//     requested(params): action creator for request
//     returned(params, data): action creator for returned data
//     error(params): action creator for fetch error
//       where params is an object describing (axios) request parameters for the API, e.g.,
//       { id: some_id } or { lexUnitId: some_id }
//   }
// }
export function makeApiActions(prefix, endpoints,
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

    function fetchRequested(params) {
        return { type: actionTypes[requested], params, ...paramsTransformer(params) };
    }
    function fetchReturned(params, data) {
        return { type: actionTypes[returned], params, ...paramsTransformer(params), data };
    }
    function fetchError(params, error) {
        return { type: actionTypes[errored], params, ...paramsTransformer(params), error };
    }

    function doFetch(params) {
        return function (dispatch) {
            const config = { params };
            dispatch(fetchRequested(params));

            return axios.get(endpoints.get, config).then(
                response => dispatch(fetchReturned(params, response.data)),
                err => dispatch(fetchError(params, err)));
        }
    }
    // TODO: there is room to expand this to other REST actions; but
    // at the moment we have no need for that and the API doesn't
    // support it

    return {
        actionTypes,
        fetchActions: {
            doFetch,
            requested: fetchRequested,
            returned: fetchReturned,
            error: fetchError,
        }
    };
}

