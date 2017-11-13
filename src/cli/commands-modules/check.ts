// TODO: implement.
import { CommandModule } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";

class CheckWithAzureCommandClass implements CommandModule {
    public command: string = "check";

    public describe: string = "Checks correlation between data in Azure storage account and data in your outDir.";

    public handler = async (options: CLIArgumentsObject) => {
        console.info("Command check.");
    }
}

export const CheckWithAzureCommand = new CheckWithAzureCommandClass;
