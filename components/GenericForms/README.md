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
complicated field-level validation with custom error messages, and you
want to do those things inside React. But they don't reduce the
verbosity of dealing with forms in React.

The opposite approach would be to use [uncontrolled
components](https://reactjs.org/docs/uncontrolled-components.html),
and just let the browser handle displaying the form, managing its
state, and validating its data as far as possible. For many cases,
where the form is relatively simple, this approach is sufficient. The
main problem is that this approach doesn't work well with single-page
applications: submitting a form causes the browser to navigate to a
new URL. You can provide an event handler that prevents this; but then
how do you submit the form's data? And what if you want to do
something else with that data before you submit it? You somehow need
to get the form data back *into* your React code when the user submits
the form, so you can use that data to make a request and render things
like error messages.

That is the main problem that the components here solve. The approach
is to let you build forms with uncontrolled components, letting the
browser manage their state as the user interacts with them. But it
provides a simple way of getting the form data back into your code
*when the user submits the form*, so you can do what you like with it:
validate it further, add some additional data, submit it to the
server, or whatever else. Essentially, the form state is a black box
that your application doesn't know about until the user clicks submit.

## Components defined here

`Form`: displays a form, validates data on submission, and dispatches
Redux actions with the validated data and any validation errors

`Button`: displays a button

`ResetButton`: displays a button that resets the containing form to its default state

`SubmitButton`: displays a button that submits the containing form

`Checkbox`: displays a checkbox with a corresponding label and validation feedback

`Select`: displays an HTML select element with a corresponding label
and validation feedback

`TextInput`: displays a text input with a corresponding label and
validation feedback

## Recipe

You create a `Form` with three callbacks:

     - `validator`, which will receive the unvalidated form data
     - `submitTo`, which will receive the validated form data
     - `errorsTo`, which will receive any validation errors 
     
When the form is submitted, an object containing the form data is
first passed to a validator callback. The validator should return an
object to be passed to the submitTo callback, or raise a
ValidationError, which will be passed to the errorsTo callback.

A useful pattern:

  1. write your form with uncontrolled components, using their
     defaultValue props to initialize the form with data from the
     parent component, and using the [browser-provided field
     validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints)
     as much as possible.
  2. have your submitTo function post the form data directly to the
     server. This function will only be called once all the
     browser-level validation passes *and* your validator function
     returns.
  3. have your errorsTo function set state in the parent component
     that can be used to re-render the form with any validation error
     messages
