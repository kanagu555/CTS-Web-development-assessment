import { Row, Col } from "react-bootstrap";

const TxnHeader = () => (
  <Row className="fw-bold p-1 mb-1 border-bottom border-dark text-center">
    <Col xs={1}>Txn#</Col>
    <Col xs={2}>Txn Date</Col>
    <Col>Header</Col>
    <Col xs={2}>Credit</Col>
    <Col xs={2}>Debit</Col>
    <Col xs={2}></Col>
  </Row>
);

export default TxnHeader;
``