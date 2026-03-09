import { useEffect, useState } from "react";
import type { Txn } from "../models/Txn";
import TxnsHeader from "./TxnsHeader";
import TxnRow from "./TxnRow";
import { addTxn, delTxnById, getAllTxns, saveTxn } from "../service/txnsApi";
import type { TxnsSummary } from "../models/TxnsSummary";
import TxnsFooter from "./TxnsFooter";
import TxnForm from "./TxnForm";
import { Container } from "react-bootstrap";
 
const Statement = () => {
 
    const [txns, setTxns] = useState<Txn[]>([]);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [txnsSummary, setTxnsSummary] = useState<TxnsSummary>({ totalCredit: 0, totalDebit: 0, balance: 0 });
 
    useEffect(() => {
        getAllTxns()
            .then(resp => setTxns(resp.data))
            .catch(err => {
                console.error(err);
                setErrMsg("Unable to fetech records! Please retry later!");
            });
    }, []);
 
    useEffect(() => {
        if (txns && txns.length > 0) {
 
            const sumUp = (txns: Txn[], target: string) => txns.filter(t => t.txnType === target)
                .map(t => t.amount)
                .reduce((a1, a2) => a1 + a2);
 
            const tc = sumUp(txns, "CREDIT");
            const tdb = sumUp(txns, "DEBIT");
            setTxnsSummary({ totalCredit: tc, totalDebit: tdb, balance: tc - tdb });
        } else {
            setTxnsSummary({ totalCredit: 0, totalDebit: 0, balance: 0 });
        }
    }, [txns]);
 
    const add = (txn: Txn) => {
        addTxn(txn)
            .then(resp => setTxns([...txns, { ...resp.data }]))
            .catch(err => {
                console.error(err);
                setErrMsg("Unable to save records! Please retry later!");
            });
    }
 
    const update = (txn: Txn) => {
        txn.isEditable = undefined;
        saveTxn(txn.id, txn)
            .then(resp => setTxns(txns.map(tx => tx.id === txn.id ? { ...resp.data } : tx)))
            .catch(err => {
                console.error(err);
                setErrMsg("Unable to save records! Please retry later!");
            });
    }
 
    const remove = (id: number) => {
        delTxnById(id)
            .then(_resp => setTxns(txns.filter(tx => tx.id !== id)))
            .catch(err => {
                console.error(err);
                setErrMsg("Unable to remove records! Please retry later!");
            });
    }
 
    const edit = (id: number) => setTxns(txns.map(tx => tx.id === id ? { ...tx, isEditable: true } : tx))
 
    const cancelEdit = (id: number) => setTxns(txns.map(tx => tx.id === id ? { ...tx, isEditable: undefined } : tx))
 
    return (
        <Container className="col-sm-10 m-2 mx-auto p-2">
            <h3>Statement</h3>
 
            {
                errMsg && (
                    <div className="alert alert-danger p-2">
                        <strong>{errMsg}</strong>
                    </div>
                )
            }
 
            <TxnsHeader />
            <TxnForm save={add} />
            {
                txns && txns.length > 0 && (
                    txns.map(t => t.isEditable ?
                        <TxnForm key={t.id} t={t} save={update} cancel={cancelEdit} /> :
                        <TxnRow key={t.id} txn={t} edit={edit} remove={remove} />)
                )
            }
            <TxnsFooter txnsSummary={txnsSummary} />
        </Container>
    )
}
 
export default Statement;