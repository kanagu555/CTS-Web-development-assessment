import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const txnDispatch = () => useDispatch<AppDispatch>();
export const useTxnSelector: TypedUseSelectorHook<RootState> = useSelector;