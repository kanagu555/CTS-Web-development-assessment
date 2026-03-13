import { configureStore } from "@reduxjs/toolkit";
import txnReducer from "./txnSlice";

export const store = configureStore({
    reducer: {
        statementTxn: txnReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;