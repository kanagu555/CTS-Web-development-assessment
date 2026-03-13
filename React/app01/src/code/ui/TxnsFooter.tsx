import { Fragment } from "react";
import { Row, Col } from "react-bootstrap";
import type { TxnsSummary } from "../models/TxnsSummary";

type Props = {
  txnsSummary: TxnsSummary;
};

const TxnsFooter = ({ txnsSummary }: Props) => (
  <Fragment>
    <Row className="p-1 mb-1 border-bottom border-dark fw-bold">
      <Col className="text-end">Totals</Col>
      <Col xs={2} className="text-end">
        {txnsSummary.totalCredit}
      </Col>
      <Col xs={2} className="text-end">
        {txnsSummary.totalDebit}
      </Col>
      <Col xs={2} className="text-center"></Col>
    </Row>

    <Row className="p-1 mb-1 border-bottom border-dark fw-bold" />
    <Row className="p-1">
      <Col className="text-end" />
      <Col xs={2} className="text-center" />
      <Col xs={2} className="text-end">
        {txnsSummary.balance}
      </Col>
      <Col xs={2} className="text-center">
      </Col>
    </Row>
  </Fragment>
);

export default TxnsFooter;
