import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  DownOutlined,
  SmileOutlined,
} from '@ant-design/icons';

import { Layout as AntdLayout, Menu, theme, Dropdown, Space, message } from 'antd';
import { useRouter } from "next/router";

import styles from './index.module.css';
import bgImage from '../../assets/bg.png';
import { exit } from 'process';

const { Header, Content, Footer, Sider } = AntdLayout;

const items = [
  {
    key: 'user',
    icon: React.createElement(UserOutlined),
    label: 'User Center', // 将用户名替换为实际的用户名变量
  },
  {
    key: 'project',
    icon: React.createElement(BarChartOutlined),
    label: 'Project Management',
  },
  {
    key: 'workbench',
    icon: React.createElement(AppstoreOutlined),
    label: 'Workbench',
  },
];



function Layout({ children }) {

  const exit_to_login = async () => {
    try {
      // 假设这里有退出项目的逻辑
      console.log("exit");
      message.success('Exited project successfully!');
      router.push('/login'); // 使用 router.push 进行重定向
    } catch (error) {
      console.error('Failed to exit project', error);
      message.error('Failed to exit project');
    }
  };
  const items_user = [
    {
      key: 'exit',
      icon: React.createElement(UserOutlined),
      label: 'Exit', // 将用户名替换为实际的用户名变量
    },
  ];

  const menu = (
    <Menu
      onClick={exit_to_login}
      items={items_user}
    />
  );
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const handleMenuClick = ({ key }) => {
    router.push(key);
  };

  const [username, setUsername] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername);
    }
  }, []);

  return (
    <AntdLayout hasSider style={{ minHeight: '100vh' }}>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: colorBgContainer,
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu theme="light" mode="inline" defaultSelectedKeys={['project']} items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntdLayout
        style={{
          marginLeft: 200, // 设置与 Sider 的宽度相同
        }}
      >
        <Header className={styles.header}
          height={40}
          style={{
            paddingLeft: 90,
            background: colorBgContainer,
            fontSize: 25
          }}
        >
          Agile Kanban
          <span className={styles.user}>
            <Dropdown overlay={menu}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  {username}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </span>
        </Header>
        <Content
          style={{
            margin: '24px 16px 0',
            overflow: 'initial',
          }}
        >
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              backgroundImage: `url(${bgImage})`, // 使用背景图片
              backgroundSize: 'cover', // 确保图片覆盖整个背景
              backgroundPosition: 'center', // 图片居中
              backgroundRepeat: 'no-repeat', // 不重复背景图片
              backgroundColor: colorBgContainer, // 背景颜色（用于透明度）
              borderRadius: borderRadiusLG,
              minHeight: '100%',
            }}
          >
            {children}
          </div>
        </Content>
      </AntdLayout>
    </AntdLayout >
  );
}

export default Layout;
