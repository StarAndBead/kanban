import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const UserCenter = () => {
    const [form] = Form.useForm();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handlePasswordChange = async (values) => {
        try {
            const { oldPassword, newPassword } = values;
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
            }
            await axios.put(`/api/users/${storedUsername}/change-password`, { oldPassword, newPassword });
            message.success('Password changed successfully.');
            form.resetFields();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to change password.';
            message.error(errorMsg);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
            <h2>User Center</h2>
            <h3>Username: {username}</h3>
            <Form form={form} onFinish={handlePasswordChange}>
                <Form.Item
                    name="oldPassword"
                    label="Old Password"
                    rules={[{ required: true, message: 'Please enter your old password' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[{ required: true, message: 'Please enter your new password' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Change Password
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserCenter;
