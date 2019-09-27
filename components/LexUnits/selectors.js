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

// TODO: this isn't in effect yet because we always look up lex units by synset ID, not by ID
// export function selectLexUnit(globalState, props) {
//     try {
//         const luId = props.queryParams.id;
//         // this already returns undefined if the lexunit is not yet in the db:
//         const selected = globalState.apiData.lexUnits.byId[luId];
//         return selected;
//     } catch (e) {
//         return undefined;
//     }
// }

export function selectLexUnits(globalState, props) {
    try {
        const selected = globalState.apiData.lexUnits.bySynsetId[props.queryParams.synsetId] || [];
        return selected;
    } catch (e) {
        return undefined;
    }
}
