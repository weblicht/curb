// reducers.js
// Re-export component-specific reducers here for convenient import in
// consuming applications
import { combineReducers } from 'redux';

export { synsetSearchBoxes } from './components/SynsetSearch/reducers';

// Data containers
export { dataContainers } from './components/DataContainer/reducers';

// API
import { iliDefs } from './components/ILIDefs/reducers';
import { lexExamples } from './components/LexExamples/reducers';
import { lexUnits } from './components/LexUnit/reducers';
import { wiktDefs } from './components/WiktionaryDefs/reducers';

// a reducer to handle every component that's connected with the API:
const fullAPIReducer = combineReducers({
    iliDefs,
    lexExamples,
    lexUnits,
    wiktDefs,
})

export { fullAPIReducer as apiData };
