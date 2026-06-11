import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import base_url from "../constraints";

function AdminDoctors(props) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingDoctorId, setEditingDoctorId] = useState("");
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [changingStatusId, setChangingStatusId] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLoading(true);
        setError("");

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/doctors/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setDoctors(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load doctors. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    function resetForm() {
        setEditingDoctorId("");
        setName("");
        setSpecialty("");
        setBio("");
        setEmail("");
        setPhone("");
        setIsActive(true);
        setError("");
    }

    function startEdit(doctor) {
        setEditingDoctorId(doctor.id);
        setName(doctor.name);
        setSpecialty(doctor.specialty);
        setBio(doctor.bio);
        setEmail(doctor.email);
        setPhone(doctor.phone);
        setIsActive(doctor.is_active);
        setError("");
        setMessage("");
    }

    function getDoctorError(error) {
        if (error.response && error.response.data) {
            if (error.response.data.detail) {
                return error.response.data.detail;
            }

            if (error.response.data.name) {
                return "Name: " + error.response.data.name.join(" ");
            }

            if (error.response.data.specialty) {
                return "Specialty: " + error.response.data.specialty.join(" ");
            }

            if (error.response.data.email) {
                return "Email: " + error.response.data.email.join(" ");
            }
        }

        if (error.request) {
            return "Backend server is not running. Please start Django on port 8000.";
        }

        return "Could not save this doctor. Please try again.";
    }

    function saveDoctor() {
        if (!name || !specialty || !email || !phone) {
            setError("Please enter name, specialty, email, and phone.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        let data = JSON.stringify({
            "name": name,
            "specialty": specialty,
            "bio": bio,
            "email": email,
            "phone": phone,
            "is_active": isActive
        });

        let config = {
            method: editingDoctorId ? 'patch' : 'post',
            maxBodyLength: Infinity,
            url: editingDoctorId ? base_url + "/doctors/" + editingDoctorId + "/" : base_url + "/doctors/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                if (editingDoctorId) {
                    setDoctors(doctors.map((doctor) => {
                        if (doctor.id === editingDoctorId) {
                            return response.data;
                        }

                        return doctor;
                    }));
                    setMessage("Doctor updated successfully.");
                } else {
                    setDoctors([...doctors, response.data]);
                    setMessage("Doctor added successfully.");
                }

                resetForm();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getDoctorError(error));
                }
            })
            .finally(() => {
                setSaving(false);
            });
    }

    function changeDoctorStatus(doctor) {
        setChangingStatusId(doctor.id);
        setError("");
        setMessage("");

        let data = JSON.stringify({
            "is_active": !doctor.is_active
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: base_url + "/doctors/" + doctor.id + "/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setDoctors(doctors.map((doctorItem) => {
                    if (doctorItem.id === doctor.id) {
                        return response.data;
                    }

                    return doctorItem;
                }));

                if (response.data.is_active) {
                    setMessage("Doctor activated successfully.");
                } else {
                    setMessage("Doctor deactivated successfully.");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getDoctorError(error));
                }
            })
            .finally(() => {
                setChangingStatusId("");
            });
    }

    function deleteDoctor(doctor) {
        if (!window.confirm("Delete " + doctor.name + "?")) {
            return;
        }

        setDeletingId(doctor.id);
        setError("");
        setMessage("");

        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: base_url + "/doctors/" + doctor.id + "/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setDoctors(doctors.filter((doctorItem) => (
                    doctorItem.id !== doctor.id
                )));

                if (editingDoctorId === doctor.id) {
                    resetForm();
                }

                setMessage("Doctor deleted successfully.");
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getDoctorError(error));
                }
            })
            .finally(() => {
                setDeletingId("");
            });
    }

    return (
        <div>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Card className="mb-4 text-start">
                <Card.Body>
                    <h3>{editingDoctorId ? "Edit Doctor" : "Add Doctor"}</h3>
                    <Form>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Specialty</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Form.Check
                            className="mb-3"
                            type="checkbox"
                            label="Active doctor"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />

                        <Button variant="primary" className="me-2" onClick={saveDoctor} disabled={saving}>
                            {saving ? "Saving..." : editingDoctorId ? "Update Doctor" : "Add Doctor"}
                        </Button>
                        {editingDoctorId &&
                            <Button variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                Cancel Edit
                            </Button>
                        }
                    </Form>
                </Card.Body>
            </Card>

            {loading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading doctors...</span>
                </Spinner> :
                doctors.length === 0 ?
                    <Alert variant="info">No doctors have been added yet.</Alert> :
                    <Table striped bordered hover responsive className="text-start">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Specialty</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id}>
                                    <td>{doctor.name}</td>
                                    <td>{doctor.specialty}</td>
                                    <td>{doctor.email}</td>
                                    <td>{doctor.phone}</td>
                                    <td>
                                        {doctor.is_active ?
                                            <Badge bg="success">Active</Badge> :
                                            <Badge bg="secondary">Inactive</Badge>
                                        }
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => startEdit(doctor)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant={doctor.is_active ? "outline-secondary" : "outline-success"}
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => changeDoctorStatus(doctor)}
                                            disabled={changingStatusId === doctor.id}
                                        >
                                            {changingStatusId === doctor.id ?
                                                "Saving..." :
                                                doctor.is_active ? "Deactivate" : "Activate"
                                            }
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => deleteDoctor(doctor)}
                                            disabled={deletingId === doctor.id}
                                        >
                                            {deletingId === doctor.id ? "Deleting..." : "Delete"}
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

export default AdminDoctors;
