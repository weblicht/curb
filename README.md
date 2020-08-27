# curb

This is a Javascript library for building Web applications using React
and Bootstrap at the SfS. It contains generic components for rendering
data into a concrete UI, and implements some conventions for styling
those components. It also contains some utility functions that are
useful in React projects.

"curb" stands for *c*ollection of *u*tilities for *R*eact and
*B*ootstrap. 

## Code structure

The code is grouped into directories by functionality. The directories
under [components](./components) contain React components; see the
documentation in those directories for the components defined there.

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
npm install --save '@sfstuebingen/curb'
```
in the directory containing your node_modules directory. (For internal
projects at the SfS, this is probably `webui`.) 

The library is shipped as ES2015 source code only. Consuming
applications are expected to include whatever code they need from the
library via their own build process.

When you use this library in another project, that project
should also have the following NPM packages installed:
  - react
  - seamless-immutable
  - classnames
  
These are listed as *peer dependencies* in the `package.json` file.
This means that this package depends on them, but installing the
package will not install them automatically. Instead, you must
manually ensure that they are installed. Consuming applications (for
instance, any project based on the SfS' `reactprojecttemplate`
repository) are likely to depend on these packages already, so you may
already have them installed in your project. Listing them as peer
dependencies helps prevent multiple versions from being installed,
which causes problems with React in particular.

### Importing and using the components and other code

In general, you should just import the object you want using the full
path within this package to the file where it is defined:
```
import { makeByIdReducer } from '@sfstuebingen/curb/helpers;
```

As a shortcut, you can import any React component from the library
from `@sfstuebingen/curb/components`, so you can leave off
the name of the directory containing the component:
```
import { Button, Card } from '@sfstuebingen/curb/components';
```

