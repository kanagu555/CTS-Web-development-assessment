import { Nav, Row } from "react-bootstrap";

const Header = ({ appTitle }: { appTitle: string }) => (
  <Nav className="navbar navbar-expand-sm navbar-dark bg-dark">
    <Row className="container-fluid">
      <a className="navbar-brand" href="#">
        {appTitle}
      </a>
    </Row>
  </Nav>
);

export default Header;
