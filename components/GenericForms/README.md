# GenericForms

This directory contains a variety of generic components that
can be used to build HTML forms.

## Approach 

There are already well-established libraries for dealing with forms in
React. Here are two:

  - [Formik](https://jaredpalmer.com/formik/docs/overview), a
    React-only library, recommended by the React documentation
  - [React final form](https://final-form.org/react), a React wrapper
    for the Final Form library 
    
So why do we need the components here?

Dealing with forms in React is a pain, because forms have a *lot* of
state associated with them, and dealing with state in React is a pain.
The above libraries are designed to help out with this problem. They
take the approach of keeping your form logic *inside* React and
helping you manage the associated state. They are generic solutions
that expose all the different things you might want to do with form
state to your React code. This is great if you need to do things like
instantaneous field-level validation with custom error messages, and
you want to do those things inside React. But they don't reduce the
verbosity of dealing with forms in React.

The opposite approach is to use [uncontrolled
components](https://reactjs.org/docs/uncontrolled-components.html),
and just let the browser handle displaying the form, managing its
state, and validating its data as far as possible. For many cases,
this approach is sufficient. The main problem is that it doesn't work
well with single-page applications: submitting a form causes the
browser to navigate to a new URL. You can provide an event handler
that prevents this; but then how do you submit the form's data? And
what if you want to do something else with that data before you submit
it? You somehow need to get the form data back *into* your React code
when the user submits the form, so you can use that data to make a
request and render things like error messages.

That is the main problem that the components here solve. The approach
lets you build forms with uncontrolled components, letting the browser
manage their state as the user interacts with them, and perform
field-level validation when the user tries to submit. But it provides
a simple way of getting the form data back into your code *when the
user submits the form*, so you can do what you like with it: validate
it further, add some additional data, submit it to the server, render
error messages for the user, or whatever else. Essentially, the form
state on the page is a black box that your React application doesn't
know about until the user clicks submit, but you have full control
over what happens after that.  Welcome back to the early 2000s!

## Components defined here

There are two components that render HTML forms:

`Form`: displays a form, and passes the form data on submission to
callbacks that you provide

`ManagedForm`: displays a form, and also manages the process of
validating the data, submitting the data to the server, and handling
any errors

There are also several components which you can use to compose the
body of forms:

`FormAlerts`: displays warning, danger, and success alerts associated
with a form

`Button`: displays a button

`ResetButton`: displays a button that resets the containing form to its default state

`SubmitButton`: displays a button that submits the containing form

`Checkbox`: displays a checkbox with a corresponding label and validation feedback

`Select`: displays an HTML select element with a corresponding label
and validation feedback

`Options`: displays an array of values as HTML option elements

`TextInput`: displays a text input with a corresponding label and
validation feedback

## Creating forms

When writing a form, there are usually a variety of things you need to do:

  1. Render the form with some initial data 
  2. Validate data in the form after the user enters it
  3. Send the validated data to the server
  4. Display any errors that arise from the request to the server
  5. Clear any errors from the form and reset it to its default state
  
The components here can help with all of these tasks.

### Form and ManagedForm 

There are two components for rendering forms: `Form` and
`ManagedForm`. They share the work of rendering a form and managing
its state. `Form` simply renders the HTML form element, and takes care
of passing the form data to callbacks when the user submits the form.
`ManagedForm` additionally manages state that represents the
submission of form data to the server. 

`ManagedForm` is a shortcut for the typical case where you want to do
all five of the tasks above, and don't need a lot of control over how
the form state (validation errors, network errors, etc.) gets
represented. But you can use `Form` by itself if you need to customize
how that state is represented, or if you need more precise control
over what happens when form data is submitted.

The input fields in a `Form` are its children. Besides these children,
`Form` accepts three callbacks as props:

   1. `validator` (optional), which will receive the unvalidated form
      data when the form is submitted
   2. `submitTo`, which will receive the form data after it is
      processed by the `validator` (or the raw form data as it was
      submitted, if there is no `validator`)
   3. `errorsTo` (optional), which will receive any validation errors
      thrown by the `validator`

When the form is submitted, an object containing all the form data is
first passed to the `validator` callback. The validator should return
an object to be passed to the `submitTo` callback, or throw a
`ValidationErrors` object (see below), which will be passed to the
`errorsTo` callback.

For example, here's a form that just uses these callbacks to validate
that its two inputs are not both empty, and logs the data or
errors to the console:
```
import { ValidationErrors } from '@sfstuebingen/germanet-common/components/GenericForms';

// Raw form data comes here first when the form is submitted: 
function validate(data) {
    if (!data.someField && !data.otherField) {
        throw new ValidationErrors(["Some field and Other field cannot both be blank"]);
    }
    
    return data;
}

// If the validation function returns, this function receives the
// validated data next:
function logSubmission(data) {
    console.log("Form data submitted!");
    console.log(data);
}

// If the validation function throws a ValidationErrors object, this function 
// receives the error object:
function logErrors(errors) {
    console.log("Form validation error!");
    errors.formErrors.map(e => console.log(e));
}

function LogForm(props) {
    return (
        <Form submitTo={logSubmission} validator={validate} errorsTo={logErrors}>
          <input name="someField" type="text"/> 
          <input name="otherField" type="text"/> 
          <button type="submit">Submit</button>
        </Form>
    );

}
```

Normally, though, you actually want to display validation errors to
the user, submit the validated form data to the server, and display
any further errors that result. `ManagedForm` helps with this.
`ManagedForm` wraps `Form` and provides its own implementation of the
`submitTo` and `errorsTo` props, which keep track of the state related
to form submission and the roundtrip to the server. `ManagedForm`
accepts these props:

  - `submitTo`: unlike in `Form`, where this prop can be an arbitrary
     callback, in `ManagedForm` it *must* be a Redux thunk action
     creator that accepts form data and returns a thunk. `ManagedForm`
     will automatically call `dispatch` on this thunk on form
     submission. The thunk must return the Promise associated with
     the axios request that submits this data to the server.
  - `onSuccess` (optional): a callback to be called after the form has
     been submitted successfully (i.e., the request made by `submitTo`
     completes with a 200-level response). You can use this, for
     example, to refresh components that depend on data modified by
     the form. The callback will be passed the same `formState` object
     as the child render function (see below), and can be used to call
     effectful code to update the user interface based on the
     submitted form data. Like `submitTo`, the `onSuccess` callback
     may return a thunk; if it does, `ManagedForm` will automatically
     dispatch this thunk.
  - `validator` (optional): a validator function (same as for `Form`)


To give you access to the form state when rendering its body (e.g., so
you can display any errors as alerts, or disable the submit button
while the form is submitting), `ManagedForm` expects a single child,
which should be a *render function* (in the sense of [this
article](https://frontarm.com/james-k-nelson/passing-data-props-children/)).
This function should accept the form state and return its body. 

Here is a more realistic example that demonstrates how to use `ManagedForm`:
```
function updateLexUnit(formData) {
    return function(dispatch) {
        return axios.post('/api/lexunits', formData);
    };
}

function LexUnitEditingForm(props) {
    return (
        <ManagedForm submitTo={updateLexUnit}>
          { formState => 
            <>
              <FormAlerts success={formState.submitSuccess && "Your changes were saved"}
                          warnings={formState.formErrors} />
              <input name="orthForm" type="text" defaultValue={props.data.orthForm} required={true}/>
              <ResetButton text="Reset" onClick={formState.reset} />
              <SubmitButton text="Submit" disabled={formState.submitting} />
            </>
          }
        </ManagedForm>
    );
}
```

Notice:

  - the `updateLexUnit` action creator accepts the form data, and
    returns a thunk which returns the result of `axios.post`, which is
    a Promise
  - the only child of `ManagedForm` is an arrow function that maps
    `formState` to the form body
  - properties of the `formState` are used to: (a) render both
    successful submission and any errors as alerts, (b) to reset the
    form state via the Reset button, and (c) to disable the Submit
    button while the form is submitting
    
Here are all the properties available on the `formState` object:

  - `submitting` (Bool): indicates whether the form data has been
    submitted and is currently awaiting a reply from the server
  - `submitSuccess` (Bool): indicates that the form data has been
    successfully submitted and processed by the server (i.e., the
    server responded with a 200-level response)
  - `submitFailure` (Bool): indicates that the form data was not
    successfully processed by the server (i.e., the server did not
    respond, or responded with a non-200-level response)
  - `submittedData` (Object or Undefined): the data as it was
    submitted to the server
  - `formErrors` ([String]): the array of form error messages in any
    ValidationErrors object thrown by your validator function
  - `fieldErrors` (Object): the object mapping field names to error
    messages in any ValidationErrors object thrown by your validator
    function
  - `serverResponse` (Object or Undefined): the response from the
    server, if there was one (whether the request was successful or
    not)
  - `reset`: a callback that you can invoke to clear the form state
  - `setState`: a callback that lets you set your own state values in
    the `formState`. It works the same as `setState` in React class
    components.

### The input fields on the form

There are also several components here that help you render the
individual input elements in a form. These components provide a thin
abstraction over the related DOM elements. Their main purpose is to
allow you to easily add labels, feedback, and styling information to
individual input elements in the form. Their props interfaces follow
the same conventions as those in the
[GenericDisplay](../GenericDisplay) directory, and allow easy styling
with [Bootstrap 4 form classes](https://getbootstrap.com/docs/4.3/components/forms/).

The main input components are `Checkbox`, `Select`, and `TextInput`.
These all accept:

  - a `label` prop that will be used to generate an HTML label for the
    associated input element
  - a `feedback` prop that will be displayed below the input element;
    you can use this to display instructions or field-level validation
    errors 
  - an `asGroup` prop that, if true, will cause the input element and
    its label to be wrapped in a div with the Bootstrap `form-group`
    class (or another class that you specify)
  - `className` and `extras` props for styling the main input element
    (see the [conventions for these props](../GenericDisplay#styling)
    in the GenericDisplay directory), and related props for styling
    its label, feedback, and form group wrapper div
    
They also pass other props (e.g., `required`) to the underlying React
DOM elements, which enables field validation by the browser.

To use these as uncontrolled components, nothing else is required. If
you want to set initial values for them when the form is first
rendered (which will also be restored by a `ResetButton`), use the
`defaultValue` prop.

`Checkbox`s are slightly exceptional. The default value of a checkbox
should be given as its `defaultChecked` prop (rather than
`defaultValue`). Also, the value of a `Checkbox` field, if checked, is
(the string) `"on"` in the submitted form data. (This is due to the
way the browser represents the form state as attributes in the DOM.)
If you need a real boolean value, remember to convert this value in
your validator or submission functions, like:
```
{ someCheckbox: formData.someCheckbox === "on", ...formData }
```

There are also a few other components for common tasks when rendering
forms:

  - the `Options` component can be used to easily generate the options for
    a `Select` from an array of strings or data objects 

  - the `FormAlerts` component provides an easy way to display a
    series of alert messages (e.g., validation errors) together
    somewhere in a form

See their definitions for details about their props.
  
### Validation

You are encouraged to use the validation
[attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes)
of input elements, such as `required`, `minLength` and `pattern`, as
much as possible to perform field-level validation via the [browser
constraint validation
API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api).
This helps you reduce the amount of boilerplate validation code that
you need to write in React: you get free validation from the browser
before form submission just by declaring constraints on your form's
input elements.

Not all validation can be done this way, though, which is why the
`Form` and `ManagedForm` components allow you to pass a validator
function to them.  Use this function to perform any validation that
can't be performed automatically by the browser.

The validation function will receive the data from the whole form as
an object. This object will map the `name` attributes of your form's
input elements to the values entered by the user into those inputs.
For example, if your form has an input like
```
<TextInput name="paraphrase" />
```
and the user types "funky" into that text input, your validation
function will receive an object that looks like
```
{ paraphrase: "funky", ... }
```
when the form is submitted.

You can use the validation function to do any necessary
post-processing on the data between when the user submits the form and
when the browser actually sends the form data to the server.

The important thing to remember is: **whatever your validation
function returns will be directly submitted** to your submission
callback (the `submitTo` prop), and thus (normally) to the server.

Your validation function must therefore *not return* if the data is
invalid and should not be sent to the server. Instead, it should throw
a `ValidationErrors` object, which represents the errors in the form
data as it was submitted.

`ValidationErrors` objects contain representations of two types of errors:

  1. **field** errors, which concern data in a particular field; these
     are represented as an *object* which maps field names to error
     messages
  2. **form** errors, which are not specific to any field, but concern
     the form as a whole; these are represented as an *array* of error
     messages
     
You *must* throw an object of this type to prevent form submission (no
other type of error will be caught by `Form` or `ManagedForm`). See
the definition of the class in [validation.js](./validation.js) for
details on how to use these objects to record validation errors.

In a `ManagedForm`, the form and field errors inside a
`ValidationErrors` object thrown by your validation function will be
available as properties of the form state. You can use these to render
messages to the user, either at the level of the whole form or as
feedback on individual fields.
  
### Form state and uncontrolled components

Because of the way that React's rendering interacts with uncontrolled
components, you may find that your form state goes "stale". This can
happen when e.g.

  1. the form renders with some data from the parent component used to
     populate the `defaultValue` props of its fields
  2. the user changes one of those values (so it is no longer
     default), but doesn't submit the form
  3. the user then takes some other action that causes the form to
     re-render from new data in the parent component
     
In that case, the field that the user modified will not update with
the new data.  That's because the user has set its `value`, and React
will not use the newly-set `defaultValue` to overwrite the user-set
`value` when re-rendering an uncontrolled component.

The solution to this kind of problem is to set the `key` on the
`ManagedForm` or `Form` that changes when the data in the parent
component changes. This forces React to create a new form, instead of
updating the existing form. For more on this, see [this React blog
post](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key).
