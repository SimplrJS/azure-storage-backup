import * as fs from "fs";
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

export interface LocalFileDto extends fs.Stats {
    path: string;
}

export interface BasePackage {
    name: string;
    version: string;
    description?: string;
    main: string;
    author?: string;
    license?: string;
}
