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

// reducers.js
// Re-export component-specific reducers here for convenient import in
// consuming applications
import { combineReducers } from 'redux';

export { synsetSearches } from './components/SynsetSearch/reducers';

// Data containers
export { dataContainers } from './components/DataContainer/reducers';

// API
import { compounds } from './components/Compounds/reducers';
import { conRels } from './components/ConRels/reducers';
import { iliRecs } from './components/ILIRecords/reducers';
import { frames } from './components/Frames/reducers';
import { lexExamples } from './components/LexExamples/reducers';
import { lexRels } from './components/LexRels/reducers';
import { lexUnits } from './components/LexUnits/reducers';
import { wiktDefs } from './components/WiktionaryDefs/reducers';

// a reducer to handle every component that's connected with the API:
const fullAPIReducer = combineReducers({
    compounds,
    conRels,
    iliRecs,
    frames,
    lexExamples,
    lexRels,
    lexUnits,
    wiktDefs,
})

export { fullAPIReducer as apiData };
