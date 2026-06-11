import React, {useEffect, useState} from 'react';
import {Link} from "react-router";
import axios from "axios";
import {Button, Container, Nav, Navbar} from "react-bootstrap";
import base_url from "../constraints";

function Navigation(props) {
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            const savedToken = localStorage.getItem("token");

            setToken(savedToken);

            if (localStorage.getItem("user")) {
                setUser(JSON.parse(localStorage.getItem("user")));
            }

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: base_url + "/auth/me/",
                headers: {
                    'Authorization': 'Token ' + savedToken
                }
            };

            axios.request(config)
                .then((response) => {
                    setUser(response.data);
                    localStorage.setItem("user", JSON.stringify(response.data));
                })
                .catch((error) => {
                    setToken("");
                    setUser(null);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                });
        }
    }, []);

    function logout() {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

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
                        {token && user && !user.is_staff && <Nav.Link as={Link} to="/appointments">My Appointments</Nav.Link>}
                        {token && user && user.is_staff && <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>}
                    </Nav>
                    <Nav className="ms-auto">
                        {token && user ?
                            <>
                                <Navbar.Text className="me-3">
                                    Logged in as {user.username}
                                </Navbar.Text>
                                <Button variant="outline-secondary" size="sm" onClick={logout}>Logout</Button>
                            </> :
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
