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
import { selectSearchFormState,
         selectSynsetsForSearchForm } from './selectors';
import { Button, Checkbox, TextInput } from '../GenericDisplay/component';
import { dataContainerFor } from '../DataContainer/component';

import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

// Renders a simple search form with text input and submit button for synset searches 
// props:
//   id :: String, an identifier for the search form
//   className (optional), class for form element. Defaults to "form-inline".
//   extras (optional), extra classes for form element.
//   inputClassName, inputExtras (optional), className and extras for the text input.
//   buttonClassName, buttonExtras (optional), className and extras for the submit button.
//     Defaults space the button slightly right from the text input.  
//   checkboxClassName, checkboxExtras (optional), className and extras for the 
//     "ignore case" checkbox. Defaults space the button slightly right of the
//     submit button.
function SynsetSearchForm(props) {
    function onSearchTermChange (e) {
        props.updateSearchTerm(e.target.value);
    }

    function onSubmit (e) {
        e.preventDefault();
        props.doSearch(props.currentSearchTerm, props.ignoreCase);
    }

    return ( 
        <form className={classNames(props.className || "form-inline", props.extras)}
              onSubmit={onSubmit}>
          <TextInput id={`${props.id}-searchTerm`} label="Search for"
                     value={props.currentSearchTerm}
                     onChange={onSearchTermChange}
                     autoFocus={true}
                     placeholder="Enter a word or Synset Id"
                     className={props.inputClassName}
                     extras={props.inputExtras}
          />
          <Button text="Find" onClick={onSubmit}
                  className={props.buttonClassName}
                  extras={props.buttonExtras || "btn-primary ml-3 my-1"}
          />
          <Checkbox id={`${props.id}-ignoreCase `} label="ignore case"
                    checked={props.ignoreCase}
                    onChange={props.toggleIgnoreCase}
                    className={props.checkboxClassName}
                    extras={props.checkboxExtras || "ml-3 my-1"}
          />
        </form>
    );
}

function searchFormStateToProps(state, ownProps) {
    return selectSearchFormState(state, ownProps.id);
}

function searchFormDispatchToProps(dispatch, ownProps) {
    return {
        doSearch: (term, igcase) => dispatch(doSearch(ownProps.id, term, igcase)),
        updateSearchTerm: (term) => dispatch(updateSearchTerm(ownProps.id, term)),
        toggleIgnoreCase: () => dispatch(toggleIgnoreCase(ownProps.id)),
    };
}

SynsetSearchForm = connect(searchFormStateToProps, searchFormDispatchToProps)(SynsetSearchForm);
export { SynsetSearchForm };

// props:
//   source :: String, the .id of the corresponding SynsetSearchForm
const SynsetSearchResults = dataContainerFor('SynsetSearchResults', selectSynsetsForSearchForm);

export { SynsetSearchResults };

// Renders an alert related to searches.
// props:
//   source :: String, the .id of the corresponding SynsetSearchForm
//   className (optional), className for alert div. Defaults to 'alert' plus an appropriate
//     alert detail class (e.g., 'alert-warning').
//   extras (optional), extras for alert div
//   props.children, if given, will also be placed inside the div, after the alert message.
function SynsetSearchAlert(props) {
    if (!props.alert) return null;
    
    return (
        <div className={classNames(props.className || props.alertClass,
                                   props.extras)} role="alert">
          {props.alert}
          {props.children}
        </div>
    );
}

function alertStateToProps(state, ownProps) {
    const searchState = selectSearchFormState(state, ownProps.source);
    const bootstrapAlertClass = searchState.alertClass
          ? 'alert alert-' + searchState.alertClass
          : undefined;

    return {
        alert: searchState.alert,
        alertClass: bootstrapAlertClass
    };
}

SynsetSearchAlert = connect(alertStateToProps, undefined)(SynsetSearchAlert);
export { SynsetSearchAlert };

// Renders search history as buttons inside a <nav> element.
// props:
//   source :: String, the .id of the corresponding SynsetSearchForm
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
            <nav className={classNames(this.props.className, this.props.extras)}>
              {(itemsToDisplay && itemsToDisplay.length) ? buttons : empty }
            </nav>
        );

    }

}

function historyStateToProps(state, ownProps) {
    return selectSearchFormState(state, ownProps.source);
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
