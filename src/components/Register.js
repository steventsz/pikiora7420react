import React, {useState} from 'react';
import axios from "axios";
import {Alert, Button, Card, Container, Form} from "react-bootstrap";
import base_url from "../constraints";

function Register(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function usernameHandler(e) {
        setUsername(e.target.value);
    }

    function passwordHandler(e) {
        setPassword(e.target.value);
    }

    function passwordConfirmHandler(e) {
        setPasswordConfirm(e.target.value);
    }

    function emailHandler(e) {
        setEmail(e.target.value);
    }

    function register() {
        if (!username || !email || !password || !password_confirm) {
            setError("Please complete all fields.");
            return;
        }

        if (password !== password_confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");

        let data = JSON.stringify({
            "username": username,
            "email": email,
            "password": password,
            "password_confirm": password_confirm
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: base_url + "/auth/register/",
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                if (response.data.user && response.data.user.is_staff) {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/";
                }
            })
            .catch((error) => {
                if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Registration failed. Please check your details.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <Container>
            <Card className="auth-card text-start">
                <Card.Body>
                    <h1>Register</h1>
                    <p className="page-intro">Create a patient account to book appointments.</p>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={username} onChange={usernameHandler}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={emailHandler}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={passwordHandler}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password_confirm}
                                onChange={passwordConfirmHandler}
                            />
                        </Form.Group>

                        <Button type="button" onClick={register} disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register;
