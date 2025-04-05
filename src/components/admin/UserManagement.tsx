import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaUserCog, FaPlus, FaEdit, FaTrash, FaEnvelope, FaUser } from 'react-icons/fa';
import Layout from '../common/Layout';
import { adminApi } from '../../services/api';
import { User, UserRole } from '../../types';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Validation schema for user form
const UserSchema = Yup.object().shape({
  username: Yup.string().required('Username is required').min(4, 'Username must be at least 4 characters'),
  password: Yup.string().when('isEdit', {
    is: false,
    then: () => Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    otherwise: () => Yup.string().min(6, 'Password must be at least 6 characters'),
  }),
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().oneOf(Object.values(UserRole), 'Invalid role').required('Role is required'),
});

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle opening modal to add user
  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setShowUserModal(true);
    setError(null);
  };
  
  // Handle opening modal to edit user
  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowUserModal(true);
    setError(null);
  };
  
  // Handle user form submission
  const handleSubmitUser = async (values: any) => {
    setActionInProgress(true);
    setError(null);
    
    try {
      if (modalMode === 'add') {
        // Create new user
        const userData = {
          username: values.username,
          password: values.password,
          name: values.name,
          email: values.email,
          role: values.role as UserRole,
        };
        
        const response = await adminApi.createUser(userData);
        
        if (response.success && response.data) {
          toast.success('User created successfully');
          fetchUsers();
          setShowUserModal(false);
        } else {
          setError(response.error || 'Failed to create user');
          toast.error(response.error || 'Failed to create user');
        }
      } else if (modalMode === 'edit' && selectedUser) {
        // Update existing user
        const userData: Partial<User> = {
          name: values.name,
          email: values.email,
          role: values.role as UserRole,
        };
        
        // Only include password in update if provided
        if (values.password) {
          userData.password = values.password;
        }
        
        const response = await adminApi.updateUser(selectedUser.id, userData);
        
        if (response.success && response.data) {
          toast.success('User updated successfully');
          fetchUsers();
          setShowUserModal(false);
        } else {
          setError(response.error || 'Failed to update user');
          toast.error(response.error || 'Failed to update user');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle opening delete confirmation modal
  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };
  
  // Handle user deletion
  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    
    setActionInProgress(true);
    try {
      const response = await adminApi.deleteUser(deleteUserId);
      
      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setActionInProgress(false);
      setShowDeleteModal(false);
      setDeleteUserId(null);
    }
  };
  
  // Render badge for user role
  const renderRoleBadge = (role: UserRole) => {
    let variant = 'secondary';
    
    switch (role) {
      case UserRole.DOCTOR:
        variant = 'primary';
        break;
      case UserRole.LAB_STAFF:
        variant = 'info';
        break;
      case UserRole.PHARMACY_STAFF:
        variant = 'success';
        break;
      case UserRole.ADMIN:
        variant = 'danger';
        break;
    }
    
    return <Badge bg={variant}>{role.replace('_', ' ')}</Badge>;
  };
  
  return (
    <Layout title="User Management">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUserCog className="text-primary me-2" size={20} />
              <h5 className="mb-0 fw-bold">System Users</h5>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleAddUser}
            >
              <FaPlus className="me-1" /> Add User
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : users.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="text-muted me-1" size={12} />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        {renderRoleBadge(user.role)}
                      </td>
                      <td>
                        <small>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit size={14} />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaUser size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">No users found</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* User Form Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{
              username: selectedUser?.username || '',
              password: '',
              name: selectedUser?.name || '',
              email: selectedUser?.email || '',
              role: selectedUser?.role || '',
              isEdit: modalMode === 'edit',
            }}
            validationSchema={UserSchema}
            onSubmit={handleSubmitUser}
          >
            {({ values, errors, touched, handleSubmit, handleChange, handleBlur }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && !!errors.username}
                        disabled={modalMode === 'edit'} // Username cannot be changed in edit mode
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{modalMode === 'edit' ? 'New Password (optional)' : 'Password'}</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder={modalMode === 'edit' ? "Enter new password" : "Enter password"}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && !!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && !!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.role && !!errors.role}
                  >
                    <option value="">Select role</option>
                    <option value={UserRole.DOCTOR}>Doctor</option>
                    <option value={UserRole.LAB_STAFF}>Lab Staff</option>
                    <option value={UserRole.PHARMACY_STAFF}>Pharmacy Staff</option>
                    <option value={UserRole.ADMIN}>Administrator</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button variant="secondary" className="me-2" onClick={() => setShowUserModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={actionInProgress}>
                    {actionInProgress ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {modalMode === 'add' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      modalMode === 'add' ? 'Create User' : 'Update User'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={actionInProgress}
          >
            {actionInProgress ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : 'Delete User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default UserManagement; 