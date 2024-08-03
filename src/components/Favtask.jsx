import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Modal, Button, Form, Input, Select, Upload, message, DatePicker } from 'antd';
import axios from 'axios';
import uuid from 'react-uuid';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AddMemberForm from './AddMember';
import MemberListModal from './MemberList';
const { confirm } = Modal;
const { Option } = Select;

const styles = {
    taskBox: {
        flex: 1,
        minWidth: '1070px',
        height: '100%',
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

};

export const TaskName = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#70B8F0', marginRight: '5px', fontSize: '20px' }}>●</span>
        <span style={{ fontSize: '20px' }}>{children}</span>
    </div>
);

export const FavTask = ({ name, details, id, comments, handleUpdate, handleRemove, handleComment, handleDetail }) => {
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
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => handleUpdate(id)}
        >
            <TaskName>{name}</TaskName>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '5px' }}>
                <Button type="link" onClick={(e) => { e.stopPropagation(); handleDetail(id); }}>Show Details</Button>
            </div>
        </div>
    );
};


export const Column = ({ tag, currentEvent, events, setEvents, fetchEvents, fetchEventsAndToDefaultProject, members }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [form] = Form.useForm();
    const [commentForm] = Form.useForm();

    const handleAdd = () => {
        setIsEditing(false);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleAddOk = async () => {
        try {
            const values = await form.validateFields();
            const { name, details, status, attachment, deadline, assignees } = values;
            const isTaskNameDuplicate = events.find(event => event.id === currentEvent.id)[tag].some(task => task.name.toLowerCase() === name.toLowerCase());
            if (isTaskNameDuplicate) {
                message.error('Task already exists, please rename.');
                return;
            }
            const newTask = {
                name,
                details,
                status,
                attachment: [],
                deadline: deadline ? dayjs(deadline).format('YYYY-MM-DD') : null,
                assignees,
            };
            const username = localStorage.getItem('username');
            await axios.post(`/api/${username}/projects/${currentEvent.id}/tasks/${status}`, newTask, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            form.resetFields();
            setIsModalVisible(false);
            fetchEvents();
        } catch (error) {
            console.error('Failed to add task!', error);
            message.error('Failed to add task!', error);
        }
    };

    const handleEditOk = async (id) => {
        try {
            const values = await form.validateFields();
            const { name, details, status, attachment, deadline, assignees } = values;
            const updatedTask = {
                name,
                details,
                status,
                attachment: attachment,
                deadline: deadline ? dayjs(deadline).format('YYYY-MM-DD') : null,
                assignees
            };
            const username = localStorage.getItem('username');
            await axios.put(`/api/${username}/projects/${currentEvent.id}/tasks/${id}`, updatedTask, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setIsModalVisible(false);
            fetchEvents();
        } catch (error) {
            console.error('Failed to edit task!', error);
            message.error('Failed to edit task!', error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsCommentVisible(false);
        setIsDetailVisible(false);
    };

    const handleRemove = useCallback((id, e) => {
        e.stopPropagation();

        confirm({
            title: 'Are you sure you want to delete this task?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    const username = localStorage.getItem('username');
                    await axios.delete(`/api/${username}/projects/${currentEvent.id}/tasks/${id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    fetchEvents();
                } catch (error) {
                    console.error('Failed to delete task!', error);
                    message.error('Failed to delete task!');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }, [currentEvent, fetchEvents, tag]);

    const handleUpdate = (id) => {
        setIsEditing(true);
        setIsModalVisible(true);
        const task = events.find((event) => event.id === currentEvent.id)[tag].find((task) => task.id === id);
        form.setFieldsValue({
            ...task,
            id,
            deadline: task.deadline ? dayjs(task.deadline) : null
        });
        setCurrentTask(task);
    };

    const handleComment = (id) => {
        setIsCommentVisible(true);
        const task = events.find((event) => event.id === currentEvent.id)[tag].find((task) => task.id === id);
        setCurrentTask(task);
    };

    const handleDetail = (id) => {
        setIsDetailVisible(true);
        const task = events.find((event) => event.id === currentEvent.id)[tag].find((task) => task.id === id);
        setCurrentTask(task);
    };

    const handleCommentOk = async () => {
        try {
            const values = await commentForm.validateFields();
            commentForm.resetFields();
            const { comment } = values;

            const username = localStorage.getItem('username');
            await axios.post(`/api/${username}/projects/${currentEvent.id}/tasks/${currentTask.id}/comments`, { comment }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchEvents();
            setIsCommentVisible(false);
        } catch (error) {
            console.error('Failed to add comment!', error);
            message.error('Failed to add comment!');
        }
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
                            .find((event) => event.id === currentEvent.id)
                            ?.[tag]?.map((task, index) => {
                                return (
                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <FavTask
                                                    name={task.name}
                                                    details={task.details}
                                                    id={task.id}
                                                    comments={task.comments}
                                                    handleRemove={handleRemove}
                                                    handleUpdate={handleUpdate}
                                                    handleComment={handleComment}
                                                    handleDetail={handleDetail}
                                                    assignees={task.assignees}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <Modal
                title={isEditing ? "Edit Task" : "Add New Task"}
                visible={isModalVisible}
                onOk={isEditing ? () => handleEditOk(form.getFieldValue('id')) : handleAddOk}
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
                        <Input.TextArea allowClear />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select the status of the task!' }]}
                    >
                        <Select placeholder="Select status" allowClear>
                            <Option value="To do">To Do</Option>
                            <Option value="In progress">In Progress</Option>
                            <Option value="Completed">Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="deadline"
                        label="Deadline"
                        rules={[{ required: true, message: 'Please select the deadline of the task!' }]}
                    >
                        <DatePicker
                            onChange={(date) => form.setFieldsValue({ deadline: date ? dayjs(date) : null })}
                        />
                    </Form.Item>
                    {isEditing && <Form.Item
                        name="attachment"
                        label="Attachment"
                        valuePropName="fileList"
                        getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                    >
                        <Upload name="files" listType="text" allowClear>
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                    </Form.Item>}
                    <Form.Item
                        name="assignees"
                        label="Assignees"
                        rules={[{ required: true, message: 'Please select the assignees of the task!' }]}
                    >
                        <Select mode="multiple" placeholder="Select assignees" allowClear>
                            {members.map(member => (
                                <Option key={member} value={member}>
                                    {member}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Comments"
                visible={isCommentVisible}
                onOk={handleCommentOk}
                onCancel={handleCancel}
            >
                <Form form={commentForm} layout="vertical" name="comment_form_in_modal">
                    <Form.Item
                        name="comment"
                        label="Comment"
                        rules={[{ required: true, message: 'Please input your comment!' }]}
                    >
                        <Input.TextArea allowClear />
                    </Form.Item>
                </Form>
                <div>
                    <h3>Existing Comments:</h3>
                    <ul>
                        {currentTask && currentTask.comments && currentTask.comments.map((comment, index) => (
                            <li key={index}>{comment}</li>
                        ))}
                    </ul>
                </div>
            </Modal>
            <Modal
                title="Task Details"
                visible={isDetailVisible}
                onOk={handleCancel}
                onCancel={handleCancel}
            >
                {currentTask && (
                    <div>
                        <p><strong>ID:</strong> {currentTask.id}</p>
                        <p><strong>Name:</strong> {currentTask.name}</p>
                        <p><strong>Details:</strong> {currentTask.details}</p>
                        <p><strong>Status:</strong> {currentTask.status}</p>
                        <p><strong>Assignees:</strong> {currentTask.assignees.join(', ')}</p>
                        <p><strong>Deadline:</strong> {currentTask.deadline}</p>
                        {currentTask.attachment && (
                            <p><strong>Attachment:</strong> <a href={currentTask.attachment} download>Download Attachment</a></p>
                        )}
                    </div>
                )}
            </Modal>
        </div >
    );
};


export const TaskBox = ({ events, setEvents, currentEvent, setCurrentEvent, fetchEvents, fetchEventsAndToDefaultProject }) => {
    const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
    const [isMemberListModalVisible, setIsMemberListModalVisible] = useState(false);
    const [members, setMembers] = useState([]);

    const handleAddMember = () => {
        setIsAddMemberModalVisible(true);
    };

    const handleAddMemberCancel = () => {
        setIsAddMemberModalVisible(false);
    };

    const handleAddMemberCreate = async (values) => {
        try {
            const username = localStorage.getItem('username');
            // console.log(username);
            // console.log(values.username);
            // console.log(members);
            if (members.some(member => member == values.username) || username + "(creator of the project)" == values.username || username == values.username) {
                message.error('The user has been in the team!');
                return;
            }
            await axios.post(`/api/${username}/projects/${currentEvent.id}/members`, values, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(values);
            message.success('Member added successfully!');
            setIsAddMemberModalVisible(false);
            fetchEvents(); // Fetch updated events from backend

        } catch (error) {
            console.error('Failed to add member!', error);
            message.error('Failed to add the member,please retry or check the username');
        }
    };

    const handleRemove = useCallback(() => {
        Modal.confirm({
            title: 'Are you sure you want to delete this project?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const username = localStorage.getItem('username');
                    await axios.delete(`/api/${username}/projects/${currentEvent.id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    fetchEventsAndToDefaultProject(); // Fetch updated events from backend
                } catch (error) {
                    console.error('Failed to delete project!', error);
                    message.error('项目删除失败');
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }, [fetchEvents, currentEvent]);

    const handleShowMemberList = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects/${currentEvent.id}/members`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMembers(response.data);
            setIsMemberListModalVisible(true);
        } catch (error) {
            console.error('Failed to fetch members!', error);
            message.error('Failed to fetch members');
        }
    };

    const getMembers = async () => {
        try {
            const username = localStorage.getItem('username');
            const response = await axios.get(`/api/${username}/projects/${currentEvent.id}/members`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMembers(response.data);
        } catch (error) {
            console.error('Failed to fetch members!', error);
            message.error('Failed to fetch members');
        }
    };


    const handleMemberListCancel = () => {
        setIsMemberListModalVisible(false);
    };


    useEffect(() => {

        getMembers();

    }, [currentEvent]); // 空依赖数组，确保只在组件挂载和卸载时运行


    return (
        <div style={styles.taskBox}>
            <header style={styles.taskBoxHeader}>
                <h1 style={styles.taskBoxTitle}>Tasks</h1>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button style={{ marginLeft: '40px', marginRight: '150px', fontWeight: "bolder" }} onClick={handleAddMember}>
                        Add member to the current project
                    </Button>
                    <Button style={{ marginRight: '150px', fontWeight: "bolder" }} onClick={handleShowMemberList}>
                        Show Member List
                    </Button>
                    <Button style={{ marginLeft: '110px', fontWeight: "bolder" }} onClick={handleRemove}>
                        Remove this project
                    </Button>
                </div>
            </header>
            <DragDropContext>
                <div style={styles.taskBoxBody}>
                    {['To do', 'In progress', 'Completed'].map((tag) => (
                        <Column
                            key={tag}
                            tag={tag}
                            events={events}
                            setEvents={setEvents}
                            currentEvent={currentEvent}
                            fetchEvents={fetchEvents} // 传递 fetchEvents 函数
                            fetchEventsAndToDefaultProject={fetchEventsAndToDefaultProject}
                            members={members}
                        />
                    ))}
                </div>
            </DragDropContext>
            <AddMemberForm
                visible={isAddMemberModalVisible}
                onCreate={handleAddMemberCreate}
                onCancel={handleAddMemberCancel}
            />
            <MemberListModal
                visible={isMemberListModalVisible}
                onCancel={handleMemberListCancel}
                members={members}
            />
        </div>
    );
};







