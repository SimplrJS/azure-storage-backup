// This module is designed to work with "Yargs" (https://github.com/yargs/yargs)
// File structure is restricted by requirements of Yargs Module:
//      https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module

import { CommandBuilder } from "yargs";
// import * as inquirer from "inquirer";
import { Questions, prompt } from "inquirer";
import { CommandHandler } from "../contracts";

export const command: string = "init";

export const describe: string = "Run configuration prompts.";

export const builder: CommandBuilder = {};

export const handler: CommandHandler = async () => {
    const questions: Questions = [
        {
            type: "input",
            name: "first_name",
            message: "What's your first name"
        },
        {
            type: "input",
            name: "last_name",
            message: "What's your last name",
            default: "Doe"
        }
    ];

    const answers = await prompt(questions);

    console.log(answers);

};
