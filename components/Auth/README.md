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

## Use

Once API authorization handling has been configured, a flag will be
set in the Redux store whenever an API call fails with a 401 error.
You can detect that this has happened using the `isAuthRequired`
selector:
```
import { isAuthRequired } from '@sfstuebingen/germanet-common/components/Auth/selectors';
import { connect } from 'react-redux';

function SomeComponent(props) {
    if (props.authRequired) {
       // do whatever makes sense for your application to alert the user
       // to re-authenticate/re-authorize
    }
    // ...
}

function mapStateToProps(state) {
    return {
        // ...
        authRequired: isAuthRequired(state)
    };
}
SomeComponent = connect(mapStateToProps)(SomeComponent);
```

In most cases it should not be necessary to manage the state of this
flag: any API request that fails with a 401 error sets it to true, and
any subsequent API call which succeeds will automatically reset it to
false. But if necessary, you can also manually set the flag to true by
dispatching the `authError()` action, and reset it to false by
dispatching the `authOK()` action, in [Auth/actions.js](./actions.js).




