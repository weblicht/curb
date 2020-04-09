# Auth

This directory contains utilities for working with the GermaNet JSON
API when that API is served from behind an authentication or
authorization boundary.

## Prerequisites

The server must be configured to send HTTP **401** ("Unauthorized") in
response to API requests when the user is not authenticated, or
otherwise not authorized to request the data via the API.

## Configuration

The API calls made inside germanet-common use a custom instance of
[axios](https://github.com/axios/axios).

The `configureApiAuth` function sets this instance up to
handle HTTP 401 responses to API calls. It must be passed a reference
to the Redux store in the consuming application. Thus, this function
should be called when the application starts up, after the store has
been initialized. For example:
```
import { configureApiAuth } from '@sfstuebingen/germanet-common/components/Auth/actions';
import { createStore } from 'redux';

const store = createStore(myRootReducers, middleware);
window.store = store;

class App extends React.Component {
   // ...
   componentDidMount() {
      configureApiAuth(store);
   }
}
```

You also need to install the `auth` reducer into your root
reducer:
```
import { auth } from '@sfstuebingen/germanet-common/reducers';
import { combineReducers } from 'redux';

const myRootReducer = combineReducers({
   // ...
   auth,
   // ...
});
```



