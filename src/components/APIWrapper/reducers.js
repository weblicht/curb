import SI from 'seamless-immutable';

// Makes a reducer for the simple but common case where the reducer's
// job is just to stick some data returned by the API into the state.
//
// params:
//   apiActionTypes :: an action types object describing the API
//     actions this reducer should handle.  These should look like the
//     types returned by makeApiActions, i.e., <PREFIX>_RETURNED, etc.
//   statePath :: [ String ] : array describing the path in the state tree
//     under which the returned data should be stored
//   idParam :: String : the name of the property inside the action's
//     .params field whose value should be used as the final element
//     in the state path.  This is normally something like the last
//     element of statePath minus a "by" prefix.  For example, if
//     statePath ends with "byLexUnitId", idParam should most likely
//     be "lexUnitId".

export function makeSimpleApiReducer(apiActionTypes, statePath, idParam) {

    return function reducer(state = SI({}), action) {
        // TODO: handle errors etc. too
        // Though before we do that, it probably makes sense to
        // rethink the shape of the apiActions object
        if (action.type in apiActionTypes &&
            action.type.endsWith('_RETURNED')) {

            var data = action.data.data;

            // add a back-reference to the lookup identifier into the
            // data; this is in general useful for display.
            // TODO: this is also an ugly hack and assumes the data is an array.
            // Can the backend just send us the data with the identifier inside?
            data.forEach( row => row[idParam] = action.params[idParam] );

            return SI.setIn(state, statePath.concat(action.params[idParam]), data)
        } else {
            return state;
        }
    }
}



