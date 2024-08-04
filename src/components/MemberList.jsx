import React from 'react';
import { Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons'
const MemberListModal = ({ visible, onCancel, members }) => {
    return (
        <Modal
            visible={visible}
            title="Project Members"
            okText="Close"
            cancelText="Cancel"
            onCancel={onCancel}
            footer={null}
        >
            <ul>
                {members.map((member) => (
                    <li key={member}>{member}</li>
                ))}
            </ul>
        </Modal>
    );
};

export default MemberListModal;