# ConRels

This directory defines a data container and various display components
for conceptual relations.

## Data object

A conceptual relation object contains the following fields:

    - `id`
    - `conRelType`
    - `allOrthForms`
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
These objects are fetched via the API by the (originating) synset ID.
The required fetch parameters look like: `{ synsetId: someId }`.

### Display components

`ConRelsAsList`: renders a set of conceptual relations as a list 

`ConRelsAsTable`: renders a set of conceptual relations as a table 

These components accept, and pass on, [data container control
props](../DataContainer#control-props) for choosing and selecting data.

### Example

```
import { components } from 'germanet-common';
const { ConRelsContainer, ConRelsAsTable } = components;

<ConRelsContainer id='theConRels'
                  fetchParams={{ synsetId: someSynsetId }}
                  displayAs={ConRelsAsTable}/>
```
