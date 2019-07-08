// SynsetSearchBox/selectors.js
// Data selectors for SynsetSearchBox state

import { defaultSearchBoxState } from './reducers';

// TODO: we are assuming here that the state for search boxes lives at
// globalState.synsetSearchBoxes, but if the consuming application uses a
// different name for the synsetSearchBoxes reducer in its combineReducers
// call, these selectors will break. Need to document this and/or
// perform some magic to dynamically determine the location of the
// search boxes part of the state.

export function searchBoxState(id, globalState) {
    if ( globalState.synsetSearchBoxes.byId === undefined  ) { 
        // globalState.synsetSearchBoxes.byId might not exist yet, because
        // it is created when the first search box component is
        // registered, but this function can be called before that --
        // e.g., in the mapStateToProps which precedes constructing
        // the first search box. In that case we still need to provide
        // the default values.
        return defaultSearchBoxState;
    } else {
        // the normal case: this component's state is already
        // initialized 
        return globalState.synsetSearchBoxes.byId[id];
    }
}

export function synsets(id, globalState) {
    try {
        return globalState.synsetSearchBoxes.byId[id].synsets;
    } catch (e) {
        return [];
    }
}
    
