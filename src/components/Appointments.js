import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import base_url from "../constraints";

function Appointments(props) {
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [cancellingId, setCancellingId] = useState("");
    const [cancelError, setCancelError] = useState("");
    const [deletingId, setDeletingId] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            window.location.href = "/login";
            return;
        }

        let userConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/auth/me/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(userConfig)
            .then((response) => {
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
            })
            .catch((error) => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            });

        setLoading(true);
        setError("");

        let appointmentsConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/appointments/",
            headers: {
                'Authorization': 'Token ' + token
            }
        };

        axios.request(appointmentsConfig)
            .then((response) => {
                setAppointments(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load your appointments. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    function getStatusVariant(status) {
        if (status === "booked") {
            return "success";
        }

        if (status === "cancelled") {
            return "secondary";
        }

        if (status === "completed") {
            return "primary";
        }

        return "dark";
    }

    function getAppointmentError(error) {
        if (error.response && error.response.data) {
            if (error.response.data.detail) {
                return error.response.data.detail;
            }

            if (error.response.data.status) {
                return "Could not update the appointment status.";
            }

            if (error.response.data.non_field_errors) {
                return error.response.data.non_field_errors.join(" ");
            }
        }

        if (error.request) {
            return "Backend server is not running. Please start Django on port 8000.";
        }

        return "Could not cancel this appointment. Please try again.";
    }

    function cancelAppointment(appointment) {
        setCancellingId(appointment.id);
        setCancelError("");
        setDeleteError("");
        setMessage("");

        let data = JSON.stringify({
            "status": "cancelled"
        });

        let config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: base_url + "/appointments/" + appointment.id + "/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setMessage("Appointment cancelled successfully.");
                setAppointments(appointments.map((appointmentItem) => {
                    if (appointmentItem.id === appointment.id) {
                        return response.data;
                    }

                    return appointmentItem;
                }));
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setCancelError(getAppointmentError(error));
                }
            })
            .finally(() => {
                setCancellingId("");
            });
    }

    function getDeleteError(error) {
        if (error.response && error.response.data && error.response.data.detail) {
            return error.response.data.detail;
        }

        if (error.request) {
            return "Backend server is not running. Please start Django on port 8000.";
        }

        return "Could not delete this appointment. Please try again.";
    }

    function deleteAppointment(appointment) {
        setDeletingId(appointment.id);
        setDeleteError("");
        setCancelError("");
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
                setMessage("Appointment deleted successfully.");
                setAppointments(appointments.filter((appointmentItem) => (
                    appointmentItem.id !== appointment.id
                )));
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                } else {
                    setDeleteError(getDeleteError(error));
                }
            })
            .finally(() => {
                setDeletingId("");
            });
    }

    return (
        <Container>
            <h1>My Appointments</h1>
            {user && <p>Appointments for {user.username}</p>}

            {error && <Alert variant="danger">{error}</Alert>}
            {cancelError && <Alert variant="danger">{cancelError}</Alert>}
            {deleteError && <Alert variant="danger">{deleteError}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            {loading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading appointments...</span>
                </Spinner> :
                appointments.length === 0 ?
                    <Alert variant="info">You do not have any appointments yet.</Alert> :
                    <Row>
                        {appointments.map((appointment) => (
                            <Col md={6} lg={4} className="mb-3" key={appointment.id}>
                                <Card className="h-100 text-start">
                                    <Card.Body>
                                        <Card.Title>{appointment.doctor_name}</Card.Title>
                                        <Card.Text>
                                            <strong>Date:</strong> {appointment.slot_date}<br/>
                                            <strong>Time:</strong> {appointment.slot_time}<br/>
                                            <strong>Status:</strong>{" "}
                                            <Badge bg={getStatusVariant(appointment.status)}>
                                                {appointment.status}
                                            </Badge>
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Notes:</strong><br/>
                                            {appointment.notes ? appointment.notes : "No notes"}
                                        </Card.Text>
                                        {appointment.status === "booked" &&
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => cancelAppointment(appointment)}
                                                disabled={cancellingId === appointment.id}
                                            >
                                                {cancellingId === appointment.id ? "Cancelling..." : "Cancel Appointment"}
                                            </Button>
                                        }
                                        {appointment.status === "cancelled" &&
                                            <Button
                                                variant="danger"
                                                onClick={() => deleteAppointment(appointment)}
                                                disabled={deletingId === appointment.id}
                                            >
                                                {deletingId === appointment.id ? "Deleting..." : "Delete"}
                                            </Button>
                                        }
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
            }
        </Container>
    );
}

export default Appointments;
