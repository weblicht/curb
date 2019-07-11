// SynsetsContainer/actions.js
// Action types and creators for SynsetsContainer
import { actionTypesFromStrings } from '../../helpers';
import { bySourceActions } from '../DataContainer/actions';

// byId actions always contain a synsets container ID 
export const byIdActionTypes = actionTypesFromStrings([
    'SYNSETS_CONTAINER_REGISTER_SOURCE',
])

// Simple action creators
export function registerSource(id, source) {
    return { type: byIdActionTypes.SYNSETS_CONTAINER_REGISTER_SOURCE, id, source };
}



