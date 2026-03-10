import { Fragment, useState, type SubmitEvent } from "react";
import { Form, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import type { Txn } from "../models/Txn";

const TxnForm = ({
  t,
  save,
  cancel,
}: {
  t?: Txn;
  save: (txn: Txn) => void;
  cancel?: (id: number) => void;
}) => {
  const [txn, setTxn] = useState<Txn>(
    t
      ? { ...t }
      : {
          id: 0,
          header: "",
          txnDate: new Date().toISOString().substring(0, 10),
          txnType: "CREDIT",
          amount: 0,
        },
  );

  const toggleType = (txnType: string) => {
    setTxn({ ...txn, txnType });
  };

  const formSubmitted = (e: SubmitEvent) => {
    e.preventDefault();
    save({ ...txn });
    if (!txn.isEditable) {
      setTxn({
        id: 0,
        header: "",
        txnDate: new Date().toISOString().substring(0, 10),
        txnType: "CREDIT",
        amount: 0,
      });
    }
  };

  return (
    <Form
      className="p-1 mb-1 border-bottom border-info"
      onSubmit={formSubmitted}
    >
      <Row>
        <Col xs={12} sm={1} className="text-sm-end text-muted small">
          {txn.id}
        </Col>
        <Col sm={2} className="text-center">
          <Form.Control
            className="form-control"
            type="date"
            value={txn.txnDate}
            onChange={(e) => setTxn({ ...txn, txnDate: e.target.value })}
          />
        </Col>
        <Col sm={2}>
          <Form.Control
            className="form-control"
            type="text"
            value={txn.header}
            onChange={(e) => setTxn({ ...txn, header: e.target.value })}
          />
        </Col>
        <Col sm={2} className="text-end" onClick={(_e) => toggleType("CREDIT")}>
          {txn.txnType === "CREDIT" && (
            <Form.Control
              className="form-control"
              type="number"
              value={txn.amount}
              onChange={(e) =>
                setTxn({ ...txn, amount: Number(e.target.value) })
              }
            />
          )}
        </Col>
        <Col sm={2} className="text-end" onClick={(_e) => toggleType("DEBIT")}>
          {txn.txnType === "DEBIT" && (
            <Form.Control
              className="form-control"
              type="number"
              value={txn.amount}
              onChange={(e) =>
                setTxn({ ...txn, amount: Number(e.target.value) })
              }
            />
          )}
        </Col>
        <Col sm={2} className="text-center">
          {txn.isEditable ? (
            <Fragment>
              <ButtonGroup>
                <Button className="btn btn-sm btn-primary">
                  <i className="bi bi-floppy" />
                </Button>
                <Button
                  className="btn btn-sm btn-danger ms-1"
                  type="button"
                  onClick={(_e) => cancel && cancel(txn.id)}
                >
                  <i className="bi bi-x-circle" />
                </Button>
              </ButtonGroup>
            </Fragment>
          ) : (
            <ButtonGroup>
              <Button className="btn btn-sm btn-primary">
                <i className="bi bi-floppy" />
              </Button>
            </ButtonGroup>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default TxnForm;
