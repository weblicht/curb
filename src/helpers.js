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

// makePublicReducer 
//
// Creates a reducer that can manage the state for a dynamic list of
// components based on their IDs.  Assumes that IDs are unique and
// included on the .id field of actions (in particular, those actions
// with type === createAction).  Parameters:
//   privReducer: function that manages the state for just one 
//   createActionType: an action type to listen for that indicates a new
//     part of the store should be created to contain the state for a new
//     component instance
//   privActions: an action types object that specifies the action types the
//     privReducer can handle. Note: these actions are *required* to have an
//     .id field when emitted!
//   defaultPublicState (optional): a Seamless Immutable object representing
//     the default state which the returned reducer will manage
export function makePublicReducer(privReducer,
                                  createActionType,
                                  privActions,
                                  defaultPublicState = SI({})) {
    return function (state = defaultPublicState, action) {
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
            const defaultPrivState = privReducer(undefined,
                                                 // dummy action type:
                                                 { type: '_DEFAULT_STATE_PROBE' }); 

            initializedState = SI.setIn(state, ['byId', componentId],
                                        defaultPrivState);
            
        } 

        // We now pass the appropriate part of the initialized state
        // on to the privReducer, and let it handle the action,
        // including possibly the creation action handled above, since
        // the privReducer may want to perform further initialization
        // with the data in the action object.

        if (action.type in privActions) {
            const oldPrivState = initializedState.byId[componentId];
            return SI.setIn(initializedState, ['byId', componentId],
                            privReducer(oldPrivState, action));

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
