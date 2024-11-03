import React, { useState, useEffect } from 'react';
import Cms from '../components/cms';

const roleMapping = {
  1: 'Admin',
  2: 'Writer',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  return date.toLocaleString('en-GB', options).replace(',', '');
};

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/users?deleted=false'); // Fetch only non-deleted users
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const users = await response.json();
        setUsersData(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e, username) => {
    const { name, value } = e.target;
    setUsersData(usersData.map((user) => {
      if (user.username === username) {
        return { ...user, [name]: value };
      }
      return user;
    }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleUpdate = async (originalUsername) => {
    const userToUpdate = usersData.find((user) => user.username === originalUsername);

    if (!validateEmail(userToUpdate.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    try {
      await fetch(`http://localhost:3005/api/users/${originalUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userToUpdate.email }), // Only send the email
      });

      setEditingUser(null); // Exit editing mode
    } catch (error) {
      console.error('Failed to update user email:', error);
    }
  };


  const handleDelete = async (username) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await fetch(`http://localhost:3005/api/users/${username}`, {
          method: 'DELETE', // Use PUT for soft delete
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deleted: true }), // Mark user as deleted
        });

        // Update local state to filter out the deleted user
        setUsersData(usersData.filter((user) => user.username !== username));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser(user.username);
  };

  return (
    <Cms activePage="users">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto bg-gray-800 rounded-xl shadow-lg">
            <table className="min-w-full bg-gray-800 rounded-xl">
  <thead className="bg-gray-800 text-white">
  <tr>
                        <th style={{ width: '100px' }} className="px-4 py-3">ID</th>
                        {/* <th style={{ width: '100px' }} className="px-4 py-3">
                            Genres
                            <button onClick={handleSort} className="ml-2 text-xs">
                                {sortOrder === 'asc' ? '▲' : '▼'}
                            </button>
                        </th> */}
                        <th style={{ width: '100px' }} className="px-4 py-3">Username</th>
                        <th style={{ width: '100px' }} className="px-4 py-3">Email</th>
                        <th style={{ width: '100px' }} className="px-4 py-3">Role</th>
                        <th style={{ width: '100px' }} className="px-4 py-3">Created At</th>
                        <th style={{ width: '100px' }} className="py-3 text-center">Actions</th>
                    </tr>
  </thead>
  <tbody>
    {usersData.map((user, index) => (
      <tr
        key={user.username}
        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
      >
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800">{index + 1}</td>
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800">{user.username}</td>
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800">
          {editingUser === user.username ? (
            <input
              type="email"
              name="email"
              value={user.email}
              className={`p-1 rounded-md bg-gray-300 text-black focus:outline-none ${emailError ? 'border-red-500' : ''}`}
              onChange={(e) => handleChange(e, user.username)}
            />
          ) : (
            user.email
          )}
          {editingUser === user.username && emailError && (
            <span className="text-red-500">{emailError}</span>
          )}
        </td>
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800">{roleMapping[user.role_id] || 'Unknown'}</td>
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800">{formatDate(user.created_at)}</td>
        <td className="py-3 px-6 border-b border-gray-300 text-gray-800 text-center">
          <div className="flex justify-center space-x-2">
            {editingUser === user.username ? (
              <>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
                  onClick={() => handleUpdate(user.username)}
                >
                  Save
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                  onClick={() => startEditing(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  onClick={() => handleDelete(user.username)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            </div>
          </div>
        </main>
      </div>
    </Cms>
  );

}
  export default Users;
