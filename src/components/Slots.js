import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {Link} from "react-router";
import base_url from "../constraints";

function Slots(props) {
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [doctor, setDoctor] = useState("");
    const [date, setDate] = useState("");
    const [isAvailable, setIsAvailable] = useState("true");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/doctors/"
        };

        axios.request(config)
            .then((response) => {
                setDoctors(response.data);
            })
            .catch((error) => {
                setDoctors([]);
            });
    }, []);

    useEffect(() => {
        setLoading(true);

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
            url: url
        };

        axios.request(config)
            .then((response) => {
                setSlots(response.data);
                setError("");
            })
            .catch((error) => {
                if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load appointment slots. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [doctor, date, isAvailable]);

    function doctorHandler(e) {
        setDoctor(e.target.value);
    }

    function dateHandler(e) {
        setDate(e.target.value);
    }

    function availabilityHandler(e) {
        setIsAvailable(e.target.value);
    }

    function clearFilters() {
        setDoctor("");
        setDate("");
        setIsAvailable("true");
    }

    return (
        <Container>
            <h1>Appointment Slots</h1>
            <p>Browse available appointment times.</p>

            {!token &&
                <Alert variant="info">
                    Please login to book an appointment. You can still browse available slots below.
                </Alert>
            }

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4 text-start">
                <Card.Body>
                    <Row>
                        <Col md={4} className="mb-3">
                            <Form.Label>Doctor</Form.Label>
                            <Form.Select value={doctor} onChange={doctorHandler}>
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
                            <Form.Control type="date" value={date} onChange={dateHandler}/>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Form.Label>Availability</Form.Label>
                            <Form.Select value={isAvailable} onChange={availabilityHandler}>
                                <option value="">All slots</option>
                                <option value="true">Available only</option>
                                <option value="false">Not available</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    <Button variant="outline-secondary" onClick={clearFilters}>Clear Filters</Button>
                </Card.Body>
            </Card>

            {loading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading slots...</span>
                </Spinner> :
                slots.length === 0 ?
                    <Alert variant="info">No appointment slots match your filters.</Alert> :
                    <Row>
                        {slots.map((slot) => (
                            <Col md={6} lg={4} className="mb-3" key={slot.id}>
                                <Card className="h-100 text-start">
                                    <Card.Body>
                                        <Card.Title>{slot.doctor_name}</Card.Title>
                                        <Card.Text>
                                            <strong>Date:</strong> {slot.date}<br/>
                                            <strong>Time:</strong> {slot.slot_time}
                                        </Card.Text>
                                        <Card.Text>
                                            {slot.is_available ?
                                                <Badge bg="success">Available</Badge> :
                                                <Badge bg="secondary">Not available</Badge>
                                            }
                                        </Card.Text>
                                        {slot.is_available && !token &&
                                            <Card.Text>
                                                <Link to="/login">Login to book this appointment</Link>
                                            </Card.Text>
                                        }
                                        {slot.is_available && token &&
                                            <Button variant="primary" disabled>
                                                Booking will be added in the next module
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

export default Slots;
