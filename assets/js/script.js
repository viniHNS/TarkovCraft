// assets/js/script.js

console.log(
  '%c' +
  '  ████████╗ █████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗\n' +
  '  ╚══██╔══╝██╔══██╗██╔══██╗██║ ██╔╝██╔═══██╗██║   ██║\n' +
  '     ██║   ███████║██████╔╝█████╔╝ ██║   ██║██║   ██║\n' +
  '     ██║   ██╔══██║██╔══██╗██╔═██╗ ██║   ██║╚██╗ ██╔╝\n' +
  '     ██║   ██║  ██║██║  ██║██║  ██╗╚██████╔╝ ╚████╔╝ \n' +
  '     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═══╝  \n' +
  '       ██████╗██████╗  █████╗ ███████╗████████╗\n' +
  '      ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝\n' +
  '      ██║     ██████╔╝███████║█████╗     ██║   \n' +
  '      ██║     ██╔══██╗██╔══██║██╔══╝     ██║   \n' +
  '      ╚██████╗██║  ██║██║  ██║██║        ██║   \n' +
  '       ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝  ',
  'color: #c8aa6e; font-family: monospace; font-size: 10px; font-weight: bold; line-height: 1.4;'
);
console.log(
  '%c ⚠  WARNING — RESTRICTED AREA  ⚠',
  'color: #0d0d0d; background: #c8aa6e; font-size: 14px; font-weight: bold; padding: 4px 16px; letter-spacing: 2px;'
);
console.log(
  '%cMessing with the console could result in Tagilla visiting you tonight.',
  'color: #888; font-size: 12px; font-style: italic; padding: 2px 0;'
);
console.log(
  '%cYou have been warned, scav. %cTURN BACK WHILE YOU STILL CAN.',
  'color: #888; font-size: 12px;',
  'color: #c8aa6e; font-size: 12px; font-weight: bold;'
);

import { loadData, clearCache } from './api.js';
import { Combobox, toast, renderJsonPreview } from './ui.js';

import { addCraft, updateCraftsList, getExportCrafts, generateObjectId } from './craft.js';

// ── Station data ──────────────────────────────────────────────
const STATION_MAX_LEVELS = {
   0: 3,  // VENTS
   1: 3,  // SECURITY
   2: 3,  // LAVATORY
   3: 4,  // STASH
   4: 3,  // GENERATOR
   5: 3,  // HEATING
   6: 3,  // WATER COLLECTOR
   7: 3,  // MEDSTATION
   8: 3,  // NUTRITION UNIT
   9: 3,  // REST SPACE
  10: 3,  // WORKBENCH
  11: 3,  // INTELLIGENCE CENTER
  12: 3,  // SHOOTING RANGE
  13: 1,  // LIBRARY
  14: 1,  // SCAV CASE
  15: 3,  // ILLUMINATION
  16: 3,  // PLACE OF FAME
  17: 1,  // AIR FILTERING UNIT
  18: 1,  // SOLAR POWER
  19: 1,  // BOOZE GENERATOR
  20: 3,  // BITCOIN FARM
  21: 1,  // CHRISTMAS TREE
  22: 6,  // BROKEN WALL
  23: 1,  // GYM
  24: 3,  // WEAPON RACK
  25: 3,  // WEAPON RACK SECONDARY
  26: 3,  // GEAR RACK
  27: 1,  // CULTIST CIRCLE
};

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

  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.className = 'tc-input custom-id-input';
  customInput.placeholder = 'MongoDB ObjectId';
  customInput.style.display = 'none';
  customInput.addEventListener('input', () => { hidden.value = customInput.value.trim(); });

  const qty = document.createElement('input');
  qty.type = 'number';
  qty.className = 'tc-input-number qty-input';
  qty.placeholder = 'Qty';
  qty.min = '1';

  const customLabel = document.createElement('label');
  customLabel.className = 'custom-item-label';
  const customCheck = document.createElement('input');
  customCheck.type = 'checkbox';
  customCheck.className = 'custom-item-check';
  customLabel.appendChild(customCheck);
  customLabel.append(' Custom');

  customCheck.addEventListener('change', () => {
    if (customCheck.checked) {
      wrap.style.display = 'none';
      customInput.style.display = '';
      hidden.value = customInput.value.trim();
    } else {
      wrap.style.display = '';
      customInput.style.display = 'none';
      hidden.value = '';
      customInput.value = '';
    }
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove';
  removeBtn.innerHTML = '✕';
  removeBtn.addEventListener('click', () => removeIngredientRow(row));

  row.appendChild(wrap);
  row.appendChild(customInput);
  row.appendChild(hidden);
  row.appendChild(qty);
  row.appendChild(customLabel);
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

  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.className = 'tc-input custom-id-input';
  customInput.placeholder = 'MongoDB ObjectId';
  customInput.style.display = 'none';
  customInput.addEventListener('input', () => { hidden.value = customInput.value.trim(); });

  const customLabel = document.createElement('label');
  customLabel.className = 'custom-item-label';
  const customCheck = document.createElement('input');
  customCheck.type = 'checkbox';
  customCheck.className = 'custom-item-check';
  customLabel.appendChild(customCheck);
  customLabel.append(' Custom');

  customCheck.addEventListener('change', () => {
    if (customCheck.checked) {
      wrap.style.display = 'none';
      customInput.style.display = '';
      hidden.value = customInput.value.trim();
    } else {
      wrap.style.display = '';
      customInput.style.display = 'none';
      hidden.value = '';
      customInput.value = '';
    }
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'row-remove';
  removeBtn.innerHTML = '✕';
  removeBtn.addEventListener('click', () => removeToolRow(row));

  row.appendChild(wrap);
  row.appendChild(customInput);
  row.appendChild(hidden);
  row.appendChild(customLabel);
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

  // Custom toggle row inserted before the combobox wrap
  const toggleRow = document.createElement('div');
  toggleRow.className = 'custom-toggle-row';
  const customCheck = document.createElement('input');
  customCheck.type = 'checkbox';
  customCheck.id = 'end-product-custom-check';
  customCheck.className = 'custom-item-check';
  const customLabel = document.createElement('label');
  customLabel.htmlFor = 'end-product-custom-check';
  customLabel.className = 'custom-item-label';
  customLabel.appendChild(customCheck);
  customLabel.append(' Custom Item');
  toggleRow.appendChild(customLabel);
  wrap.parentElement.insertBefore(toggleRow, wrap);

  // Custom text input inserted before the combobox wrap
  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.id = 'end-product-custom-input';
  customInput.className = 'tc-input custom-id-input';
  customInput.placeholder = 'MongoDB ObjectId';
  customInput.style.display = 'none';
  customInput.style.marginBottom = '6px';
  wrap.parentElement.insertBefore(customInput, wrap);

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.id = 'end-product-hidden';
  wrap.appendChild(hidden);
  endProductCombobox = new Combobox(wrap, hidden, items, 'Search end product...');

  customInput.addEventListener('input', () => { hidden.value = customInput.value.trim(); });

  customCheck.addEventListener('change', () => {
    if (customCheck.checked) {
      wrap.style.display = 'none';
      customInput.style.display = '';
      hidden.value = customInput.value.trim();
    } else {
      wrap.style.display = '';
      customInput.style.display = 'none';
      hidden.value = '';
      customInput.value = '';
      endProductCombobox.clear();
    }
  });
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

  // Clear end product — reset custom mode if active
  const epCustomCheck = document.getElementById('end-product-custom-check');
  const epCustomInput = document.getElementById('end-product-custom-input');
  const epWrap = document.getElementById('end-product-wrap');
  if (epCustomCheck?.checked) {
    epCustomCheck.checked = false;
    epCustomInput.style.display = 'none';
    epCustomInput.value = '';
    epWrap.style.display = '';
  }
  endProductCombobox?.clear();

  // Clear misc inputs
  document.getElementById('time-hint').textContent = '';
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

// ── Panel resizer ─────────────────────────────────────────────

function initResizer() {
  const resizer = document.getElementById('resizer');
  const centerPanel = document.getElementById('center-panel');
  const jsonPanel = document.getElementById('json-panel');

  resizer.addEventListener('mousedown', (e) => {
    const startX = e.clientX;
    const startCenterW = centerPanel.getBoundingClientRect().width;
    const startJsonW = jsonPanel.getBoundingClientRect().width;

    resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(e) {
      const dx = e.clientX - startX;
      const newCenter = Math.max(280, startCenterW + dx);
      const newJson = Math.max(200, startJsonW - dx);
      centerPanel.style.flex = 'none';
      centerPanel.style.width = newCenter + 'px';
      jsonPanel.style.flex = 'none';
      jsonPanel.style.width = newJson + 'px';
    }

    function onUp() {
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
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

// ── Debug flags ───────────────────────────────────────────────
const DEBUG_SPLASH_LOADING = false; 
const DEBUG_SPLASH_ERROR   = false; 

// ── Splash helpers ────────────────────────────────────────────

function hasCachedData() {
  try {
    const cached = localStorage.getItem('cachedItems');
    if (cached) {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) && parsed.length > 0;
    }
  } catch (_) {}
  return false;
}

function showSplash() {
  const el = document.getElementById('splash');
  el.classList.add('open');
  el.removeAttribute('aria-hidden');
}

function hideSplash() {
  const el = document.getElementById('splash');
  el.classList.add('dismissing');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

function showSplashError() {
  document.getElementById('splash-loading').style.display = 'none';
  document.getElementById('splash-error').style.display = '';
}

// ── Init ──────────────────────────────────────────────────────

async function init() {
  // Initialize UI
  initResizer();
  initCraftsListToggle();
  initEndProductCombobox();
  addIngredientRow(); // start with 1 ingredient row

  // Show splash only when a live API fetch will be needed (or debug forced)
  if (!hasCachedData() || DEBUG_SPLASH_LOADING || DEBUG_SPLASH_ERROR) showSplash();

  // Set all comboboxes to loading state initially
  [...ingredientComboboxes.values(), endProductCombobox].forEach(cb => {
    cb?.setState('loading');
  });

  // Live production time hint
  document.getElementById('craft-time').addEventListener('input', (e) => {
    const hint = document.getElementById('time-hint');
    const mins = parseInt(e.target.value, 10);
    if (!mins || mins <= 0) { hint.textContent = ''; return; }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    hint.textContent = h > 0 ? `= ${h}h ${m}m` : `= ${m}m`;
  });

  // Station level cap — on station change
  document.getElementById('hideout-area').addEventListener('change', (e) => {
    const levelInput = document.getElementById('hideout-level');
    const areaId = e.target.value;
    if (areaId === '') {
      levelInput.removeAttribute('max');
      return;
    }
    const maxLevel = STATION_MAX_LEVELS[parseInt(areaId, 10)];
    levelInput.max = maxLevel;
    const current = parseInt(levelInput.value, 10);
    if (current > maxLevel) {
      levelInput.value = maxLevel;
      const stationName = e.target.options[e.target.selectedIndex].text;
      toast(`Max level for ${stationName} is ${maxLevel}`, 'danger');
    }
  });

  // Station level cap — on manual typing
  document.getElementById('hideout-level').addEventListener('input', (e) => {
    const max = parseInt(e.target.max, 10);
    if (!max) return;
    const val = parseInt(e.target.value, 10);
    if (val > max) {
      e.target.value = max;
      const select = document.getElementById('hideout-area');
      const stationName = select.options[select.selectedIndex]?.text || 'this station';
      toast(`Max level for ${stationName} is ${max}`, 'danger');
    }
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

  // Clear DB — custom confirm modal
  document.getElementById('btn-clear-db').addEventListener('click', () => openModal('modal-confirm-clear'));
  document.getElementById('btn-confirm-clear-cancel').addEventListener('click', () => closeModal('modal-confirm-clear'));
  document.getElementById('btn-confirm-clear-ok').addEventListener('click', () => {
    clearCache();
    location.reload();
  });

  // ID Generator
  document.getElementById('btn-id-gen').addEventListener('click', () => {
    const id = generateObjectId();
    navigator.clipboard.writeText(id);
    toast('ObjectId copied to clipboard!', 'success');
  });

  // Modals
  function openModal(id) {
    const el = document.getElementById(id);
    el.classList.add('open');
    el.removeAttribute('aria-hidden');
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('btn-about').addEventListener('click', () => openModal('modal-about'));
  document.getElementById('btn-modal-about-close').addEventListener('click', () => closeModal('modal-about'));
  document.getElementById('btn-tips').addEventListener('click', () => openModal('modal-tips'));
  document.getElementById('btn-modal-tips-close').addEventListener('click', () => closeModal('modal-tips'));
  document.getElementById('btn-stations').addEventListener('click', () => openModal('modal-stations'));
  document.getElementById('btn-modal-stations-close').addEventListener('click', () => closeModal('modal-stations'));

  // Copy Area ID on click
  document.querySelectorAll('#modal-stations .stations-id').forEach(cell => {
    cell.addEventListener('click', () => {
      navigator.clipboard.writeText(cell.textContent.trim());
      toast(`Area ID ${cell.textContent.trim()} copied!`, 'success');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
    }
  });

  // Render initial empty JSON preview
  renderJsonPreview([]);

  // Splash action buttons
  document.getElementById('btn-splash-retry').addEventListener('click', () => {
    clearCache();
    location.reload();
  });
  document.getElementById('btn-splash-continue').addEventListener('click', () => {
    hideSplash();
  });

  // Load items — enforce 1s minimum when fetching from API (splash is visible)
  const needsFetch = !hasCachedData() || DEBUG_SPLASH_LOADING || DEBUG_SPLASH_ERROR;
  const [loadedItems] = await Promise.all([
    DEBUG_SPLASH_ERROR ? Promise.resolve([]) : loadData(),
    needsFetch ? new Promise(r => setTimeout(r, 1000)) : Promise.resolve(),
  ]);

  if (loadedItems.length === 0) {
    showSplashError();
    return;
  }
  hideSplash();
  onItemsLoaded(loadedItems);
}

init();
