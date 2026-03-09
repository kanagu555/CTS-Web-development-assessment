import { TXN } from "../model/txn";

interface Totals {
    credit: number;
    debit: number;
}

type AmountValidation =
    | { ok: true; txnType: 'Credit' | 'Debit'; amount: number }
    | { ok: false; msg: string };

declare global {
    interface Window {
        AmountToggle: {
            initAll: () => void;
            initOne: (groupEl: HTMLElement) => void;
        };
    }
}

function byId<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with id="${id}" not found`);
    return el as T;
}

function formatDateForDisplay(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function toDateInputValue(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

(async () => {
    const form = byId<HTMLFormElement>('entryForm');
    const idInput = byId<HTMLImageElement | HTMLInputElement>('inputId') as HTMLInputElement; // preserve existing field name
    const dateInput = byId<HTMLInputElement>('inputDate');
    const headerInput = byId<HTMLInputElement>('inputHeader');
    const creditInput = byId<HTMLInputElement>('inputCredit');
    const debitInput = byId<HTMLInputElement>('inputDebit');
    const addBtn = byId<HTMLButtonElement>('addBtn');

    const entriesContainer = byId<HTMLElement>('entries');
    const totalsCreditEl = byId<HTMLElement>('totalsCredit');
    const totalsDebitEl = byId<HTMLElement>('totalsDebit');
    const balanceValueEl = byId<HTMLElement>('balanceValue');

    let entries: TXN[] = [];
    let editIndex: number | null = null;
    const LOCAL_STORAGE_KEY_NAME = 'statementEntries';

    const amountFmt = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const handleFormatAmount = (val: any): string => {
        if (val === null || val === undefined || val === '') return '';
        const n = Number(val);
        if (Number.isNaN(n)) return '';
        return amountFmt.format(n);
    };

    const initialLoadData = async (): Promise<void> => {
        const apiUrl = 'http://localhost:9999/txns';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(response.statusText);
            const data: unknown = await response.json();
            console.log('data123:', data);

            if (Array.isArray(data)) {
                entries = data
                    .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
                    .map((x) => {
                        const id = String((x as any).id ?? '');
                        const date = String((x as any).date ?? '');
                        const header = String((x as any).header ?? '');
                        const amountField = (x as any).amount;
                        const txnTypeField = (x as any).txnType;

                        if (typeof amountField === 'number' && (txnTypeField === 'Credit' || txnTypeField === 'Debit')) {
                            return {
                                id,
                                date,
                                header,
                                txnType: txnTypeField,
                                amount: amountField,
                            } as TXN;
                        }

                        const credit = Number((x as any).credit ?? 0);
                        const debit = Number((x as any).debit ?? 0);
                        if (credit > 0 && debit > 0) {
                            console.warn('Both credit and debit present; defaulting to credit for id:', id);
                        }
                        if (credit > 0) {
                            return {
                                id,
                                date,
                                header,
                                txnType: 'Credit',
                                amount: credit,
                            } as TXN;
                        } else {
                            return {
                                id,
                                date,
                                header,
                                txnType: 'Debit',
                                amount: debit,
                            } as TXN;
                        }
                    });
            } else {
                entries = [];
            }
        } catch {
            // const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
            // entries = raw ? (JSON.parse(raw) as TXN[]) : [];
            entries = [];
        }
    };

    const handleSave = (): void => {
        localStorage.setItem(LOCAL_STORAGE_KEY_NAME, JSON.stringify(entries));
    };

    const handleEditRow = (): void => {
        entriesContainer.innerHTML = '';

        console.log('entries:', entries);
        

        entries.forEach((e, idx) => {
            const row = document.createElement('div');
            row.className = 'row g-2 align-items-center py-3 border-bottom';

            if (editIndex === idx) {
                const creditValue = e.txnType === 'Credit' ? String(e.amount) : '';
                const debitValue = e.txnType === 'Debit' ? String(e.amount) : '';

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
              value="${creditValue}" placeholder="0.00" />
          </div>
          <div class="col-6 col-md-2">
            <input name="edit-debit" type="text" inputmode="decimal"
              class="form-control form-control-sm text-md-end editable-input"
              value="${debitValue}" placeholder="0.00" />
          </div>
          <div class="col-12 col-md-1 text-end">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-primary" data-action="handleSave" data-index="${idx}">Save</button>
              <button type="button" class="btn btn-secondary" data-action="cancel" data-index="${idx}">Cancel</button>
            </div>
          </div>
        `;
                entriesContainer.appendChild(row);
            } else {
                const creditCol = e.txnType === 'Credit' ? handleFormatAmount(e.amount) : '';
                const debitCol = e.txnType === 'Debit' ? handleFormatAmount(e.amount) : '';

                row.innerHTML = `
          <div class="col-2 col-md-1"><span class="text-muted">${e.id || ''}</span></div>
          <div class="col-10 col-md-3">${formatDateForDisplay(e.date)}</div>
          <div class="col-12 col-md-3">${e.header || ''}</div>
          <div class="col-6 col-md-2 text-md-end">${creditCol}</div>
          <div class="col-6 col-md-2 text-md-end">${debitCol}</div>
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

        const totals = entries.reduce<Totals>(
            (acc, e) => {
                if (e.txnType === 'Credit') acc.credit += e.amount || 0;
                else acc.debit += e.amount || 0;
                return acc;
            },
            { credit: 0, debit: 0 }
        );

        totalsCreditEl.textContent = handleFormatAmount(totals.credit);
        totalsDebitEl.textContent = handleFormatAmount(totals.debit);
        balanceValueEl.textContent = handleFormatAmount(totals.credit - totals.debit);
    };

    const clearForm = (): void => {
        form.reset();
        addBtn.textContent = 'Add';
        dateInput.focus();
    };

    const validateAmounts = (creditRaw: unknown, debitRaw: unknown): AmountValidation => {
        let credit = (creditRaw ?? '').toString().replace(/,/g, '').trim();
        let debit = (debitRaw ?? '').toString().replace(/,/g, '').trim();

        if (credit && debit) return { ok: false, msg: 'Enter either Credit OR Debit, not both.' };
        if (!credit && !debit) return { ok: false, msg: 'Enter an amount in Credit or Debit.' };

        if (credit) {
            const n = Number(credit);
            if (Number.isNaN(n) || n <= 0) return { ok: false, msg: 'Enter a valid positive credit amount.' };
            return { ok: true, txnType: 'Credit', amount: n };
        } else {
            const n = Number(debit);
            if (Number.isNaN(n) || n <= 0) return { ok: false, msg: 'Enter a valid positive debit amount.' };
            return { ok: true, txnType: 'Debit', amount: n };
        }
    };

    const nextSequentialId = (): string => {
        const userId = idInput.value.trim();
        if (userId) return userId;
        const maxNum = entries.reduce((m, e) => {
            const n = parseInt(e.id, 10);
            return Number.isFinite(n) ? Math.max(m, n) : m;
        }, 0);
        return String(maxNum + 1);
    };

    form.addEventListener('submit', (evt: SubmitEvent) => {
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

        const item: TXN = {
            id: nextSequentialId(),
            date,
            header: headerInput.value.trim(),
            txnType: amounts.txnType,
            amount: amounts.amount,
        };

        entries.push(item);
        handleSave();
        handleEditRow();
        clearForm();
    });

    entriesContainer.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const btn = target.closest('button[data-action]') as HTMLButtonElement | null;
        if (!btn) return;

        const action = btn.dataset.action as
            | 'edit'
            | 'remove'
            | 'cancel'
            | 'handleSave'
            | undefined;
        const idx = Number(btn.dataset.index);
        const row = btn.closest('.row') as HTMLElement | null;

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
            if (editIndex !== null && idx < editIndex) editIndex -= 1;
            if (editIndex === idx) editIndex = null;
            entries.splice(idx, 1);
            handleSave();
            handleEditRow();
            return;
        }

        if (action === 'handleSave') {
            if (!row) return;

            const idEl = row.querySelector<HTMLInputElement>('input[name="edit-id"]');
            const dateEl = row.querySelector<HTMLInputElement>('input[name="edit-date"]');
            const headerEl = row.querySelector<HTMLInputElement>('input[name="edit-header"]');
            const creditEl = row.querySelector<HTMLInputElement>('input[name="edit-credit"]');
            const debitEl = row.querySelector<HTMLInputElement>('input[name="edit-debit"]');

            const id = (idEl?.value || '').trim();
            const date = dateEl?.value || '';
            if (!date) {
                alert('Please choose Date of Transaction.');
                return;
            }

            const amounts = validateAmounts(creditEl?.value, debitEl?.value);
            if (!amounts.ok) {
                alert(amounts.msg);
                return;
            }

            entries[idx] = {
                id,
                date,
                header: (headerEl?.value || '').trim(),
                txnType: amounts.txnType,
                amount: amounts.amount,
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
    const setVisible = (input: HTMLInputElement, visible: boolean): void => {
        input.style.opacity = visible ? '1' : '0';
        input.style.pointerEvents = visible ? 'auto' : 'none';
    };

    const initAmountGroup = (groupEl: HTMLElement | null): void => {
        if (!groupEl || groupEl.dataset.amountToggleInit === '1') return;

        const creditInput =
            (groupEl.querySelector('#inputCredit') as HTMLInputElement | null) ||
            (groupEl.querySelector('.amount-cell input') as HTMLInputElement | null);
        const debitInput =
            (groupEl.querySelector('#inputDebit') as HTMLInputElement | null) ||
            (groupEl.querySelectorAll('.amount-cell input')[1] as HTMLInputElement | undefined) ||
            null;

        if (!creditInput || !debitInput) return;

        const creditCell = creditInput.closest('.amount-cell') as HTMLElement | null;
        const debitCell = debitInput.closest('.amount-cell') as HTMLElement | null;

        const showOnly = (which: 'credit' | 'debit'): void => {
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
            } else if (document.activeElement === creditInput) {
                showOnly('credit');
            } else {
                showOnly('credit');
            }
        });

        const onFocusOut = (e: FocusEvent) => {
            const next = e.relatedTarget as Node | null;
            const stillInside = !!next && groupEl.contains(next);
            if (!stillInside) showOnly('credit');
        };
        creditInput.addEventListener('focusout', onFocusOut);
        debitInput.addEventListener('focusout', onFocusOut);

        groupEl.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                showOnly('credit');
                creditInput.focus();
            }
        });

        groupEl.dataset.amountToggleInit = '1';
    };

    const initAllAmountGroups = (root: Document | HTMLElement = document): void => {
        const groups = root.querySelectorAll('.amount-group');
        groups.forEach((node) => initAmountGroup(node as HTMLElement));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initAllAmountGroups());
    } else {
        initAllAmountGroups();
    }

    window.AmountToggle = {
        initAll: initAllAmountGroups,
        initOne: (groupEl: HTMLElement) => initAmountGroup(groupEl),
    };
})();