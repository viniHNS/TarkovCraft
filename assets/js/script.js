console.log('%cWarning! Proceed with Caution!', 'color: red; font-size: 30px; font-weight: bold;');
console.log('%cMessing with the console could result in Tagilla visiting you tonight!', 'color: red; font-size: 16px;');


function copyDiscordUsername() {
    navigator.clipboard.writeText("bagreassalariado");
    // Show feedback
    const tooltip = bootstrap.Tooltip.getInstance(event.target);
    if (tooltip) {
        tooltip.setContent({ '.tooltip-inner': 'Copied to clipboard!' });
        setTimeout(() => tooltip.hide(), 1000);
    }
}

// Define all Select2 selectors
const select2Selectors = [
    '#ingredientInput1', '#ingredientInput2',
    '#ingredientInput3', '#ingredientInput4',
    '#toolInput1', '#toolInput2', '#toolInput3',
    '#finalProductInput', '#HideoutAreaInput'

];

// Function to generate MongoDB-style ObjectId
function generateObjectId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const objectId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    }).toLowerCase();

    return objectId;
}

function handleMongoId() {
    const mongoId = generateObjectId();
    navigator.clipboard.writeText(mongoId);

    // Show feedback
    showToast(`MongoDB ObjectId copied to clipboard!`, 'success');
}

function initializeQuestSelect2(quests) {
    $('#questLock1').select2({
        theme: 'bootstrap-5',
        placeholder: 'Select a quest...',
        data: quests.map(quest => ({
            id: quest.id,
            text: quest.name
        })),
        width: '100%',
        allowClear: true
    });
}

// Initialize all Select2 dropdowns
function initializeAllSelect2(items) {
    // Common configuration for item selects
    const itemSelectConfig = {
        theme: 'bootstrap-5',
        placeholder: 'Search item...',
        data: items.map(item => ({
            id: item.id,
            text: `${item.name} (${item.id})`
        })),
        width: '100%',
        allowClear: true
    };

    // Initialize ingredient and tool selects
    select2Selectors.slice(0, 7).forEach(selector => {
        $(selector).select2(itemSelectConfig);
    });

    // Final product select
    $('#finalProductInput').select2({
        ...itemSelectConfig,
        placeholder: 'Select final product...'
    });



    /*
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
    */
    // Hideout area select
    $('#HideoutAreaInput').select2({
        theme: 'bootstrap-5',
        placeholder: 'Hideout Area',
        data: [
            { id: '2', text: 'LAVATORY' },
            { id: '6', text: 'WATER COLLECTOR' },
            { id: '7', text: 'MEDSTATION' },
            { id: '8', text: 'NUTRITION UNIT' },
            { id: '10', text: 'WORKBENCH' },
            { id: '11', text: 'INTELLIGENCE CENTER' },
            { id: '19', text: 'BOOZE GENERATOR' },
        ],
        width: '100%'
    });
}

function hideRecipeCreator() {
    $('.recipe-container').hide();
    $('.quest-container').show();
}

function hideQuestCreator() {
    $('.quest-container').hide();
    $('.recipe-container').show();
}

function generateQuestJson() {
    const questId = generateObjectId();

    let questType = $('#taskTypeSelect').val();
    if (questType === 'CounterCreator') {
        questType = 'Elimination';
    }

    return {
        [questId]: { // Dynamic key based on generated ID
            "QuestName": $("#questName").val(),
            "_id": questId,
            "acceptPlayerMessage": questId + " acceptPlayerMessage", // Will be replaced in locales
            "acceptanceAndFinishingSource": "eft",
            "arenaLocations": [],
            "canShowNotificationsInGame": true,
            "changeQuestMessageText": questId + " changeQuestMessageText", // Will be replaced in locales
            "completePlayerMessage": questId + " completePlayerMessage", // Will be replaced in locales
            "conditions": generateConditions(),
            "declinePlayerMessage": questId + " declinePlayerMessage", // Will be replaced in locales
            "description": questId + " description", // Will be replaced in locales
            "failMessageText": questId + " failMessageText", // Will be replaced in locales
            "gameModes": [],
            "image": "/files/quest/icon/default.jpg",
            "instantComplete": false,
            "isKey": false,
            "location": $('#locationSelect').val(),
            "name": questId + " name", // Will be replaced in locales
            "note": questId + " note", // Will be replaced in locales
            "progressSource": "eft",
            "rankingModes": [],
            "restartable": false,
            "rewards": {
                "Fail": [],
                "Started": [],
                "Success": generateRewards(),
            },
            "secretQuest": false,
            "side": "Pmc",
            "startedMessageText": questId + " startedMessageText", // Will be replaced in locales
            "status": 0,
            "successMessageText": questId + " successMessageText", // Will be replaced in locales
            "traderId": $("#traderSelect").val(),
            "type": questType
        }
    };
}

function generateConditions() {

    console.log(generateKillConditions());
    console.log(generateStartConditions());

    return {
        "AvailableForFinish": generateKillConditions(), // Condições para finalizar
        "AvailableForStart": generateStartConditions(), // Pré-requisitos
        "Fail": [] // Sem condições de falha
    };
}

// Generate locales based on quest ID
function generateLocalesJson(questData) {
    const questId = Object.keys(questData)[0];
    const availableForFinish = questData[questId].conditions.AvailableForFinish;
    const locales = {
        [questId + " name"]: $("#questName").val(),
        [questId + " description"]: $("#descriptionMessageText").val(),
        [questId + " successMessageText"]: $("#successMessageText").val(),
        [questId + " acceptPlayerMessage"]: $("#acceptPlayerMessage").val(),
        [questId + " declinePlayerMessage"]: $("#declinePlayerMessage").val(),
        [questId + " completePlayerMessage"]: $("#completePlayerMessage").val()
    };

    // Handle multiple kill descriptions
    $('.kill-task').each(function(index) {
        const $taskElement = $(this);
        const killDescription = $taskElement.find('[id^="killDescription"]').val();
        
        // Get the corresponding condition ID from availableForFinish array
        if (availableForFinish[index]) {
            locales[availableForFinish[index].id] = killDescription;
        }
    });



    return locales;
}



// Gerar condições de kill
function generateKillConditions() {
    const conditions = [];
    
    $('.kill-task').each(function() {
        const $taskElement = $(this);
        const killAmount = $taskElement.find('[id^="killAmount_"]').val();

        if (!killAmount) return;

        const killCondition = {
            "completeInSeconds": 0,
            "conditionType": "CounterCreator",
            "counter": {
                "conditions": [],
                "id": generateObjectId()
            },
            "dynamicLocale": false,
            "id": generateObjectId(),
            "type": "Elimination",
            "value": parseInt(killAmount)
        };

        const specificTarget = $taskElement.find('[id^="specificTarget_"]').val();
        const nonBossTargets = new Set(['Any', 'Savage', 'AnyPmc', 'Usec', 'Bear', 'pmcBot']);
        let target, savageRole = [];

        if (specificTarget && !nonBossTargets.has(specificTarget)) {
            target = 'Savage';
            savageRole.push(specificTarget);
        } else {
            target = specificTarget || 'Any';
        }

        const baseKill = {
            "conditionType": "Kills",
            "target": target,
            "savageRole": savageRole,
            "id": generateObjectId(),
            "compareMethod": ">=",
            "daytime": { "from": 0, "to": 0 },
            "distance": { "compareMethod": ">=", "value": 0 },
            "dynamicLocale": false,
            "enemyEquipmentExclusive": [],
            "enemyEquipmentInclusive": [],
            "enemyHealthEffects": [],
            "resetOnSessionEnd": false,
            "weapon": [],
            "weaponCaliber": [],
            "weaponModsExclusive": [],
            "weaponModsInclusive": []
        };

        if ($taskElement.find('[id^="bodyPartCheck_"]').is(':checked')) {
            baseKill.bodyPart = $taskElement.find('[id^="bodyPartSelect_"]').val();
        }

        if ($taskElement.find('[id^="distanceCheck_"]').is(':checked')) {
            const distance = parseInt($taskElement.find('[id^="killDistance_"]').val());
            if (!isNaN(distance)) {
                baseKill.distance.value = distance;
            }
        }

        if ($taskElement.find('[id^="timeCheck_"]').is(':checked')) {
            const from = parseInt($taskElement.find('[id^="timeRequirementFrom_"]').val());
            const to = parseInt($taskElement.find('[id^="timeRequirementTo_"]').val());
            if (!isNaN(from) && !isNaN(to)) {
                baseKill.daytime = { from, to };
            }
        }

        killCondition.counter.conditions.push(baseKill);

        const location = $taskElement.find('[id^="locationSelect_"]').val();
        if (location && location !== 'any') {
            killCondition.counter.conditions.push({
                "conditionType": "Location",
                "target": [location],
                "id": generateObjectId(),
                "dynamicLocale": false
            });
        }

        conditions.push(killCondition);
    });

    return conditions;
}

function generateRewards() {
    const rewards = [];

    $('.reward-row').each(function () {
        const type = $(this).find('.reward-type-select').val();
        if (!type) return;


        const reward = {
            "availableInGameEditions": [],
            "_id": generateObjectId(),
            "type": type,
            "unknown": false,
            "index": rewards.length,
        };

        switch (type) {

            case 'Money':
                const currencyType = $(this).find('.money-type-select').val();
                const moneyAmount = parseInt($(this).find('.money-input').val());
                if (!currencyType || !moneyAmount) break;

                let moneyRewardId = generateObjectId();

                reward.items = [{
                    "_id": moneyRewardId,
                    "_tpl": currencyType,
                    "upd": { "StackObjectsCount": moneyAmount }
                }];
                reward.target = moneyRewardId;
                reward.type = "Item";
                reward.value = moneyAmount;
                reward.findInRaid = false;
                break;

            case 'Item':
                const itemId = $(this).find('.reward-item select').val();
                const rewardId = generateObjectId();
                if (!itemId) break;

                reward.findInRaid = false;

                reward.items = [{
                    "_id": rewardId,
                    "_tpl": itemId,
                    "upd": { "StackObjectsCount": 1 }
                }];
                reward.value = 1;
                reward.target = rewardId
                reward.type = "Item";
                break;

            case 'Experience':
                const expValue = parseInt($(this).find('.experience-input').val());
                if (!expValue) break;
                reward.type = "Experience";
                reward.value = expValue;
                break;

            case 'TraderStanding':
                const traderId = $(this).find('.trader-standing-select').val();
                const standingValue = parseFloat($(this).find('.standing-value').val());
                if (!traderId || isNaN(standingValue)) break;

                reward.target = traderId;
                reward.value = standingValue;
                reward.type = "TraderStanding";

                break;
        }

        if (Object.keys(reward).length > 4) { // Basic validation
            rewards.push(reward);
        }
    });

    return rewards;
}

// Gerar pré-requisitos
function generateStartConditions() {
    const conditions = [];
    let index = 0;

    // Iterate through each kill task to get its start conditions
        const $taskElement = $('.quest-general');
        
        // Level lock condition
        if ($taskElement.find('[id="levelLockCheck"]').is(':checked')) {
            const level = parseInt($taskElement.find('[id="levelLockInput"]').val());
            if (!isNaN(level)) {
                conditions.push({
                    "conditionType": "Level",
                    "compareMethod": ">=",
                    "value": level,
                    "id": generateObjectId(),
                    "index": index++
                });
            }
        }

        // Quest lock condition
        if ($taskElement.find('[id="questLockCheck"]').is(':checked')) {
            const questId = $taskElement.find('[id="questLock"]').val();
            if (questId) {
                conditions.push({
                    "conditionType": "Quest",
                    "status": [4], // 4 = Completed
                    "target": questId,
                    "id": generateObjectId(),
                    "index": index++
                });
            }
        }
    ;

    return conditions;
}

// Event Listeners
$('#generateQuestJson').click(() => {
    const quest = generateQuestJson();
    if (!quest) return;

    const locales = generateLocalesJson(quest);

    $('#jsonQuestOutput').text(JSON.stringify(quest, null, 2));
    $('#jsonLocalesOutput').text(JSON.stringify(locales, null, 2));
    new bootstrap.Modal('#questJsonModal').show();
});

// Funções de cópia
$('#copyQuestJson').click(() => {
    navigator.clipboard.writeText($('#jsonQuestOutput').text());
    showToast('Quest JSON copied!', 'success');
});

$('#copyLocalesJson').click(() => {
    navigator.clipboard.writeText($('#jsonLocalesOutput').text());
    showToast('Locales JSON copied!', 'success');
});


// Main recipe generation function
function generateRecipeJson() {
    // Base template
    const recipe = {
        "_id": generateObjectId(),
        "areaType": parseInt($('#HideoutAreaInput').val() || 10),
        "requirements": [],
        "productionTime": parseInt($('#craftTimeInput').val()) * 60 || 0,
        "needFuelForAllProductionTime": false,
        "locked": false,
        "endProduct": $('#finalProductInput').val(),
        "continuous": false,
        "count": parseInt($('#endProductCountInput').val()) || 1,
        "productionLimitCount": 0,
        "isEncoded": false,
        "isCodeProduction": false
    };

    // Add hideout requirement with level
    recipe.requirements.push({
        "areaType": recipe.areaType,
        "requiredLevel": parseInt($('#hideoutLevelInput').val()) || 1,
        "type": "Area"
    });

    // Add ingredients
    for (let i = 1; i <= 4; i++) {
        const itemId = $(`#ingredientInput${i}`).val();
        const count = $(`#ingredientAmountInput${i}`).val();

        if (itemId && count) {
            recipe.requirements.push({
                "templateId": itemId,
                "count": parseInt(count),
                "isFunctional": false,
                "isEncoded": false,
                "type": "Item"
            });
        }
    }

    // Add tools
    for (let i = 1; i <= 3; i++) {
        const toolId = $(`#toolInput${i}`).val();
        if (toolId) {
            recipe.requirements.push({
                "templateId": toolId,
                "type": "Tool"
            });
        }
    }

    // Validation with toasts

    // Existing ingredient validation
    let hasIngredients = false;

    for (let i = 1; i <= 4; i++) {
        const itemId = $(`#ingredientInput${i}`).val();
        const count = $(`#ingredientAmountInput${i}`).val();

        if (itemId) {
            if (!count || isNaN(count) || parseInt(count) <= 0) {
                showToast(`Please enter valid amount for ingredient #${i}`);
                return null;
            }
            hasIngredients = true;
        }
    }

    if (!hasIngredients) {
        showToast('Please add at least one ingredient');
        return null;
    }

    if (!recipe.endProduct) {
        showToast('Please select a final product!');
        return null;
    }

    if (recipe.productionTime <= 0) {
        showToast('Please enter valid production time!');
        return null;
    }

    // Validate Hideout Area selection
    const selectedArea = $('#HideoutAreaInput').val();
    if (!selectedArea || isNaN(selectedArea)) {
        showToast('Please select a valid Hideout Area');
        return null;
    }

    // Validate end product count
    const endProductCount = parseInt($('#endProductCountInput').val());
    if (isNaN(endProductCount) || endProductCount < 1) {
        showToast('End product count must be at least 1');
        return null;
    }

    return recipe;

}

$('.wip').click(() => {
    showToast('This feature is not yet implemented', 'warning');
})

$('#button-addon2').off('click').click(addCraft);

// Modal and clipboard functionality
$('#generateJson').click(() => {
    if (crafts.length === 0) {
        showToast('No crafts to generate!', 'warning');
        return;
    }
    const cleanCrafts = crafts.map(({ displayName, ...rest }) => rest);
    const jsonString = JSON.stringify(cleanCrafts, null, 2);
    $('#jsonOutput').text(jsonString);
    new bootstrap.Modal('#jsonModal').show();
});

$('#TraderStandingInput1').on('input', function () {
    let value = $(this).val().replace(/[^0-9.,]/g, '');

    value = value.replace(/([.,])(?=.*[.,])/g, '');

    value = value.replace(/,/g, '.');

    $(this).val(value);
});


$('#copyJson').click(() => {
    if (crafts.length === 0) {
        showToast('No crafts to copy!', 'warning');
        return;
    }

    const cleanCrafts = crafts.map(({ displayName, ...rest }) => rest);
    navigator.clipboard.writeText(JSON.stringify(cleanCrafts));
    showToast('All crafts copied to clipboard!', 'success');
});

// Toast functionality
function showToast(message, type = 'danger') {
    const toastEl = document.getElementById('errorToast');
    const toastMessage = document.getElementById('toastMessage');

    toastEl.className = `toast bg-${type} text-white`;
    toastMessage.textContent = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Data loading and initialization
async function fetchData() {
    const query = `{ items(lang: en) { id name } }`;
    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.items;
    } catch (error) {
        console.error('API Error:', error);
        showToast('Failed to fetch data from API', 'danger');
        return [];
    }
}

async function fetchQuestData() {
    const query = `{
        tasks(lang: en) {
            id
            name
        }
    }`;

    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.tasks;
    } catch (error) {
        console.error('API Error:', error);
        showToast('Failed to fetch quests data from API', 'danger');
        return [];
    }
}


// Update loadQuestData to store the quests globally
async function loadQuestData() {
    try {
        const cachedData = localStorage.getItem('cachedQuests');

        if (cachedData) {
            quests = JSON.parse(cachedData);
            console.log('Loaded quests from cache:', quests.length);
        }

        if (!quests.length) {
            showToast('Fetching quests data...', 'info');
            quests = await fetchQuestData();

            if (quests.length) {
                localStorage.setItem('cachedQuests', JSON.stringify(quests));
                console.log('Saved quests to cache:', quests.length);
            }
        }

        if (quests.length) {
            initializeQuestSelect2(quests);
        } else {
            showToast('No quests available', 'warning');
        }

    } catch (error) {
        console.error('Quest Load Error:', error);
        showToast('Failed to load quests', 'danger');
    }
}

async function loadData() {
    try {
        const cachedData = localStorage.getItem('cachedItems');

        if (cachedData) {
            items = JSON.parse(cachedData); // Atualiza a variável global
            console.log('Loaded from cache:', items.length, 'items');
            initializeAllSelect2(items);
        }

        if (!items.length) {
            showToast('Fetching latest data...', 'info');
            items = await fetchData(); // Atualiza a variável global

            if (items.length) {
                localStorage.setItem('cachedItems', JSON.stringify(items));
                console.log('Saved to cache:', items.length, 'items');
                initializeAllSelect2(items);
            }
        }

        // Inicializar o primeiro reward item select
        $('#rewardItemInput1').select2({
            theme: 'bootstrap-5',
            placeholder: 'Select item...',
            data: items.map(item => ({
                id: item.id,
                text: `${item.name} (${item.id})`
            })),
            width: '100%'
        });

    } catch (error) {
        console.error('Load Error:', error);
        showToast('Failed to load data. Using fallback.', 'danger');
        initializeWithFallbackData();
    }
}

let crafts = [];
let items = [];
let quests = [];

function resetForm() {
    $('#craftNameInput').val('');
    select2Selectors.forEach(selector => {
        $(selector).val(null).trigger('change');
    });

    ['#ingredientAmountInput1', '#ingredientAmountInput2', '#ingredientAmountInput3', '#ingredientAmountInput4',
        '#craftTimeInput', '#endProductCountInput', '#hideoutLevelInput'].forEach(selector => {
            $(selector).val('');
        });
}

function addCraft() {
    const craftName = $('#craftNameInput').val().trim();
    const recipe = generateRecipeJson();

    if (!recipe) return;

    recipe.displayName = craftName || `Craft ${crafts.length + 1}`;

    crafts.push(recipe);
    updateCraftsList();
    resetForm();
}

function updateCraftsList() {
    const list = $('#craftsList .list-group');
    list.empty();

    crafts.forEach((craft, index) => {
        list.append(`
            <div class="list-group-item d-flex justify-content-between align-items-center rounded-2 my-1">
                ${craft.displayName || `Craft ${index + 1}`}
                <small>${craft.endProduct}</small>
            </div>
        `);
    });
}

// Fallback data initialization
function initializeWithFallbackData() {
    const fallbackItems = [
        { id: "5447a9cd4bdc2dbd208b4567", name: "Colt M4A1 5.56x45 assault rifle" },
        { id: "5447ac644bdc2d6c208b4567", name: "5.56x45mm M855 ammo pack (50 pcs)" },
        { id: "5448ba0b4bdc2d02308b456c", name: "Factory emergency exit key" },
    ];

    initializeAllSelect2(fallbackItems);
    localStorage.setItem('cachedItems', JSON.stringify(fallbackItems));
}

let rewardIndex = 1;

// Função para adicionar nova recompensa
function addRewardRow() {
    if (items.length === 0) {
        showToast('Items data not loaded yet!', 'warning');
        return;
    }

    const original = $('.reward-row:first');
    const newRow = original.clone(true);

    // Resetar valores
    newRow.find('select').val('');
    newRow.find('input').val('');
    newRow.find('.remove-reward').removeClass('d-none');

    // Gerar novo ID único
    const newIndex = Date.now();
    newRow.attr('data-reward-index', newIndex);

    // Atualizar IDs dos elementos
    newRow.find('.reward-item-select').attr('id', `rewardItem${newIndex}`);

    // Inicializar Select2 para o novo item
    newRow.find('.reward-item-select').select2({
        theme: 'bootstrap-5',
        placeholder: 'Select item...',
        data: items.map(item => ({
            id: item.id,
            text: `${item.name} (${item.id})`
        })),
        width: '100%'
    });

    // Inserir antes do botão de adicionar
    newRow.insertBefore('#addReward').hide().slideDown();

    // Esconder botão de remover se for o único item
    if ($('.reward-row').length > 1) {
        newRow.find('.remove-reward').removeClass('d-none');
    }
}

// Remover recompensa
$(document).on('click', '.remove-reward', function () {
    $(this).closest('.reward-row').slideUp(() => {
        $(this).remove();
        // Atualizar visibilidade dos botões de remover
        const remaining = $('.reward-row').length;
        if (remaining === 1) {
            $('.remove-reward').addClass('d-none');
        }
    });
});

// Controle de visibilidade
$(document).on('change', '.reward-type-select', function () {
    const parent = $(this).closest('.reward-row');
    const type = $(this).val();

    // Esconder todos os campos
    parent.find('.reward-item, .reward-experience, .money-type, .money-amount, .trader-select, .standing-input')
        .addClass('d-none');

    // Mostrar campos relevantes
    switch (type) {
        case 'Item':
            parent.find('.reward-item').removeClass('d-none');
            break;
        case 'Experience':
            parent.find('.reward-experience').removeClass('d-none');
            break;
        case 'Money':
            parent.find('.money-type, .money-amount').removeClass('d-none');
            break;
        case 'TraderStanding':
            parent.find('.trader-select, .standing-input').removeClass('d-none');
            break;
    }
});

// Vincular evento de adição
$('#addReward').click(addRewardRow);

// Initial setup
$(document).ready(async () => {
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    $('.quest-container').hide(); // Hide quest container by default

    $('#addQuestTask').click(function () {
        const taskType = $('#taskTypeSelect').val();

        if (taskType === 'CounterCreator') {
            const template = document.getElementById('killTaskTemplate');
            const clone = template.content.cloneNode(true);

            // Torna os IDs únicos
            const timestamp = Date.now();
            $(clone).find('select, input').each(function () {
                const newId = $(this).attr('id') + '_' + timestamp;
                $(this).attr('id', newId);
            });

            $('.kill-tasks-container').append(clone);
        } else {
            showToast('Select "Counter Creator" first!', 'warning');
        }
    });

    // Remover tarefa
    $(document).on('click', '.remove-kill-task', function () {
        $(this).closest('.kill-task').remove();
    });

    // Habilitar/desabilitar inputs baseado nas checkboxes
    $(document).on('change', '[id^="bodyPartCheck_"]', function () {
        const $select = $(this).closest('.kill-task').find('[id^="bodyPartSelect_"]');
        $select.prop('disabled', !this.checked);
    });

    // Distance check handler
    $(document).on('change', '[id^="distanceCheck_"]', function () {
        const $input = $(this).closest('.kill-task').find('[id^="killDistance_"]');
        $input.prop('disabled', !this.checked);
    });

    // Time check handler
    $(document).on('change', '[id^="timeCheck_"]', function () {
        const $taskContainer = $(this).closest('.kill-task');
        const $timeInputs = $taskContainer.find('[id^="timeRequirementFrom_"], [id^="timeRequirementTo_"]');
        $timeInputs.prop('disabled', !this.checked);
    });

    // Level lock check handler 
    $(document).on('change', '[id="levelLockCheck"]', function() {
        const $input = $(this).closest('.quest-general').find('[id="levelLockInput"]');
        $input.prop('disabled', !this.checked);
    });

    // Quest lock check handler
    $(document).on('change', '[id="questLockCheck"]', function () {
        const $select = $(this).closest('.quest-general').find('[id="questLock"]');
        if (this.checked) {
            $select.prop('disabled', false).select2({
                theme: 'bootstrap-5',
                placeholder: 'Select a quest...',
                data: quests.map(quest => ({
                    id: quest.id,
                    text: quest.name
                })),
                width: '100%',
                allowClear: true
            });
        } else {
            $select.prop('disabled', true).val(null).trigger('change');
        }
    });


    await loadQuestData();
    await loadData();

});
