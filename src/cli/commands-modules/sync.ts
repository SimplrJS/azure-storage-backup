// TODO: implement.
import { CommandModule } from "yargs";
import { CLIArgumentsObject } from "../cli-contracts";

class SynchronizationCommandClass implements CommandModule {
    public command: string = "sync";

    public describe: string = "Synchronizes storage account content in Azure and your outDir.";

    public handler = async (options: CLIArgumentsObject) => {
        console.info("Command sync.");

        // TODO: cache 'check-list.json' in RAM and delete file, than download 'check-list' files.
    }
}

export const SynchronizationCommand = new SynchronizationCommandClass;
