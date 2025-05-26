document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    setupEventListeners();
});

function loadUserInfo() {
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            return response.json();
        })
        .then(user => {
            // Заполняем таблицу профиля
            document.getElementById('userId').textContent = user.id;
            document.getElementById('firstName').textContent = user.firstName;
            document.getElementById('lastName').textContent = user.lastName;
            document.getElementById('age').textContent = user.age;
            document.getElementById('email').textContent = user.email;

            // Отображаем роли
            const rolesContainer = document.getElementById('roles');
            rolesContainer.innerHTML = user.roles.map(role =>
                `<span class="badge bg-primary role-badge">${role.name.replace('ROLE_', '')}</span>`
            ).join('');

            // Обновляем информацию в шапке
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

            // Показываем/скрываем ссылку на админку
            const isAdmin = user.roles.some(role => role.name === 'ROLE_ADMIN');
            document.getElementById('adminLinkItem').style.display = isAdmin ? 'block' : 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error loading user data');
        });
}

function setupEventListeners() {
    document.getElementById('logoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetch('/logout', { method: 'POST' })
            .then(() => window.location.href = '/login');
    });
}

function showError(message) {
    const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert" style="margin-top: 20px;">
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