# Synsets

This directory defines a data container and various display components
for synsets.

## Data object

A synset object contains the following fields:

  - `id`
  - `wordCategory`
  - `wordClass`
  - `orthForms`
  - `paraphrase`
  - `wiktionaryParaphrases`
  - `comment`

## Components defined here

### Container

`SynsetsContainer`: a data container for synset objects.

These objects are *not* yet fetched by an ID via the API.  Instead,
they are returned as results from a search.  See the
[SynsetSearch](../SynsetSearch) components.

### Display components

`SynsetsAsList`: renders a set of synsets as a list 

`SynsetsAsSelect`: renders a set of synsets as a select control

`SynsetsAsTable`: renders a set of synsets as a table 


These components accept, and pass on, [data container control
props](../DataContainer#user-content-selecting-and-choosing-data-objects) for choosing and selecting data.


There are two additional display components for dealing with
subobjects on synset objects:

`WordCategory`: renders a synset's word category

`WordClass`: renders a synset's word class

They are provided for convenience.  Pass the entire synset to these
components as the `data` prop.

### Example

```
import { components } from 'germanet-common';
const { SynsetsContainer, SynsetsAsTable } = components;
```
