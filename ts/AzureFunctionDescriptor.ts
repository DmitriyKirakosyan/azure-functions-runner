/**
 * Module that stored full descriptor of specific azure function
 */
export module AzureFunctionDescriptor {

    /**
     * Represent core of binding item
     **/
    export abstract class Binding {

        private name: string;

        constructor(name: string) {
            this.name = name;
        }

        get getName(): string {
            return this.name;
        }
    }

    /**
     * Represent binding in argumet
     **/
    export class BindingIn extends Binding {

        private methods: string[];
        private route: string;

        constructor(name: string, methods: string[], route: string) {
            super(name);
            this.methods = methods;
            this.route = route;
        }

        get getMethods(): string[] {
            return this.methods;
        }

        get getRoute(): string {
            return this.route;
        }
    }

    /**
     * Represent binding out argumet
     **/
    export class BindingOut extends Binding {

        constructor(name: string) {
            super(name);
        }

    }

    /**
     * Represent descriptor that stored path to files of specific function
     */
    export class FunctionFilesDescriptor {

        private functionPath: string;
        private jsonPath: string;
        private packageJsonPath: string

        constructor(functionPath: string, jsonPath: string) {
            this.functionPath = functionPath;
            this.jsonPath = jsonPath;
        }

        get getFunctionPath(): string {
            return this.functionPath;
        }

        get getJsonPath(): string {
            return this.jsonPath;
        }

        get getPackageJsonPath(): string {
            return this.packageJsonPath;
        }

        set setPackageJsonPath(packageJsonPath: string) {
            this.packageJsonPath = packageJsonPath;
        }
    }


}