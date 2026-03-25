// ========== REGISTROS ANTERIORES - LÓGICA ==========

let currentUser = null;
let fechaActual = '';

window.addEventListener('DOMContentLoaded', async function () {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = '../../index.html'; return; }
    currentUser = user;
    document.querySelectorAll('.user-display-name').forEach(el => el.textContent = user.nombre);
    document.querySelectorAll('.dropdown-rol').forEach(el => el.textContent = user.rol.toUpperCase());

    // Poner fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('input-fecha').value = hoy;
    document.getElementById('input-fecha').max = hoy;

    await tursodb.initializeData();
});

// ========== DROPDOWN ==========
function toggleUserDropdown(id) {
    const d = document.getElementById(id);
    if (d) d.classList.toggle('active');
}
document.addEventListener('click', function(e) {
    const d = document.getElementById('user-dropdown-ra');
    if (d && !d.contains(e.target)) d.classList.remove('active');
});
function cerrarSesion() {
    localStorage.removeItem('currentUser');
    window.location.href = '../../index.html';
}
function volverDocentes() {
    window.location.href = '../index.html';
}

// ========== BUSCAR REGISTROS ==========
async function buscarRegistros() {
    const fecha = document.getElementById('input-fecha').value;
    if (!fecha) { alert('Selecciona una fecha'); return; }
    fechaActual = fecha;

    document.getElementById('registros-dia').style.display = 'none';
    document.getElementById('sin-resultados').style.display = 'none';
    document.getElementById('detalle-registro').style.display = 'none';

    const result = await tursodb.query(`
        SELECT DISTINCT especialidad, anio_formacion, hora_registro,
            SUM(CASE WHEN estado = 'PRESENTE' THEN 1 ELSE 0 END) as presentes,
            SUM(CASE WHEN estado = 'AUSENTE' THEN 1 ELSE 0 END) as ausentes,
            SUM(CASE WHEN estado = 'RETRASO' THEN 1 ELSE 0 END) as retrasos,
            SUM(CASE WHEN estado = 'LICENCIA' THEN 1 ELSE 0 END) as licencias,
            COUNT(*) as total
        FROM asistencia_estudiantes
        WHERE docente_id = ? AND fecha = ?
        GROUP BY especialidad, anio_formacion
        ORDER BY hora_registro DESC
    `, [currentUser.id, fecha]);

    if (!result.rows || result.rows.length === 0) {
        document.getElementById('sin-resultados').style.display = 'block';
        return;
    }

    const [anio, mes, dia] = fecha.split('-');
    document.getElementById('titulo-fecha').textContent = `📅 Registros del ${dia}/${mes}/${anio}`;

    const container = document.getElementById('lista-registros');
    container.innerHTML = '';
    result.rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'registro-item';
        div.onclick = () => verDetalle(r.especialidad, r.anio_formacion, fecha);
        div.innerHTML = `
            <div>
                <strong>🎓 ${r.especialidad}</strong>
                <small style="display:block; color:#666; margin-top:3px;">📅 Año ${r.anio_formacion} | 🕒 ${r.hora_registro}</small>
                <div class="mini-contadores">
                    <span class="mini-cnt presente">✅ ${r.presentes}</span>
                    <span class="mini-cnt retraso">⏰ ${r.retrasos}</span>
                    <span class="mini-cnt licencia">📋 ${r.licencias}</span>
                    <span class="mini-cnt ausente">❌ ${r.ausentes}</span>
                    <span class="mini-cnt total">👥 ${r.total}</span>
                </div>
            </div>
            <span class="btn-edit">Ver →</span>
        `;
        container.appendChild(div);
    });

    document.getElementById('registros-dia').style.display = 'block';
}

// ========== VER DETALLE ==========
async function verDetalle(especialidad, anio, fecha) {
    const result = await tursodb.query(`
        SELECT ae.*, e.nombre, e.apellido_paterno, e.apellido_materno, e.codigo_unico
        FROM asistencia_estudiantes ae
        JOIN estudiantes e ON ae.estudiante_id = e.id
        WHERE ae.especialidad = ? AND ae.anio_formacion = ? AND ae.fecha = ? AND ae.docente_id = ?
        ORDER BY e.apellido_paterno, e.nombre
    `, [especialidad, anio, fecha, currentUser.id]);

    if (!result.rows || result.rows.length === 0) return;

    document.getElementById('registros-dia').style.display = 'none';
    document.getElementById('detalle-registro').style.display = 'block';

    const [anioF, mes, dia] = fecha.split('-');
    document.getElementById('det-titulo').textContent = `${especialidad} - ${anio}`;
    document.getElementById('det-fecha').textContent = `📅 ${dia}/${mes}/${anioF} | 🕒 ${result.rows[0].hora_registro}`;

    renderDetalle(result.rows, especialidad, anio, fecha);
    actualizarContadores(result.rows);
}

function renderDetalle(registros, especialidad, anio, fecha) {
    const container = document.getElementById('lista-detalle');
    container.innerHTML = '';
    registros.forEach(reg => {
        const div = document.createElement('div');
        div.className = `estudiante-row ${reg.estado !== 'PRESENTE' ? 'ausente' : ''}`;
        div.id = `det-row-${reg.id}`;

        const nombre = `${reg.apellido_paterno} ${reg.apellido_materno !== 'SIN DATO' ? reg.apellido_materno : ''} ${reg.nombre}`;
        const horaAct = reg.hora_actualizacion ? ` | ✏️ Act: ${reg.hora_actualizacion}` : '';

        if (reg.estado === 'PRESENTE') {
            div.innerHTML = `
                <div class="est-info">
                    <strong>${nombre}</strong>
                    <small>${reg.codigo_unico}</small>
                </div>
                <span class="estado-badge presente">✅ PRESENTE</span>
            `;
        } else {
            div.innerHTML = `
                <div class="est-info">
                    <strong>${nombre}</strong>
                    <small>${reg.codigo_unico}${horaAct}</small>
                </div>
                <div class="estados-update">
                    <button onclick="actualizarEstado('${reg.id}', 'AUSENTE', '${especialidad}', '${anio}', '${fecha}')"
                        class="btn-estado ${reg.estado === 'AUSENTE' ? 'activo ausente-btn' : ''}">❌ Ausente</button>
                    <button onclick="actualizarEstado('${reg.id}', 'RETRASO', '${especialidad}', '${anio}', '${fecha}')"
                        class="btn-estado ${reg.estado === 'RETRASO' ? 'activo retraso-btn' : ''}">⏰ Retraso</button>
                    <button onclick="actualizarEstado('${reg.id}', 'LICENCIA', '${especialidad}', '${anio}', '${fecha}')"
                        class="btn-estado ${reg.estado === 'LICENCIA' ? 'activo licencia-btn' : ''}">📋 Licencia</button>
                </div>
            `;
        }
        container.appendChild(div);
    });
}

async function actualizarEstado(registroId, nuevoEstado, especialidad, anio, fecha) {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit', hour12:false});
    const fechaAct = ahora.toISOString().split('T')[0];

    await tursodb.query(`
        UPDATE asistencia_estudiantes
        SET estado = ?, hora_actualizacion = ?, fecha_actualizacion = ?
        WHERE id = ?
    `, [nuevoEstado, hora, fechaAct, registroId]);

    await verDetalle(especialidad, anio, fecha);
}

function actualizarContadores(registros) {
    document.getElementById('det-cnt-presente').textContent = registros.filter(r => r.estado === 'PRESENTE').length;
    document.getElementById('det-cnt-retraso').textContent = registros.filter(r => r.estado === 'RETRASO').length;
    document.getElementById('det-cnt-licencia').textContent = registros.filter(r => r.estado === 'LICENCIA').length;
    document.getElementById('det-cnt-ausente').textContent = registros.filter(r => r.estado === 'AUSENTE').length;
}

function volverARegistros() {
    document.getElementById('detalle-registro').style.display = 'none';
    document.getElementById('registros-dia').style.display = 'block';
}
