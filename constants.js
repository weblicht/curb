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

const prefix = window.GERMANET_API_PREFIX || window.APP_CONTEXT_PATH || "";
const urlRoot = prefix + "/api"; // window.location.origin;

// For now, we define only a subset of the endpoints which are already
// available in gernedit.
export const apiPath = {
    compounds: `${urlRoot}/compounds`, 
    conRels: `${urlRoot}/conrels`,
    examples: `${urlRoot}/examples`,
    frames: `${urlRoot}/frames`,
    graphs: `${urlRoot}/graphs/by_synset_id`,
    iliRecords: `${urlRoot}/ili_recs`,
    lexUnits: `${urlRoot}/lexunits`,
    lexRels: `${urlRoot}/lexrels`,
    hnymPaths: `${urlRoot}/paths`,
    synsets: `${urlRoot}/synsets`,
    wiktDefs: `${urlRoot}/wikt_defs`, 
};

