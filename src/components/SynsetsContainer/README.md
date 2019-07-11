# SynsetsContainer

This component manages a list of synsets that come from some data
source.  The data source might be a list of search results, or it
might be a page-worth of synsets from the entire underlying database,
or something else.   

## Component

Goal: want to write
```html
<SynsetsContainer id="some-id" source="source-id">
```
and have that (paired with an appropriate reducer) suffice to update
the list of synsets managed by this component.

props:
  - id
  - source
  - synsets
  - selectedSynset(s?)
  - displayAs: table | none

## Reducer

## Selectors
