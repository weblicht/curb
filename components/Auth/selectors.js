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

export function isAuthRequired(globalState) {
    try {
        return globalState.auth.authRequired;
    } catch (e) {
        console.error("You called isAuthRequired, but didn't configure auth support correctly.\n" +
                      "Make sure you have installed the auth reducer and called configureApiAuth.\n" +
                      "See the germanet-common Auth documentation.")
        return false;
    }
}
