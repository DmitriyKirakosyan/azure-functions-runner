import * as fs from 'fs';
import * as path from 'path'
import { AzureFunction, AzureFunctionBindings, Context } from './AzureFunction'
import { AzureFunctionDescriptor } from './AzureFunctionDescriptor'

const FUNCTINON_JSON_TEMPLATE = 'function.json';
const FUNCTINON_INDEX_TEMPLATE = 'index.js';
const FUNCTINON_PACKAGE_JSON_TEMPLATE = 'package.json';

/**
 * Represent builder of azure functions.
 */
export class AFBuilder {

    private rootDirectory: string;

    /**
     * Initialize new instance of AFBuilder
     */
    constructor(rootDirectory: string) {
        this.rootDirectory = rootDirectory;
    }

    /**
     *Gets list of azure functions
     */
    public build(): AzureFunction[] {
        let functionDescriptors: AzureFunctionDescriptor.FunctionFilesDescriptor[] = this.getFunctionFilesDescriptors();
        if (!functionDescriptors || functionDescriptors.length === 0) {
            return null;
        }

        let result: AzureFunction[] = [];
        functionDescriptors.forEach((item: AzureFunctionDescriptor.FunctionFilesDescriptor) => {
            let bindings: AzureFunctionBindings = this.generateBindings(item.getJsonPath);
            let func: Function = require(item.getFunctionPath);
            if (bindings && func) {
                let af: AzureFunction = new AzureFunction(item.getFunctionPath, bindings, func);
                af.setPackageJsonPath = item.getPackageJsonPath;
                result.push(af);
            }
        });

        return result;
    };

    public generateContext(req: any, res: any, binding: AzureFunctionBindings): Context {
        if (!req || !res || !binding) {
            return null;
        }

        let context: Context = new Context;
        context.setLog = console.log;
        context[binding.getBindingIn.getName] = {
            originaUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            method: req.method,
            query: {},
            headers: req.headers,
            params: req.params,
            body: req.body
        };

        context[binding.getBindingOut.getName] = {
            headers: {},
            body: undefined
        }

        return context;
    }

    public generateUrl(afPostfix) {
        if (!afPostfix) {
            return null;
        }

        let expressUrl = afPostfix;
        expressUrl = expressUrl.replace(/{/g, ":");
        expressUrl = expressUrl.replace(/}/g, "");
        expressUrl = expressUrl.trim();
        return expressUrl;
    }

    /**
     * Gets list of functio descriptors from @rootDirectory
     */
    private getFunctionFilesDescriptors(): AzureFunctionDescriptor.FunctionFilesDescriptor[] {
        let descriptorsList: AzureFunctionDescriptor.FunctionFilesDescriptor[] = [];

        fs.readdirSync(this.rootDirectory).forEach(file => {
            let p: string = path.resolve(path.join(this.rootDirectory, file));
            if (fs.lstatSync(p).isDirectory()) {
                let func: AzureFunctionDescriptor.FunctionFilesDescriptor = this.getFunctionFileDescriptor(p);
                if (func) {
                    descriptorsList.push(func);
                }
            }
        });

        return descriptorsList;
    }

    /**
     * Gets specific function descriptor
     */
    private getFunctionFileDescriptor(functionFolder: string): AzureFunctionDescriptor.FunctionFilesDescriptor {
        let funcPath: string = path.resolve(path.join(functionFolder, FUNCTINON_INDEX_TEMPLATE));
        let funcJsonPath: string = path.resolve(path.join(functionFolder, FUNCTINON_JSON_TEMPLATE));
        let packageJsonPath: string = path.resolve(path.join(functionFolder, FUNCTINON_PACKAGE_JSON_TEMPLATE));

        if (!fs.existsSync(funcPath) || !fs.existsSync(funcJsonPath)) {
            return null;
        }

        let descriptor: AzureFunctionDescriptor.FunctionFilesDescriptor = new AzureFunctionDescriptor.FunctionFilesDescriptor(funcPath, funcJsonPath);

        if (fs.existsSync(packageJsonPath)) {
            descriptor.setPackageJsonPath = packageJsonPath;
        }

        return descriptor;
    }

    /**
     * Generate binding by the function.json file
     **/
    private generateBindings(functionJsonPath: string): AzureFunctionBindings {
        if (!functionJsonPath) {
            return null;
        }

        let jsonDescriptor: any = JSON.parse(fs.readFileSync(functionJsonPath, 'utf8').toString().trim());
        let disabled: boolean = jsonDescriptor.disabled;
        let bindingIn: AzureFunctionDescriptor.BindingIn;
        let bindingOut: AzureFunctionDescriptor.BindingOut;

        jsonDescriptor.bindings.forEach(bindingItem => {
            if (bindingItem.direction === "in") {
                bindingIn = new AzureFunctionDescriptor.BindingIn(bindingItem.name, bindingItem.methods, bindingItem.route);
            } else if (bindingItem.direction === "out") {
                bindingOut = new AzureFunctionDescriptor.BindingOut(bindingItem.name);
            }
        });

        return new AzureFunctionBindings(disabled, bindingIn, bindingOut);
    }
}