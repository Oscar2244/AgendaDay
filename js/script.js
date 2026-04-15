/**
 * SISTEMA DE AGENDA INTELIGENTE
 * Desarrollado por: Oscar Ocampos
 */

// 1. ESTADO DE LA APLICACIÓN
let eventos = JSON.parse(localStorage.getItem('smart_agenda_data')) || [];
let modoEdicion = false;

// 2. SELECTORES DEL DOM
const form = document.getElementById('evento-form');
const listaContainer = document.getElementById('lista-eventos');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');

// 3. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    renderizarEventos();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        gestionarEnvio();
    });

    btnCancel.addEventListener('click', salirModoEdicion);
});

// 4. FUNCIONALIDAD CRUD
function gestionarEnvio() {
    const id = document.getElementById('edit-id').value;
    const titulo = document.getElementById('titulo').value;
    const fecha = document.getElementById('fecha').value;
    const descripcion = document.getElementById('descripcion').value;

    if (modoEdicion) {
        // EDITAR: Buscamos y actualizamos el objeto
        eventos = eventos.map(ev => 
            ev.id == id ? { ...ev, titulo, fecha, descripcion } : ev
        );
        salirModoEdicion();
    } else {
        // CREAR: events.push()
        const nuevoEvento = {
            id: Date.now(),
            titulo,
            fecha,
            descripcion
        };
        eventos.push(nuevoEvento);
    }

    guardarDatos();
    renderizarEventos();
    form.reset();
}

function renderizarEventos(datosAMostrar = eventos) {
    listaContainer.innerHTML = '';

    // Ordenar por fecha antes de mostrar
    const ordenados = [...datosAMostrar].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    if (ordenados.length === 0) {
        listaContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay eventos registrados.</p>';
        return;
    }

    ordenados.forEach(ev => {
        listaContainer.innerHTML += `
            <div class="event-card">
                <div class="event-date">${formatearFecha(ev.fecha)}</div>
                <h3>${ev.titulo}</h3>
                <p>${ev.descripcion}</p>
                <div class="event-actions no-print">
                    <button class="btn-edit" onclick="prepararEdicion(${ev.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarEvento(${ev.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
}

function eliminarEvento(id) {
    if (confirm('¿Desea eliminar este evento?')) {
        // ELIMINAR: Uso de filter()
        eventos = eventos.filter(ev => ev.id !== id);
        guardarDatos();
        renderizarEventos();
    }
}

function prepararEdicion(id) {
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;

    // REUTILIZAR FORMULARIO
    document.getElementById('edit-id').value = ev.id;
    document.getElementById('titulo').value = ev.titulo;
    document.getElementById('fecha').value = ev.fecha;
    document.getElementById('descripcion').value = ev.descripcion;

    modoEdicion = true;
    btnSubmit.innerText = 'Actualizar Evento';
    document.getElementById('form-title').innerText = 'Editando Evento';
    btnCancel.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. FILTROS POR FECHAS
function aplicarFiltros() {
    const desde = document.getElementById('filtro-desde').value;
    const hasta = document.getElementById('filtro-hasta').value;

    if (!desde || !hasta) {
        alert("Por favor seleccione ambas fechas para el filtro.");
        return;
    }

    const filtrados = eventos.filter(ev => {
        return ev.fecha >= desde && ev.fecha <= hasta;
    });

    renderizarEventos(filtrados);
}

function limpiarFiltros() {
    document.getElementById('filtro-desde').value = '';
    document.getElementById('filtro-hasta').value = '';
    renderizarEventos();
}

// 6. PERSISTENCIA Y EXPORTACIÓN
function guardarDatos() {
    localStorage.setItem('smart_agenda_data', JSON.stringify(eventos));
}

function exportarPDF() {
    const printContainer = document.getElementById('print-content');
    
    // 1. Limpiar el contenedor de impresión
    printContainer.innerHTML = '';

    // 2. Verificar si hay eventos
    if (eventos.length === 0) {
        alert("No hay eventos para exportar.");
        return;
    }

    // 3. Ordenar eventos por fecha para el reporte
    const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // 4. Crear estructura de tabla profesional
    let tablaHTML = `
        <table class="print-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Fecha</th>
                    <th style="width: 25%;">Evento</th>
                    <th style="width: 50%;">Descripción</th>
                </tr>
            </thead>
            <tbody>
    `;

    eventosOrdenados.forEach(ev => {
        tablaHTML += `
            <tr>
                <td>${formatearFecha(ev.fecha)}</td>
                <td><h3>${ev.titulo}</h3></td>
                <td><p>${ev.descripcion}</p></td>
            </tr>
        `;
    });

    tablaHTML += `
            </tbody>
        </table>
        <div class="footer-print">
            <p>Reporte generado automáticamente por SmartAgenda - Oscar Ocampos</p>
        </div>
    `;

    // 5. Inyectar y ejecutar impresión
    printContainer.innerHTML = tablaHTML;
    window.print();
}

// UTILIDADES
function salirModoEdicion() {
    modoEdicion = false;
    form.reset();
    btnSubmit.innerText = 'Guardar Evento';
    document.getElementById('form-title').innerText = 'Nuevo Evento';
    btnCancel.style.display = 'none';
}

function formatearFecha(fechaStr) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
}