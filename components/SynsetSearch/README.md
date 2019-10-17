# SynsetSearch

This directory provides components for searching for synsets and
displaying the results of those searches.

## Components defined here

### SynsetSearchForm

Displays a simple search form for synsets, including a text input, a
submit button, and a checkbox for ignoring case.

The `id` prop is required and must be unique in the application, since
it is used to track the state of the form in Redux.

### SynsetSearchResults

A [data container](../DataContainer) for the synsets returned when a
search is submitted.

The `source` prop is required and must be the same as the `id` for the
corresponding search form.

### SynsetSearchHistoryNav

Displays an HTML nav element containing buttons with previous search
terms. Each button allows reperforming the search with the same
parameters.  Allows persisting search history across browser sessions
via localStorage.

The `source` prop is required and must be the same as the `id` for the
corresponding search form.

### Example

```
import { SynsetSearchForm, SynsetSearchResults, SynsetsAsTable } from '@sfstuebingen/germanet-common/components';

<SynsetSearchForm id="mainSearch" />
<SynsetSearchResults id="mainSearchResults" source="mainSearch" displayAs={SynsetsAsTable}/>
```

## Reducer

To use these components, you also need to install the corresponding
reducers in your root Redux reducer: 
```javascript
import { reducers } from '@sfstuebingen/germanet-common';
const { synsetSearches, dataContainers } = reducers;

combineReducers({
  ...
  synsetSearches,
  dataContainers,
  ...
  })
```

