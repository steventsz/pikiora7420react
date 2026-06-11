import React, {useEffect, useState} from 'react';
import axios from "axios";
import base_url from "../constraints";

function Appointments(props) {
    const [user, setUser] = useState(null);

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
                    setUser(response.data);
                    localStorage.setItem("user", JSON.stringify(response.data));
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
            <h1>My Appointments</h1>
            {user && <p>Appointments for {user.username} will be added here.</p>}
        </div>
    );
}

export default Appointments;
