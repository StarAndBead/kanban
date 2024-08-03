import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal, Button, Form, Input, Select, Upload, message } from 'antd';
import axios from 'axios';
import uuid from 'react-uuid';
import { UploadOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
const { Option } = Select;
import { TaskBox } from '../../components/task';
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
const Fav_EventBar = ({ events, setEvents, currentEvent, setCurrentEvent, fetchEvents, fetchEventsAndToDefaultProject }) => {
    return (
        <div style={styles.eventBar}>
            <h1 style={{ marginBottom: 10 }}>My Favourite Projects</h1>
            <div style={styles.eventContainer}>
                {events.length === 0 ? (
                    <div style={{ padding: '20px', fontSize: '1.2em', color: '#999' }}>
                        当前没有收藏的项目
                    </div>
                ) : (
                    events.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.event,
                                ...(currentEvent && currentEvent.id === item.id ? styles.selectedEvent : {}),
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                alignItems: 'center',
                            }}
                            onClick={() => setCurrentEvent(item)}
                        >
                            <span style={styles.starIcon} onClick={(e) => { e.stopPropagation(); }}>
                                {item.favorite ? <StarFilled /> : <StarOutlined />}
                            </span>
                            <span style={{ textAlign: 'center' }}>
                                {item.title}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


const Workbench = () => {
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);

    const FAVfetchEvents = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects/favou`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log({ response });
            if (response.data.length === 0) {
                setEvents([]);
                setCurrentEvent(null);

            } else {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch projects!', error);
            message.error('Failed to fetch projects!');
        }
    };


    const FAVfetchEventsAndToDefaultProject = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects/favou`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            //  console.log({ response });
            if (response.data.length === 0) {
                setEvents([]);
                setCurrentEvent(null);
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
        FAVfetchEventsAndToDefaultProject();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            FAVfetchEvents();
        }, 5000); // Call fetchEvents every second

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);
    return (
        //<div className={st_main.main}>
        <div style={styles.app}>
            <Fav_EventBar
                events={events}
                setEvents={setEvents}
                currentEvent={currentEvent}
                setCurrentEvent={setCurrentEvent}
                fetchEvents={FAVfetchEvents} // 传递 fetchEvents 函数
                fetchEventsAndToDefaultProject={FAVfetchEventsAndToDefaultProject}
            />
            {currentEvent && (
                <TaskBox
                    events={events}
                    setEvents={setEvents}
                    currentEvent={currentEvent}
                    setCurrentEvent={setCurrentEvent}
                    fetchEvents={FAVfetchEvents} // 传递 fetchEvents 函数
                    fetchEventsAndToDefaultProject={FAVfetchEventsAndToDefaultProject}
                />
            )}
        </div>
        // </div>
    );
};

export default Workbench;
