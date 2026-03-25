// ========== BIBLIOTECA - LÓGICA PRINCIPAL ==========

window.addEventListener('DOMContentLoaded', async function () {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('user-nombre').textContent = user.nombre;
    document.getElementById('user-rol').textContent = user.rol.toUpperCase();
    await tursodb.initializeData();
});

function toggleDropdown() {
    document.getElementById('user-dropdown-biblioteca').classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('user-dropdown-biblioteca');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

function cerrarSesion() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

function volverDashboard() {
    sessionStorage.setItem('fromModule', '1');
    window.location.href = '../index.html';
}
