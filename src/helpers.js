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
// The returned reducer assumes that IDs are unique within the slice
// of state that it manages, and that an .id field is included on all
// of the actions it handles.  
//
// Parameters:
//   innerReducer: reducer function that manages the internal state for a  
//   createActionType: an action type to listen for that indicates a new
//     part of the state should be created corresponding to a new ID
//   innerActions: an action types object that specifies the action types the
//     innerReducer can handle. Important: these actions are *required* to have
//     an .id field whenever they are emitted!
//   initialSharedState (optional): a Seamless Immutable object that represents
//     any initial state.  The byId object will become a property of this object.
//     
export function makeByIdReducer(innerReducer,
                                createActionType,
                                innerActions,
                                initialSharedState = SI({})) {
    return function (state = initialSharedState, action) {
        const componentId = action.id;
        var initializedState = state;
        
        // An action of the createActionType initializes a part of the
        // store for a given component during component construction;
        // it's necessary to do this by handling an action because we
        // won't know component IDs until they are created by some
        // consuming application.
        if (action.type === createActionType) {
            if (componentId === undefined) {
                throw new InternalError(`${createActionType} was emitted with an undefined .id`);
            }

            // redux reducers are required to return a default state
            // if given an undefined state, so we use that to get the
            // default state handled by the private reducer; see 
            // https://redux.js.org/basics/reducers
            // https://redux.js.org/api/combinereducers
            const defaultPrivState = innerReducer(undefined,
                                                 // dummy action type:
                                                 { type: '_DEFAULT_STATE_PROBE' }); 

            initializedState = SI.setIn(state, ['byId', componentId],
                                        defaultPrivState);
            
        } 

        // We now pass the appropriate part of the initialized state
        // on to the innerReducer, and let it handle the action,
        // including possibly the creation action handled above, since
        // the innerReducer may want to perform further initialization
        // with the data in the action object.
        if (action.type in innerActions) {
            const oldPrivState = initializedState.byId[componentId];
            return SI.setIn(initializedState, ['byId', componentId],
                            innerReducer(oldPrivState, action));

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
