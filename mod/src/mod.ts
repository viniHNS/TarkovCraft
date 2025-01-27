/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";

import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";

import crafts from "../crafts/crafts.json";
import quests from "../quests/quests.json";
import questLocales from "../quests/questLocales.json";
import config from "../config/config.json";


// -----------------------------
class Mod implements IPostDBLoadMod, IPreSptLoadMod 
{
    private mod: string;
    private logger: ILogger;

    public customLogger(message: string, color: LogTextColor): void {
        if (config.debug) this.logger.logWithColor(message, color);
    }

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

        // Add new crafts
        const newCrafts = crafts;
        const newQuests = quests;


        // Add new recipes
        for (const craftToAdd of newCrafts) {
            // Check if recipe already exists
            const existingRecipe = tables.hideout.production.recipes.find((recipe) => recipe._id === craftToAdd._id);
            if (!existingRecipe) {
                tables.hideout.production.recipes.push(craftToAdd);
                this.customLogger(`[ViniHNS] ${this.mod} - Added Recipe ${craftToAdd._id}`, LogTextColor.GREEN);    
            } else {
                this.customLogger(`[ViniHNS] ${this.mod} - Recipe ${craftToAdd._id} already exists`, LogTextColor.MAGENTA);
            }
        }

    
        // Add new quests
        for (const questToAdd in newQuests) {
            this.customLogger(`[ViniHNS] ${this.mod} - Adding Quest ${questToAdd}`, LogTextColor.GREEN);
            // Check if quest exists
            let questExists = false;
            for(const quest in tables.templates.quests){
                if(quest === questToAdd) {
                    this.customLogger(`[ViniHNS] ${this.mod} - Quest ${questToAdd} already exists`, LogTextColor.MAGENTA);
                    questExists = true;
                    break;
                }
            }
            if(questExists) continue;

            // Add quest
            tables.templates.quests[questToAdd] = newQuests[questToAdd];
            this.customLogger(`[ViniHNS] ${this.mod} - Added Quest ${questToAdd}`, LogTextColor.GREEN);
        }

        // Add quest locales
        for (const questLocale in questLocales) {
            tables.locales.global["en"][questLocale] = questLocales[questLocale];
            this.customLogger(`[${this.mod}] Added Locale ${questLocale}`, LogTextColor.GREEN);
        }

        
        this.logger.logWithColor(
            `[ViniHNS] ${this.mod} - Database Loaded`,
            LogTextColor.GREEN
        );
    }
}

export const mod = new Mod();
