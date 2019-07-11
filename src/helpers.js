// helpers.js
// Some useful helper functions for dealing with react and redux components in this library

import { InternalError } from './errors';

import SI from 'seamless-immutable';

// actionTypesFromStrings :: [ String ] -> Object
// Given an array of strings, returns an object using those strings as field names.
// This object can be used to represent a set of action types.
export function actionTypesFromStrings (strs) {
    var types = {};
    strs.forEach(function(key) {
        types[key] = key;
    });

    return types;
}

// makeByIdReducer
//
// Creates a reducer that can manage the state for a dynamic list of
// components based on their IDs.  That is, given a reducer which
// manages state that looks like { foo: fooVal, ...}, this
// function creates a reducer which manages state that looks like:
// { byId: {
//      idA: { foo: fooVal, ... },
//      idB: { foo: fooVal, ... },
//      ...
//   }
// }
//           
// The returned reducer assumes that IDs are unique within the state
// tree that it manages, and that an .id field is included on all of
// the actions it handles.  Based on that .id, it routes the
// corresponding slice of state to the given reducer, and updates the
// state tree with its return value.  Thus, the given reducer is
// called *exactly once* per action.
//
// Parameters:
//   innerReducer: reducer function that manages the internal state for a  
//   innerActions: an action types object that specifies the action types the
//     innerReducer can handle. Important: these actions are *required* to have
//     an .id field whenever they are emitted!
//   initialSharedState (optional): a Seamless Immutable object that represents
//     an initial state tree for the returned reducer to manage.  The byId object
//     will become a property of this object.
//     
export function makeByIdReducer(innerReducer,
                                innerActions,
                                initialSharedState = SI({})) {
    return function (state = initialSharedState, action) {
        const componentId = action.id;
        var initializedState = state;

        if (action.type in innerActions) {

            if (componentId === undefined) {
                throw new InternalError(`${action.type} was emitted with an undefined .id`);
            }
        
            // initialize a slice of state corresponding to the given
            // ID if it doesn't yet exist
            if ((state.byId === undefined) ||
                !(componentId in state.byId)) {
                // redux reducers are required to return a default
                // state if given an undefined state, so we use that to get
                // the default state handled by the inner reducer; see 
                // https://redux.js.org/basics/reducers
                // https://redux.js.org/api/combinereducers
                const defaultInnerState = innerReducer(undefined,
                                                      // dummy action type:
                                                      { type: '_DEFAULT_STATE_PROBE' }); 

                initializedState = SI.setIn(state, ['byId', componentId],
                                            defaultInnerState);
            }
            
            // pass the appropriate slice of the initialized state on
            // to the innerReducer, and let it handle the action
            const oldInnerState = initializedState.byId[componentId];
            return SI.setIn(initializedState, ['byId', componentId],
                            innerReducer(oldInnerState, action));

        // any other actions are not handled by us and should return
        // the original state unchanged:
        } else {
            return state;
        }
    }
}

       
// debugResponse :: Response ->
// can drop this onto Promise objects to debug errors in server responses
// e.g. axios.get(...).then(...).catch(debugResponse);
function debugResponse(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
        console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
    console.log(error.config);

}
