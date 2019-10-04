# SynsetSearch

This directory provides components for searching for synsets and
displaying the results of those searches.

## Components defined here

### SynsetSearchBox

Displays a simple search form for synsets, including a text input, a
submit button, and a checkbox for ignoring case.

The `id` prop is required and must be unique in the application, since
it is used to track the state of the form in Redux.

### SynsetSearchResults

A [data container](../DataContainer) for the synsets returned when a
search is submitted.

The `source` prop is required and must be the same as the `id` for the
corresponding search box.

### SynsetSearchHistoryBox

Displays a row of buttons of previous search terms. Each button allows
reperforming the search with the same parameters. 

The `source` prop is required and must be the same as the `id` for the
corresponding search box.

### Example

```
import { SynsetSearchBox, SynsetSearchResults, SynsetsAsTable } from '@sfstuebingen/germanet-common/components';

<SynsetSearchBox id="mainSearch" />
<SynsetSearchResults id="mainSearchResults" source="mainSearch" displayAs={SynsetsAsTable}/>
```

## Reducer

To use these components, you also need to install the corresponding
reducers in your root Redux reducer: 
```javascript
import { reducers } from '@sfstuebingen/germanet-common';
const { synsetSearchBoxes, dataContainers } = reducers;

combineReducers({
  ...
  synsetSearchBoxes,
  dataContainers,
  ...
  })
```

