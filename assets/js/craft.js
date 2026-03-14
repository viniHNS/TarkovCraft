// assets/js/craft.js

import { toast, renderJsonPreview } from './ui.js';

/** In-memory array of committed crafts (with displayName). */
let crafts = [];

/**
 * Generate MongoDB-style ObjectId.
 * @returns {string}
 */
function generateObjectId() {
  const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const rand = 'xxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return ts + rand;
}

/**
 * Build and validate a craft JSON object from current form state.
 * Returns null if validation fails (toast shown internally).
 * @returns {Object|null}
 */
function buildCraftFromForm() {
  // Collect ingredients
  const ingredientRows = document.querySelectorAll('#ingredient-rows .ingredient-row');
  const ingredients = [];
  for (const row of ingredientRows) {
    const id = row.querySelector('input[type="hidden"]').value;
    const qty = parseInt(row.querySelector('.qty-input').value, 10);
    if (id) {
      if (!qty || qty < 1) {
        toast('Enter quantity for all ingredients');
        return null;
      }
      ingredients.push({ id, qty });
    }
  }
  if (ingredients.length === 0) {
    toast('Add at least one ingredient');
    return null;
  }

  // Collect tools
  const toolRows = document.querySelectorAll('#tool-rows .tool-row');
  const tools = [];
  for (const row of toolRows) {
    const id = row.querySelector('input[type="hidden"]').value;
    if (id) tools.push(id);
  }

  // Misc fields
  const endProduct = document.getElementById('end-product-hidden').value;
  if (!endProduct) { toast('Select the end product'); return null; }
  // Read the display name from the combobox text input for use in the crafts list
  const endProductName = document.querySelector('#end-product-wrap .combobox-input')?.value || endProduct;

  const timeMins = parseInt(document.getElementById('craft-time').value, 10);
  if (!timeMins || timeMins <= 0) { toast('Enter a valid production time (minutes)'); return null; }

  const count = parseInt(document.getElementById('craft-count').value, 10);
  if (!count || count < 1) { toast('Output count must be at least 1'); return null; }

  const areaType = parseInt(document.getElementById('hideout-area').value, 10);
  if (isNaN(areaType)) { toast('Select a hideout area'); return null; }

  const areaLevel = parseInt(document.getElementById('hideout-level').value, 10);
  if (!areaLevel || areaLevel < 1) { toast('Enter a valid hideout area level'); return null; }

  const craftName = document.getElementById('craft-name').value.trim()
    || `Craft ${crafts.length + 1}`;

  // Build object
  const requirements = [
    { areaType, requiredLevel: areaLevel, type: 'Area' },
    ...ingredients.map(({ id, qty }) => ({
      templateId: id,
      count: qty,
      isFunctional: false,
      isEncoded: false,
      type: 'Item',
    })),
    ...tools.map(id => ({ templateId: id, type: 'Tool' })),
  ];

  return {
    displayName: craftName,
    endProductName,   // UI only — for crafts list display; stripped on export
    _id: generateObjectId(),
    areaType,
    requirements,
    productionTime: timeMins * 60,
    needFuelForAllProductionTime: false,
    locked: false,
    endProduct,
    continuous: false,
    count,
    productionLimitCount: 0,
    isEncoded: false,
    isCodeProduction: false,
  };
}

/**
 * Commit craft from form: validate, push to array, update UI.
 * @param {Function} resetFormFn - called on success to reset form
 */
function addCraft(resetFormFn) {
  const craft = buildCraftFromForm();
  if (!craft) return;

  crafts.push(craft);
  updateCraftsList();
  renderJsonPreview(getExportCrafts());
  resetFormFn();
  toast('Craft added!', 'success');
}

/**
 * Remove craft by index.
 */
function removeCraft(index) {
  crafts.splice(index, 1);
  updateCraftsList();
  renderJsonPreview(getExportCrafts());
}

/**
 * Return crafts array with UI-only fields stripped (for export/preview).
 */
function getExportCrafts() {
  return crafts.map(({ displayName, endProductName, ...rest }) => rest);
}

/**
 * Update the crafts list UI section.
 */
function updateCraftsList() {
  const body = document.getElementById('crafts-list-body');
  const title = document.getElementById('crafts-list-title');
  const chevron = document.getElementById('crafts-list-chevron');

  title.textContent = `Crafts — ${crafts.length} item${crafts.length !== 1 ? 's' : ''}`;
  body.innerHTML = '';

  if (crafts.length === 0) {
    body.classList.add('collapsed');
    chevron.textContent = '▶';
    return;
  }

  // Auto-expand when crafts exist
  body.classList.remove('collapsed');
  chevron.textContent = '▼';

  crafts.forEach((craft, i) => {
    const areaLabels = {
      2: 'LAVATORY', 6: 'WATER COLLECTOR', 7: 'MEDSTATION',
      8: 'NUTRITION UNIT', 10: 'WORKBENCH', 11: 'INTEL CENTER', 19: 'BOOZE GEN',
    };
    const areaLabel = areaLabels[craft.areaType] || `Area ${craft.areaType}`;

    const row = document.createElement('div');
    row.className = 'craft-list-item';
    row.innerHTML = `
      <span class="craft-list-item-name">${craft.displayName}</span>
      <span class="craft-list-item-meta">${craft.endProductName || craft.endProduct} · ${areaLabel}</span>
      <button class="craft-list-item-remove" data-index="${i}" title="Remove">✕</button>
    `;
    row.querySelector('button').addEventListener('click', () => removeCraft(i));
    body.appendChild(row);
  });
}

export { addCraft, updateCraftsList, getExportCrafts, generateObjectId };
