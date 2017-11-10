import * as fs from "fs-extra";
import * as path from "path";
import { BasePackage } from "../contracts/app-contracts";
export const PACKAGE_JSON = fs.readJSONSync(path.join(__dirname, "../../../package.json")) as BasePackage;
