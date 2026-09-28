const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const fetchAdminEnquiries = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/admin/enquiries`, {
      headers: getHeaders(token)
    });
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Failed to fetch enquiries:', err);
    return [];
  }
};

export const updateEnquiryStatusApi = async (token, id, status) => {
  try {
    const res = await fetch(`${API_BASE}/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update status:', err);
    return { success: false, message: err.message };
  }
};

export const deleteEnquiryApi = async (token, id) => {
  try {
    const res = await fetch(`${API_BASE}/admin/enquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to delete enquiry:', err);
    return { success: false, message: err.message };
  }
};

export const updateAdminProfileApi = async (token, profileData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update profile:', err);
    return { success: false, message: err.message };
  }
};

export const changeAdminPasswordApi = async (token, passwordData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(passwordData)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to change password:', err);
    return { success: false, message: err.message };
  }
};
