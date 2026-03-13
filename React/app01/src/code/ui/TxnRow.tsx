import { Row, Col, Button, ButtonGroup } from "react-bootstrap";
import type { Txn } from "../models/Txn";

type Props = {
  txn: Txn;
  edit: (id: number) => void;
  remove: (id: number) => void;
};

const TxnRow = ({ txn, edit, remove }: Props) => (
  <Row className="p-1 mb-1 border-bottom border-info align-items-center">
    <Col xs={1} className="text-end">
      {txn.id}
    </Col>

    <Col xs={2} className="text-center">
      {txn.txnDate}
    </Col>

    <Col>{txn.header}</Col>

    <Col xs={2} className="text-end">
      {txn.txnType === "CREDIT" && txn.amount}
    </Col>

    <Col xs={2} className="text-end">
      {txn.txnType === "DEBIT" && txn.amount}
    </Col>

    <Col xs={2} className="text-center">
      <ButtonGroup aria-label="transaction actions" size="sm">
        <Button variant="secondary" onClick={() => edit(txn.id)} title="Edit">
          <i className="bi bi-pen" aria-hidden="true" />
          <span className="visually-hidden">Edit</span>
        </Button>
        <Button
          variant="danger"
          className="ms-1"
          onDoubleClick={() => remove(txn.id)}
          title="Double click to delete"
        >
          <i className="bi bi-trash" aria-hidden="true" />
          <span className="visually-hidden">Delete</span>
        </Button>
      </ButtonGroup>
    </Col>
  </Row>
);

export default TxnRow;
