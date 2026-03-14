// assets/js/ui.js

const ROW_H = 36; // px
const VISIBLE_ROWS = Math.ceil(280 / ROW_H) + 2; // 9

// Registry of all open combobox instances — enforces one-open-at-a-time
const _allComboboxes = new Set();

/**
 * Reusable virtual-scroll combobox.
 *
 * @param {HTMLElement} wrapEl    - .combobox-wrap container
 * @param {HTMLInputElement} hiddenEl - <input type="hidden"> that stores selected ID
 * @param {Array<{id: string, name: string}>} items - full item list
 * @param {string} [placeholder]
 */
class Combobox {
  constructor(wrapEl, hiddenEl, items, placeholder = 'Search item...') {
    this.wrap = wrapEl;
    this.hidden = hiddenEl;
    this.items = items;
    this.placeholder = placeholder;

    this.filtered = [];
    this.activeIndex = -1;
    this.scrollOffset = 0; // index of first rendered row
    this.open = false;

    this._build();
    this._attachEvents();
    _allComboboxes.add(this);
  }

  _build() {
    // Input wrapper
    this.inputWrap = document.createElement('div');
    this.inputWrap.className = 'combobox-input-wrap';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'combobox-input';
    this.input.placeholder = this.placeholder;
    this.input.autocomplete = 'off';

    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.className = 'combobox-clear';
    this.clearBtn.innerHTML = '✕';

    this.inputWrap.appendChild(this.input);
    this.inputWrap.appendChild(this.clearBtn);

    // Dropdown
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'combobox-dropdown';

    // Virtual scroll inner (full height = total rows * ROW_H)
    this.scrollInner = document.createElement('div');
    this.scrollInner.className = 'combobox-scroll-inner';
    this.dropdown.appendChild(this.scrollInner);

    this.wrap.appendChild(this.inputWrap);
    this.wrap.appendChild(this.dropdown);
  }

  _attachEvents() {
    let debounceTimer;

    this.input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this._filter(this.input.value), 150);
    });

    this.input.addEventListener('focus', () => {
      if (!this.hidden.value) this._filter(this.input.value);
      this._openDropdown();
    });

    this.input.addEventListener('keydown', (e) => this._onKeydown(e));

    this.clearBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.clear();
    });

    this.dropdown.addEventListener('scroll', () => {
      const newOffset = Math.floor(this.dropdown.scrollTop / ROW_H);
      if (newOffset !== this.scrollOffset) {
        this.scrollOffset = newOffset;
        this._renderRows();
      }
    });

    // Close on outside click
    this._outsideClickHandler = (e) => {
      if (!this.wrap.contains(e.target)) this._closeDropdown();
    };
    document.addEventListener('mousedown', this._outsideClickHandler);
  }

  _filter(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filtered = this.items;
    } else {
      this.filtered = this.items.filter(item =>
        item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      );
    }
    this.activeIndex = -1;
    this.scrollOffset = 0;
    this.dropdown.scrollTop = 0;
    this._renderInner();
    this._renderRows();
  }

  _renderInner() {
    const total = this.filtered.length;
    this.scrollInner.style.height = total > 0 ? `${total * ROW_H}px` : '0px';

    // Remove existing rendered options
    this.scrollInner.querySelectorAll('.combobox-option, .combobox-no-results').forEach(el => el.remove());

    if (total === 0) {
      const msg = document.createElement('div');
      msg.className = 'combobox-no-results';
      msg.textContent = 'No results';
      this.scrollInner.appendChild(msg);
    }
  }

  _renderRows() {
    if (this.filtered.length === 0) return;

    // Remove existing row elements
    this.scrollInner.querySelectorAll('.combobox-option').forEach(el => el.remove());

    const start = this.scrollOffset;
    const end = Math.min(start + VISIBLE_ROWS, this.filtered.length);

    for (let i = start; i < end; i++) {
      const item = this.filtered[i];
      const row = document.createElement('div');
      row.className = 'combobox-option';
      if (i === this.activeIndex) row.classList.add('active');
      row.style.top = `${i * ROW_H}px`;
      row.dataset.index = i;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'combobox-option-name';
      nameSpan.textContent = item.name;

      const idSpan = document.createElement('span');
      idSpan.className = 'combobox-option-id';
      idSpan.textContent = item.id.slice(0, 16) + '…';

      row.appendChild(nameSpan);
      row.appendChild(idSpan);

      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._select(i);
      });

      this.scrollInner.appendChild(row);
    }
  }

  _onKeydown(e) {
    if (!this.open) {
      if (e.key === 'ArrowDown') { this._openDropdown(); return; }
      return;
    }
    if (e.key === 'Escape') { this._closeDropdown(); return; }
    if (e.key === 'Enter') {
      if (this.activeIndex >= 0 && this.activeIndex < this.filtered.length) {
        e.preventDefault();
        this._select(this.activeIndex);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.filtered.length - 1);
      this._scrollToActive();
      this._renderRows();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this._scrollToActive();
      this._renderRows();
    }
  }

  _scrollToActive() {
    const itemTop = this.activeIndex * ROW_H;
    const itemBottom = itemTop + ROW_H;
    if (itemTop < this.dropdown.scrollTop) {
      this.dropdown.scrollTop = itemTop;
    } else if (itemBottom > this.dropdown.scrollTop + 280) {
      this.dropdown.scrollTop = itemBottom - 280;
    }
    this.scrollOffset = Math.floor(this.dropdown.scrollTop / ROW_H);
  }

  _openDropdown() {
    // Close all others first
    _allComboboxes.forEach(cb => { if (cb !== this) cb._closeDropdown(); });
    if (this.filtered.length === 0) this._filter(this.input.value);
    this.dropdown.classList.add('open');
    this.open = true;
  }

  _closeDropdown() {
    this.dropdown.classList.remove('open');
    this.open = false;
  }

  _select(index) {
    const item = this.filtered[index];
    if (!item) return;
    this.input.value = item.name;
    this.hidden.value = item.id;
    this.clearBtn.classList.add('visible');
    this._closeDropdown();
    // Dispatch change event so callers can react
    this.hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }

  clear() {
    this.input.value = '';
    this.hidden.value = '';
    this.clearBtn.classList.remove('visible');
    this.filtered = [];
    this._closeDropdown();
    this._renderInner();
    this.hidden.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Set error/loading state.
   * @param {'loading'|'error'|'ready'} state
   * @param {Function} [onRetry] - called when user clicks Retry (error state only)
   */
  setState(state, onRetry) {
    this.input.classList.remove('loading', 'error');
    // Remove any existing retry element
    this.inputWrap.querySelector('.combobox-retry')?.remove();

    if (state === 'loading') {
      this.input.value = 'Loading items…';
      this.input.disabled = true;
      this.input.classList.add('loading');
    } else if (state === 'error') {
      this.input.value = 'Failed to load items';
      this.input.classList.add('error');
      this.input.disabled = false;
      if (onRetry) {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'combobox-retry';
        retry.textContent = 'Retry';
        retry.style.cssText = 'position:absolute;right:8px;background:transparent;border:none;color:var(--gold);font-family:Bender,sans-serif;font-size:11px;cursor:pointer;text-decoration:underline;';
        retry.addEventListener('click', onRetry);
        this.inputWrap.appendChild(retry);
      }
    } else if (state === 'ready') {
      this.input.value = '';
      this.input.disabled = false;
      this.input.placeholder = this.placeholder;
    }
  }

  /** Get currently selected item ID (from hidden input) */
  getValue() { return this.hidden.value; }

  /** Destroy — remove from global registry */
  destroy() {
    _allComboboxes.delete(this);
    document.removeEventListener('mousedown', this._outsideClickHandler);
  }
}

// ── Toast ────────────────────────────────────────────────────
let _activeToast = null;

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'danger'} type
 */
function toast(message, type = 'danger') {
  const container = document.getElementById('toast-container');
  if (_activeToast) _activeToast.remove();

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  _activeToast = el;

  setTimeout(() => {
    el.classList.add('dismissing');
    el.addEventListener('animationend', () => {
      el.remove();
      if (_activeToast === el) _activeToast = null;
    }, { once: true });
  }, 3000);
}

// ── Sidebar navigation ────────────────────────────────────────
/**
 * Wire sidebar buttons to section visibility.
 * @param {Array<{btnId: string, sectionId: string}>} routes
 */
function initSidebar(routes) {
  routes.forEach(({ btn, section }) => {
    btn.addEventListener('click', () => {
      routes.forEach(r => {
        r.btn.classList.remove('active');
        r.section.style.display = 'none';
      });
      btn.classList.add('active');
      section.style.display = '';
    });
  });
}

// ── JSON Preview renderer ─────────────────────────────────────
/**
 * Syntax-highlight a JSON string for HTML display.
 * @param {string} json
 * @returns {string} HTML string
 */
function highlightJson(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-str';
        } else if (/true|false/.test(match)) {
          cls = 'json-bool';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

/**
 * Render crafts array into the JSON preview panel.
 * @param {Array<Object>} crafts - committed crafts (displayName already stripped)
 */
function renderJsonPreview(crafts) {
  const pre = document.getElementById('json-pre');
  const label = document.getElementById('json-panel-label');
  const n = crafts.length;

  label.textContent = `crafts.json — ${n} item${n !== 1 ? 's' : ''}`;

  if (n === 0) {
    pre.innerHTML = `<span class="json-empty">[]  // No crafts yet</span>`;
    return;
  }

  const json = JSON.stringify(crafts, null, 2);
  pre.innerHTML = highlightJson(json);
}

// Note: initSidebar is deferred — only Craft section is active; Barter is WIP (pointer-events: none).
// When Barter is implemented, wire initSidebar to toggle panel visibility.
export { Combobox, toast, renderJsonPreview };
