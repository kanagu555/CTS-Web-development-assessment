function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element with id="${id}" not found`);
    return el;
}
function formatDateForDisplay(iso) {
    if (!iso)
        return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
function toDateInputValue(iso) {
    if (!iso)
        return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return '';
    // Convert to local-equivalent YYYY-MM-DD (no time zone shift for date-only)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${day.length === 2 ? month : month}-${day}`;
}
(async () => {
    const form = byId('entryForm');
    const idInput = byId('inputId');
    const dateInput = byId('inputDate');
    const headerInput = byId('inputHeader');
    const creditInput = byId('inputCredit');
    const debitInput = byId('inputDebit');
    const addBtn = byId('addBtn');
    const entriesContainer = byId('entries');
    const totalsCreditEl = byId('totalsCredit');
    const totalsDebitEl = byId('totalsDebit');
    const balanceValueEl = byId('balanceValue');
    let entries = [];
    let editIndex = null;
    const LOCAL_STORAGE_KEY_NAME = 'statementEntries';
    const amountFmt = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    const handleFormatAmount = (val) => {
        if (val === null || val === undefined || val === '')
            return '';
        const n = Number(val);
        if (Number.isNaN(n))
            return '';
        return amountFmt.format(n);
    };
    const initialLoadData = async () => {
        const apiUrl = 'http://localhost:9999/txns';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok)
                throw new Error(response.statusText);
            const data = await response.json();
            console.log('data123:', data);
            if (Array.isArray(data)) {
                entries = data
                    .filter((x) => typeof x === 'object' && x !== null)
                    .map((x) => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: String((_a = x.id) !== null && _a !== void 0 ? _a : ''),
                        date: String((_b = x.date) !== null && _b !== void 0 ? _b : ''),
                        header: String((_c = x.header) !== null && _c !== void 0 ? _c : ''),
                        credit: Number((_d = x.credit) !== null && _d !== void 0 ? _d : 0),
                        debit: Number((_e = x.debit) !== null && _e !== void 0 ? _e : 0),
                    });
                });
            }
            else {
                entries = [];
            }
        }
        catch (_a) {
            // const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
            // entries = raw ? (JSON.parse(raw) as TXN[]) : [];
            entries = [];
        }
    };
    const handleSave = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY_NAME, JSON.stringify(entries));
    };
    const handleEditRow = () => {
        entriesContainer.innerHTML = '';
        entries.forEach((e, idx) => {
            const row = document.createElement('div');
            row.className = 'row g-2 align-items-center py-3 border-bottom';
            if (editIndex === idx) {
                row.innerHTML = `
          <div class="col-2 col-md-1">
            <input name="edit-id" type="text" class="form-control form-control-sm" value="${e.id || ''}" />
          </div>
          <div class="col-10 col-md-3">
            <input name="edit-date" type="date" class="form-control form-control-sm" value="${toDateInputValue(e.date) || ''}" />
          </div>
          <div class="col-12 col-md-3">
            <input name="edit-header" type="text" class="form-control form-control-sm" value="${e.header || ''}" placeholder="Header" />
          </div>
          <div class="col-6 col-md-2">
            <input name="edit-credit" type="text" inputmode="decimal"
              class="form-control form-control-sm text-md-end editable-input"
              value="${e.credit ? String(e.credit) : ''}" placeholder="0.00" />
          </div>
          <div class="col-6 col-md-2">
            <input name="edit-debit" type="text" inputmode="decimal"
              class="form-control form-control-sm text-md-end editable-input"
              value="${e.debit ? String(e.debit) : ''}" placeholder="0.00" />
          </div>
          <div class="col-12 col-md-1 text-end">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-primary" data-action="handleSave" data-index="${idx}">Save</button>
              <button type="button" class="btn btn-secondary" data-action="cancel" data-index="${idx}">Cancel</button>
            </div>
          </div>
        `;
                entriesContainer.appendChild(row);
            }
            else {
                row.innerHTML = `
          <div class="col-2 col-md-1"><span class="text-muted">${e.id || ''}</span></div>
          <div class="col-10 col-md-3">${formatDateForDisplay(e.date)}</div>
          <div class="col-12 col-md-3">${e.header || ''}</div>
          <div class="col-6 col-md-2 text-md-end">${e.credit ? handleFormatAmount(e.credit) : ''}</div>
          <div class="col-6 col-md-2 text-md-end">${e.debit ? handleFormatAmount(e.debit) : ''}</div>
          <div class="col-12 col-md-1 text-end">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-secondary" data-action="edit" data-index="${idx}">Edit</button>
              <button type="button" class="btn btn-outline-danger" data-action="remove" data-index="${idx}">Remove</button>
            </div>
          </div>
        `;
                entriesContainer.appendChild(row);
            }
        });
        const totals = entries.reduce((acc, e) => {
            acc.credit += Number(e.credit || 0);
            acc.debit += Number(e.debit || 0);
            return acc;
        }, { credit: 0, debit: 0 });
        totalsCreditEl.textContent = handleFormatAmount(totals.credit);
        totalsDebitEl.textContent = handleFormatAmount(totals.debit);
        balanceValueEl.textContent = handleFormatAmount(totals.credit - totals.debit);
    };
    const clearForm = () => {
        form.reset();
        addBtn.textContent = 'Add';
        dateInput.focus();
    };
    const validateAmounts = (creditRaw, debitRaw) => {
        let credit = (creditRaw !== null && creditRaw !== void 0 ? creditRaw : '').toString().replace(/,/g, '').trim();
        let debit = (debitRaw !== null && debitRaw !== void 0 ? debitRaw : '').toString().replace(/,/g, '').trim();
        if (credit && debit)
            return { ok: false, msg: 'Enter either Credit OR Debit, not both.' };
        if (!credit && !debit)
            return { ok: false, msg: 'Enter an amount in Credit or Debit.' };
        if (credit) {
            const n = Number(credit);
            credit = Number.isNaN(n) ? '0' : String(n);
        }
        else {
            credit = '0';
        }
        if (debit) {
            const n = Number(debit);
            debit = Number.isNaN(n) ? '0' : String(n);
        }
        else {
            debit = '0';
        }
        return { ok: true, credit: Number(credit), debit: Number(debit) };
    };
    const nextSequentialId = () => {
        const userId = idInput.value.trim();
        if (userId)
            return userId;
        const maxNum = entries.reduce((m, e) => {
            const n = parseInt(e.id, 10);
            return Number.isFinite(n) ? Math.max(m, n) : m;
        }, 0);
        return String(maxNum + 1);
    };
    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const date = dateInput.value;
        if (!date) {
            alert('Please choose Date of Transaction.');
            return;
        }
        const amounts = validateAmounts(creditInput.value, debitInput.value);
        if (!amounts.ok) {
            alert(amounts.msg);
            return;
        }
        const item = {
            id: nextSequentialId(),
            date,
            header: headerInput.value.trim(),
            credit: amounts.credit,
            debit: amounts.debit,
        };
        entries.push(item);
        handleSave();
        handleEditRow();
        clearForm();
    });
    entriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (!target)
            return;
        const btn = target.closest('button[data-action]');
        if (!btn)
            return;
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.index);
        const row = btn.closest('.row');
        if (action === 'edit') {
            editIndex = idx;
            handleEditRow();
            return;
        }
        if (action === 'cancel') {
            editIndex = null;
            handleEditRow();
            return;
        }
        if (action === 'remove') {
            if (editIndex !== null && idx < editIndex)
                editIndex -= 1;
            if (editIndex === idx)
                editIndex = null;
            entries.splice(idx, 1);
            handleSave();
            handleEditRow();
            return;
        }
        if (action === 'handleSave') {
            if (!row)
                return;
            const idEl = row.querySelector('input[name="edit-id"]');
            const dateEl = row.querySelector('input[name="edit-date"]');
            const headerEl = row.querySelector('input[name="edit-header"]');
            const creditEl = row.querySelector('input[name="edit-credit"]');
            const debitEl = row.querySelector('input[name="edit-debit"]');
            const id = ((idEl === null || idEl === void 0 ? void 0 : idEl.value) || '').trim();
            const date = (dateEl === null || dateEl === void 0 ? void 0 : dateEl.value) || '';
            if (!date) {
                alert('Please choose Date of Transaction.');
                return;
            }
            const amounts = validateAmounts(creditEl === null || creditEl === void 0 ? void 0 : creditEl.value, debitEl === null || debitEl === void 0 ? void 0 : debitEl.value);
            if (!amounts.ok) {
                alert(amounts.msg);
                return;
            }
            entries[idx] = {
                id,
                date,
                header: ((headerEl === null || headerEl === void 0 ? void 0 : headerEl.value) || '').trim(),
                credit: amounts.credit,
                debit: amounts.debit,
            };
            handleSave();
            editIndex = null;
            handleEditRow();
        }
    });
    await initialLoadData();
    handleEditRow();
})();
(() => {
    const setVisible = (input, visible) => {
        input.style.opacity = visible ? '1' : '0';
        input.style.pointerEvents = visible ? 'auto' : 'none';
    };
    const initAmountGroup = (groupEl) => {
        if (!groupEl || groupEl.dataset.amountToggleInit === '1')
            return;
        const creditInput = groupEl.querySelector('#inputCredit') ||
            groupEl.querySelector('.amount-cell input');
        const debitInput = groupEl.querySelector('#inputDebit') ||
            groupEl.querySelectorAll('.amount-cell input')[1] ||
            null;
        if (!creditInput || !debitInput)
            return;
        const creditCell = creditInput.closest('.amount-cell');
        const debitCell = debitInput.closest('.amount-cell');
        const showOnly = (which) => {
            const showCredit = which === 'credit';
            setVisible(creditInput, showCredit);
            setVisible(debitInput, !showCredit);
            groupEl.dataset.active = showCredit ? 'credit' : 'debit';
        };
        showOnly('credit');
        if (creditCell) {
            creditCell.addEventListener('mouseenter', () => showOnly('credit'));
        }
        if (debitCell) {
            debitCell.addEventListener('mouseenter', () => showOnly('debit'));
        }
        creditInput.addEventListener('focusin', () => showOnly('credit'));
        debitInput.addEventListener('focusin', () => showOnly('debit'));
        groupEl.addEventListener('mouseleave', () => {
            if (document.activeElement === debitInput) {
                showOnly('debit');
            }
            else if (document.activeElement === creditInput) {
                showOnly('credit');
            }
            else {
                showOnly('credit');
            }
        });
        const onFocusOut = (e) => {
            const next = e.relatedTarget;
            const stillInside = !!next && groupEl.contains(next);
            if (!stillInside)
                showOnly('credit');
        };
        creditInput.addEventListener('focusout', onFocusOut);
        debitInput.addEventListener('focusout', onFocusOut);
        groupEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                showOnly('credit');
                creditInput.focus();
            }
        });
        groupEl.dataset.amountToggleInit = '1';
    };
    const initAllAmountGroups = (root = document) => {
        const groups = root.querySelectorAll('.amount-group');
        groups.forEach((node) => initAmountGroup(node));
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initAllAmountGroups());
    }
    else {
        initAllAmountGroups();
    }
    window.AmountToggle = {
        initAll: initAllAmountGroups,
        initOne: (groupEl) => initAmountGroup(groupEl),
    };
})();
export {};
