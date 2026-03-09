import axios from "axios";
import type { Txn } from "../models/Txn";

const API_URL = "http://localhost:9999/txns";

export const getAllTxns = () => axios.get<Txn[]>(API_URL);

export const getTxnById = (id: number) => axios.get<Txn>(`${API_URL}/${id}`);

export const delTxnById = (id: number) => axios.delete<void>(`${API_URL}/${id}`);

export const addTxn = (txn: Txn) => axios.post<Txn>(API_URL, txn);

export const saveTxn = (id: number, txn: Txn) => axios.put<Txn>(`${API_URL}/${id}`, txn);