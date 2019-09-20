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

import { lexUnitsQueries } from './actions';
import { makeSimpleApiReducer } from '../APIWrapper';

// TODO: this is somewhat badly shaped. Ideally we would request
// lexunit details by their ID, and could use makeByIdReducer to add
// them to the store; but there is currently no endpoint for
// requesting lexunits by ID, and only an endpoint for requesting
// multiple lexunits by synset id.
const queryActionTypes = lexUnitsQueries.actionTypes;
export const lexUnits = makeSimpleApiReducer(queryActionTypes, "synsetId");
        
