# Germanet-common

This is a library which provides a variety of abstractions for
implementing the following pattern:

  1. Fetching data objects from a backend API into the Redux store
     (see [APIWrapper](./src/components/APIWrapper))
  2. Selecting data objects from the store into a container (see [DataContainer](./src/components/DataContainer))
  3. Rendering the data in a container into a UI (see [GenericDisplay](./src/components/GenericDisplay))

It also implements this pattern for the different types of data
objects in the [GermaNet](http://www.sfs.uni-tuebingen.de/GermaNet/) API, namely

  - synsets (see [Synsets](./src/components/Synset))
  - conceptual relations (see [ConRels](./src/components/ConRels))
  - lexical units (see [LexUnits](./src/components/LexUnits))
  - lexical relations (see [LexRels](./src/components/LexRels))
  - examples for lexical items (see [LexExamples](./src/components/LexExamples))
  - compounds (see [Compounds](./src/components/Compounds))
  - frames (see [Frames](./src/components/Frames))
  - Interlingual Index records (see [ILIRecords](./src/components/ILIRecords))
  - Wiktionary definitions (see [WiktionaryDefs](./src/components/WiktionaryDefs))

Thus, applications using this library can focus on just providing the
code needed to render GermaNet data for their own specific use case,
without having to define all the boilerplate for fetching that data
and managing it.

**Note**: if you are reading this README on NPM, the relative links on
this page will be broken, because they are designed to work with our
internal GitLab instance at the
[Seminar für Sprachwissenschaft](https://uni-tuebingen.de/fakultaeten/philosophische-fakultaet/fachbereiche/neuphilologie/seminar-fuer-sprachwissenschaft/arbeitsbereiche/allg-sprachwissenschaft-computerlinguistik/).
You can read the complete source and documentation by installing the
package.

## Prerequisites

When you use these components from another project, that project
should have the following NPM packages installed:
  - axios
  - react
  - react-dom
  - redux
  - react-redux
  - seamless-immutable
  
These are listed as *peer dependencies* in the `package.json` file.
This means that this package relies on them, but does not bundle them
itself.  This is because consuming applications (for instance, any
project based on the SfS' `reactprojecttemplate` repository) are
likely to depend on these packages already.

## Use

The library is available as a package on NPM in the `@sfstuebingen`
scope.  To install the package, run
```
npm install --save @sfstuebingen/germanet-common
```
in the directory containing your node_modules directory. (For internal
projects at the SfS, this is probably `webui`.) 

To make the library useful, you will need to install several reducers
from this library into your root Redux reducer:
```
import { reducers } from '@sfstuebingen/germanet-common';

const { synsetSearchBoxes, dataContainers, apiData } = reducers; // e.g.

const rootReducer = {
   ...
   synsetSearchBoxes,
   dataContainers,
   apiData,
   ...
}
```

Then you can import the components and use them in your own code:
```
import { components } from '@sfstuebingen/germanet-common';

const { LexUnitsContainer, LexUnitsAsList } = components; // e.g.

...
<LexUnitsContainer queryParams={{ synsetId: someId}} displayAs={LexUnitsAsList} />

```

## Code structure

The code is organized around the various functions in the general
pattern described above.  Each of these groupings consists of a React
component, or a set of related components, together with any functions
needed to manage their state via Redux.  Every grouping thus consists
of a directory under `src/components` with at least these files:

  - `README.md`: documentation specific to the component(s) 
  - `component.jsx`: the definition of the component(s)

If the component has local state managed by Redux, the following files
will also be present:

  - `actions.js`: Redux actions for the component(s)
  - `reducers.js`: Redux reducers for managing the component's state
  - `selectors.js`: Redux selectors which map the Redux state to the
    component's props
    
In some cases (notably `DataContainer` and `APIWrapper`), the
component is a higher-order component. In that case, the directory
structure follows the same pattern, but the associated actions,
reducers, and selectors are also higher order.  For example, in
APIWrapper's `actions.js`, instead of direct definitions of action
creators, there is a `makeQueryActions` function that *returns* action
creators.

In addition, there are several other files that contain code shared
across the library:
  - [errors.js](./src/): assorted error classes and
    handling functions
  - [helpers.js](./src/): assorted common utility
    functions
  - [validation.js](./src/): validation functions for user
    input

