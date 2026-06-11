import React, {useEffect, useState} from 'react';
import axios from "axios";
import base_url from "../constraints";
import {Container, Tab, Tabs} from "react-bootstrap";
import AdminDoctors from "./AdminDoctors";
import AdminSlots from "./AdminSlots";

function AdminDashboard(props) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (localStorage.getItem("token")) {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: base_url + "/auth/me/",
                headers: {
                    'Authorization': 'Token ' + localStorage.getItem("token")
                }
            };

            axios.request(config)
                .then((response) => {
                    if (response.data.is_staff) {
                        setUser(response.data);
                        localStorage.setItem("user", JSON.stringify(response.data));
                    } else {
                        setError("You must be an admin user to view this page.");
                    }
                })
                .catch((error) => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                });
        } else {
            window.location.href = "/login";
        }
    }, []);

    return (
        <Container>
            <h1>Admin Dashboard</h1>
            {error && <p>{error}</p>}
            {user &&
                <div>
                    <p>Welcome, {user.username}. Choose a section to manage.</p>

                    <Tabs defaultActiveKey="doctors" className="mb-3">
                        <Tab eventKey="doctors" title="Doctors">
                            <h2>Doctors</h2>
                            <AdminDoctors/>
                        </Tab>
                        <Tab eventKey="slots" title="Slots">
                            <h2>Slots</h2>
                            <AdminSlots/>
                        </Tab>
                        <Tab eventKey="appointments" title="Appointments">
                            <h2>Appointments</h2>
                            <p>Appointment management will be added here.</p>
                        </Tab>
                        <Tab eventKey="users" title="Users">
                            <h2>Users</h2>
                            <p>User management will be added here.</p>
                        </Tab>
                    </Tabs>
                </div>
            }
        </Container>
    );
}

export default AdminDashboard;
