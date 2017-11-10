import { Arguments } from "yargs";

export interface BasePackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    license?: string;
}

export interface CLIArgumentsObject extends Arguments {
    config?: string | boolean;
    logPath?: string;
    container?: string | boolean;
    noCache?: boolean;
}
