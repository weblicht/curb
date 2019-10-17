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

import { doSearch, updateSearchTerm, toggleIgnoreCase, setIgnoreCase, reloadHistory } from './actions';
import { selectSearchBoxState,
         selectSynsetsForSearchBox } from './selectors';
import { Button, Checkbox, TextInput, Card } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';

import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

// props:
//   id :: String, an identifier for the search box
// The following props, if given, will be forwarded to the <Card> component that wraps the search form:
//   title 
//   level
//   extras
//   bodyExtras 
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
        <Card title={props.title} level={props.level} extras={props.extras} bodyExtras={props.bodyExtras}>
          <form className="form-inline" onSubmit={onSubmit}>
            <TextInput id={`${props.id}-searchTerm`} label="Search for"
                       value={props.currentSearchTerm}
                       onChange={onSearchTermChange}
                       autoFocus={true}
                       placeholder="Enter a word or Synset Id"
                       extras=""
            />
            <Button text="Find" onClick={onSubmit} extras="btn-primary ml-3 my-1"/>
            <Checkbox id={`${props.id}-ignoreCase `} label="ignore case"
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

// Renders search history as buttons inside a <nav> element.
// props:
//   source :: String, the .id of the corresponding SynsetSearchBox
//   onlyUnique (optional) :: Bool, whether to only display a list of unique search terms
//   onlySuccessful (optional) :: Bool, whether to only display searches that returned results
//   persist (optional) :: Bool, whether to use browser localStorage to persist search history
//   limit (optional) :: Number, a maximum number of history items to display, *after*
//     filtering for unique and successful items (if requested)
//   className, extras (optional), className and extras for the <nav> element 
//   buttonClassName, buttonExtras (optional), className and extras for history buttons
//   emptyMessage (optional), a message to display when there is no search history
//     Defaults to "No search history to display."
//   emptyClassName, emptyExtras (optional), classNames and extras for the <div> used to
//     display the message when there is no search history 
class SynsetSearchHistoryNav extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.persist) {
            this.props.reloadHistory();
        }
    }

    componentDidUpdate(prevProps) {
        // store the history in browser localStorage so it can be retrieved 
        // after page refreshes; see reloadHistory in actions.js. 
        if (this.props.persist) {
            localStorage.setItem(this.props.source + '.searchHistory',
                                 JSON.stringify(this.props.history));
        }
    }

    render() {
        // the reducer tracks the *complete* search history (as does
        // local storage); we start by filtering the complete history
        // down to a subset, in accordance with the given props
        var itemsToDisplay = this.props.history;
        if (this.props.onlyUnique) {
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
        if (this.props.onlySuccessful) {
            itemsToDisplay = itemsToDisplay.filter(item => item.numResults > 0);
        }
        if (this.props.limit) {
            itemsToDisplay = itemsToDisplay.slice(0, this.props.limit);
        }
        
        const empty = <div className={classNames(this.props.emptyClass, this.props.emptyExtras)}>
                        {this.props.emptyMessage || "No search history to display."}
                      </div>;
        const buttons = itemsToDisplay.map(
            item => <Button text={item.word}
                            onClick={this.props.redoSearch(item.word, item.ignoreCase)}
                            className={this.props.buttonClassName}
                            extras={this.props.buttonExtras} />
        );
        
        return (
            <nav className={classNames(this.props.class, this.props.extras)}>
              {(itemsToDisplay && itemsToDisplay.length) ? buttons : empty }
            </nav>
        );

    }

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
        },
        reloadHistory: () => dispatch(reloadHistory(ownProps.source))
    };
}

SynsetSearchHistoryNav = connect(historyStateToProps, historyDispatchToProps)(SynsetSearchHistoryNav);
export { SynsetSearchHistoryNav };
