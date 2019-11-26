// Copyright 2019 Richard Lawrence
//
// This file is part of germanet-common.
//
// germanet-common is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// germanet-common is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with germanet-common.  If not, see <https://www.gnu.org/licenses/>.

import { ValidationErrors } from './validation';
import { InternalError } from '../../errors';
import { Alert } from '../GenericDisplay/component';

import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

// helper for constructing className prop.  The convention is:
// props.className, if given, *replaces* the default class name;
// props.extras, if given, are *added* to the class name.
// See the README for motivation and examples for this convention.
function withDefault(dfault, props) {
    return classNames(props.className || dfault, props.extras);
}

// props:
//   submitTo :: Object -> (anything). Callback that should receive the object
//     containing validated form data.
//   validator (optional) :: Object -> Object. Receives the form data after submit.
//     Should return an object that will be passed to the submitAction.  
//     If the form data is invalid, it should throw a ValidationErrors
//     object to prevent submission of the data to the submitTo callback.
//     Defaults to the identity function (i.e., all data is valid).
//   errorsTo (optional) :: Object -> (anything). Callback that should receive
//     any ValidationErrors object thrown by the validator.
//   className (optional), extras (optional): combined to create the className
//     for the <form> (no default)
export function Form(props) {

    // remove props that we can't send on to the <form> element:
    const { submitTo, validator, errorsTo, className, extras, ...rest } = props;

    const validate = (typeof validator === 'function') ? validator : (data => data); 
    const fwdError = (typeof errorsTo === 'function') ? errorsTo : (errors => null);

    function dispatchData(e) {
        e.preventDefault();
        
        // get the data out of the form: e.target is a reference to
        // the form's DOM node, and we can pass that directly to the
        // FormData API to get an object representing the form's data;
        // see: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
        const formData = new FormData(e.target);

        // transform the FormData object into a regular object which
        // maps field names to data, for ease of use inside the
        // validator and submitTo callbacks:
        const data = Object.fromEntries(formData.entries());

        try {
            const validatedData = validate(data);
            submitTo(validatedData);
        } catch (e) {
            if (e instanceof ValidationErrors) {
                fwdError(e); 
            } else {
                throw e;
            }
        }
    }

    return (
        <form {...rest} 
              onSubmit={dispatchData}
              className={classNames(className, extras)}>
          {props.children}
        </form>
    );
}

// props:
//   submitAction: a Redux thunk action creator that accepts form data and returns the Promise
//     associated with an axios request.
//   validator (optional): a validator function that will be passed on to <Form>
// children: a ManagedForm should have exactly one child, which should
//   act as a render function: it will receive an object representing
//   the form state as input, which it can use to render the body of
//   the form. The output of this function will be wrapped in a <Form>
//   element, so it should not use <Form> itself.
class ManagedForm extends React.Component {
    constructor(props){
        super(props);
        this.defaultState = {
            submitting: false,
            submitSuccess: false,
            submitFailure: false,
            submittedData: undefined,
            serverResponse: undefined,
            formErrors: [],
            fieldErrors: {},
        };
        this.state = this.defaultState;

        this.validationErrors = this.validationErrors.bind(this);
        this.requestErrors = this.requestErrors.bind(this);
        this.reset = this.reset.bind(this);
        this.submit = this.submit.bind(this);
    }

    // handler for validation errors raised before the request is submitted: 
    validationErrors(errors) {
        // errors will be a ValidationErrors object with .formErrors and .fieldErrors: 
        this.setState({ formErrors: errors.formErrors,
                        fieldErrors: errors.fieldErrors });
    }

    // handler for errors that arise during the request-response cycle:
    requestErrors(error) {
        if (error.response) {
            // the server responded, but with a response code outside
            // of 2xx; we don't try to figure out here what happened,
            // but we make the response available to the children so
            // they can:
            this.setState({ submitFailure: true,
                            serverResponse: error.response });
        } else if (error.request) {
            // the server didn't respond, so there's nothing else for
            // us to record here:
            this.setState({ submitFailure: true });
        } else {
            // the error occurred in setting up the request; it
            // probably represents a frontend programming error and we
            // should notify someone about it:
            throw error;
        }
    }

    // manages the request-response cycle:
    submit(data) {
        this.setState({ submitting: true, submittedData: data });
        this.props.doSubmit(data)
            .then(response => {
                this.setState({ submitting: false, submitSuccess: true, serverResponse: response });
            })
            .catch(error => this.requestErrors(error));
    }

    // passed down to children so they can clear the form, including any errors, if desired:
    reset(e) {
        // Note: we *don't* call e.preventDefault here, so that it can
        // be passed as the onClick prop of a ResetButton, and the
        // click event will still reset the uncontrolled elements on a
        // form back to their default values
        this.setState(this.defaultState);
    }

    render() {
        if (typeof this.props.children !== 'function') {
            throw new InternalError("ManagedForm requires a render function as its only child");
        }

        const formState = {
            ...this.state,
            reset: this.reset
        };

        return (
            <Form validator={this.props.validator} submitTo={this.submit} errorsTo={this.validationErrors}>
              {this.props.children(formState)}
            </Form>
        );

    }
}

function managedFormDispatchToProps(dispatch, ownProps) {
    return {
        doSubmit: data => dispatch(ownProps.submitTo(data))
    };
}

ManagedForm = connect(undefined, managedFormDispatchToProps)(ManagedForm);
export { ManagedForm }


// props:
//   type (optional) :: String, defaults to 'button'
//   text (optional) :: String to use as button text; defaults to props.children
//   className (optional), defaults to 'btn'
//   extras (optional), extra classes for button 
// All other props will be passed down to <button>, such as:
//   onClick 
//   disabled
export function Button(props) {
    // remove props that we can't send on to the <button> element:
    const { type, text, className, extras, ...rest } = props;

    return (
        <button {...rest}
                type={type || 'button'}
                className={withDefault('btn', props)}
                onClick={props.disabled ? undefined : props.onClick}>
          {text || props.children}
        </button>
    );
}

// props: same as Button
export function ResetButton(props) {
    return (
        <Button {...props} type='reset' />
    );
}

// props: same as Button
export function SubmitButton(props) {
    return (
        <Button {...props} type='submit' />
    );
}

// props:
//   label :: String
//   feedback (optional) :: String, message to display below checkbox 
//   className (optional), defaults to 'form-check-input'
//   extras (optional), extra classes for checkbox input
//   labelClassName (optional), defaults to 'form-check-label'
//   labelExtras (optional), extra classes for label 
//   feedbackClassName (optional), className for feedback message
//      Defaults to 'form-text'
//   feedbackExtras (optional), extras for feedback message
// All other props will be passed down to <input>, such as:
//    name (required, determines field name in form submission)
//    id (required for properly associating the <label>; defaults to name)
//    defaultChecked
//    onChange
//    disabled
//    required 
export function Checkbox(props) {
    // remove the props that we can't send down to the <input> element:
    const { label, feedback,
            className, extras,
            labelClassName, labelExtras,
            feedbackClassName, feedbackExtras,
            ...rest } = props;

    // We need an ID to associate the label with the checkbox, because
    // Bootstrap styling doesn't work with a <label> that is wrapped
    // around its associated input element. We could technically run
    // into problems here by setting the input's id attribute to a
    // value that isn't unique on the page, since this would make the
    // HTML invalid. But the risk that this will cause problems seems
    // low, and the benefit is that you don't have to write e.g.
    // <Checkbox id="editedCheckbox" name="edited" />, which is
    // verbose and redundant. This comment also applies to the other
    // places where id is set using name below.
    const id = rest.id || rest.name;

    return (
        <React.Fragment>
          <input {...rest}
                 type='checkbox'
                 id={id}
                 className={withDefault('form-check-input', props)}
          />
          <label className={classNames(labelClassName || 'form-check-label', labelExtras)}
                 htmlFor={id}>
            {label}
          </label>
          {props.feedback &&
           <small className={classNames(feedbackClassName || 'form-text', feedbackExtras)}>
             {props.feedback}
           </small>
          }
        </React.Fragment>
    );
}
 
// props:
//   label :: String
//   type (optional) :: String, defaults to 'text' (but could be 'email', 'url', etc.) 
//   feedback (optional) :: String, message to display below checkbox 
//   className (optional), defaults to 'form-control'
//   extras (optional), extra classes for text input
//   labelClassName (optional),  no default 
//   labelExtras (optional), extra classes for label 
//   feedbackClassName (optional), className for feedback message
//      Defaults to 'form-text'
//   feedbackExtras (optional), extras for feedback message
// All other props will be passed to <input>, such as:
//   name (required, determines field name in form submission)
//   id (required for properly associating the <label>; defaults to name)
//   name
//   onChange
//   defaultValue
//   placeholder
//   autoFocus
//   disabled
//   required
//   pattern
export function TextInput(props) {
    // remove the props that we can't send down to the <input> element:
    const { label, type, feedback,
            className, extras,
            labelClassName, labelExtras,
            feedbackClassName, feedbackExtras,
            ...rest } = props;

    // See comment in Checkbox, above:
    const id = rest.id || rest.name;

    return (
        <React.Fragment>
          <label className={classNames(labelClassName, labelExtras)}
                 htmlFor={id}>
            {label}
          </label>
          <input {...rest}
                 type={type || 'text'}
                 id={id}
                 className={withDefault('form-control', props)}
          />
          {props.feedback &&
           <small className={classNames(feedbackClassName || 'form-text', feedbackExtras)}>
             {props.feedback}
           </small>
          }
        </React.Fragment>
    );
}

// props:
//   label :: String
//   data (optional) :: [ Object ]
//     The options to be displayed in the select element.
//     Defaults to props.children.
//   choose (optional) :: (String) -> (anything), a callback to call with an item value
//     when that item is selected. If this function is given it will be used to create
//     the underlying <select>'s onChange prop. 
//   disabled (optional) :: Bool
//   className (optional), defaults to 'custom-select' 
//   extras (optional), extra classes for select
//   labelClassName (optional), no default
//   labelExtras (optional), extra classes for label 
//   feedbackClassName (optional), className for feedback message
//      Defaults to 'form-text'
//   feedbackExtras (optional), extras for feedback message
// All other props will be passed to <select>, such as:
//   name (required, determines field name in form submission)
//   id (required for properly associating the <label>; defaults to name)
//   name
//   onChange
//   defaultValue
//   placeholder
//   autoFocus
//   disabled
//   required
export function Select(props) {
    // remove the props we can't send down to the <select> element:
    const { label, data, choose, feedback,
            className, extras,
            labelClassName, labelExtras,
            feedbackClassName, feedbackExtras,
            ...rest } = props;

    // See comment in Checkbox, above:
    const id = rest.id || rest.name;
    
    function chooseItem(e) {
        const itemId = e.target.value;
        props.choose(itemId);
    }

    // Allow the user to provide onChange directly, or to use an
    // uncontrolled component, but support the 'choose' function if
    // given, which makes it easier to create a controlled component:
    const onChange = props.onChange || (props.choose ? chooseItem : undefined);
 
    return (
        <>
          <label className={classNames(labelClassName, labelExtras)}
                 htmlFor={id}>
            {label}
          </label>
          <select {...rest}
                  id={id}
                  onChange={onChange}
                  className={withDefault('custom-select', props)}>
            {data || props.children}
          </select>
          {props.feedback &&
           <small className={classNames(feedbackClassName || 'form-text', feedbackExtras)}>
             {props.feedback}
           </small>
          }
        </>
    );
}

// props:
//   success (optional) :: String, message to be displayed as a success Alert 
//   warnings (optional) :: [String], messages to be displayed as warning Alerts
//   errors (optional) :: [String], messages to be displayed as danger Alerts
export function FormAlerts(props) {
    const successAlert = props.success
          ? [<Alert type='success' text={props.success}/>]
          : [];
    const warningAlerts = props.warnings && props.warnings.length
          ? props.warnings.map(w => <Alert type='warning' text={w}/>)
          : [];
    const errorAlerts = props.errors && props.errors.length
          ? props.errors.map(e => <Alert type='danger' text={e}/>)
          : [];

    return successAlert.concat(errorAlerts).concat(warningAlerts);
}
