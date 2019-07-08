
# SynsetSearchBox

This component displays a search form for Germanet Synsets.  It
manages transforming user input into search parameters, and fetching
search results from the backend using those parameters.

## Component

Import the component like this:
```javascript
import { components } from 'germanet-common';
const SynsetSearchBox = components.SynsetSearchBox;
```

Use the component like this:
```html
<SynsetSearchBox id="mainsearch">
```
The **id** prop is required.  In the Redux store, the state related to a given
search box is indexed by id.  This allows using more than one search
box per page.  Make sure you choose a unique name for each search box
on the page.

## Reducer

To use the component, you also need to install the corresponding
reducer in your root Redux reducer: 
```javascript
import { reducers } from 'germanet-common';
const synsetSearchBoxes = reducers.synsetSearchBoxes;

combineReducers({
  ...
  synsetSearchBoxes,
  ...
  })
```
If you use Redux's `combineReducers` function like this, it is
important that you use exactly the name `synsetSearchBoxes` (so don't
rename the object during import).  This is because the name of the
reducer function passed to `combineReducers` is also the name of the
part of the Redux store managed by that reducer.

## Actions

All actions require an **id** field that contains the id of the search
box they are related to.  The main actions that you might want to emit
or listen for elsewhere are:

 1) `SYNSET_SEARCH_SUBMITTED`: emitted when the user submits the form
 that initiates a search. Created by `submitSearch` function.
 1) `SYNSET_SEARCH_RESULTS_RETURNED`: emitted when results are
 returned by a search. Created by `receiveResults` function. 
 
The action creator which handles the full request-response cycle for a
search is `doSearch`.

## Selectors
  
To access the state of the search boxes from elsewhere in your
application, you should use selectors, rather than walking the state
tree directly.  (The encapsulation provided by selectors means your
application won't break if the state shape defined by this library
changes.)

The two important selectors for this component are:

 1) `synsets`: the synsets returned by a search in a particular search box
 1) `searchBoxState`: the whole state tree for a particular search box

For example, if you want to use the synsets returned by a search to
display a table of results, you could do:

```javascript
import { selectors } from 'germanet-common';

const synsets = selectors.synsetSearchBoxes.synsets(searchBoxId, globalState);
```

