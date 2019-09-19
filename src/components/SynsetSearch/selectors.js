// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

// SynsetSearch/selectors.js
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
   
export function selectSynsetsForSearchBox(globalState, ownProps) {
    try {
        return globalState.synsetSearchBoxes.byId[ownProps.source].synsets || [];
    } catch (e) {
        // TypeError if one of the properties in the middle is not
        // defined yet
        return [];
    }

}
