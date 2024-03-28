import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import axios from 'axios';

function ResetPasswordPage() {
  const { token } = useParams(); // Access the token parameter
  const [formData, setFormData] = useState({
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`http://localhost:4000/users/resetPass/${token}`, formData);
      console.log('Password reset successful:', response.data);
      // Optionally, you can redirect the user to the login page or show a success message
    } catch (error) {
      console.error('Password reset failed:', error.response.data);
      // Handle error response from the backend
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
