import api from './api'

export const registerAccount = async (phoneNumber, password) => {
    return await api.post('/account/register', {
        phoneNumber,
        password,
    });
};

// Create User Profile
export const createUserProfile = async (profileData) => {
    return await api.post('/user/create', profileData);
};
