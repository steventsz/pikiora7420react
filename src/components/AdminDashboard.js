import React, {useEffect, useState} from 'react';
import axios from "axios";
import base_url from "../constraints";

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
        <div>
            <h1>Admin Dashboard</h1>
            {error && <p>{error}</p>}
            {user && <p>Welcome, {user.username}. Admin tools will be added here.</p>}
        </div>
    );
}

export default AdminDashboard;
