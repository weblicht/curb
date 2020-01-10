# WiktionaryDefs

This directory defines a data container and various display components
for Wiktionary definitions of lexical units.

## Data object

An wiktionary definition object contains the following fields:

  - `id` :: String
  - `lexUnitId` :: String
  - `orthForm` :: String
  - `wknId` :: Integer
  - `wknSenseId` :: Integer
  - `wknParaphrase` :: String
  - `edited` :: Bool

## Components defined here

### Container

`WiktionaryDefsContainer`: a data container for Wiktionary definition
objects.  These objects are queried from the API by lexical unit ID.
The required query parameters look like: `{ lexUnitId: someId }`.

### Display components

`WiktDefsAsDefList`: renders a set of Wiktionary definitions as a
definition list

`WiktDefsAsList`: renders a set of Wiktionary definitions as a list 

`WiktDefsAsTable`: renders a set of Wiktionary definitions as a table 

**Note** that for conciseness, 'Wiktionary' has been shortened to
'Wikt' in the names of the display components (but not in the
container component).

These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { WiktionaryDefsContainer, WiktDefsAsDefList } from '@sfstuebingen/germanet-common/components';

<WiktionaryDefsContainer containerId='theWiktionaryDefs'
                         queryParams={{ lexUnitId: someLexUnit.id }}
                         displayAs={WiktDefsAsDefList}/>
```
