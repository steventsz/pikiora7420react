import React, {useCallback, useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import base_url from "../constraints";

function AdminUsers(props) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingUserId, setEditingUserId] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isStaff, setIsStaff] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deactivatingId, setDeactivatingId] = useState("");
    const token = localStorage.getItem("token");

    const loadUsers = useCallback(() => {
        setLoading(true);
        setError("");

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/users/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else if (error.response && error.response.status === 403) {
                    setError("You must be an admin user to manage users.");
                } else if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load users. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    function resetForm() {
        setEditingUserId("");
        setEmail("");
        setFirstName("");
        setLastName("");
        setIsStaff(false);
        setIsActive(true);
        setError("");
    }

    function startEdit(user) {
        setEditingUserId(user.id);
        setEmail(user.email ? user.email : "");
        setFirstName(user.first_name ? user.first_name : "");
        setLastName(user.last_name ? user.last_name : "");
        setIsStaff(user.is_staff);
        setIsActive(user.is_active);
        setError("");
        setMessage("");
    }

    function getUserError(error) {
        if (error.response && error.response.data) {
            if (error.response.data.detail) {
                return error.response.data.detail;
            }

            if (error.response.data.email) {
                return "Email: " + error.response.data.email.join(" ");
            }

            if (error.response.data.first_name) {
                return "First name: " + error.response.data.first_name.join(" ");
            }

            if (error.response.data.last_name) {
                return "Last name: " + error.response.data.last_name.join(" ");
            }
        }

        if (error.request) {
            return "Backend server is not running. Please start Django on port 8000.";
        }

        return "Could not save this user. Please try again.";
    }

    function saveUser() {
        if (!editingUserId) {
            setError("Choose a user to edit.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        let data = JSON.stringify({
            "email": email,
            "first_name": firstName,
            "last_name": lastName,
            "is_staff": isStaff,
            "is_active": isActive
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: base_url + "/users/" + editingUserId + "/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setUsers(users.map((user) => {
                    if (user.id === editingUserId) {
                        return response.data;
                    }

                    return user;
                }));
                setMessage("User updated successfully.");
                resetForm();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getUserError(error));
                }
            })
            .finally(() => {
                setSaving(false);
            });
    }

    function deactivateUser(user) {
        if (!window.confirm("Deactivate " + user.username + "?")) {
            return;
        }

        setDeactivatingId(user.id);
        setError("");
        setMessage("");

        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: base_url + "/users/" + user.id + "/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setUsers(users.map((userItem) => {
                    if (userItem.id === user.id) {
                        return {...userItem, is_active: false};
                    }

                    return userItem;
                }));

                if (editingUserId === user.id) {
                    resetForm();
                }

                setMessage("User deactivated successfully.");
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getUserError(error));
                }
            })
            .finally(() => {
                setDeactivatingId("");
            });
    }

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Card className="mb-4 text-start">
                <Card.Body>
                    <h3>{editingUserId ? "Edit User" : "Choose a User"}</h3>
                    {editingUserId ?
                        <Form>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Col>
                            </Row>

                            <Form.Check
                                className="mb-2"
                                type="checkbox"
                                label="Staff user"
                                checked={isStaff}
                                onChange={(e) => setIsStaff(e.target.checked)}
                            />

                            <Form.Check
                                className="mb-3"
                                type="checkbox"
                                label="Active user"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />

                            <Button variant="primary" className="me-2" onClick={saveUser} disabled={saving}>
                                {saving ? "Saving..." : "Update User"}
                            </Button>
                            <Button variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                Cancel Edit
                            </Button>
                        </Form> :
                        <p>Select Edit beside a user to update their account details. New users should register through the registration page.</p>
                    }
                </Card.Body>
            </Card>

            {loading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading users...</span>
                </Spinner> :
                users.length === 0 ?
                    <Alert variant="info">No users have been added yet.</Alert> :
                    <Table striped bordered hover responsive className="text-start">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Staff</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email ? user.email : "No email"}</td>
                                    <td>
                                        {user.is_staff ?
                                            <Badge bg="primary">Staff</Badge> :
                                            <Badge bg="secondary">Patient</Badge>
                                        }
                                    </td>
                                    <td>
                                        {user.is_active ?
                                            <Badge bg="success">Active</Badge> :
                                            <Badge bg="secondary">Inactive</Badge>
                                        }
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => startEdit(user)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => deactivateUser(user)}
                                            disabled={deactivatingId === user.id || !user.is_active}
                                        >
                                            {deactivatingId === user.id ? "Saving..." : "Deactivate"}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
            }
        </div>
    );
}

export default AdminUsers;
