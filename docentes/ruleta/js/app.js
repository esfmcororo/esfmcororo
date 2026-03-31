// ========== RULETA DE PARTICIPACIÓN ==========

let currentUser = null;
let estudiantes = [];       // todos los del grupo
let pendientes = [];        // los que aún no participaron
let sesionId = null;
let girando = false;
let anguloActual = 0;

const COLORES = [
    '#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7',
    '#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9',
    '#F0B27A','#82E0AA','#F1948A','#AED6F1','#A9DFBF'
];

window.addEventListener('DOMContentLoaded', async function () {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = '../../index.html'; return; }
    currentUser = user;
    document.querySelectorAll('.user-display-name').forEach(el => el.textContent = user.nombre);
    document.querySelectorAll('.dropdown-rol').forEach(el => el.textContent = user.rol.toUpperCase());
    await tursodb.initializeData();
    await cargarEspecialidades();
});

// ========== DROPDOWN ==========
function toggleUserDropdown(id) {
    const d = document.getElementById(id);
    if (d) d.classList.toggle('active');
}
document.addEventListener('click', function(e) {
    const d = document.getElementById('user-dropdown-ruleta');
    if (d && !d.contains(e.target)) d.classList.remove('active');
});
function cerrarSesion() {
    localStorage.removeItem('currentUser');
    window.location.href = '../../index.html';
}
function volverDocentes() {
    window.location.href = '../index.html';
}

// ========== SELECCIÓN ==========
async function cargarEspecialidades() {
    const result = await tursodb.query(`SELECT DISTINCT especialidad FROM estudiantes ORDER BY especialidad`);
    const sel = document.getElementById('sel-especialidad');
    (result.rows || []).forEach(r => sel.innerHTML += `<option value="${r.especialidad}">${r.especialidad}</option>`);
}

async function cargarAnios() {
    const especialidad = document.getElementById('sel-especialidad').value;
    const grupoAnio = document.getElementById('grupo-anio');
    const btnIniciar = document.getElementById('btn-iniciar');
    if (!especialidad) { grupoAnio.style.display = 'none'; btnIniciar.style.display = 'none'; return; }

    const result = await tursodb.query(
        `SELECT DISTINCT anio_formacion FROM estudiantes WHERE especialidad = ? ORDER BY anio_formacion`,
        [especialidad]
    );
    const orden = ['PRIMERO','SEGUNDO','TERCERO','CUARTO','QUINTO'];
    const sel = document.getElementById('sel-anio');
    sel.innerHTML = '<option value="">-- Selecciona --</option>';
    (result.rows || []).sort((a,b) => orden.indexOf(a.anio_formacion) - orden.indexOf(b.anio_formacion))
        .forEach(r => sel.innerHTML += `<option value="${r.anio_formacion}">${r.anio_formacion}</option>`);

    grupoAnio.style.display = 'block';
    sel.onchange = () => { btnIniciar.style.display = sel.value ? 'block' : 'none'; };
}

// ========== INICIAR RULETA ==========
async function iniciarRuleta() {
    const especialidad = document.getElementById('sel-especialidad').value;
    const anio = document.getElementById('sel-anio').value;
    if (!especialidad || !anio) return;

    // Cargar todos los estudiantes
    const estResult = await tursodb.query(
        `SELECT id, nombre, apellido_paterno, apellido_materno, codigo_unico
         FROM estudiantes WHERE especialidad = ? AND anio_formacion = ?
         ORDER BY apellido_paterno, nombre`,
        [especialidad, anio]
    );
    if (!estResult.rows || estResult.rows.length === 0) {
        showToast('No hay estudiantes en este grupo', 'warning'); return;
    }
    estudiantes = estResult.rows;

    // Buscar sesión activa
    const sesionResult = await tursodb.query(
        `SELECT * FROM ruleta_sesiones WHERE docente_id = ? AND especialidad = ? AND anio_formacion = ? AND activa = 1 ORDER BY created_at DESC LIMIT 1`,
        [String(currentUser.id), especialidad, anio]
    );

    if (sesionResult.rows && sesionResult.rows.length > 0) {
        sesionId = sesionResult.rows[0].id;
    } else {
        // Crear nueva sesión
        sesionId = Date.now().toString() + Math.random().toString(36).substr(2,4);
        const fechaLocal = new Date();
        const fecha = `${fechaLocal.getFullYear()}-${String(fechaLocal.getMonth()+1).padStart(2,'0')}-${String(fechaLocal.getDate()).padStart(2,'0')}`;
        await tursodb.query(
            `INSERT INTO ruleta_sesiones (id, docente_id, especialidad, anio_formacion, fecha_inicio, total_estudiantes, activa) VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [sesionId, String(currentUser.id), especialidad, anio, fecha, estudiantes.length]
        );
    }

    // Cargar quiénes ya participaron en esta sesión
    await cargarPendientes(especialidad, anio);

    // Mostrar vista ruleta
    document.getElementById('vista-seleccion').style.display = 'none';
    document.getElementById('vista-ruleta').style.display = 'block';
    document.getElementById('ruleta-titulo').textContent = `${especialidad} - ${anio}`;

    dibujarRuleta();
    await cargarReporte();
}

async function cargarPendientes(especialidad, anio) {
    const yaParticiparon = await tursodb.query(
        `SELECT estudiante_id FROM participaciones WHERE sesion_id = ?`,
        [sesionId]
    );
    const idsParticiparon = new Set((yaParticiparon.rows || []).map(r => r.estudiante_id));
    pendientes = estudiantes.filter(e => !idsParticiparon.has(e.id));
    actualizarInfo();
}

function actualizarInfo() {
    const participaron = estudiantes.length - pendientes.length;
    document.getElementById('ruleta-info').textContent =
        `👥 Pendientes: ${pendientes.length} | ✅ Participaron: ${participaron} / ${estudiantes.length}`;

    if (pendientes.length === 0) {
        document.getElementById('btn-girar').disabled = true;
        document.getElementById('btn-girar').textContent = '🎉 ¡Todos participaron!';
        showToast('¡Todos los estudiantes participaron!', 'success', 5000);
    }
}

// ========== RULETA CANVAS ==========
function dibujarRuleta(anguloOffset = 0) {
    const canvas = document.getElementById('ruleta-canvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radio = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pendientes.length === 0) {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 ¡Todos!', cx, cy);
        return;
    }

    const segmento = (Math.PI * 2) / pendientes.length;

    pendientes.forEach((est, i) => {
        const inicio = anguloOffset + i * segmento;
        const fin = inicio + segmento;
        const color = COLORES[i % COLORES.length];

        // Segmento
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radio, inicio, fin);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texto
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(inicio + segmento / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#222';
        ctx.font = `bold ${pendientes.length > 20 ? '9' : pendientes.length > 10 ? '11' : '13'}px Segoe UI`;

        const apellido = est.apellido_paterno || '';
        const nombre = est.nombre || '';
        const texto = `${apellido} ${nombre}`.substring(0, 18);
        ctx.fillText(texto, radio - 8, 4);
        ctx.restore();
    });

    // Centro
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
}

// ========== GIRAR ==========
function girarRuleta() {
    if (girando || pendientes.length === 0) return;
    girando = true;

    document.getElementById('btn-girar').disabled = true;
    document.getElementById('ganador-box').style.display = 'none';

    const vueltasExtra = 5 + Math.random() * 5; // 5-10 vueltas
    const anguloExtra = Math.PI * 2 * vueltasExtra;
    const anguloFinal = anguloActual + anguloExtra;
    const duracion = 4000;
    const inicio = performance.now();

    function animar(ahora) {
        const transcurrido = ahora - inicio;
        const progreso = Math.min(transcurrido / duracion, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progreso, 3);
        const anguloActualAnim = anguloActual + anguloExtra * ease;

        dibujarRuleta(anguloActualAnim);

        if (progreso < 1) {
            requestAnimationFrame(animar);
        } else {
            anguloActual = anguloFinal % (Math.PI * 2);
            girando = false;
            mostrarGanador();
        }
    }

    requestAnimationFrame(animar);
}

async function mostrarGanador() {
    // La flecha apunta hacia arriba (ángulo -PI/2)
    // Calcular qué segmento está en la parte superior
    const segmento = (Math.PI * 2) / pendientes.length;
    // Normalizar ángulo actual para encontrar el segmento apuntado
    const anguloNorm = ((Math.PI * 2) - (anguloActual % (Math.PI * 2))) % (Math.PI * 2);
    const indice = Math.floor(anguloNorm / segmento) % pendientes.length;
    const ganador = pendientes[indice];

    // Mostrar ganador
    const nombre = `${ganador.apellido_paterno} ${ganador.apellido_materno !== 'SIN DATO' ? ganador.apellido_materno : ''} ${ganador.nombre}`.trim();
    document.getElementById('ganador-nombre').textContent = `🎉 ${nombre}`;
    document.getElementById('ganador-codigo').textContent = ganador.codigo_unico;
    document.getElementById('ganador-box').style.display = 'block';

    // Guardar participación
    const ahora = new Date();
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
    const hora = `${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
    const id = Date.now().toString() + Math.random().toString(36).substr(2,4);

    await tursodb.query(
        `INSERT INTO participaciones (id, estudiante_id, docente_id, especialidad, anio_formacion, fecha, hora, sesion_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, ganador.id, String(currentUser.id), document.getElementById('ruleta-titulo').textContent.split(' - ')[0],
         document.getElementById('ruleta-titulo').textContent.split(' - ')[1], fecha, hora, sesionId]
    );

    // Quitar de pendientes y redibujar
    pendientes = pendientes.filter(e => e.id !== ganador.id);
    anguloActual = 0;
    dibujarRuleta();
    actualizarInfo();
    await cargarReporte();

    document.getElementById('btn-girar').disabled = pendientes.length === 0;
}

// ========== REPORTE ==========
async function cargarReporte() {
    const result = await tursodb.query(`
        SELECT p.fecha, p.hora, e.nombre, e.apellido_paterno, e.apellido_materno, e.codigo_unico
        FROM participaciones p
        JOIN estudiantes e ON p.estudiante_id = e.id
        WHERE p.sesion_id = ?
        ORDER BY p.fecha DESC, p.hora DESC
    `, [sesionId]);

    const lista = document.getElementById('reporte-lista');
    const participaron = result.rows ? result.rows.length : 0;
    document.getElementById('reporte-titulo').textContent = `📋 Participantes (${participaron}/${estudiantes.length})`;

    if (!result.rows || result.rows.length === 0) {
        lista.innerHTML = '<p style="color:#999; text-align:center; padding:15px;">Aún no hay participantes</p>';
        return;
    }

    lista.innerHTML = result.rows.map((r, i) => {
        const apellidoM = r.apellido_materno !== 'SIN DATO' ? r.apellido_materno : '';
        const nombre = `${r.apellido_paterno} ${apellidoM} ${r.nombre}`.trim();
        return `
            <div class="participante-item">
                <span class="part-num">${i + 1}</span>
                <div class="part-info">
                    <strong>${nombre}</strong>
                    <small>${r.codigo_unico} | ${r.fecha} ${r.hora}</small>
                </div>
            </div>`;
    }).join('');
}

// ========== REINICIAR ==========
async function reiniciarRuleta() {
    const titulo = document.getElementById('ruleta-titulo').textContent;
    const [especialidad, anio] = titulo.split(' - ');
    const participaron = estudiantes.length - pendientes.length;

    const ok = await showConfirm(
        'Reiniciar Ruleta',
        `Se guardarán los ${participaron} participantes registrados y se iniciará una nueva sesión.<br><br>¿Confirmas el reinicio?`,
        'warning'
    );
    if (!ok) return;

    // Cerrar sesión actual
    const ahora = new Date();
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
    await tursodb.query(
        `UPDATE ruleta_sesiones SET activa = 0, fecha_fin = ?, total_participaron = ? WHERE id = ?`,
        [fecha, participaron, sesionId]
    );

    showToast(`Sesión guardada con ${participaron} participantes`, 'success');

    // Reiniciar estado
    sesionId = null;
    pendientes = [];
    anguloActual = 0;
    document.getElementById('ganador-box').style.display = 'none';
    document.getElementById('vista-ruleta').style.display = 'none';
    document.getElementById('vista-seleccion').style.display = 'block';
    document.getElementById('btn-iniciar').style.display = 'none';
    document.getElementById('sel-especialidad').value = '';
    document.getElementById('sel-anio').value = '';
    document.getElementById('grupo-anio').style.display = 'none';
}
