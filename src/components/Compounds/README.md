# Compounds

This directory defines a data container and various display components
for compounds.

## Data object

A compound object contains the following fields:

  - `id`
  - `lexUnitId`
  - `splits`
  - `head`
  - `idHead`
  - `propertyHead`
  - `mod1`
  - `categoryMod1`
  - `propertyMod1`
  - `idMod1`
  - `id2Mod1`
  - `id3Mod1`
  - `mod2`
  - `categoryMod2`
  - `propertyMod2`
  - `idMod2`
  - `id2Mod2`
  - `id3Mod2`

## Components defined here

### Container

`CompoundsContainer`: a data container for compound objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`CompoundsAsTable`: renders a set of compounds as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { components } from 'germanet-common';
const { CompoundsContainer, CompoundsAsTable } = components;

<CompoundsContainer queryParams={{ lexUnitId: someLexUnit.id }}
                    displayAs={CompoundsAsTable}/>
```
