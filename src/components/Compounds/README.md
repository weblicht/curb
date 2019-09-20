# Compounds

This directory defines a data container and various display components
for compounds.

## Data object

A compound object contains the following fields:

  - `id`
  - `lexUnitId`
  - `splits`
  - `head`
    - `lemma`
    - `property`
    - `id`
  - `modifier1`
    - `lemma`
    - `property`
    - `category`
    - `id`
    - `id2`
    - `id3`
  - `modifier2`
    - `lemma`
    - `property`
    - `category`
    - `id`
    - `id2`
    - `id3`

## Components defined here

### Container

`CompoundsContainer`: a data container for compound objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`CompoundAsGrid`: renders a single compound's head and modifier
objects as a table with lemma, property, and category columns

`CompoundsAsList`: renders a set of compounds as a list

`CompoundsAsTable`: renders a set of compounds as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { components } from '@sfstuebingen/germanet-common';
const { CompoundsContainer, CompoundsAsTable } = components;

<CompoundsContainer queryParams={{ lexUnitId: someLexUnit.id }}
                    displayAs={CompoundsAsTable}/>
```
