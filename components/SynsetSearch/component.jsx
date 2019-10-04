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

import { doSearch, updateSearchTerm, toggleIgnoreCase, setIgnoreCase } from './actions';
import { selectSearchBoxState,
         selectSynsetsForSearchBox } from './selectors';
import { Button, Checkbox, TextInput, Card } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';

import classNames from 'classnames';
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

    // Note: we use a <label> to display any alert because it aligns
    // better with the other form elements, and users can click it to
    // return to the search field. The invisible "Alignment message"
    // is just there to maintain alignment of the form elements and
    // the height of the form row when there is no actual alert to
    // display.  (Alerts are slightly taller than the rest of the form
    // elements by default, so just leaving it out causes the form
    // size to jump in an annoying way.)
    return ( 
        <Card>
          <form className="form-inline" onSubmit={onSubmit}>
            <TextInput id="searchTerm" label="Search for"
                       value={props.currentSearchTerm}
                       onChange={onSearchTermChange}
                       autoFocus={true}
                       placeholder="Enter a word or Synset Id"
                       extras=""
            />
            <Button text="Find" onClick={onSubmit} extras="btn-primary ml-3 my-1"/>
            <Checkbox id="ignoreCase" label="ignore case"
                      checked={props.ignoreCase}
                      onChange={props.toggleIgnoreCase}
                      extras="ml-3 my-1"
            />
            <label htmlFor="searchTerm"
                   className={classNames('d-inline-block',
                                         'alert',
                                         props.alertClass ? 'alert-' + props.alertClass : 'invisible',
                                         'ml-3 my-1')}>
              {props.alert || "Alignment message"}
            </label>
          </form>
        </Card>
    );
}

function searchBoxStateToProps(state, ownProps) {
    return selectSearchBoxState(state, ownProps.id);
}

function searchBoxDispatchToProps(dispatch, ownProps) {
    return {
        doSearch: (term, igcase) => dispatch(doSearch(ownProps.id, term, igcase)),
        updateSearchTerm: (term) => dispatch(updateSearchTerm(ownProps.id, term)),
        toggleIgnoreCase: () => dispatch(toggleIgnoreCase(ownProps.id)),
    };
}

SynsetSearchBox = connect(searchBoxStateToProps, searchBoxDispatchToProps)(SynsetSearchBox);
export { SynsetSearchBox };

// props:
//   source :: String, the .id of the corresponding SynsetSearchBox
const SynsetSearchResults = dataContainerFor('SynsetSearchResults', selectSynsetsForSearchBox);

export { SynsetSearchResults };

// props:
//   source :: String, the .id of the corresponding SynsetSearchBox
//   onlyUnique (optional) :: Bool, whether to only display a list of unique search terms
//   onlySuccessful (optional) :: Bool, whether to only display searches that returned results
//   limit (optional) :: Number, a maximum number of history items to display, *after*
//     filtering for unique and successful items (if requested)
//   buttonClassName (optional), className for history buttons
//   buttonExtras (optional), extras for history buttons
function SynsetSearchHistoryBox(props) {
    var itemsToDisplay = props.history;
    if (props.onlyUnique) {
        var seenWords = [];
        itemsToDisplay = itemsToDisplay.filter(
            item => {
                if (seenWords.includes(item.word)) {
                    return false;
                } else {
                    seenWords.push(item.word);
                    return true;
                }
            }
        );
    }
    if (props.onlySuccesful) {
        itemsToDisplay = itemsToDisplay.filter(item => item.numResults > 0);
    }
    if (props.limit) {
        itemsToDisplay = itemsToDisplay.slice(0, props.limit);
    }

    if (!(itemsToDisplay && itemsToDisplay.length)) {
        return (
            <Card title="History" level={3}>
              <p>No search history to display.</p>
            </Card>
        );
    }

    return (
        <Card title="History" level={3}>
          <nav>
            {itemsToDisplay.map(
                 item => <Button text={item.word}
                                 onClick={props.redoSearch(item.word, item.ignoreCase)}
                                 className={props.buttonClassName}
                                 extras={props.buttonExtras} />
            )}
          </nav>
        </Card>
    );

}

function historyStateToProps(state, ownProps) {
    return selectSearchBoxState(state, ownProps.source);
}

function historyDispatchToProps(dispatch, ownProps) {
    return {
        redoSearch: (term, igcase) => function(e) {
            e.preventDefault();
            dispatch(doSearch(ownProps.source, term, igcase));
            dispatch(updateSearchTerm(ownProps.source, term));
            dispatch(setIgnoreCase(ownProps.source, igcase)); 
        }
    };
}

SynsetSearchHistoryBox = connect(historyStateToProps, historyDispatchToProps)(SynsetSearchHistoryBox);
export { SynsetSearchHistoryBox };
