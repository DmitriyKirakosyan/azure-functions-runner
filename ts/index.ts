import { AFRunner } from "./AFRunner";

export function run(rootDir: string = './', port: number = null): void {
    if (!rootDir) {
        throw new Error("The root directory must be defined");
    }

    let runner: AFRunner = new AFRunner(rootDir);

    if (port) {
        runner.setPort = port;
    }
    runner.start();
}