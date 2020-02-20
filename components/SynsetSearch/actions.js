// Copyright 2020 Richard Lawrence
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
    'SYNSET_SEARCH_UPDATE_SEARCH_PARAMS',
    'SYNSET_SEARCH_CLEAR_SEARCH_PARAMS',
    'SYNSET_SEARCH_TOGGLE_CATEGORY',
    'SYNSET_SEARCH_TOGGLE_REGEX_SUPPORT',
    'SYNSET_SEARCH_UPDATE_ERROR',
    'SYNSET_SEARCH_SUBMITTED',
    'SYNSET_SEARCH_RESULTS_RETURNED',
    'SYNSET_SEARCH_RELOAD_HISTORY'
])

export function clearSearchParams(id) {
    return { type: actionTypes.SYNSET_SEARCH_CLEAR_SEARCH_PARAMS, id };
}

export function updateSearchParams(id, params) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_SEARCH_PARAMS, id, params };
}

export function toggleRegexSupport(id) {
    return { type: actionTypes.SYNSET_SEARCH_TOGGLE_REGEX_SUPPORT, id };
}

export function toggleCategory(id, category) {
    return { type: actionTypes.SYNSET_SEARCH_TOGGLE_CATEGORY, id, category };
}

export function updateError(id, error) {
    return { type: actionTypes.SYNSET_SEARCH_UPDATE_ERROR, id, error };
}

export function submitSearch(id, params) {
    return { type: actionTypes.SYNSET_SEARCH_SUBMITTED, id, params };
}

export function receiveResults(id, data, params) {
    return { type: actionTypes.SYNSET_SEARCH_RESULTS_RETURNED, id, data, params };
}

export function reloadHistory(id) {
    const history = JSON.parse(localStorage.getItem(id + '.searchHistory')) || [];
    return { type: actionTypes.SYNSET_SEARCH_RELOAD_HISTORY, id, history };
}
    

// Async action creator that queries the /synsets endpoint with the
// query parameters from the advanced search form and dispatches the
// results.
// 
// params:
//   id: the ID of the search box for which this search should be recorded.
//   params: Object representing the search query.  It must contain a string
//     value for the 'word' property; all other properties are optional. These
//     include:
//       ignoreCase :: Boolean
//       regEx :: Boolean
//       editDistance :: String for Integer > 0 (invalid if regEx is true)
//     as well as any of the Boolean flags for word category, word class, and
//     orthographic variants which are submitted from the advanced search form. 
//     See SynsetSearchForm for all possible options.
export function doAdvancedSearch(id, params) {
    return function (dispatch) {
        const config = { params };
        dispatch(submitSearch(id, params));
        return axios.get(apiPath.synsets, config)
            .then(response => dispatch(receiveResults(id, response.data.data, params)),
                  // TODO: more generalized error handling? logging?
                  error => dispatch(updateError(id, `Failed to retrieve results for "${params.word}".`)) 
             );
    };
}

// This wrapper provides backward-compatible support for the signature
// of doSearch() up through version 1.2.5, where the only search
// option was a boolean flag for ignoring case. We can remove it in
// 2.0 and rename doAdvancedSearch to doSearch:
export function doSearch(id, word, ignoreCase) {
    return doAdvancedSearch(id, { word, ignoreCase });
}
