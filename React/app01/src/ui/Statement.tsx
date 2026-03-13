// import { useEffect, useState } from "react";
import type { Txn } from "../models/Txn";
import TxnsHeader from "./TxnsHeader";
import TxnRow from "./TxnRow";
import type { TxnsSummary } from "../models/TxnsSummary";
import TxnsFooter from "./TxnsFooter";
import TxnForm from "./TxnForm";
import { Container } from "react-bootstrap";
import {
  addTxn,
  cancelTxn,
  deleteTxn,
  editTxn,
  updateTxn,
} from "../state/txnSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../state/store";

const Statement = () => {
  const txns: Txn[] = useSelector(
    (state: RootState) => state.statementTxn.list,
  );
  const txnsSummary: TxnsSummary = useSelector(
    (state: RootState) => state.statementTxn.summary,
  );
  const dispatch: AppDispatch = useDispatch();

  // console.log("txnsData:", txnsData);

  // const [txns, setTxns] = useState<Txn[]>([]);
  // const [errMsg, ] = useState<string | null>(null);
  // const [txnsSummary, setTxnsSummary] = useState<TxnsSummary>({
  //   totalCredit: 0,
  //   totalDebit: 0,
  //   balance: 0,
  // });

  // useEffect(() => {
  // getAllTxns()
  //   .then((resp) => setTxns(resp.data))
  //   .catch((err) => {
  //     console.error(err);
  //     setErrMsg("Unable to fetech records! Please retry later!");
  //   });
  // }, []);

  // useEffect(() => {
  //   if (txns && txns.length > 0) {
  //     const sumUp = (txns: Txn[], target: string) =>
  //       txns
  //         .filter((t) => t.txnType === target)
  //         .map((t) => t.amount)
  //         .reduce((a1, a2) => a1 + a2);

  //     const tc = sumUp(txns, "CREDIT");
  //     const tdb = sumUp(txns, "DEBIT");
  //     setTxnsSummary({ totalCredit: tc, totalDebit: tdb, balance: tc - tdb });
  //   } else {
  //     setTxnsSummary({ totalCredit: 0, totalDebit: 0, balance: 0 });
  //   }
  // }, [txns]);

  const add = (txn: Txn) => {
    // addTxn(txn)
    //   .then((resp) => setTxns([...txns, { ...resp.data }]))
    //   .catch((err) => {
    //     console.error(err);
    //     setErrMsg("Unable to save records! Please retry later!");
    //   });
    dispatch(addTxn(txn));
  };

  const update = (txn: Txn) => {
    dispatch(updateTxn(txn));
    // txn.isEditable = undefined;
    // saveTxn(txn.id, txn)
    //   .then((resp) =>
    //     setTxns(txns.map((tx) => (tx.id === txn.id ? { ...resp.data } : tx))),
    //   )
    //   .catch((err) => {
    //     console.error(err);
    //     setErrMsg("Unable to save records! Please retry later!");
    //   });
  };

  const remove = (id: number) => {
    console.log("deleteTxn:", id);

    dispatch(deleteTxn(id));
    // delTxnById(id)
    //   .then((_resp) => setTxns(txns.filter((tx) => tx.id !== id)))
    //   .catch((err) => {
    //     console.error(err);
    //     setErrMsg("Unable to remove records! Please retry later!");
    //   });
  };

  const edit = (id: number) => {
    dispatch(editTxn(id));

    // setTxns(
    //   txns.map((tx) => (tx.id === id ? { ...tx, isEditable: true } : tx)),
    // );
  };

  const cancelEdit = (id: number) => {
    dispatch(cancelTxn(id));

    // setTxns(
    //   txns.map((tx) => (tx.id === id ? { ...tx, isEditable: undefined } : tx)),
    // );
  };

  console.log("txns123:", txns);

  return (
    <Container className="col-sm-10 m-2 mx-auto p-2">
      <h3>Statement</h3>

      {/* {errMsg && (
        <div className="alert alert-danger p-2">
          <strong>{errMsg}</strong>
        </div>
      )} */}

      <TxnsHeader />
      <TxnForm save={add} />
      {txns &&
        txns.length > 0 &&
        txns.map((t) =>
          t.isEditable ? (
            <TxnForm key={t.id} t={t} save={update} cancel={cancelEdit} />
          ) : (
            <TxnRow key={t.id} txn={t} edit={edit} remove={remove} />
          ),
        )}
      <TxnsFooter txnsSummary={txnsSummary} />
    </Container>
  );
};

export default Statement;
