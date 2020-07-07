# Germanet-common

This is a Javascript library for building Web applications using
the different types of data in
[GermaNet](http://www.sfs.uni-tuebingen.de/GermaNet/), namely

  - synsets (see [Synsets](./components/Synset))
  - conceptual relations (see [ConRels](./components/ConRels))
  - lexical units (see [LexUnits](./components/LexUnits))
  - lexical relations (see [LexRels](./components/LexRels))
  - examples for lexical items (see [LexExamples](./components/LexExamples))
  - compounds (see [Compounds](./components/Compounds))
  - frames (see [Frames](./components/Frames))
  - Interlingual Index records (see [ILIRecords](./components/ILIRecords))
  - Wiktionary definitions (see [WiktionaryDefs](./components/WiktionaryDefs))

[GermaNet Rover](https://weblicht.sfs.uni-tuebingen.de/rover/) is an
example of an application built with this library.

The library provides abstractions for implementing the following
pattern with [React](https://reactjs.org/) and [Redux](https://redux.js.org/):

  1. Fetching data objects from a JSON API into the Redux store
     (see [APIWrapper](./components/APIWrapper))
  2. Selecting data objects from the store into a container component (see [DataContainer](./components/DataContainer))
  3. Rendering the data in a container into a concrete UI (see
     [GenericDisplay](./components/GenericDisplay) and [GenericForms](./components/GenericForms))

The library also implements steps 1 and 2 of this pattern for each of
the GermaNet data types above. This enables applications using this
library to focus on rendering GermaNet data for their own specific use
cases, without having to write a lot of boilerplate for fetching that
data and shuffling it around.

**Note**: if you are reading this README on NPM, the relative links on
this page will be broken. You can read the complete source and
documentation on
[GitHub](https://github.com/Germanet-sfs/germanet-common), or by
installing the package.

## Code structure

The code is organized around the various functions in the general
pattern described above.  Each of these groupings consists of a React
component, or a set of related components, together with any functions
needed to manage their state via Redux.  Every grouping thus consists
of a directory under `components` with at least these files:

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
  - [errors.js](./): assorted error classes and
    handling functions
  - [helpers.js](./): assorted common utility
    functions


## Use

### Installing the package 

The library is available as a package on NPM in the `@sfstuebingen`
scope.  To install the package, run
```
npm install --save '@sfstuebingen/germanet-common'
```
in the directory containing your node_modules directory. (For internal
projects at the SfS, this is probably `webui`.) 

The library is shipped as ES2015 source code only. Consuming
applications are expected to include whatever code they need from the
library via their own build process.

When you use this library in another project, that project
should also have the following NPM packages installed:
  - axios
  - react
  - react-dom
  - redux
  - react-redux
  - seamless-immutable
  
These are listed as *peer dependencies* in the `package.json` file.
This means that this package depends on them, but installing the
package will not install them automatically. Instead, you must
manually ensure that they are installed. Consuming applications (for
instance, any project based on the SfS' `reactprojecttemplate`
repository) are likely to depend on these packages already, so you may
already have them installed in your project. Listing them as peer
dependencies helps prevent multiple versions from being installed,
which causes problems with React in particular.

### Installing reducers

To make the library useful, you will need to install several reducers
from this library into your root Redux reducer.  You can import them
from the top-level `reducers.js`:
```
import { synsetSearches, dataContainers, apiData } from '@sfstuebingen/germanet-common/reducers';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
   ...
   synsetSearches,
   dataContainers,
   apiData,
   ...
});
```

In addition to handling their specified actions, these top-level
reducers respond to the global actions for the library (defined in the
top-level `actions.js`). They will, for example, clear all the state
that they manage when a `RESET_GERMANET_COMMON` action is emitted. The
reducers defined in individual component directories do *not* respond
to these global actions, so you should not import them directly unless
you want to override how these global actions are handled.

### Importing and using the components and other code

In general, you should just import the object you want using the full
path within this package to the file where it is defined:
```
import { lexUnitQueries } from '@sfstuebingen/germanet-common/components/LexUnits/actions';
```

As a shortcut, you can import any React component from the library
just using the path to the directory containing its definition
(leaving 'component' off at the end):
```
import { LexUnitsContainer, LexUnitsAsList } from '@sfstuebingen/germanet-common/components/LexUnits';
```

All components are also re-exported from
`@sfstuebingen/germanet-common/components`, so you can also leave off
the name of the component's directory:
```
import { LexUnitsContainer, LexUnitsAsList } from '@sfstuebingen/germanet-common/components';
```

### API path

By default, the library expects to make API calls to endpoints that
fall under `/api`, e.g., `/api/synsets`. You can customize this by
setting either `window.GERMANET_API_PREFIX` (recommended for new or
external projects) or `window.APP_CONTEXT_PATH` (for existing
applications at the SfS) to a prefix for these endpoints. Note that
you should do this before loading the library's code. For example, if
you set ``` window.GERMANET_API_PREFIX = '/germanet'; ``` then API
requests will go to endpoints like `/germanet/api/synsets`. If you
need more control over the exact path, you should edit the `urlRoot`
variable in the top-level `constants.js` module.

### Using a custom axios instance

The library uses [axios](https://github.com/axios/axios) to make API
requests. If you need to provide a custom instance of axios, you can
do so with the `installAxiosInstance` function in [constants.js](./):
```
import { installAxiosInstance } from '@sfstuebingen/germanet-common/constants';
import axios from 'axios';

const myAxiosInstance = axios.create();

// tell germanet-common to make API requests with your custom axios instance:
installAxiosInstance(myAxiosInstance);
```
This is useful if, for example, you need to catch and respond to HTTP
errors that result from API requests, which you can do 
with axios' [interceptors](https://github.com/axios/axios#interceptors).
