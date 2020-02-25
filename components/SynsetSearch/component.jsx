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

// SynsetSearch/component.jsx

import { doAdvancedSearch as doSearch,
         clearSearchParams,
         updateSearchParams,
         reloadHistory,
         toggleCategory,
         toggleRegexSupport,
         WORD_CLASS_OPTIONS } from './actions';
import { selectSearchFormState,
         selectSynsetsForSearchForm } from './selectors';
import { Button, Checkbox, Form, Options, ResetButton, Select, SubmitButton, TextInput } from '../GenericForms/component';
import { dataContainerFor } from '../DataContainer/component';

import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';

// Renders a search form with text input and submit button for synset searches 
// props:
//   id :: String, an identifier for the search form
//   advanced (optional) :: Boolean: when true, a link to
//     display advanced search options is made available and the
//     user's selections for these options are submitted with the
//     form. Otherwise, the only search option is to ignore case,
//     which displays as a checkbox next to the submit button.
//     Defaults to false.
//   keepTerm (optional) :: Boolean: when true, the search term will
//     not be cleared after a successful submit. This better allows
//     the user to see the results and then adjust the search to
//     further refine them. Defaults to props.advanced, so that an
//     advanced search form behaves this way by default.
//   className, extras (optional): for the form element. 
//   inputClassName, inputExtras (optional), className and extras for
//     the text input representing the search term.
//   submitButtonClassName, submitButtonExtras (optional), className
//     and extras for the submit button. Defaults style the button as
//     a primary control and space it right of the main text input.
//   resetButtonClassName, resetButtonExtras (optional), className and
//     extras for the reset button. Defaults style the button as a
//     secondary control and space it slightly right from the submit
//     button.  
//   optionsButtonClassName, optionsButtonExtras (optional), className
//     and extras for the Show/Hide search options button. Defaults
//     style the button as a link and space it slightly right from the
//     reset button.
//   checkboxClassName, checkboxExtras (optional), className and
//     extras for all checkboxes on the form.
//   editDistanceClassName, editDistanceExtras (optional), className and extras for
//     the edit distance text input (advanced search options only)
function SynsetSearchForm(props) {

    // our one piece of local state:
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    function toggleAdvancedOptions(e) {
        e.preventDefault();
        setShowAdvanced(isShown => !isShown);
    }
    function closeAdvancedOptions(e) {
        // close advanced options if they are open so that they don't
        // obscure results, warning messages, etc.:
        if (showAdvanced) {
            setShowAdvanced(false);
        }
    }

    // search forms with advanced options should keep its term by
    // default, but we allow the caller to override by explicitly
    // setting props.keepTerm to false:
    const keepTerm = (props.keepTerm === undefined)
          ? !!props.advanced
          : props.keepTerm;

    // submit handler for form:
    function onSubmit(formData) {
        props.doSearch(formData, keepTerm);
    }

    // classes for advanced search options:
    const advancedContainerClasses = classNames([
        // adds position: relative to the div wrapping the options
        // box, which keeps the top of the options box visually inside
        // the form (since its position is computed relative to this
        // wrapper div)
        "dropdown", 
    ]);

    const advancedDropdownClasses = classNames({
        // the advanced options should only be visible when showAdvanced is true:
        "d-block": showAdvanced,
        "d-none": !showAdvanced,
        // adds position: absolute, which allows the options box to
        // display outside the normal page flow, as well as a z-index and border:
        "dropdown-menu": true,
        // adds some padding inside the options box; otherwise form
        // elements appear immediately at the edge:
        "p-4": true,
        // gives the options box a shadow to set it off from the main page: 
        "shadow-lg": true,
    });

        
    return ( 
        <Form key={props.formKey} 
              submitTo={onSubmit}
              className={classNames(props.className, props.extras)}>
          <div className="form-group form-row">
            <TextInput id={`${props.id}-word`}
                       name="word"
                       label="Search for" labelClassName="sr-only"
                       type="search"
                       defaultValue={props.params.word}
                       autoFocus={true}
                       placeholder="Enter a word or Synset Id"
                       className={props.inputClassName}
                       extras={props.inputExtras}
                       required={true}
                       asGroup={true} groupClassName="col-4" />
            <SubmitButton text="Search"
                          onClick={closeAdvancedOptions}
                          className={props.submitButtonClassName}
                          extras={props.submitButtonExtras || "btn-primary ml-3 my-auto"} />

            <ResetButton text="Clear"
                         onClick={props.clear}
                         className={props.resetButtonClassName}
                         extras={props.resetButtonExtras || "btn-secondary ml-1 my-auto"} />

            {props.advanced &&
             <Button onClick={toggleAdvancedOptions}
                     className={props.optionsButtonClassName}
                     extras={props.optionsButtonExtras || "btn-link ml-1 my-auto"}>
               {showAdvanced ? "Hide" : "Show"} search options
             </Button>
            }
            {!props.advanced &&
             // when the advanced options are not enabled, we show the
             // ignore case checkbox inline in the main search form,
             // with default classes that space it away from the subit
             // button; otherwise, we put it down in the advanced
             // options:
             <Checkbox id={`${props.id}-ignoreCase`} label="Ignore case"
                       name="ignoreCase"
                       defaultChecked={props.params.ignoreCase}
                       asGroup={true} groupClassName="form-check-inline"
                       className={props.checkboxClassName}
                       extras={props.checkboxExtras || "my-auto"} />
            }
          </div>

          {props.advanced &&
           <div className={advancedContainerClasses}>
             <div className={advancedDropdownClasses}>
               <Button className="close" onClick={closeAdvancedOptions}>&times;</Button>
               <h5>Search term interpretation</h5>
               <div className="form-group">
                 <Checkbox id={`${props.id}-ignoreCase`} label="Ignore case"
                           name="ignoreCase"
                           defaultChecked={props.params.ignoreCase}
                           asGroup={false}
                           className={props.checkboxClassName}
                           extras={props.checkboxExtras} />
                 <Checkbox id={`${props.id}-regEx`} label="Enable regular expressions"
                           name="regEx"
                           checked={props.params.regEx}
                           onChange={props.toggleRegexSupport}
                           asGroup={false} 
                           className={props.checkboxClassName}
                           extras={props.checkboxExtras} />
               </div>
               <div className="form-group">
                 <TextInput id={`${props.id}-editDistance`} label="Edit distance"
                            name="editDistance"
                            type="number"
                            min={0}
                            defaultValue={props.params.editDistance}
                            asGroup={false}  
                            readOnly={props.params.regEx}
                            className={props.editDistanceClassName}
                            extras={props.editDistanceExtras || "col-4"}
                            placeholder="Enter an integer greater than 0" />
               </div>

               <div className="row">
                 <div className="col">
                   <h5>Word categories</h5>
                   <p className="small text-muted">Empty selection searches all categories.</p>
                   <Checkbox id={`${props.id}-adjectives`} label="Adjectives"
                             name="adjectives"
                             asGroup={false} 
                             checked={props.params.adjectives}
                             onChange={props.toggleCategory('adjectives')}
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                   <Checkbox id={`${props.id}-nouns`} label="Nouns"
                             name="nouns"
                             asGroup={false} 
                             checked={props.params.nouns}
                             onChange={props.toggleCategory('nouns')}
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                   <Checkbox id={`${props.id}-verbs`} label="Verbs"
                             name="verbs"
                             asGroup={false} 
                             checked={props.params.verbs}
                             onChange={props.toggleCategory('verbs')}
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                 </div>

                 <div className="col" >
                   <h5>Word classes</h5>
                   <p className="small text-muted">Empty selection searches all classes.</p>
                   <div style={{ maxHeight: "20vh", overflow: "scroll" }}>
                     <WordClassCheckboxes {...props}/>
                   </div>
                 </div>

                 <div className="col">
                   <h5>Orthographic variants</h5>
                   <p className="small text-muted">Empty selection searches all variants.</p>
                   <Checkbox id={`${props.id}-orthForm`} label="Current form"
                             name="orthForm"
                             defaultChecked={props.params.orthForm}
                             asGroup={true} groupClassName="col" 
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                   <Checkbox id={`${props.id}-orthVar`} label="Current form, variant spelling"
                             name="orthVar"
                             defaultChecked={props.params.orthVar}
                             asGroup={true} groupClassName="col" 
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                   <Checkbox id={`${props.id}-oldOrthForm`} label="Old form"
                             name="oldOrthForm"
                             defaultChecked={props.params.oldOrthForm}
                             asGroup={true} groupClassName="col" 
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                   <Checkbox id={`${props.id}-oldOrthVar`} label="Old form, variant spelling"
                             name="oldOrthVar"
                             defaultChecked={props.params.oldOrthVar}
                             asGroup={true} groupClassName="col" 
                             className={props.checkboxClassName}
                             extras={props.checkboxExtras} />
                 </div>
               </div>
             </div>
           </div>
          }
        </Form>
    );
}

function searchFormStateToProps(state, ownProps) {
    return selectSearchFormState(state, ownProps.id);
}

function searchFormDispatchToProps(dispatch, ownProps) {
    return {
        doSearch: (params, keepTerm) => dispatch(doSearch(ownProps.id, params, keepTerm)),
        clear: e => dispatch(clearSearchParams(ownProps.id)),
        toggleCategory: category => e => dispatch(toggleCategory(ownProps.id, category)),
        toggleRegexSupport: e => dispatch(toggleRegexSupport(ownProps.id)),
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
//     Note: the comparison is on search terms only; if multiple searches for the same term 
//     were run with different options, only one history item for this term will appear! 
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
                    if (seenWords.includes(item.params.word)) {
                        return false;
                    } else {
                        seenWords.push(item.params.word);
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
            item => <Button title={`${item.numResults} results`}
                            onClick={this.props.redoSearch(item.params)}
                            className={this.props.buttonClassName}
                            extras={this.props.buttonExtras}>
                      {item.params.word}
                    </Button>
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
        redoSearch: params => function(e) {
            e.preventDefault();
            dispatch(doSearch(ownProps.source, params));
            dispatch(updateSearchParams(ownProps.source, params));
        },
        reloadHistory: () => dispatch(reloadHistory(ownProps.source))
    };
}

SynsetSearchHistoryNav = connect(historyStateToProps, historyDispatchToProps)(SynsetSearchHistoryNav);
export { SynsetSearchHistoryNav };


// Helper component to display the checkboxes for all the word classes
// in the advanced search form.
// props:
//   params: search parameters object
//   checkboxClassName, checkboxExtras
function WordClassCheckboxes(props) {

    function labelFor(wordClass) {
        const categories = [
            wordClass.nouns ? 'Nouns' : undefined,
            wordClass.adjectives ? 'Adjectives' : undefined,
            wordClass.verbs ? 'Verbs' : undefined,
        ].filter(s => s !== undefined);

        const nvaLabel = `(${categories.join(', ')})`;

        return (<>{wordClass.label} <small className="text-muted">{nvaLabel}</small> </>);
    }

    function isDisabled(wordClass) {
        const allUnchecked = !props.params.nouns && !props.params.adjectives && !props.params.verbs;

        if (allUnchecked) return false;
        if (props.params.nouns && wordClass.nouns) return false;
        if (props.params.adjectives && wordClass.adjectives) return false;
        if (props.params.verbs && wordClass.verbs) return false;

        return true;
    }

    return WORD_CLASS_OPTIONS.map(
        wc => <Checkbox id={`${props.id}-${wc.value}`} label={labelFor(wc)}
                        key={wc.value}
                        name={wc.value}
                        defaultChecked={props.params[wc.value]}
                        asGroup={false} 
                        disabled={isDisabled(wc)}
                        className={props.checkboxClassName}
                        extras={props.checkboxExtras}
              />
    );
}

