import { AzureFunctionDescriptor } from './AzureFunctionDescriptor'

/**
 * Represent azure function bindings
 */
export class AzureFunctionBindings {

    private disabled: boolean;
    private bindingIn: AzureFunctionDescriptor.BindingIn;
    private bindingOut: AzureFunctionDescriptor.BindingOut;

    constructor(disabled: boolean, bindingIn: AzureFunctionDescriptor.BindingIn, bindingOut: AzureFunctionDescriptor.BindingOut) {
        this.disabled = disabled;
        this.bindingIn = bindingIn;
        this.bindingOut = bindingOut;
    }

    get isDisabled(): boolean {
        return this.disabled;
    }

    get getBindingIn(): AzureFunctionDescriptor.BindingIn {
        return this.bindingIn;
    }

    get getBindingOut(): AzureFunctionDescriptor.BindingOut {
        return this.bindingOut;
    }
}

/**
 * Represent the execution context of specific function.
 * Also to instance of this object can be added properties dynamically at runtime
 */
export class Context {

    private log: Function;

    private done: Function;

    set setLog(log: Function) {
        this.log = log;
    }

    get Log(): Function {
        return this.log;
    }

    set setDone(done: Function) {
        this.done = done;
    }

    get getDone(): Function {
        return this.done;
    }
}

/**
 * Represent the full azure function 
 */
export class AzureFunction {

    private bindings: AzureFunctionBindings;
    private func: Function;
    private name: string;
    private packageJsonPath: string

    constructor(name: string, bindings: AzureFunctionBindings, func: Function) {
        this.bindings = bindings;
        this.func = func;
        this.name = name;
    }

    get getBindings(): AzureFunctionBindings {
        return this.bindings;
    }

    get getFunc(): Function {
        return this.func;
    }

    get getName(): string {
        return this.name;
    }

    get getPackageJsonPath(): string {
        return this.packageJsonPath;
    }

    set setPackageJsonPath(packageJsonPath: string) {
        this.packageJsonPath = packageJsonPath;
    }
}