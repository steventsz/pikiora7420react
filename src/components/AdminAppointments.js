import React, {useCallback, useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table} from "react-bootstrap";
import base_url from "../constraints";

function handleLoginError(error) {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return true;
    }

    return false;
}

function getBackendError(error, fallbackMessage) {
    if (error.response && error.response.data) {
        if (error.response.data.detail) {
            return error.response.data.detail;
        }

        if (error.response.data.patient) {
            return "Patient: " + error.response.data.patient.join(" ");
        }

        if (error.response.data.slot) {
            return "Slot: " + error.response.data.slot.join(" ");
        }

        if (error.response.data.status) {
            return "Status: " + error.response.data.status.join(" ");
        }

        if (error.response.data.notes) {
            return "Notes: " + error.response.data.notes.join(" ");
        }

        if (error.response.data.non_field_errors) {
            return error.response.data.non_field_errors.join(" ");
        }
    }

    if (error.request) {
        return "Backend server is not running. Please start Django on port 8000.";
    }

    return fallbackMessage;
}

function AdminAppointments(props) {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [slots, setSlots] = useState([]);
    const [status, setStatus] = useState("");
    const [doctor, setDoctor] = useState("");
    const [date, setDate] = useState("");
    const [slot, setSlot] = useState("");
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [newPatient, setNewPatient] = useState("");
    const [newSlot, setNewSlot] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [editingAppointmentId, setEditingAppointmentId] = useState("");
    const [editStatus, setEditStatus] = useState("booked");
    const [editNotes, setEditNotes] = useState("");
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
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not load doctors. Please try again."));
                }
            })
            .finally(() => {
                setLoadingDoctors(false);
            });
    }, [token]);

    useEffect(() => {
        setLoadingPatients(true);

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
                setPatients(response.data.filter((user) => (
                    !user.is_staff && user.is_active
                )));
            })
            .catch((error) => {
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not load patients. Please try again."));
                }
            })
            .finally(() => {
                setLoadingPatients(false);
            });
    }, [token]);

    const loadSlots = useCallback(() => {
        setLoadingSlots(true);

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/slots/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                setSlots(response.data);
            })
            .catch((error) => {
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not load appointment slots. Please try again."));
                }
            })
            .finally(() => {
                setLoadingSlots(false);
            });
    }, [token]);

    useEffect(() => {
        loadSlots();
    }, [loadSlots]);

    const loadAppointments = useCallback(() => {
        setLoadingAppointments(true);
        setError("");

        let params = new URLSearchParams();

        if (status) {
            params.append("status", status);
        }

        if (doctor) {
            params.append("doctor", doctor);
        }

        if (date) {
            params.append("date", date);
        }

        if (slot) {
            params.append("slot", slot);
        }

        let url = base_url + "/appointments/";

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
                setAppointments(response.data);
            })
            .catch((error) => {
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not load appointments. Please try again."));
                }
            })
            .finally(() => {
                setLoadingAppointments(false);
            });
    }, [status, doctor, date, slot, token]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    function getStatusVariant(appointmentStatus) {
        if (appointmentStatus === "booked") {
            return "success";
        }

        if (appointmentStatus === "cancelled") {
            return "secondary";
        }

        if (appointmentStatus === "completed") {
            return "primary";
        }

        return "dark";
    }

    function getPatientName(user) {
        if (user.first_name || user.last_name) {
            return (user.first_name + " " + user.last_name).trim() + " (" + user.username + ")";
        }

        return user.username;
    }

    function getSlotLabel(slotItem) {
        return slotItem.doctor_name + " - " + slotItem.date + " " + slotItem.slot_time;
    }

    function clearFilters() {
        setStatus("");
        setDoctor("");
        setDate("");
        setSlot("");
    }

    function resetForm() {
        setNewPatient("");
        setNewSlot("");
        setNewNotes("");
        setEditingAppointmentId("");
        setEditStatus("booked");
        setEditNotes("");
        setError("");
    }

    function startEdit(appointment) {
        setEditingAppointmentId(appointment.id);
        setEditStatus(appointment.status);
        setEditNotes(appointment.notes ? appointment.notes : "");
        setError("");
        setMessage("");
    }

    function saveAppointment() {
        setSaving(true);
        setError("");
        setMessage("");

        let data = editingAppointmentId ? JSON.stringify({
            "status": editStatus,
            "notes": editNotes
        }) : JSON.stringify({
            "patient": Number(newPatient),
            "slot": Number(newSlot),
            "notes": newNotes
        });

        if (!editingAppointmentId && (!newPatient || !newSlot)) {
            setSaving(false);
            setError("Please choose a patient and slot.");
            return;
        }

        let config = {
            method: editingAppointmentId ? 'patch' : 'post',
            maxBodyLength: Infinity,
            url: editingAppointmentId ? base_url + "/appointments/" + editingAppointmentId + "/" : base_url + "/appointments/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                if (editingAppointmentId) {
                    setMessage("Appointment updated successfully.");
                } else {
                    setMessage("Appointment added successfully.");
                }

                resetForm();
                loadAppointments();
                loadSlots();
            })
            .catch((error) => {
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not save this appointment. Please try again."));
                }
            })
            .finally(() => {
                setSaving(false);
            });
    }

    function deleteAppointment(appointment) {
        if (!window.confirm("Delete this appointment?")) {
            return;
        }

        setDeletingId(appointment.id);
        setError("");
        setMessage("");

        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: base_url + "/appointments/" + appointment.id + "/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(config)
            .then((response) => {
                if (editingAppointmentId === appointment.id) {
                    resetForm();
                }

                setMessage("Appointment deleted successfully.");
                loadAppointments();
                loadSlots();
            })
            .catch((error) => {
                if (!handleLoginError(error)) {
                    setError(getBackendError(error, "Could not delete this appointment. Please try again."));
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
                    <h3>{editingAppointmentId ? "Edit Appointment" : "Add Appointment"}</h3>
                    {editingAppointmentId ?
                        <Form>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                        <option value="booked">booked</option>
                                        <option value="cancelled">cancelled</option>
                                        <option value="completed">completed</option>
                                    </Form.Select>
                                </Col>
                                <Col md={8} className="mb-3">
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Button variant="primary" className="me-2" onClick={saveAppointment} disabled={saving}>
                                {saving ? "Saving..." : "Update Appointment"}
                            </Button>
                            <Button variant="outline-secondary" onClick={resetForm} disabled={saving}>
                                Cancel Edit
                            </Button>
                        </Form> :
                        <Form>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Patient</Form.Label>
                                    <Form.Select
                                        value={newPatient}
                                        onChange={(e) => setNewPatient(e.target.value)}
                                        disabled={loadingPatients}
                                    >
                                        <option value="">Choose patient</option>
                                        {patients.map((patient) => (
                                            <option value={patient.id} key={patient.id}>
                                                {getPatientName(patient)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Slot</Form.Label>
                                    <Form.Select
                                        value={newSlot}
                                        onChange={(e) => setNewSlot(e.target.value)}
                                        disabled={loadingSlots}
                                    >
                                        <option value="">Choose slot</option>
                                        {slots.map((slotItem) => (
                                            <option value={slotItem.id} key={slotItem.id}>
                                                {getSlotLabel(slotItem)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newNotes}
                                        onChange={(e) => setNewNotes(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Button variant="primary" onClick={saveAppointment} disabled={saving}>
                                {saving ? "Saving..." : "Add Appointment"}
                            </Button>
                        </Form>
                    }
                </Card.Body>
            </Card>

            <Card className="mb-4 text-start">
                <Card.Body>
                    <h3>Filter Appointments</h3>
                    <Row>
                        <Col md={3} className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="booked">booked</option>
                                <option value="cancelled">cancelled</option>
                                <option value="completed">completed</option>
                            </Form.Select>
                        </Col>
                        <Col md={3} className="mb-3">
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
                        <Col md={3} className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Col>
                        <Col md={3} className="mb-3">
                            <Form.Label>Slot</Form.Label>
                            <Form.Select value={slot} onChange={(e) => setSlot(e.target.value)} disabled={loadingSlots}>
                                <option value="">All slots</option>
                                {slots.map((slotItem) => (
                                    <option value={slotItem.id} key={slotItem.id}>
                                        {getSlotLabel(slotItem)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                    <Button variant="outline-secondary" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </Card.Body>
            </Card>

            {loadingAppointments ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading appointments...</span>
                </Spinner> :
                appointments.length === 0 ?
                    <Alert variant="info">No appointments match your filters.</Alert> :
                    <Table striped bordered hover responsive className="text-start">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.patient_username}</td>
                                    <td>{appointment.doctor_name}</td>
                                    <td>{appointment.slot_date}</td>
                                    <td>{appointment.slot_time}</td>
                                    <td>
                                        <Badge bg={getStatusVariant(appointment.status)}>
                                            {appointment.status}
                                        </Badge>
                                    </td>
                                    <td>{appointment.notes ? appointment.notes : "No notes"}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 mb-1"
                                            onClick={() => startEdit(appointment)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => deleteAppointment(appointment)}
                                            disabled={deletingId === appointment.id}
                                        >
                                            {deletingId === appointment.id ? "Deleting..." : "Delete"}
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

export default AdminAppointments;
