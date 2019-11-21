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

// GenericDisplay/component.jsx
// Definition of generic display components that are reused elsewhere

import { withNullAsString } from '../../helpers';
import { ValidationError } from '../../validation';

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
//   validator (optional) :: Object -> Object. Receives the form data after submit.
//     Should return an object that will be passed to the submitAction.  
//     If the form data is invalid, it should throw a ValidationError
//     with an object that maps field names to error messages.
//   submitTo :: Object -> (anything). Callback that should receive the object
//     containing validated form data.
//   errorsTo :: Object -> (anything). Callback that should receive an object
//     representing errors encountered in validation.
//   className (optional), extras (optional): combined to create the className
//     for the <form> (no default)
function Form(props) {
    
    const validator = props.validator || (data => data); 

    function dispatchData(e) {
        e.preventDefault();
        
        // get the data out of the form: e.target is a reference to
        // the form's DOM node, and we can pass that directly to the
        // FormData API to get an object representing the form's data;
        // see: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
        const formData = new FormData(e.target);

        // transform the FormData object into a regular object for ease of use:
        const data = Object.fromEntries(formData.entries());

        try {
            const validatedData = validator(data);
            props.submitTo(validatedData);
        } catch (e) {
            if (e instanceof ValidationError) {
                props.errorsTo(e); // TODO: also send the data?
            } else {
                throw e;
            }
        }
    }

    return (
        <form {...props} 
              onSubmit={dispatchData}
              className={classNames(props.className, props.extras)}>
          {props.children}
        </form>
    );
}

// props:
//   id :: String
//   type (optional) :: String, defaults to 'button'
//   text (optional) :: String to use as button text; defaults to props.children
//   className (optional), defaults to 'btn'
//   extras (optional), extra classes for button 
// All other props will be passed down to <button>, such as:
//   onClick 
//   disabled
//   
export function Button(props) {
    return (
        <button {...props}
                name={props.id} 
                type={props.type || 'button'}
                className={withDefault('btn', props)}
                onClick={props.disabled ? undefined : props.onClick}>
            {props.text || props.children}
          </button>
    );
}

export function ResetButton(props) {
    return (
        <Button {...props} type='reset' />
    );
}

export function SubmitButton(props) {
    return (
        <Button {...props} type='submit' />
    );
}

// props:
//   id :: String
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
//    name
//    defaultChecked
//    onChange
//    disabled
//    required 
export function Checkbox(props) {
    return (
        <React.Fragment>
          <input {...props}
                 type='checkbox'
                 className={withDefault('form-check-input', props)}
          />
          <label className={
              withDefault('form-check-label', {
                  className: props.labelClassName,
                  extras: props.labelExtras
              })}
                 htmlFor={props.id}>
            {props.label}
          </label>
          {props.feedback &&
            <small className={
               withDefault('form-text', {
                   className: props.feedbackClassName,
                   extras: props.feedbackExtras
               })}>
               {props.feedback}
             </small>
          }
        </React.Fragment>
    );
}
 
// props:
//   id :: String
//   label :: String
//   type (optional) :: String, defaults to 'text' (but could be 'email', 'url', etc.) 
//   feedback (optional) :: String, message to display below checkbox 
//   className (optional), defaults to 'form-control'
//   extras (optional), extra classes for text input
//   labelClassName (optional),  defaults to 'sr-only'
//   labelExtras (optional), extra classes for label 
//   feedbackClassName (optional), className for feedback message
//      Defaults to 'form-text'
//   feedbackExtras (optional), extras for feedback message
// All other props will be passed to <input>, such as:
//   onChange
//   defaultValue
//   placeholder
//   autoFocus
//   disabled
//   required
//   pattern
export function TextInput(props) {
    return (
        <React.Fragment>
          <label className={
              withDefault('sr-only', {
                  className: props.labelClassName,
                  extras: props.labelExtras
              })}
                 htmlFor={props.id}>
            {props.label}
          </label>
          <input {...props}
                 type={props.type || 'text'}
                 name={props.id}
                 className={withDefault('form-control', props)}
          />
          {props.feedback &&
            <small className={
               withDefault('form-text', {
                   className: props.feedbackClassName,
                   extras: props.feedbackExtras
               })}>
               {props.feedback}
             </small>
          }
        </React.Fragment>
    );
}

// props:
//   id :: String
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
//   labelClassName (optional),  defaults to 'sr-only'
//   labelExtras (optional), extra classes for label 
//   feedbackClassName (optional), className for feedback message
//      Defaults to 'form-text'
//   feedbackExtras (optional), extras for feedback message

// All other props will be passed to <select>, such as:
export function Select(props) {
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
          <label className={classNames(props.labelClassName || 'sr-only', props.labelExtras)}
                 htmlFor={props.id}>
            {props.label}
          </label>
          <select {...props}
                  name={props.id}
                  onChange={onChange}
                  className={withDefault('custom-select', props)}>
            {props.data || props.children}
          </select>
          {props.feedback &&
            <small className={
               withDefault('form-text', {
                   className: props.feedbackClassName,
                   extras: props.feedbackExtras
               })}>
               {props.feedback}
             </small>
          }
        </>
    );
}

