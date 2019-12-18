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
// Data selectors for SynsetSearchForm state

import { defaultSearchFormState } from './reducers';

export function selectSearchFormState(globalState, id) {
    try { 
        return globalState.synsetSearches.byId[id] || defaultSearchFormState;
    } catch (e) {
        return defaultSearchFormState;
    }
}
   
export function selectSynsetsForSearchForm(globalState, ownProps) {
    try {
        return globalState.synsetSearches.byId[ownProps.source].synsets || [];
    } catch (e) {
        // TypeError if one of the properties in the middle is not
        // defined yet
        return [];
    }

}

export function selectHistoryForSearchForm(globalState, ownProps) {
    try {
        return globalState.synsetSearches.byId[ownProps.source].history || [];
    } catch (e) {
        // TypeError if one of the properties in the middle is not
        // defined yet
        return [];
    }

}

