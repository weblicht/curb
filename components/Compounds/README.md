# Compounds

This directory defines a data container and various display components
for compounds.

## Data object

A compound object contains the following fields:

  - `id` :: String
  - `lexUnitId` :: String
  - `splitCode` :: Integer (0: undetermined; 1: not a compound; 2: is
    a compound)
  - `splits` :: Bool (undefined: splitCode === 0; false: splitCode ===
    1; true: splitCode === 2)
  - `head` :: Object, with properties
    - `orthForm` :: String
    - `property` :: String
    - `id` :: String
  - `modifier1` :: Object, with properties
    - `orthForm` :: String
    - `property` :: String
    - `category` :: String
    - `id` :: String
    - `id2` :: String
    - `id3` :: String
  - `modifier2` :: Object, with properties
    - `orthForm` :: String
    - `property` :: String
    - `category` :: String
    - `id` :: String
    - `id2` :: String
    - `id3` :: String

## Components defined here

### Container

`CompoundsContainer`: a data container for compound objects.
These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`CompoundAsGrid`: renders a single compound's head and modifier
objects as a table with orth form, property, and category columns

`CompoundsAsList`: renders a set of compounds as a list

`CompoundsAsTable`: renders a set of compounds as a table 

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { CompoundsContainer, CompoundsAsTable } from '@sfstuebingen/germanet-common/components';

<CompoundsContainer queryParams={{ lexUnitId: someLexUnit.id }}
                    displayAs={CompoundsAsTable}/>
```
