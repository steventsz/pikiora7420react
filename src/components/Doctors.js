import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Alert, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import base_url from "../constraints";

function Doctors(props) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/doctors/"
        };

        axios.request(config)
            .then((response) => {
                setDoctors(response.data);
                setError("");
            })
            .catch((error) => {
                if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Could not load doctors. Please try again.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Container>
            <h1>Doctors</h1>
            <p>Browse doctors available at Piki Ora.</p>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading doctors...</span>
                </Spinner> :
                doctors.length === 0 ?
                    <Alert variant="info">No doctors are available at the moment.</Alert> :
                    <Row>
                        {doctors.map((doctor) => (
                            <Col md={6} lg={4} className="mb-3" key={doctor.id}>
                                <Card className="h-100 text-start">
                                    <Card.Body>
                                        <Card.Title>{doctor.name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            {doctor.specialty}
                                        </Card.Subtitle>
                                        <Card.Text>{doctor.bio}</Card.Text>
                                        <Card.Text>
                                            <strong>Email:</strong> {doctor.email}<br/>
                                            <strong>Phone:</strong> {doctor.phone}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Status:</strong> {doctor.is_active ? "Active" : "Inactive"}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
            }
        </Container>
    );
}

export default Doctors;
