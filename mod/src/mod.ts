/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";

import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";

import crafts from "../crafts/crafts.json";


// -----------------------------
class Mod implements IPostDBLoadMod, IPreSptLoadMod 
{
    private mod: string;
    private logger: ILogger;

    constructor() 
    {
        this.mod = "Tarkov Craft"; // Set name of mod so we can log it to console later
    }

    public preSptLoad(container: DependencyContainer): void 
    {
    // Get SPT code/data we need later
        this.logger = container.resolve<ILogger>("WinstonLogger");
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // Add new recipes
        for (const craftToAdd of crafts) {
            // Check if recipe already exists
            const existingRecipe = tables.hideout.production.recipes.find((recipe) => recipe._id === craftToAdd._id);
            if (!existingRecipe) {
                tables.hideout.production.recipes.push(craftToAdd);
            } else {
                this.logger.logWithColor(
                    `[ViniHNS] ${this.mod} - Recipe ${craftToAdd._id} already exists`,
                    LogTextColor.YELLOW
                );
            }
        }

        this.logger.logWithColor(
            `[ViniHNS] ${this.mod} - Database Loaded`,
            LogTextColor.GREEN
        );
    }
}

export const mod = new Mod();
