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

// reducers.js
// Top-level reducers for germanet-common that should be imported by
// consuming applications

import { globalActions } from './actions';

import SI from 'seamless-immutable';
import { combineReducers } from 'redux';

// Wraps top-level reducers to respond to global actions: 
function withGlobalActions(reducer) {
    return function (state, action) {
        if (action.type === globalActions.RESET_GERMANET_COMMON) {
            // reducers return their default state if state is undefined: 
            return reducer(undefined, { type: '_DEFAULT_STATE_PROBE' }); 
        } 

        return reducer(state, action);
    }
}

// Defintions of top-level reducers that can be imported by consuming applications:

// Authentication:
import { authentication as _authentication } from './components/Auth/reducers';
export const authentication = withGlobalActions(_authentication);

// Synset searches: 
import { synsetSearches as _synsetSearches } from './components/SynsetSearch/reducers';
export const synsetSearches = withGlobalActions(_synsetSearches);

// Data containers
import { dataContainers as _dataContainers } from './components/DataContainer/reducers';
export const dataContainers = withGlobalActions(_dataContainers);

// API
import { compounds } from './components/Compounds/reducers';
import { conRels } from './components/ConRels/reducers';
import { iliRecs } from './components/ILIRecords/reducers';
import { frames } from './components/Frames/reducers';
import { lexExamples } from './components/LexExamples/reducers';
import { lexRels } from './components/LexRels/reducers';
import { lexUnits } from './components/LexUnits/reducers';
import { hnymPaths } from './components/Graphs/reducers';
import { wiktDefs } from './components/WiktionaryDefs/reducers';

const fullAPIReducer = withGlobalActions(combineReducers({
    compounds,
    conRels,
    iliRecs,
    frames,
    hnymPaths,
    lexExamples,
    lexRels,
    lexUnits,
    wiktDefs,
}));

export { fullAPIReducer as apiData };
