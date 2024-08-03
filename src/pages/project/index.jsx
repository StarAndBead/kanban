import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal, Button, Form, Input, Select, Upload, message } from 'antd';
import axios from 'axios';
import uuid from 'react-uuid';
import { UploadOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
const { Option } = Select;
import { TaskBox, TaskName, Task, Column } from '../../components/task';
import dayjs from 'dayjs';
import st_main from "./index.module.css";

const styles = {
    app: {
        display: 'flex',
        transform: 'scale(0.9)',
        transformOrigin: 'top left'  // 确定变形的基点
    },
    eventBar: {
        flexShrink: 1,
        minWidth: '250px',
        textAlign: 'center',
        width: '250px',
        height: '100%',  // Adjust to 100% of parent container
        borderRight: '2px solid #ededed',
        padding: '0px 0'
    },
    eventBarTitle: {
        fontSize: '2.5em',
        fontWeight: 400,
        fontStyle: 'italic'
    },
    eventContainer: {
        height: '100vh',
        padding: '0 10px',
        overflow: 'auto'
    },
    event: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.5em',
        lineHeight: '1.5em',
        maxWidth: '230px',
        fontWeight: 400,
        borderRadius: '10px',
        padding: '5px 10px',
        margin: '10px',
        transition: '0.5s',
        cursor: 'pointer',
        // border: '2px solid rgba(227, 180, 244, 0.425)', // 添加边框
    },
    selectedEvent: {
        color: '#fff',
        backgroundColor: '#4590f0'
    },
    starIcon: {
        marginRight: '10px',
        cursor: 'pointer'
    },
};
export const EventBar = ({ events, setEvents, currentEvent, setCurrentEvent, fetchEvents, fetchEventsAndToDefaultProject }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = useCallback(() => {
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const { title } = values;
            if (events.find((event) => event.title.toLowerCase() === title.toLowerCase())) {
                message.error('项目已存在，请重新命名');
                return;
            }
            const username = localStorage.getItem('username');
            const response = await axios.post(`/api/${username}/projects`, { title }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEvents((prev) => [...prev, response.data]);
            setCurrentEvent(response.data);
            setIsModalVisible(false);
            //  console.log({ events });
            //   console.log({ currentEvent });
            form.resetFields();
        } catch (error) {
            console.error('Failed to create project!', error);
            message.error('项目创建失败');
        }
    }, [events, form, setEvents, setCurrentEvent]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    const toggleFavorite = useCallback(async (item) => {
        try {
            const username = localStorage.getItem('username');
            const updatedItem = { ...item, favorite: !item.favorite };
            await axios.put(`/api/${username}/projects/${item.id}`, updatedItem, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEvents(events.map(event => event.id === item.id ? updatedItem : event));
        } catch (error) {
            console.error('Failed to update project!', error);
            message.error('更新项目失败');
        }
    }, [events, setEvents]);

    return (
        <div style={styles.eventBar}>
            <h1 style={{ marginBottom: 10 }}>Project list</h1>
            <Button style={{ fontWeight: "bolder" }} onClick={handleAdd}>
                Add Project
            </Button>
            <div style={styles.eventContainer}>
                {events.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            ...styles.event,
                            ...(currentEvent && currentEvent.id === item.id ? styles.selectedEvent : {}),
                            display: 'grid', // 设置为 grid 布局
                            gridTemplateColumns: 'auto 1fr', // 设置列宽，第二列自动填充剩余空间
                            alignItems: 'center', // 垂直居中对齐
                        }}
                        onClick={() => setCurrentEvent(item)}
                    >
                        <span style={styles.starIcon} onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}>
                            {item.favorite ? <StarFilled /> : <StarOutlined />}
                        </span>
                        <span style={{ textAlign: 'center' }}>
                            {item.title}
                        </span>
                    </div>
                ))}
            </div>
            <Modal
                title="Add New Project"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" name="form_in_modal">
                    <Form.Item
                        name="title"
                        label="Project Title"
                        rules={[{ required: true, message: 'Please input the title of the project!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


const Project = () => {
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);

    const fetchEvents = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // console.log({ response });
            if (response.data.length === 0) {
                // If no projects, create a default project
                const defaultProject = {
                    title: 'default project',
                    ['To do']: [],
                    ['In progress']: [],
                    ['Completed']: [],
                };
                //   console.log({ defaultProject });
                const defaultResponse = await axios.post(`/api/${username}/projects`, defaultProject, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setEvents([defaultResponse.data]);
                setCurrentEvent(defaultResponse.data);
                //  console.log({ events });
                // console.log({ currentEvent });

            } else {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch projects!', error);
            message.error('Failed to fetch projects!');
        }
    };


    const fetchEventsAndToDefaultProject = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            //  console.log({ response });
            if (response.data.length === 0) {
                // If no projects, create a default project
                const defaultProject = {
                    title: 'default project',
                    ['To do']: [],
                    ['In progress']: [],
                    ['Completed']: [],
                };
                //   console.log({ defaultProject });
                const defaultResponse = await axios.post(`/api/${username}/projects`, defaultProject, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setEvents([defaultResponse.data]);
                setCurrentEvent(defaultResponse.data);
                //  console.log({ events });
                //  console.log({ currentEvent });

            } else {
                setEvents(response.data);
                setCurrentEvent(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch projects!', error);
            message.error('Failed to fetch projects!');
        }
    };

    useEffect(() => {
        fetchEventsAndToDefaultProject();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchEvents();
        }, 5000); // Call fetchEvents every second

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);
    return (
        //<div className={st_main.main}>
        <div style={styles.app}>
            <EventBar
                events={events}
                setEvents={setEvents}
                currentEvent={currentEvent}
                setCurrentEvent={setCurrentEvent}
                fetchEvents={fetchEvents} // 传递 fetchEvents 函数
                fetchEventsAndToDefaultProject={fetchEventsAndToDefaultProject}
            />
            {currentEvent && (
                <TaskBox
                    events={events}
                    setEvents={setEvents}
                    currentEvent={currentEvent}
                    setCurrentEvent={setCurrentEvent}
                    fetchEvents={fetchEvents} // 传递 fetchEvents 函数
                    fetchEventsAndToDefaultProject={fetchEventsAndToDefaultProject}
                />
            )}
        </div>
        // </div>
    );
};

export default Project;
