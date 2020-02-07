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
import { Button, Checkbox, Form, Options, Select, SubmitButton, TextInput } from '../GenericForms/component';
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
//   advancedEnabled :: Boolean: when true, a link to display advanced search options
//     is made available and the user's selections for these options are submitted with
//     the form.
function SynsetSearchForm(props) {

    function onSubmit(formData) {
        props.doSearch(formData.searchTerm, formData.ignoreCase === "on");
    }

    const [showAdvanced, setShowAdvanced] = React.useState(false);
    function toggleAdvancedOptions(e) {
        e.preventDefault();
        setShowAdvanced(!showAdvanced);
    }

    // we still want to show the ignore case checkbox in the search
    // form when the advanced options are not enabled; but if they
    // are, we put it down in the advanced options instead
    const ignoreCaseOrAdvancedLink = props.advancedEnabled
          ? <><a href="#" onClick={toggleAdvancedOptions} className="ml-3 my-1">
                {showAdvanced ? "Hide" : "Show"} search options</a></>
          : <> 
              <Checkbox id={`${props.id}-ignoreCase`} label="Ignore case"
                        name="ignoreCase"
                        asGroup={true} groupClassName="col"
                        checked={props.ignoreCase}
                        onChange={props.toggleIgnoreCase}
                        className={props.checkboxClassName}
                        extras={props.checkboxExtras || "ml-3 my-1"}
              />
            </>;

    const wordCategories = [
        { label: 'Adjectives', value: 'adj' },
        { label: 'Nouns', value: 'nomen' },
        { label: 'Verbs', value: 'verben' }
    ];

    const wordClasses = [
        'Allgemein',
        'Bewegung',
        'Gefuehl',
        'Geist',
        'Gesellschaft',
        'Koerper',
        'Menge',
        'natPhaenomen',
        'Ort',
        'Pertonym',
        'Perzeption',
        'privativ',
        'Relation',
        'Substanz',
        'Verhalten',
        'Zeit',
        'Artefakt',
        'Attribut',
        'Besitz',
        'Form',
        'Geschehen',
        'Gruppe',
        'Kognition',
        'Kommunikation',
        'Mensch',
        'Motiv',
        'Nahrung',
        'natGegenstand',
        'Pflanze',
        'Tier',
        'Tops',
        'Koerperfunktion',
        'Konkurrenz',
        'Kontakt',
        'Lokation',
        'Schoepfung',
        'Veraenderung',
        'Verbrauch'
    ].sort();

    const variants = [
        { label: 'Current form', value: 'orthForm' },
        { label: 'Current form, variant spelling', value: 'orthVar' },
        { label: 'Old form', value: 'oldOrthForm' },
        { label: 'Old form, variant spelling', value: 'oldOrthVar' }
    ];
    
    return ( 
        // setting the key to props.history.length clears the search
        // term box and validity state after each search is run
        <Form key={props.history.length} 
              submitTo={onSubmit}
              className={classNames(props.className, props.extras)}>
          <div className="form-row">
            <TextInput id={`${props.id}-searchTerm`}
                       name="searchTerm"
                       label="Search for" labelClassName="sr-only"
                       type="search"
                       defaultValue={props.currentSearchTerm}
                       autoFocus={true}
                       placeholder="Enter a word or Synset Id"
                       className={props.inputClassName}
                       extras={props.inputExtras}
                       required={true}
                       asGroup={true} groupClassName="col"
            />
            <SubmitButton text="Find"
                          className={props.buttonClassName}
                          extras={props.buttonExtras || "btn-primary ml-3 my-auto"}
                          asGroup={true} groupClassName="col"
            />
            {ignoreCaseOrAdvancedLink}
          </div>
          {showAdvanced &&
           <>
             <div className="row my-2">
               <Checkbox id={`${props.id}-ignoreCase`} label="Ignore case"
                         name="ignoreCase"
                         defaultChecked={props.ignoreCase}
                         asGroup={true} groupClassName="col" 
                         className={props.checkboxClassName}
                         extras={props.checkboxExtras}
               />
               <Checkbox id={`${props.id}-regEx`} label="Enable regular expressions"
                         name="regEx"
                         defaultChecked={props.regEx}
                         asGroup={true} groupClassName="col" 
                         className={props.checkboxClassName}
                         extras={props.checkboxExtras}
               />
             </div>
             <div className="row mb-2">
               <Select id={`${props.id}-wordCategories`} label="Word category"
                       multiple={true}
                       feedback="Narrow search to these categories"
                       asGroup={true} groupClassName="col">
                 <Options data={wordCategories}/>
               </Select>
               <Select id={`${props.id}-wordCategories`} label="Word class"
                       multiple={true}
                       feedback="Narrow search to these classes"
                       asGroup={true} groupClassName="col">
                 <Options data={wordClasses}/>
               </Select>
               <Select id={`${props.id}-orthFormVariants`} label="Orthographic Variants"
                       multiple={true}
                       feedback="Narrow search to these variants"
                       asGroup={true} groupClassName="col">
                 <Options data={variants}/>
               </Select>
             </div>
             
             <div className="row">
               <TextInput id={`${props.id}-editDistance`} label="Edit distance"
                          name="editDistance"
                          type="number"
                          min={0}
                          asGroup={true}  groupClassName="col"
                          placeholder="Enter an integer greater than 0"
               />
             </div>
         </> 
        }
        </Form>
    );
}

function searchFormStateToProps(state, ownProps) {
    return selectSearchFormState(state, ownProps.id);
}

function searchFormDispatchToProps(dispatch, ownProps) {
    return {
        doSearch: (term, igcase) => dispatch(doSearch(ownProps.id, term, igcase)),
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
        
        const empty = <div className={classNames(this.props.emptyClassName, this.props.emptyExtras)}>
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
