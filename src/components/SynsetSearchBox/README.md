
# SynsetSearch

This directory provides components for  form for Germanet Synsets.  It
manages transforming user input into search parameters, and fetching
search results from the backend using those parameters, and rendering
those results.

## Components defined here

### SynsetSearchBox

Displays a simple search form for synsets, including a text input, a
submit button, and a checkbox for ignoring case

The **id** prop is required and must be unique on the page, since it
is used to control the state of the form.

### SynsetSearchResults

A data container for the synsets returned when a search is submitted.

The **source*** prop is required and must be the same as the **id**
for the corresponding search box.

### Example

```
import { components } from 'germanet-common';
const { SynsetSearchBox, SynsetSearchResults, SynsetsAsTable } = components;

<SynsetSearchBox id="mainSearch" />
<SynsetSearchResults id="mainSearchResults" source="mainSearch" displayAs={SynsetsAsTable}/>
```

## Reducer

To use these components, you also need to install the corresponding
reducers in your root Redux reducer: 
```javascript
import { reducers } from 'germanet-common';
const { synsetSearchBoxes, dataContainers } = reducers;

combineReducers({
  ...
  synsetSearchBoxes,
  dataContainers,
  ...
  })
```

