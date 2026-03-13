import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Txn } from "../models/Txn";
import type { TxnsSummary } from "../models/TxnsSummary";

export interface TxnState {
    list: Txn[];
    summary: TxnsSummary;
}

const initialState: TxnState = {
    list: [{
        id: 1,
        header: "Salary",
        txnDate: "2026-01-01",
        txnType: "CREDIT",
        amount: 56000
    },
    {
        id: 2,
        header: "Rent",
        txnDate: "2026-01-01",
        txnType: "DEBIT",
        amount: 6000
    }],
    summary: { totalCredit: 56000, totalDebit: 6000, balance: 50000 }
};

export const txnSlice = createSlice({
    name: "txn",
    initialState,
    reducers: {
        addTxn: (state, action: PayloadAction<Txn>) => {
            const newId =
                state.list.length > 0
                    ? Math.max(...state.list.map((t) => t.id)) + 1
                    : 1;

            const newTxn = {
                ...action.payload,
                id: newId
            }

            state.list.push(newTxn);

            // Add tranasction summary - todo

            if (newTxn.txnType === "CREDIT") {
                state.summary.totalCredit += newTxn.amount
            } else if (newTxn.txnType === 'DEBIT') {
                state.summary.totalDebit += newTxn.amount
            }

            state.summary.balance = state.summary.totalCredit - state.summary.totalDebit

        },

        updateTxn: (state, action: PayloadAction<Txn>) => {
            const idx = state.list.findIndex((x) => x.id === action.payload.id);
            if (idx >= 0) {
                const selectedTxn = state.list[idx]                

                if (selectedTxn.txnType === 'CREDIT') {
                    state.summary.totalCredit -= selectedTxn.amount
                } else if (selectedTxn.txnType === 'DEBIT') {
                    state.summary.totalDebit -= selectedTxn.amount
                }

                state.list[idx] = action.payload;

                if (action.payload.txnType === 'CREDIT') {
                    state.summary.totalCredit += action.payload.amount
                } else if (action.payload.txnType === 'DEBIT') {
                    state.summary.totalDebit += action.payload.amount
                }

                state.summary.balance = state.summary.totalCredit - state.summary.totalDebit

                state.list[idx].isEditable = undefined;

            }
            // update tranasction summary - todo


        },

        deleteTxn: (state, action: PayloadAction<number>) => {
            let index = state.list.findIndex((t) => t.id === action.payload);
            if (index > -1) {
                state.list.splice(index, 1);

                const selectedTxn = state.list[index];
                if (selectedTxn.txnType === 'CREDIT') {
                    state.summary.totalCredit -= selectedTxn.amount
                } else if (selectedTxn.txnType === 'DEBIT') {
                    state.summary.totalDebit -= selectedTxn.amount;
                }

                state.summary.balance = state.summary.totalCredit - state.summary.totalDebit

            }
            // delete tranasction summary - todo


        },

        editTxn: (state, action: PayloadAction<number>) => {
            const index = state.list.findIndex(item => item.id === action.payload);
            if (index > -1) {
                state.list[index].isEditable = true;
            }
        },

        cancelTxn: (state, action: PayloadAction<number>) => {
            const index = state.list.findIndex(item => item.id === action.payload);
            if (index > -1) {
                state.list[index].isEditable = undefined;
            }
        }
    },
});

const txnReducer = txnSlice.reducer;

export const { addTxn, updateTxn, deleteTxn, editTxn, cancelTxn } = txnSlice.actions;
export default txnReducer;