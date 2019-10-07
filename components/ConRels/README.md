# ConRels

This directory defines a data container and various display components
for conceptual relations.

## Data object

A conceptual relation object contains the following fields:

  - `id` :: String
  - `conRelType`
  - `fromOrthForms` :: [String]
  - `toOrthForms` :: [String]
  - `numHyponyms`
  - `canBeDeleted`
  - `originatingSynsetId`
  - `relatedSynsetId`

**Note**: this is not exactly the shape of the data which is currently
returned by the backend; it is reshaped a little bit for clarity.  See
[reducers.js](./reducers.js) for the details.

## Components defined here

### Container

`ConRelsContainer`: a data container for conceptual relation objects.
These objects are queried from the API by the (originating) synset ID.
The required query parameters look like: `{ synsetId: someId }`.

`HypernymsTree`: a tree data container for conceptual relation objects
which stores the hypernym tree that begins at the root node.  The API
query parameters are the same as for `ConRelsContainer`; the queried
synset id defines the root node.

`HyponymsTree`: a tree data container for conceptual relation objects
which stores the hyponym tree that begins at the root node.  The API
query parameters are the same as for `ConRelsContainer`; the queried
synset id defines the root node.

`HnymsTree`: a tree data container for conceptual relation objects
which stores both the hypernym and the hyponym trees that begin at the
root node.  The API query parameters are the same as for
`ConRelsContainer`; the queried synset id defines the root node.

### Display components

`ConRelsAsList`: renders a set of conceptual relations as a list 

`ConRelsAsTable`: renders a set of conceptual relations as a table 

`HypernymsGraph`: renders hypernym tree upward from a root node

`HyponymsGraph`: renders hyponym tree downward from a root node

`HnymsGraph`: renders both hypernym and hyponym tree from a common root 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { ConRelsContainer, ConRelsAsTable } from '@sfstuebingen/germanet-common/components';

<ConRelsContainer id='theConRels'
                  queryParams={{ synsetId: someSynsetId }}
                  displayAs={ConRelsAsTable}/>
```
