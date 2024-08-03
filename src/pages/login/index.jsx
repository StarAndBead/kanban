
import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import axios from 'axios';
import styles from "./index.module.css";

function Login() {
    const [formType, setFormType] = useState('login');
    const [form] = Form.useForm();

    const handleFinish = async (values) => {
        try {
            if (formType === 'login') {
                const response = await axios.post('/api/login', values);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                message.success('登录成功');
                window.location.href = '/project';
            } else {
                const response = await axios.post('/api/register', values);
                message.success('注册成功');
                setFormType('login');
            }
        } catch (error) {
            console.error('Failed to authenticate!', error);
            message.error(formType === 'login' ? '登录失败' : '注册失败');
        }
    };

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <h2 className={styles.title}>敏捷看板</h2>
                <Radio.Group onChange={e => setFormType(e.target.value)} value={formType} style={{ marginBottom: 10 }}>
                    <Radio.Button value="login">登录</Radio.Button>
                    <Radio.Button value="register">注册</Radio.Button>
                </Radio.Group>
                <Form form={form} onFinish={handleFinish}>
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    {formType === 'register' && (
                        <Form.Item
                            name="confirmPassword"
                            label="确认密码"
                            rules={[
                                { required: true, message: "请确认密码" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次密码输入不一致'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {formType === 'login' ? '登录' : '注册'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default Login;
