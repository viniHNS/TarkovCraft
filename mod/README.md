# Tarkov Craft

## What is this?

This is a mod for [SPT](https://www.sp-tarkov.com "The main goal of the project is to provide a single-player offline experience with ready-to-use progression for the official BSG client. Now you can play Escape From Tarkov while waiting for their servers to come back online, when you're offline, or if you need a break from cheaters.") that you can use to add custom recipes to the game.

## Usage
### Adding a recipe
To add a recipe, go to the folder `crafts` and put your recipe in the `crafts.json`, inside the `[]` (You can use [THIS](https://vinihns.github.io/TarkovCraft/) tool to create the JSONs). The recipe must be a JSON file with the following structure:

```json
// Area types:
    |-----------------------------------------------------|
    |     **Name**          | **AreaID** | **Max level**  |
    | --------------------- | ---------- | -------------  |
    | VENTS                 | 0          | 3              |
    | SECURITY              | 1          | 3              |
    | LAVATORY              | 2          | 3              |
    | STASH                 | 3          | 4              |
    | GENERATOR             | 4          | 3              |
    | HEATING               | 5          | 3              |
    | WATER COLLECTOR       | 6          | 3              |
    | MEDSTATION            | 7          | 3              |
    | NUTRITION UNIT        | 8          | 3              |
    | REST SPACE            | 9          | 3              |
    | WORKBENCH             | 10         | 3              |
    | INTELLIGENCE CENTER   | 11         | 3              |
    | SHOOTING RANGE        | 12         | 3              |
    | LIBRARY               | 13         | 1              |
    | SCAV CASE             | 14         | 1              |
    | ILLUMINATION          | 15         | 3              |
    | PLACE OF FAME         | 16         | 3              |
    | AIR FILTRERING UNIT   | 17         | 1              |
    | SOLAR POWER           | 18         | 1              |
    | BOOZE GENERATOR       | 19         | 1              |
    | BITCOIN FARM          | 20         | 3              |
    | CHRISTMAS TREE        | 21         | 1              |
    | BROKEN WALL           | 22         | 6              |
    | GYM                   | 23         | 1              |
    | Weapon Rack           | 24         | 3              |
    | Weapon Rack SECONDARY | 25         | 3              |
    | Gear Rack             | 26         | 3              |
    | Cultist Circle        | 27         | 1              |
    |-----------------------------------------------------|

    // The following is an example of a common craft recipe, you can use [THIS](https://vinihns.github.io/TarkovCraft/) tool to create the JSONs.

// JSON structure:

{
  "_id": "unique_id_mongoID",
  "areaType": "area_type_number",
  "requirements": [
    {
      "areaType": "area_type_number",
      "requiredLevel": "required_level_number",
      "type": "Area" // Don't touch this
    },

    // Here you can put the items needed for the recipe
    {
      "templateId": "item_id",
      "count": 1, // Amount of items needed
      "isFunctional": false, // Don't touch this
      "isEncoded": false, // Don't touch this
      "type": "Item" // Don't touch this
    },

    // This is optional, but if you want to add a tool to the recipe, you can do it like this:
    { 
      "templateId": "item_id",
      "type": "Tool"
    }
  ],
  "productionTime": 3600, // In seconds
  "needFuelForAllProductionTime": false, // Self explanatory
  "locked": false, // Don't touch this
  "endProduct": "unique_id_mongoID", // Item ID of the final product
  "continuous": false,
  "count": 1, // Amount of final product
  "productionLimitCount": 0, 
  "isEncoded": false,
  "isCodeProduction": false
}, <- //If you want to add more than one recipe, remember to put a comma between them
```

## Installation

Simply place the `user` folder into your `SPT` game installation directory.

## License

This mod is licensed under the [MIT License](LICENSE).