import React from 'react';
import {Link} from "react-router";
import {Container, Nav, Navbar} from "react-bootstrap";

function Navigation(props) {
    return (
        <Navbar bg="light" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">Piki Ora 7420</Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navigation"/>
                <Navbar.Collapse id="main-navigation">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/doctors">Doctors</Nav.Link>
                        <Nav.Link as={Link} to="/slots">Slots</Nav.Link>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
