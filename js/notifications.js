// ========== SISTEMA DE NOTIFICACIONES GLOBAL ==========

// Toast: notificacion rapida que desaparece sola (reemplaza alert simple)
function showToast(mensaje, tipo = 'success', duracion = 3000) {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    const iconos = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const colores = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        error:   { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        info:    { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
    };
    const c = colores[tipo] || colores.info;

    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        background: ${c.bg};
        border: 2px solid ${c.border};
        color: ${c.text};
        padding: 14px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        font-size: 15px;
        font-weight: 600;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;
    toast.innerHTML = `<span style="font-size:20px;">${iconos[tipo]}</span><span>${mensaje}</span>`;
    toast.onclick = () => toast.remove();

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes slideIn { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
            @keyframes slideOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(100px); } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duracion);
}

// Modal de confirmacion (reemplaza confirm())
function showConfirm(titulo, mensaje, tipo = 'warning') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.6); z-index:99998;
            display:flex; align-items:center; justify-content:center;
            animation: fadeIn 0.2s ease;
        `;

        const iconos = { success: '✅', error: '🗑️', warning: '⚠️', info: 'ℹ️' };
        const btnColors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
        const btnText = { success: '#fff', error: '#fff', warning: '#333', info: '#fff' };

        overlay.innerHTML = `
            <div style="
                background:white; border-radius:16px; padding:30px;
                max-width:400px; width:90%; text-align:center;
                box-shadow:0 20px 60px rgba(0,0,0,0.3);
                animation: popIn 0.2s ease;
            ">
                <div style="font-size:3rem; margin-bottom:15px;">${iconos[tipo]}</div>
                <h3 style="color:#333; font-size:1.3rem; margin-bottom:10px;">${titulo}</h3>
                <p style="color:#666; font-size:14px; margin-bottom:25px; line-height:1.5;">${mensaje}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="confirm-cancel" style="
                        padding:10px 24px; border-radius:8px; border:2px solid #ddd;
                        background:white; color:#666; font-size:14px; font-weight:600;
                        cursor:pointer; transition:all 0.2s;
                    ">Cancelar</button>
                    <button id="confirm-ok" style="
                        padding:10px 24px; border-radius:8px; border:none;
                        background:${btnColors[tipo]}; color:${btnText[tipo]};
                        font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s;
                    ">Confirmar</button>
                </div>
            </div>
        `;

        if (!document.getElementById('modal-style')) {
            const style = document.createElement('style');
            style.id = 'modal-style';
            style.textContent = `
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes popIn  { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);
        overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
        overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
    });
}

// Modal con input de texto (reemplaza prompt() para confirmaciones tipo "escribe ELIMINAR")
function showPromptConfirm(titulo, mensaje, palabraClave, tipo = 'error') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.6); z-index:99998;
            display:flex; align-items:center; justify-content:center;
        `;

        const btnColors = { error: '#dc3545', warning: '#ffc107' };
        const btnText   = { error: '#fff',    warning: '#333'    };

        overlay.innerHTML = `
            <div style="
                background:white; border-radius:16px; padding:30px;
                max-width:420px; width:90%; text-align:center;
                box-shadow:0 20px 60px rgba(0,0,0,0.3);
                animation: popIn 0.2s ease;
            ">
                <div style="font-size:3rem; margin-bottom:15px;">🗑️</div>
                <h3 style="color:#333; font-size:1.2rem; margin-bottom:10px;">${titulo}</h3>
                <p style="color:#666; font-size:13px; margin-bottom:15px; line-height:1.5; text-align:left;">${mensaje}</p>
                <p style="color:#dc3545; font-size:13px; margin-bottom:10px; font-weight:600;">
                    Escribe <strong>${palabraClave}</strong> para confirmar:
                </p>
                <input id="prompt-input" type="text" placeholder="${palabraClave}" style="
                    width:100%; padding:10px; border:2px solid #ddd; border-radius:8px;
                    font-size:15px; text-align:center; margin-bottom:20px;
                    box-sizing:border-box; letter-spacing:2px; font-weight:700;
                ">
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="prompt-cancel" style="
                        padding:10px 24px; border-radius:8px; border:2px solid #ddd;
                        background:white; color:#666; font-size:14px; font-weight:600; cursor:pointer;
                    ">Cancelar</button>
                    <button id="prompt-ok" style="
                        padding:10px 24px; border-radius:8px; border:none;
                        background:${btnColors[tipo]}; color:${btnText[tipo]};
                        font-size:14px; font-weight:600; cursor:pointer;
                    ">Eliminar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const input = overlay.querySelector('#prompt-input');
        input.focus();

        overlay.querySelector('#prompt-ok').onclick = () => {
            if (input.value.trim().toUpperCase() === palabraClave.toUpperCase()) {
                overlay.remove(); resolve(true);
            } else {
                input.style.border = '2px solid #dc3545';
                input.style.background = '#fff5f5';
                input.placeholder = 'Texto incorrecto, intenta de nuevo';
                input.value = '';
                input.focus();
            }
        };
        overlay.querySelector('#prompt-cancel').onclick = () => { overlay.remove(); resolve(false); };
        input.addEventListener('keydown', e => { if (e.key === 'Enter') overlay.querySelector('#prompt-ok').click(); });
    });
}
