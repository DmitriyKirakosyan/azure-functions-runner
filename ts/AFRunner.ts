import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as childProcess from "child_process"

import { AzureFunction, Context } from './AzureFunction';
import { AFBuilder } from './AFBuilder';

import { config } from 'dotenv';
config();

const LOG_LEVELS = ["error", "silly", "debug", "verbose", "info", "warn"];

/**
 * Represent the runner of azure functions
 */
export class AFRunner {

    private port: number;
    private builder: AFBuilder;
    private logLvl: string;

    constructor(rootDir: string) {
        if (!rootDir) {
            throw new Error("The root directory must be defined");
        }

        this.builder = new AFBuilder(rootDir);
        this.port = 3001;
    }

    set setPort(port: number) {
        this.port = port;
    }

    set setLogLevel(logLevel: string) {
        this.logLvl = logLevel;
    }

    public start(): void {
        let app: express.Application = express();
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        this.addLogLevel(app, this.logLvl);

        let server = app.listen(this.port, () => console.log('Functions app listen a port ' + this.port + '.'));
        let azureFuntions: AzureFunction[] = this.builder.build();
        if (!azureFuntions || azureFuntions.length === 0) {
            console.log('\x1b[31m%s\x1b[0m', "Azure functions not found.");
            server.close();
            return;
        }

        azureFuntions.forEach((af: AzureFunction) => {
            if (af.getBindings.isDisabled) {
                console.log('\x1b[33m%s\x1b[0m', "Function: " + af.getName + "(DISABLED)");
                return;
            }

            if (!af.getPackageJsonPath) {
                this.createSpeificFunction(af, app);
            }
            else {
                this.installPackages(af.getPackageJsonPath).then(() => {
                    this.createSpeificFunction(af, app);
                },
                    (error) => {
                        throw new Error(error);
                    });
            }
        });
    }

    private createSpeificFunction(af: AzureFunction, app: express.Application): void {
        af.getBindings.getBindingIn.getMethods.forEach((method: string) => {
            if (method.toLowerCase() === "options") {
                return;
            }

            app[method]("/api/" + this.builder.generateUrl(af.getBindings.getBindingIn.getRoute), (req, res) => {
                let context: Context = this.builder.generateContext(req, res, af.getBindings);
                context.setDone = () => {
                    let funcHeaders: any = context[af.getBindings.getBindingOut.getName].headers;
                    if (funcHeaders) {
                        res.set(funcHeaders);
                    }

                    res.headers = context[af.getBindings.getBindingOut.getName].headers;
                    res.status(context[af.getBindings.getBindingOut.getName].status).json(context[af.getBindings.getBindingOut.getName].body);
                };
                af.getFunc(context);
            });
            console.log('\x1b[32m%s\x1b[0m',
                'Function: http://localhost:' + this.port + '/api/' + this.builder.generateUrl(af.getBindings.getBindingIn.getRoute) + "(" + method.toUpperCase() + ")");
        });
    }

    private addLogLevel(app: express.Application, logLevel: string): void {
        if (!logLevel || !LOG_LEVELS.indexOf(logLevel.toLocaleLowerCase())) {
            return;
        }

        let winston = require("winston");
        let expressWinston = require("express-winston");
        let morgan = require("morgan");
        app.use(morgan('combine'));
        app.use(expressWinston.logger({
            transports: [
                new winston.transports.Console({
                    json: true,
                    colorize: true,
                    level: logLevel
                })
            ],
            level: logLevel,
            requestWhitelist: ['body'],
            responseWhitelist: ['body']
        }));
    }

    private installPackages(packageJsonPath: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!packageJsonPath) {
                resolve();
            }

            let command = (/^win/.test(process.platform)) ? "npm.cmd" : "npm";
            command += " install";
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
}