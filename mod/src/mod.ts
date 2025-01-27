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
import { QuestTypeEnum } from "@spt/models/enums/QuestTypeEnum";

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

        let newQuests = Object.values(quests);
        let newCrafts = Object.values(crafts);

        newCrafts = Array.isArray(crafts) ? crafts : [];
        newQuests = Array.isArray(quests) ? quests : [];


        // Add new recipes
        for (const craftToAdd of newCrafts) {
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

        // Add new quests
        for (const questToAdd of newQuests) {
            // Check if quest exists
            for(const quest of Object.values(tables.templates.quests)) {
                if(quest._id === questToAdd._id) {
                    this.logger.logWithColor(
                        `[ViniHNS] ${this.mod} - Quest ${questToAdd._id} already exists`,
                        LogTextColor.YELLOW
                    );
                    return;
                }
            }

            questToAdd.type = questToAdd.type as QuestTypeEnum;

            tables.templates.quests[questToAdd._id] = questToAdd;
        }

        const existingQuest = tables.templates.quests[newQuests[0]._id];
            this.logger.logWithColor(`[ViniHNS] ${this.mod} - existingQuest ${existingQuest}`, LogTextColor.GREEN);

        this.logger.logWithColor(
            `[ViniHNS] ${this.mod} - Database Loaded`,
            LogTextColor.GREEN
        );
    }
}

export const mod = new Mod();
