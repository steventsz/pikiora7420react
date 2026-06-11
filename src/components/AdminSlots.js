import React, {useCallback, useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import base_url from "../constraints";

const SLOT_TIMES = [
    {value: 1, label: "09:00 - 09:30"},
    {value: 2, label: "09:30 - 10:00"},
    {value: 3, label: "10:00 - 10:30"},
    {value: 4, label: "10:30 - 11:00"},
    {value: 5, label: "11:00 - 11:30"},
    {value: 6, label: "11:30 - 12:00"},
    {value: 7, label: "13:00 - 13:30"},
    {value: 8, label: "13:30 - 14:00"},
    {value: 9, label: "14:00 - 14:30"},
    {value: 10, label: "14:30 - 15:00"},
    {value: 11, label: "15:00 - 15:30"},
    {value: 12, label: "15:30 - 16:00"}
];

function AdminSlots(props) {
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [doctor, setDoctor] = useState("");
    const [date, setDate] = useState("");
    const [isAvailable, setIsAvailable] = useState("");
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [newDoctor, setNewDoctor] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newSlotIndex, setNewSlotIndex] = useState("");
    const [newIsAvailable, setNewIsAvailable] = useState(true);
    const [editingSlotId, setEditingSlotId] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLoadingDoctors(true);

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
                setLoadingDoctors(false);
            });
    }, [token]);

    const loadSlots = useCallback(() => {
        setLoadingSlots(true);
        setError("");

        let params = new URLSearchParams();

        if (doctor) {
            params.append("doctor", doctor);
        }

        if (date) {
            params.append("date", date);
        }

        if (isAvailable) {
            params.append("is_available", isAvailable);
        }

        let url = base_url + "/slots/";

        if (params.toString()) {
            url = url + "?" + params.toString();
        }

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setSlots(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load appointment slots. Please try again.");
                }
            })
            .finally(() => {
                setLoadingSlots(false);
            });
    }, [doctor, date, isAvailable, token]);

    useEffect(() => {
        loadSlots();
    }, [loadSlots]);

    function clearFilters() {
        setDoctor("");
        setDate("");
        setIsAvailable("");
    }

    function resetForm() {
        setEditingSlotId("");
        setNewDoctor("");
        setNewDate("");
        setNewSlotIndex("");
        setNewIsAvailable(true);
        setError("");
    }

    function startEdit(slot) {
        setEditingSlotId(slot.id);
        setNewDoctor(String(slot.doctor));
        setNewDate(slot.date);
        setNewSlotIndex(String(slot.slot_index));
        setNewIsAvailable(slot.is_available);
        setError("");
        setMessage("");
    }

    function getSlotTime(slot) {
        if (slot.slot_time) {
            return slot.slot_time;
        }

        let matchingSlotTime = SLOT_TIMES.find((slotTime) => (
            slotTime.value === slot.slot_index
        ));

        if (matchingSlotTime) {
            return matchingSlotTime.label;
        }

        return "";
    }

    function getSlotError(error) {
        if (error.response && error.response.data) {
            if (error.response.data.detail) {
                return error.response.data.detail;
            }

            if (error.response.data.doctor) {
                return "Doctor: " + error.response.data.doctor.join(" ");
            }

            if (error.response.data.date) {
                return "Date: " + error.response.data.date.join(" ");
            }

            if (error.response.data.slot_index) {
                return "Time: " + error.response.data.slot_index.join(" ");
            }

            if (error.response.data.non_field_errors) {
                return error.response.data.non_field_errors.join(" ");
            }
        }

        if (error.request) {
            return "Backend server is not running. Please start Django on port 8000.";
        }

        return "Could not save this slot. Please try again.";
    }

    function saveSlot() {
        if (!newDoctor || !newDate || !newSlotIndex) {
            setError("Please choose a doctor, date, and time.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        let data = JSON.stringify({
            "doctor": Number(newDoctor),
            "date": newDate,
            "slot_index": Number(newSlotIndex),
            "is_available": newIsAvailable
        });

        let config = {
            method: editingSlotId ? 'patch' : 'post',
            maxBodyLength: Infinity,
            url: editingSlotId ? base_url + "/slots/" + editingSlotId + "/" : base_url + "/slots/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                if (editingSlotId) {
                    setMessage("Slot updated successfully.");
                } else {
                    setMessage("Slot added successfully.");
                }

                resetForm();
                loadSlots();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getSlotError(error));
                }
            })
            .finally(() => {
                setSaving(false);
            });
    }

    function deleteSlot(slot) {
        if (!window.confirm("Delete this appointment slot?")) {
            return;
        }

        setDeletingId(slot.id);
        setError("");
        setMessage("");

        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: base_url + "/slots/" + slot.id + "/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                if (editingSlotId === slot.id) {
                    resetForm();
                }

                setMessage("Slot deleted successfully.");
                loadSlots();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setError(getSlotError(error));
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
                    <h3>{editingSlotId ? "Edit Slot" : "Add Slot"}</h3>
                    <Form>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Label>Doctor</Form.Label>
                                <Form.Select
                                    value={newDoctor}
                                    onChange={(e) => setNewDoctor(e.target.value)}
                                    disabled={loadingDoctors}
                                >
                                    <option value="">Choose doctor</option>
                                    {doctors.map((doctorItem) => (
                                        <option value={doctorItem.id} key={doctorItem.id}>
                                            {doctorItem.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Select value={newSlotIndex} onChange={(e) => setNewSlotIndex(e.target.value)}>
                                    <option value="">Choose time</option>
                                    {SLOT_TIMES.map((slotTime) => (
                                        <option value={slotTime.value} key={slotTime.value}>
                                            {slotTime.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>

                        <Form.Check
                            className="mb-3"
                            type="checkbox"
                            label="Available for booking"
                            checked={newIsAvailable}
                            onChange={(e) => setNewIsAvailable(e.target.checked)}
                        />

                        <Button variant="primary" className="me-2" onClick={saveSlot} disabled={saving}>
                            {saving ? "Saving..." : editingSlotId ? "Update Slot" : "Add Slot"}
                        </Button>
                        {editingSlotId &&
                            <Button variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                Cancel Edit
                            </Button>
                        }
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mb-4 text-start">
                <Card.Body>
                    <h3>Filter Slots</h3>
                    <Row>
                        <Col md={4} className="mb-3">
                            <Form.Label>Doctor</Form.Label>
                            <Form.Select
                                value={doctor}
                                onChange={(e) => setDoctor(e.target.value)}
                                disabled={loadingDoctors}
                            >
                                <option value="">All doctors</option>
                                {doctors.map((doctorItem) => (
                                    <option value={doctorItem.id} key={doctorItem.id}>
                                        {doctorItem.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Label>Availability</Form.Label>
                            <Form.Select value={isAvailable} onChange={(e) => setIsAvailable(e.target.value)}>
                                <option value="">All slots</option>
                                <option value="true">Available only</option>
                                <option value="false">Not available</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    <Button variant="outline-secondary" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </Card.Body>
            </Card>

            {loadingSlots ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading slots...</span>
                </Spinner> :
                slots.length === 0 ?
                    <Alert variant="info">No appointment slots match your filters.</Alert> :
                    <Table striped bordered hover responsive className="text-start">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Slot Index</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((slot) => (
                                <tr key={slot.id}>
                                    <td>{slot.doctor_name}</td>
                                    <td>{slot.date}</td>
                                    <td>{getSlotTime(slot)}</td>
                                    <td>{slot.slot_index}</td>
                                    <td>
                                        {slot.is_available ?
                                            <Badge bg="success">Available</Badge> :
                                            <Badge bg="secondary">Not available</Badge>
                                        }
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => startEdit(slot)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => deleteSlot(slot)}
                                            disabled={deletingId === slot.id}
                                        >
                                            {deletingId === slot.id ? "Deleting..." : "Delete"}
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

export default AdminSlots;
