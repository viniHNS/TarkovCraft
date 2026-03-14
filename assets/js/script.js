// assets/js/script.js

import { loadData, clearCache } from './api.js';
import { Combobox, toast, renderJsonPreview } from './ui.js';

import { addCraft, updateCraftsList, getExportCrafts, generateObjectId } from './craft.js';

// ── State ─────────────────────────────────────────────────────
let items = [];

// Combobox instances — keyed by row element for cleanup
const ingredientComboboxes = new Map(); // rowEl -> Combobox
const toolComboboxes = new Map();       // rowEl -> Combobox
let endProductCombobox = null;

const MAX_INGREDIENTS = 4;
const MAX_TOOLS = 5;

// ── Helpers ───────────────────────────────────────────────────

/** Create a hidden input alongside the combobox wrap */
function createHiddenInput(id) {
  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.id = id;
  return hidden;
}

/** Update ✕ visibility on ingredient rows (hidden when only 1 row) */
function updateIngredientRemoveBtns() {
  const rows = document.querySelectorAll('#ingredient-rows .ingredient-row');
  rows.forEach(row => {
    const btn = row.querySelector('.row-remove');
    btn.classList.toggle('hidden', rows.length <= 1);
  });
}

// ── Ingredient rows ───────────────────────────────────────────

function addIngredientRow() {
  const rows = document.querySelectorAll('#ingredient-rows .ingredient-row');
  if (rows.length >= MAX_INGREDIENTS) return;

  const row = document.createElement('div');
  row.className = 'ingredient-row';

  const wrap = document.createElement('div');
  wrap.className = 'combobox-wrap';
  const hidden = createHiddenInput('');

  const qty = document.createElement('input');
  qty.type = 'number';
  qty.className = 'tc-input-number qty-input';
  qty.placeholder = 'Qty';
  qty.min = '1';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove';
  removeBtn.innerHTML = '✕';
  removeBtn.addEventListener('click', () => removeIngredientRow(row));

  row.appendChild(wrap);
  row.appendChild(hidden);
  row.appendChild(qty);
  row.appendChild(removeBtn);
  document.getElementById('ingredient-rows').appendChild(row);

  const cb = new Combobox(wrap, hidden, items, 'Search ingredient...');
  ingredientComboboxes.set(row, cb);

  if (items.length === 0) cb.setState('loading');

  updateIngredientRemoveBtns();
  updateAddIngredientBtn();
}

function removeIngredientRow(row) {
  const cb = ingredientComboboxes.get(row);
  if (cb) { cb.destroy(); ingredientComboboxes.delete(row); }
  row.remove();
  updateIngredientRemoveBtns();
  updateAddIngredientBtn();
}

function updateAddIngredientBtn() {
  const count = document.querySelectorAll('#ingredient-rows .ingredient-row').length;
  document.getElementById('btn-add-ingredient').disabled = count >= MAX_INGREDIENTS;
}

// ── Tool rows ─────────────────────────────────────────────────

function addToolRow() {
  const rows = document.querySelectorAll('#tool-rows .tool-row');
  if (rows.length >= MAX_TOOLS) return;

  const row = document.createElement('div');
  row.className = 'tool-row';

  const wrap = document.createElement('div');
  wrap.className = 'combobox-wrap';
  const hidden = createHiddenInput('');

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove';
  removeBtn.innerHTML = '✕';
  removeBtn.addEventListener('click', () => removeToolRow(row));

  row.appendChild(wrap);
  row.appendChild(hidden);
  row.appendChild(removeBtn);
  document.getElementById('tool-rows').appendChild(row);

  const cb = new Combobox(wrap, hidden, items, 'Search tool...');
  toolComboboxes.set(row, cb);

  if (items.length === 0) cb.setState('loading');

  updateAddToolBtn();
}

function removeToolRow(row) {
  const cb = toolComboboxes.get(row);
  if (cb) { cb.destroy(); toolComboboxes.delete(row); }
  row.remove();
  updateAddToolBtn();
}

function updateAddToolBtn() {
  const count = document.querySelectorAll('#tool-rows .tool-row').length;
  document.getElementById('btn-add-tool').disabled = count >= MAX_TOOLS;
}

// ── End product combobox ──────────────────────────────────────

function initEndProductCombobox() {
  const wrap = document.getElementById('end-product-wrap');
  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.id = 'end-product-hidden';
  wrap.appendChild(hidden);
  endProductCombobox = new Combobox(wrap, hidden, items, 'Search end product...');
}

// ── Form reset ────────────────────────────────────────────────

function resetForm() {
  // Clear craft name
  document.getElementById('craft-name').value = '';

  // Remove all ingredient rows and re-add 1 fresh one
  document.querySelectorAll('#ingredient-rows .ingredient-row').forEach(row => {
    ingredientComboboxes.get(row)?.destroy();
    ingredientComboboxes.delete(row);
    row.remove();
  });
  addIngredientRow();

  // Remove all tool rows
  document.querySelectorAll('#tool-rows .tool-row').forEach(row => {
    toolComboboxes.get(row)?.destroy();
    toolComboboxes.delete(row);
    row.remove();
  });
  updateAddToolBtn();

  // Clear end product
  endProductCombobox?.clear();

  // Clear misc inputs
  document.getElementById('craft-time').value = '';
  document.getElementById('craft-count').value = '1';
  document.getElementById('hideout-area').value = '';
  document.getElementById('hideout-level').value = '1';
}

// ── Items loaded callback ─────────────────────────────────────

function onItemsLoaded(loadedItems) {
  items = loadedItems;

  // Update all existing comboboxes
  [...ingredientComboboxes.values()].forEach(cb => {
    cb.items = items;
    cb.setState('ready');
  });
  [...toolComboboxes.values()].forEach(cb => {
    cb.items = items;
    cb.setState('ready');
  });
  if (endProductCombobox) {
    endProductCombobox.items = items;
    endProductCombobox.setState('ready');
  }
}

// ── Crafts list toggle ────────────────────────────────────────

function initCraftsListToggle() {
  document.getElementById('crafts-list-toggle').addEventListener('click', () => {
    const body = document.getElementById('crafts-list-body');
    const chevron = document.getElementById('crafts-list-chevron');
    const collapsed = body.classList.toggle('collapsed');
    chevron.textContent = collapsed ? '▶' : '▼';
  });
}

// ── Init ──────────────────────────────────────────────────────

async function init() {
  // Initialize UI
  initCraftsListToggle();
  initEndProductCombobox();
  addIngredientRow(); // start with 1 ingredient row

  // Set all comboboxes to loading state initially
  [...ingredientComboboxes.values(), endProductCombobox].forEach(cb => {
    cb?.setState('loading');
  });

  // Wire buttons
  document.getElementById('btn-add-ingredient').addEventListener('click', addIngredientRow);
  document.getElementById('btn-add-tool').addEventListener('click', addToolRow);
  document.getElementById('btn-add-craft').addEventListener('click', () => addCraft(resetForm));

  // JSON panel actions
  document.getElementById('btn-copy-json').addEventListener('click', () => {
    const crafts = getExportCrafts();
    if (crafts.length === 0) { toast('No crafts to copy'); return; }
    navigator.clipboard.writeText(JSON.stringify(crafts, null, 2));
    toast('JSON copied to clipboard!', 'success');
  });

  document.getElementById('btn-download-json').addEventListener('click', () => {
    const crafts = getExportCrafts();
    if (crafts.length === 0) { toast('No crafts to download'); return; }
    const blob = new Blob([JSON.stringify(crafts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'crafts.json'; a.click();
    URL.revokeObjectURL(url);
  });

  // Clear DB
  document.getElementById('btn-clear-db').addEventListener('click', () => {
    if (confirm('Clear all cached data and session crafts? This cannot be undone.')) {
      clearCache();
      location.reload();
    }
  });

  // ID Generator
  document.getElementById('btn-id-gen').addEventListener('click', () => {
    const id = generateObjectId();
    navigator.clipboard.writeText(id);
    toast('ObjectId copied to clipboard!', 'success');
  });

  // Render initial empty JSON preview
  renderJsonPreview([]);

  // Load items (async — comboboxes show loading state until done)
  const loadedItems = await loadData();
  if (loadedItems.length === 0) {
    const retry = () => { clearCache(); location.reload(); };
    [...ingredientComboboxes.values(), ...toolComboboxes.values(), endProductCombobox]
      .forEach(cb => cb?.setState('error', retry));
    toast('Failed to load items from API. Check connection.', 'danger');
    return;
  }
  onItemsLoaded(loadedItems);
}

init();
