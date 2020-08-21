// Copyright 2019 Richard Lawrence
//
// This file is part of react-utils.
//
// react-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// react-utils is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with react-utils.  If not, see <https://www.gnu.org/licenses/>.

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

// mergeActionTypes :: Object -> Object -> Object
export function mergeActionTypes(typesA, typesB) {
    return { ...typesA, ...typesB };
}

// upperFirst :: String -> String
export function upperFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// withNullAsString :: Object -> String
// params:
//   data: the data to convert to a string
//   nullString (optional): the string to use for null values
// Returns data as a string, unless data is null or undefined, in
// which case it returns nullString.  This is needed because
// .toString() raises a TypeError on null or undefined, which have no
// properties.
export function withNullAsString(data, nullString = '') {
    if (data == null || data == undefined) {
        return nullString;
    }
    else {
        return data.toString();
    }
}

// comparisonOn :: (String, Bool) -> ( (Object, Object) -> {-1, 0, 1} )
// Builds a comparison function for two objects that can be
// passed e.g. to Array.sort().
// params:
//   fieldName: the property on which the two objects should be compared
//   descending (optional): if true, returns a comparison function that
//     sorts in descending order (default is ascending)
export function comparisonOn(fieldName, descending = false) {
    return function compare(obj1, obj2){
        if (obj1[fieldName] < obj2[fieldName]) {
            // a return value of -1 means that obj1 should come first
            // in the sort order, while 1 means that obj2 should come
            // first; thus, if we are descending, obj2 should come
            // first in this case. Similarly below.
            return descending ? 1 : -1;
        } else if (obj1[fieldName] > obj2[fieldName]) {
            return descending ? -1 : 1;
        } else {
            return 0;
        }
    };
}

// isComponent :: anything -> Bool
// Tests whether a given value can be used as a React component.
// 
// I haven't found a definitively correct way to do this, so the test
// is only a rough heuristic: any function passes, as do objects of
// the sort returned by react-redux's connect().
export function isComponent(value) {
    const valueType = typeof(value);
    return (
        // any function (including pure classes) counts as a component:
        valueType === 'function' ||
        // react-redux's connect() returns an object, not a function; but it has
        // a function embedded in it:
        (valueType === 'object' && value.hasOwnProperty('WrappedComponent') &&
         typeof(value.WrappedComponent) === 'function')
    );
}

// isVisible :: DOM Node -> Bool
// Borrowed from jQuery; see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
export function isVisible(elem) {
    return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
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
// corresponding slice of state to the given reducer (first
// initializing it if necessary), and updates the state tree with the
// return value.  Thus, the given reducer is called *exactly once* per
// action handled.
//
// Parameters:
//   innerReducer: reducer function that manages internal slices of state 
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

        // any actions other than those in innerActions are not
        // handled by us and should return the original state
        // unchanged:
        if (!(action.type in innerActions)) {
            return state;
        }

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

    }
}
