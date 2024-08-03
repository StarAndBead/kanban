
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal, Button, Form, Input, Select, Upload } from 'antd'
import uuid from 'react-uuid';
import { UploadOutlined } from '@ant-design/icons';
const { Option } = Select;
// 内联样式

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
        padding: '25px 0'
    },
    eventBarTitle: {
        fontSize: '2.5em',
        fontWeight: 400,
        fontStyle: 'italic'
    },
    eventContainer: {
        height: '100vh',
        padding: '0 30px',
        overflow: 'auto'
    },
    event: {
        fontSize: '1.5em',
        lineHeight: '1.5em',
        maxWidth: '230px',
        fontWeight: 400,
        borderRadius: '10px',
        padding: '5px 10px',
        marginBottom: '10px',
        transition: '0.5s',
        cursor: 'pointer'
    },

    selectedEvent: {
        color: '#fff',
        backgroundColor: '#4590f0'
    },
    taskBox: {
        flex: 1,
        minWidth: '1070px',
        backgroundColor: '#fefefe'
    },
    taskBoxBody: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        width: '100%',
        height: '700px',
        marginTop: '20px'
    },
    column: {
        width: '300px',
        maxHeight: 'none',
        backgroundColor: '#f6f9fa',
        borderRadius: '10px',
        padding: '5px 5px',
        fontSize: '1.4em',
        fontWeight: 400,
        fontStyle: 'italic',
        transition: '1s',
        border: '2px solid #ededed',
    },
    addTaskButton: {
        width: '230px',
        height: '40px',
        fontSize: '1.3em',
        lineHeight: '40px',
        backgroundColor: '#ebf1f1',
        borderRadius: '10px',
        marginBottom: '20px',
        cursor: 'pointer',
        transition: '0.5s',
        outline: 'none',
        textAlign: 'center',
        fontStyle: 'normal',
        margin: '15px auto',
        fontSize: '1.1em'
    },

    taskContainer: {
        width: '100%',
        minHeight: '30px',
        maxHeight: '600px',
        overflow: 'auto'
    },

    taskDetails: {
        fontStyle: 'normal',
        fontWeight: 300,
        fontSize: '0.8em',
        color: '#9c9c9c',
        wordWrap: 'break-word',
        marginTop: '10px',
        lineHeight: '1.1em'
    },

};

// 事件栏组件
const EventBar = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = useCallback(() => {
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(() => {
        form
            .validateFields()
            .then(values => {
                console.log(events);
                form.resetFields();
                const { title } = values;
                if (events.find((event) => event.title && event.title.toLowerCase() === title.toLowerCase())) {
                    alert('Event Already Existed');
                    return;
                }
                setEvents((prev) => [
                    ...prev,
                    {
                        title,
                        ['To do']: [],
                        ['In progress']: [],
                        ['Completed']: [],
                    },
                ]);
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    }, [events, form, setEvents]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <div style={styles.eventBar}>
            <h1>Project list</h1>
            <Button style={styles.addTaskButton} onClick={handleAdd}>Add Project</Button>
            <div style={styles.eventContainer}>
                {events.map((item) => (
                    <div
                        key={item.title}
                        style={{
                            ...styles.event,
                            ...(currentEvent.title === item.title ? styles.selectedEvent : {}),
                            ...styles.overHide
                        }}
                        onClick={() => setCurrentEvent(item)}
                    >
                        {item.title}
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

// 任务组件
const TaskName = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#70B8F0', marginRight: '5px', fontSize: '20px' }}>●</span>
        <span style={{ fontSize: '20px' }}>{children}</span>
    </div>
);
const Task = ({ name, details, id, provided, handleUpdate, handleRemove }) => {
    const [hover, setHover] = useState(false);
    const taskStyle = {
        position: 'relative',
        width: 'calc(100% - 33px)',
        backgroundColor: hover ? 'rgba(0, 119, 256, 0.014)' : '#fff',
        padding: '5px',
        borderRadius: '10px',
        marginBottom: '18px',
        marginLeft: '24px',
        cursor: 'pointer',
        transition: '0.2s',
        userSelect: 'none',
        border: '1px solid #ccc',
        outline: 'none'
    };

    return (
        <div
            style={taskStyle}
            // onMouseEnter={() => setHover(true)}
            // onMouseLeave={() => setHover(false)}
            onMouseEnter={() => {
                console.log("Mouse enter");
                setHover(true);
            }}
            onMouseLeave={() => {
                console.log("Mouse leave");
                setHover(false);
            }}
            ref={provided.innerRef}
            // {...provided.draggableProps}
            // {...provided.dragHandleProps}
            onClick={() => handleUpdate(id)}
        >
            <h2><TaskName >{name}</TaskName></h2>
            <p style={styles.taskDetails}>{details}</p>
            <div style={{

                display: 'flex',
                gap: '5px', // 控制按钮之间的间隔
            }}>
                <Button type="link" onClick={() => handleUpdate(id)}>Edit</Button>
                <Button type="link" onClick={() => handleUpdate(id)}>Comments</Button>
                <Button type="link" danger onClick={(e) => handleRemove(id, e)}>Delete</Button>

            </div>


        </div>
    );
};

// 列组件

const Column = ({ tag, currentEvent, events, setEvents }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    const handleAdd = () => {
        setIsEditing(false);
        setIsModalVisible(true);
    };

    const handleAddOk = () => {
        form
            .validateFields()
            .then(values => {
                console.log(values);
                form.resetFields();
                const { name, details, status, attachment } = values;
                setEvents((prev) => {
                    const arrCopy = [...prev];
                    const index = prev.findIndex((event) => event.title === currentEvent.title);
                    const eventCopy = arrCopy[index];
                    arrCopy.splice(index, 1, {
                        ...eventCopy,
                        [tag]: [...eventCopy[tag], { name, id: uuid(), details, status, attachment }]
                    });
                    return arrCopy;
                });
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleEditOk = (id) => {
        form
            .validateFields()
            .then(values => {
                console.log(values);
                form.resetFields();
                const { name, details, status, attachment } = values;
                setEvents((prev) =>
                    prev.map((event) => {
                        if (event.title === currentEvent.title) {
                            const taskList = event[tag];
                            const index = taskList.findIndex((item) => item.id === id);
                            const updatedTask = {
                                ...taskList[index],
                                name,
                                details,
                                status,
                                attachment
                            };
                            taskList.splice(index, 1);
                            return { ...event, [tag]: [...taskList, updatedTask] };
                        } else {
                            return event;
                        }
                    })
                );
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleRemove = (id, e) => {
        e.stopPropagation(); // Stop event bubbling
        setEvents((prev) =>
            prev.map((event) => {
                if (event.title === currentEvent.title) {
                    const taskList = event[tag];
                    const index = taskList.findIndex((item) => item.id === id);
                    taskList.splice(index, 1);
                    return { ...event, [tag]: [...taskList] };
                } else {
                    return event;
                }
            })
        );
    };

    const handleUpdate = (id) => {
        setIsEditing(true);
        setIsModalVisible(true);
        const task = events.find((event) => event.title === currentEvent.title)[tag].find((task) => task.id === id);
        form.setFieldsValue({ ...task, id });
    };

    return (
        <div style={styles.column}>
            <h2>{tag}</h2>
            <button style={styles.addTaskButton} onClick={handleAdd}>Add Task</button>
            <Droppable droppableId={tag}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={styles.taskContainer}
                    >
                        {events
                            .find((event) => event.title === currentEvent.title)
                            ?.[tag].map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Task
                                                name={task.name}
                                                details={task.details}
                                                id={task.id}
                                                provided={provided}
                                                snapshot={snapshot}
                                                handleRemove={handleRemove}
                                                handleUpdate={handleUpdate}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <Modal
                title={isEditing ? "Edit Task" : "Add New Task"}
                visible={isModalVisible}
                onOk={isEditing ? handleEditOk : handleAddOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" name="form_in_modal">
                    <Form.Item name="id" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Task Name"
                        rules={[{ required: true, message: 'Please input the name of the task!' }]}
                    >
                        <Input allowClear />
                    </Form.Item>
                    <Form.Item
                        name="details"
                        label="Task Details"
                        rules={[{ required: true, message: 'Please input the details of the task!' }]}
                    >
                        <Input allowClear />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select the status of the task!' }]}
                    >
                        <Select placeholder="Select a status" allowClear>
                            <Option value="To Do">To Do</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Done">Done</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="attachment"
                        label="Attachment"
                        valuePropName="fileList"
                        getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                    >
                        <Upload name="files" action="/upload.do" listType="text" allowClear>
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

// 任务框组件
const TaskBox = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
    const handleRemove = useCallback(() => {
        if (confirm('You really want to remove it?')) {
            // update events
            setEvents((prev) => {
                const result = prev.filter((item) => item.title != currentEvent.title);
                // if event is empty
                if (!result.length) {
                    // init the event
                    const initEvent = [
                        {
                            title: 'Add a new Event',
                            ['To do']: [],
                            ['In progress']: [],
                            ['Completed']: [],
                        },
                    ];
                    setEvents(initEvent);
                } else {
                    // set the first event as current
                    setCurrentEvent(result[0]);
                }
                return result;
            });
        }
    }, [events, setEvents, currentEvent, setCurrentEvent]);

    const handleDragEnd = useCallback((result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const curEvent = events.find((item) => item.title === currentEvent.title);
        const taskCopy = curEvent[source.droppableId][source.index];
        setEvents((prev) =>
            prev.map((event) => {
                if (event.title === currentEvent.title) {
                    let eventCopy = { ...event };
                    // Remove from source
                    const taskListSource = event[source.droppableId];
                    taskListSource.splice(source.index, 1);
                    eventCopy = { ...event, [source.droppableId]: taskListSource };
                    // Add to destination
                    const taskListDes = event[destination.droppableId];
                    taskListDes.splice(destination.index, 0, taskCopy);
                    eventCopy = { ...event, [destination.droppableId]: taskListDes };
                    return eventCopy;
                } else {
                    return event;
                }
            })
        );
    }, [events, setEvents, currentEvent]);

    return (
        <div style={styles.taskBox}>
            <header style={styles.taskBoxHeader}>
                <h1 style={styles.taskBoxTitle}>Tasks</h1>
                <Button style={{ marginLeft: '810px', fontWeight: "bolder" }} onClick={handleRemove} >
                    Remove this Project
                </Button>
            </header>
            <DragDropContext >
                <div style={styles.taskBoxBody}>
                    {['To do', 'In progress', 'Completed'].map((tag) => (
                        <Column
                            key={tag}
                            tag={tag}
                            events={events}
                            setEvents={setEvents}
                            currentEvent={currentEvent}
                        />
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};


// // 主应用组件
// function Project() {
//     const initEvent = useMemo(() => [
//         {
//             title: 'Add a new Event',
//             ['To do']: [],
//             ['In progress']: [],
//             ['Completed']: [],
//         },
//     ], []);

//     const [events, setEvents] = useState(() => {
//         return localStorage.getItem('events')
//             ? JSON.parse(localStorage.getItem('events'))
//             : initEvent;
//     });

//     const [currentEvent, setCurrentEvent] = useState(events[0]);

//     const updateEvents = useCallback(async () => {
//         try {
//             if (!events.length) {
//                 await localStorage.setItem('events', JSON.stringify(initEvent));
//                 setEvents(JSON.parse(localStorage.getItem('events')));
//             } else {
//                 await localStorage.setItem('events', JSON.stringify(events));
//             }
//         } catch (e) {
//             console.error('Failed to modify events!');
//         }
//     }, [events]);

//     useEffect(() => {
//         updateEvents();
//     }, [events]);

//     return (
//         <div style={styles.app}>
//             <EventBar
//                 events={events}
//                 setEvents={setEvents}
//                 currentEvent={currentEvent}
//                 setCurrentEvent={setCurrentEvent}
//             />
//             <TaskBox
//                 events={events}
//                 setEvents={setEvents}
//                 currentEvent={currentEvent}
//                 setCurrentEvent={setCurrentEvent}
//             />
//         </div>
//     );
// }

// export default Project;

// import React, { useMemo, useState, useCallback, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { Modal, Button, Form, Input, Select, Upload, message } from 'antd'
// import axios from 'axios';
// import uuid from 'react-uuid';
// import { UploadOutlined } from '@ant-design/icons';
// const { Option } = Select;
// import { TaskBox, TaskName, Task, Column } from '../../components/task';
// import dayjs from 'dayjs';
// import st_main from "./index.module.css"
// const styles = {
//     app: {
//         display: 'flex',
//         transform: 'scale(0.9)',
//         transformOrigin: 'top left'  // 确定变形的基点
//     },
//     eventBar: {
//         flexShrink: 1,
//         minWidth: '250px',
//         textAlign: 'center',
//         width: '250px',
//         height: '100%',  // Adjust to 100% of parent container
//         borderRight: '2px solid #ededed',
//         padding: '0px 0'
//     },
//     eventBarTitle: {
//         fontSize: '2.5em',
//         fontWeight: 400,
//         fontStyle: 'italic'
//     },
//     eventContainer: {
//         height: '100vh',
//         padding: '0 30px',
//         overflow: 'auto'
//     },
//     event: {
//         fontSize: '1.5em',
//         lineHeight: '1.5em',
//         maxWidth: '230px',
//         fontWeight: 400,
//         borderRadius: '10px',
//         padding: '5px 10px',
//         margin: '10px',
//         transition: '0.5s',
//         cursor: 'pointer'
//     },

//     selectedEvent: {
//         color: '#fff',
//         backgroundColor: '#4590f0'
//     },

// };

// // 事件栏组件
// const EventBar = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [form] = Form.useForm();

//     const handleAdd = useCallback(() => {
//         setIsModalVisible(true);
//     }, []);

//     const handleOk = useCallback(() => {
//         form
//             .validateFields()
//             .then(values => {
//                 console.log(events);
//                 form.resetFields();
//                 const { title } = values;
//                 if (events.find((event) => event.title && event.title.toLowerCase() === title.toLowerCase())) {
//                     message.error('项目已存在，请重新命名');
//                     return;
//                 }
//                 setEvents((prev) => [
//                     ...prev,
//                     {
//                         title,
//                         ['To do']: [],
//                         ['In progress']: [],
//                         ['Completed']: [],
//                     },
//                 ]);
//                 setIsModalVisible(false);
//             })
//             .catch(info => {
//                 console.log('Validate Failed:', info);
//             });
//     }, [events, form, setEvents]);

//     const handleCancel = useCallback(() => {
//         setIsModalVisible(false);
//     }, []);

//     return (
//         <div style={styles.eventBar}>
//             <h1 style={{ marginBottom: 10 }}>Project list</h1>
//             <Button
//                 style={{ fontWeight: "bolder" }}
//                 onClick={handleAdd}>Add Project</Button>
//             <div style={styles.eventContainer}>
//                 {events.map((item) => (
//                     <div
//                         key={item.title}
//                         style={{
//                             ...styles.event,
//                             ...(currentEvent.title === item.title ? styles.selectedEvent : {}),
//                             ...styles.overHide
//                         }}
//                         onClick={() => setCurrentEvent(item)}
//                     >
//                         {item.title}
//                     </div>
//                 ))}
//             </div>
//             <Modal
//                 title="Add New Project"
//                 visible={isModalVisible}
//                 onOk={handleOk}
//                 onCancel={handleCancel}
//             >
//                 <Form form={form} layout="vertical" name="form_in_modal">
//                     <Form.Item
//                         name="title"
//                         label="Project Title"
//                         rules={[{ required: true, message: 'Please input the title of the project!' }]}
//                     >
//                         <Input />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </div >
//     );
// };



// // 主应用组件
// function Project() {
//     const initEvent = useMemo(() => [
//         {
//             title: 'default project',
//             ['To do']: [],
//             ['In progress']: [],
//             ['Completed']: [],
//         },
//     ], []);

//     const [events, setEvents] = useState(() => {
//         return localStorage.getItem('events')
//             ? JSON.parse(localStorage.getItem('events'))
//             : initEvent;
//     });

//     const [currentEvent, setCurrentEvent] = useState(events[0]);



//     const updateEvents = useCallback(async () => {
//         try {
//             if (!events.length) {
//                 await localStorage.setItem('events', JSON.stringify(initEvent));
//                 setEvents(JSON.parse(localStorage.getItem('events')));
//             } else {
//                 await localStorage.setItem('events', JSON.stringify(events));
//             }
//         } catch (e) {
//             console.error('Failed to modify events!');
//         }
//     }, [events]);

//     useEffect(() => {
//         updateEvents();
//     }, [events]);



//     return (
//         <div className={st_main.main}>
//             <div style={styles.app}>
//                 <EventBar
//                     events={events}
//                     setEvents={setEvents}
//                     currentEvent={currentEvent}
//                     setCurrentEvent={setCurrentEvent}
//                 />
//                 <TaskBox
//                     events={events}
//                     setEvents={setEvents}
//                     currentEvent={currentEvent}
//                     setCurrentEvent={setCurrentEvent}
//                 />
//             </div>
//         </div>
//     );
// }

// export default Project;
