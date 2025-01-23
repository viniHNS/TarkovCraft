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
            { id: '14', text: 'SCAV CASE' },
            { id: '27', text: 'Cultist Circle' }
        ],
        width: '100%'
    });
}

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
    showToast('This feature is a work in progress!', 'warning');
})

// Modal and clipboard functionality
$('#generateJson').click(() => {
    const recipe = generateRecipeJson();
    if (recipe) {
        $('#jsonOutput').text(JSON.stringify(recipe, null, 2));
        new bootstrap.Modal('#jsonModal').show();
    }
});

$('#copyJson').click(() => {
    const recipe = generateRecipeJson();
    if (recipe) {
        navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
        showToast('JSON copied to clipboard!', 'success');
    }
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
            headers: {'Content-Type': 'application/json'},
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

async function loadData() {
    try {
        let items = [];
        const cachedData = localStorage.getItem('cachedItems');

        // Try to load from cache first
        if (cachedData) {
            items = JSON.parse(cachedData);
            console.log('Loaded from cache:', items.length, 'items');
        }

        // If no cached data, fetch from API
        if (!items.length) {
            showToast('Fetching latest data... This may take a while', 'info');
            items = await fetchData();
            
            if (items.length) {
                localStorage.setItem('cachedItems', JSON.stringify(items));
                console.log('Saved to cache:', items.length, 'items');
            }
        }

        // Initialize Select2
        if (items.length) {
            initializeAllSelect2(items);
        } else {
            showToast('No items available. Using fallback data.', 'warning');
            initializeWithFallbackData();
        }

    } catch (error) {
        console.error('Load Error:', error);
        showToast('Failed to load data. Using fallback.', 'danger');
        initializeWithFallbackData();
    }
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

// Initial setup
$(document).ready(async () => {
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Load data
    await loadData();
    
});
