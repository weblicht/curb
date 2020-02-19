# ConRels

This directory defines a data container and various display components
for conceptual relations.

## Data object

A conceptual relation object contains the following fields:

  - `id` :: String
  - `relType` :: String
  - `fromOrthForms` :: [String]
  - `toOrthForms` :: [String]
  - `numHyponyms` :: Integer (number of hyponyms of synset with `toSynsetId`)
  - `canBeDeleted` :: Bool
  - `fromSynsetId` :: String
  - `toSynsetId` :: String

## Components defined here

### Container

`ConRelsContainer`: a data container for conceptual relation objects.
These objects are queried from the API by the (originating) synset ID.
The required query parameters look like: `{ synsetId: someId }`.

### Display components

`ConRelsAsList`: renders a set of conceptual relations as a list 

`ConRelsAsTable`: renders a set of conceptual relations as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { ConRelsContainer, ConRelsAsTable } from '@sfstuebingen/germanet-common/components';

<ConRelsContainer containerId='theConRels'
                  queryParams={{ synsetId: someSynsetId }}
                  displayAs={ConRelsAsTable}/>
```
