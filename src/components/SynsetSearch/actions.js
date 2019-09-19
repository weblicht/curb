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

// SynsetSearch/actions.js
// Action types and creators for synset searches
import { actionTypesFromStrings } from '../../helpers';
import { apiPath } from '../../constants';

import axios from 'axios';

// these are all per-id actions:
export const actionTypes = actionTypesFromStrings([
    'SYNSET_SEARCH_UPDATE_SEARCH_TERM',
    'SYNSET_SEARCH_TOGGLE_CASE',
    'SYNSET_SEARCH_UPDATE_ERROR',
    'SYNSET_SEARCH_SUBMITTED',
    'SYNSET_SEARCH_RESULTS_RETURNED',
    'SYNSET_SEARCH_BACKEND_FAILURE',
])


// Simple action creators

export function updateSearchTerm(id, searchTerm) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_TERM, id, searchTerm };
}

export function updateIgnoreCase(id) {
    return { type: actionTypes.SYNSET_SEARCH_TOGGLE_CASE, id };
}

export function updateError(id, error) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_ERROR, id, error };
}

export function submitSearch(id, params) {
    return { type: actionTypes.SYNSET_SEARCH_SUBMITTED, id, params };
}

export function receiveResults(id, data) {
    return { type: actionTypes.SYNSET_SEARCH_RESULTS_RETURNED, id, data };
}

export function searchFailure(id) {
    return { type: actionTypes.SYNSET_SEARCH_BACKEND_FAILURE, id };
}
    

// Thunk action creators: these return thunks that perform async requests

function validateSearchTerm(term) {
    if (term === '') { // TODO: is this the only condition for a valid search term?
        throw new ValidationError('Please enter a valid word or Id');
    } else {
        return true;
    }
}

export function doSearch(id, term, ignoreCase) {
    return function (dispatch) {

        try {
            validateSearchTerm(term);
        } catch (validationErr) {
            dispatch(updateError(validationErr.message));
            return;
        }

        const params = { word: term, ignoreCase }
        const config = { params };
        dispatch(submitSearch(id, params));
        return axios.get(apiPath.synsets, config)
        .then(response => {
            dispatch(receiveResults(id, response.data.data)); 
            },
              error => dispatch(updateError(id,
                  // TODO: more generalized error handling? logging?
                  `Failed to retrieve results for "${params.word}".`)) 
             );
    };
}
