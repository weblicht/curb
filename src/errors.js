// errors.js
// common error creation and handling

// represents an error in using an internal API: e.g., an action was
// emitted without a required field
export class InternalError {
    constructor(msg) {
        this.message = msg;
    }
}
