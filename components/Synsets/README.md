# Synsets

This directory defines a data container and various display components
for synsets.

## Data object

A synset object contains the following fields with the following types:

  - `id` :: String
  - `wordCategory` :: String
  - `wordClass` :: String
  - `orthForms` :: [String]
  - `paraphrase` :: String
  - `wiktionaryParaphrases` :: [String]
  - `comment` :: String

## Components defined here

### Container

`SynsetsContainer`: a data container for synset objects.

The SynsetsContainer component does *not* yet have an API wrapper.
Instead, synsets are normally returned as results from a search.  See
the [SynsetSearch](../SynsetSearch) components.

### Display components

`SynsetsAsList`: renders a set of synsets as a list 

`SynsetsAsSelect`: renders a set of synsets as a select control

`SynsetsAsTable`: renders a set of synsets as a table 


These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.

### Example

```
import { SynsetsContainer, SynsetsAsTable } from '@sfstuebingen/germanet-common/components';
```
