// Get stored token
export const getToken = () => localStorage.getItem('token');

// Check if user is authenticated
export const isAuthenticated = () => !!getToken();

// Get user role (customer/employee)
export const getUserRole = () => localStorage.getItem('role');

// Logout user (clear local storage)
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};
