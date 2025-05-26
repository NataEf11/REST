document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    loadUsers();
    loadRoles();
    setupEventListeners();
});

let allRoles = [];

function loadCurrentUser() {
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            updateUserInfoInHeader(user);
            setupLogoutHandler();
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка загрузки данных пользователя');
        });
}

function updateUserInfoInHeader(user) {
    const userInfo = document.getElementById('currentUserInfo');
    userInfo.innerHTML = `
        ${user.username} with roles: 
        ${user.roles.map(role =>
        `<span class="badge bg-primary role-badge">${role.name.replace('ROLE_', '')}</span>`
    ).join('')}
        <form class="d-inline" id="logoutForm">
            <button type="submit" class="btn btn-link text-light">Logout</button>
        </form>
    `;
}

function setupLogoutHandler() {
    document.getElementById('logoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
    });
}

function loadUsers() {
    fetch('/api/admin')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки списка пользователей');
            }
            return response.json();
        })
        .then(users => renderUsersTable(users))
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка загрузки списка пользователей');
        });
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(role =>
            `<span class="badge bg-primary role-badge">${role.name.replace('ROLE_', '')}</span>`
        ).join('')}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-warning edit-btn" data-user-id="${user.id}">Edit</button>
                <button class="btn btn-sm btn-danger ms-2 delete-btn" data-user-id="${user.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadRoles() {
    fetch('/api/admin/roles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки списка ролей');
            }
            return response.json();
        })
        .then(roles => {
            allRoles = roles;
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка загрузки списка ролей');
        });
}

function setupEventListeners() {
    document.getElementById('newUserBtn').addEventListener('click', showNewUserModal);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            showEditUserModal(userId);
        }

        if (e.target.classList.contains('delete-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            showDeleteConfirmModal(userId);
        }
    });
}

function showNewUserModal() {
    const modalHTML = `
        <div class="modal fade" id="newUserModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New User</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="newUserForm">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-control" name="firstName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-control" name="lastName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Age</label>
                                <input type="number" class="form-control" name="age" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Roles</label>
                                <select multiple class="form-select" name="roles" required>
                                    ${allRoles.map(role =>
        `<option value="${role.id}">${role.name.replace('ROLE_', '')}</option>`
    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('newUserModal'));

    document.getElementById('newUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createNewUser(new FormData(this));
        modal.hide();
    });

    modal.show();

    document.getElementById('newUserModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function createNewUser(formData) {
    const userData = {
        username: formData.get('username'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        age: formData.get('age'),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: Array.from(formData.getAll('roles')).map(roleId => ({ id: roleId }))
    };

    fetch('/api/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Ошибка создания пользователя'); });
            }
            return response.json();
        })
        .then(() => {
            loadUsers();
            showSuccess('Пользователь успешно создан');
        })
        .catch(error => {
            console.error('Error:', error);
            showError(error.message || 'Ошибка создания пользователя');
        });
}

function showEditUserModal(userId) {
    fetch(`/api/admin/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            const modalHTML = `
                <div class="modal fade" id="editUserModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit User</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <form id="editUserForm">
                                <input type="hidden" name="id" value="${user.id}">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-control" name="username" value="${user.username}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">First Name</label>
                                        <input type="text" class="form-control" name="firstName" value="${user.firstName}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Last Name</label>
                                        <input type="text" class="form-control" name="lastName" value="${user.lastName}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Age</label>
                                        <input type="number" class="form-control" name="age" value="${user.age}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" name="email" value="${user.email}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Password (leave empty to keep current)</label>
                                        <input type="password" class="form-control" name="password" placeholder="Leave empty to keep current password">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Roles</label>
                                        <select multiple class="form-select" name="roles" required>
                                            ${allRoles.map(role => {
                const selected = user.roles.some(r => r.id == role.id);
                return `<option value="${role.id}" ${selected ? 'selected' : ''}>${role.name.replace('ROLE_', '')}</option>`;
            }).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));

            document.getElementById('editUserForm').addEventListener('submit', function(e) {
                e.preventDefault();
                updateUser(userId, new FormData(this));
                modal.hide();
            });

            modal.show();

            document.getElementById('editUserModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка загрузки данных пользователя');
        });
}

function updateUser(userId, formData) {
    const userData = {
        id: userId,
        username: formData.get('username'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        age: formData.get('age'),
        email: formData.get('email'),
        password: formData.get('password') || undefined,
        roles: Array.from(formData.getAll('roles')).map(roleId => ({ id: roleId }))
    };

    fetch('/api/admin', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Ошибка обновления пользователя'); });
            }
            return response.json();
        })
        .then(() => {
            loadUsers();
            showSuccess('Пользователь успешно обновлен');
        })
        .catch(error => {
            console.error('Error:', error);
            showError(error.message || 'Ошибка обновления пользователя');
        });
}

function showDeleteConfirmModal(userId) {
    fetch(`/api/admin/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            const modalHTML = `
                <div class="modal fade" id="deleteUserModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm Deletion</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <form id="deleteUserForm">
                                <input type="hidden" name="id" value="${user.id}">
                                <div class="modal-body">
                                    <p>Are you sure you want to delete user:</p>
                                    <p><strong>${user.username}</strong> (${user.firstName} ${user.lastName})?</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-danger">Delete</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));

            document.getElementById('deleteUserForm').addEventListener('submit', function(e) {
                e.preventDefault();
                deleteUser(userId);
                modal.hide();
            });

            modal.show();

            document.getElementById('deleteUserModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Ошибка загрузки данных пользователя');
        });
}

function deleteUser(userId) {
    fetch(`/api/admin/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Ошибка удаления пользователя'); });
            }
            return response;
        })
        .then(() => {
            loadUsers();
            showSuccess('Пользователь успешно удален');
        })
        .catch(error => {
            console.error('Error:', error);
            showError(error.message || 'Ошибка удаления пользователя');
        });
}

function showSuccess(message) {
    const alertHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    document.querySelector('.content-container').insertAdjacentHTML('afterbegin', alertHTML);

    setTimeout(() => {
        const alert = document.querySelector('.alert-success');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 3000);
}

function showError(message) {
    const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    document.querySelector('.content-container').insertAdjacentHTML('afterbegin', alertHTML);

    setTimeout(() => {
        const alert = document.querySelector('.alert-danger');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}