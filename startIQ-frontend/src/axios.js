// importing axios for network request
import axios from 'axios';


// Get Authentication token
const getAuthToken = () => {
    const token = localStorage.getItem("admin_token");
    return token;
}
// Created Axios instance to use it in whole application
const coreModuleinstance = axios.create({
    baseURL: 'https://api.startiq.org/api/v1',
    // baseURL : 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});


// declaring interceptors
coreModuleinstance.interceptors.request.use(response => {
    const token = getAuthToken();
    // Check if User is authenticated or not
    if (token) {
        response.headers = {
            'Authorization': `Bearer ${token}`
        }
    }
    return response;
}, error => {
    return error;
});

export { coreModuleinstance };