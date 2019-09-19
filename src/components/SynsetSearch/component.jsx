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

// SynsetSearch/component.jsx

import { doSearch, updateSearchTerm, updateIgnoreCase } from './actions';
import { searchBoxState, selectSynsetsForSearchBox } from './selectors';
import { Button, Checkbox, TextInput, Card } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';

import React from 'react';
import { connect } from 'react-redux';

function SynsetSearchBox(props) {
    function onSearchTermChange (e) {
        props.updateSearchTerm(e.target.value);
    }

    function onSubmit (e) {
        e.preventDefault();
        props.doSearch(props.currentSearchTerm, props.ignoreCase);
    }

    return ( 
        <Card>
          <form className="form-inline" onSubmit={onSubmit}>
            <TextInput id="searchTerm" label="Search for"
                       value={props.currentSearchTerm}
                       onChange={onSearchTermChange}
                       autoFocus={true}
                       placeholder="Enter a word or Synset Id"
                       extras="mx-sm-3 mb-10"
            />
            <Button text="Find" onClick={onSubmit} extras="btn-primary mr-2"/>
            <Checkbox id="ignoreCase" label="ignore case"
                      checked={props.ignoreCase}
                      onChange={props.updateIgnoreCase}
                      extras="ml-sm-3"
            />
          </form>
        </Card>
    );
}

function mapStateToProps (state, ownProps) {
    return searchBoxState(ownProps.id, state);
}

function mapDispatchToProps (dispatch, ownProps) {
    return {
        doSearch: (term, igcase) => dispatch(doSearch(ownProps.id, term, igcase)),
        updateSearchTerm: (term) => dispatch(updateSearchTerm(ownProps.id, term)),
        updateIgnoreCase: () => dispatch(updateIgnoreCase(ownProps.id)),
    };
}

SynsetSearchBox = connect(mapStateToProps, mapDispatchToProps)(SynsetSearchBox);
export { SynsetSearchBox };

// props:
//   source :: String, the .id of the corresponding SynsetSearchBox
const SynsetSearchResults = dataContainerFor('SynsetSearchResults', selectSynsetsForSearchBox);

export { SynsetSearchResults };
