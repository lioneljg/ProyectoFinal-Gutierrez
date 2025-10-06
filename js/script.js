// Acá guardo todos los datos que vienen del JSON
let serviciosData = {};
let reservasGuardadas = [];

// Agarro los elementos del HTML que voy a usar
const formulario = document.getElementById('formularioReserva');
const selectHora = document.getElementById('hora');
const selectBarbero = document.getElementById('barbero');
const selectServicio = document.getElementById('servicio');
const botonVerReservas = document.getElementById('verReservas');
const listaReservas = document.getElementById('listaReservas');
const contenidoReservas = document.getElementById('contenidoReservas');

// Esta función trae los datos del archivo JSON
async function cargarDatos() {
    try {
        const response = await fetch('./json/servicios.json');
        serviciosData = await response.json();
        llenarSelectores();
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Lleno todos los select con la info del JSON
function llenarSelectores() {
    // Pongo los horarios disponibles
    const horarios = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora + ' hs';
        selectHora.appendChild(option);
    });

    // Cargo los barberos del JSON
    serviciosData.barberos.forEach(barbero => {
        const option = document.createElement('option');
        option.value = barbero.id;
        option.textContent = barbero.nombre;
        selectBarbero.appendChild(option);
    });

    // Cargo los servicios con sus precios
    serviciosData.servicios.forEach(servicio => {
        const option = document.createElement('option');
        option.value = servicio.id;
        option.textContent = `${servicio.nombre} - $${servicio.precio}`;
        selectServicio.appendChild(option);
    });
}

// Armo el objeto reserva con todos los datos
function crearReserva(datosFormulario) {
    const barberoSeleccionado = serviciosData.barberos.find(b => b.id === datosFormulario.barbero);
    const servicioSeleccionado = serviciosData.servicios.find(s => s.id === datosFormulario.servicio);
    
    const nuevaReserva = {
        id: Date.now(), // uso el timestamp como ID, re simple
        nombre: datosFormulario.nombre,
        telefono: datosFormulario.telefono,
        fecha: datosFormulario.fecha,
        hora: datosFormulario.hora,
        barbero: barberoSeleccionado.nombre,
        servicio: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        fechaCreacion: new Date().toLocaleString()
    };
    
    return nuevaReserva;
}

// Guardo la reserva en el localStorage
function guardarEnStorage(reserva) {
    reservasGuardadas.push(reserva);
    localStorage.setItem('reservasBarberia', JSON.stringify(reservasGuardadas));
}

// Traigo las reservas que ya estaban guardadas
function cargarDesdeStorage() {
    const reservasStorage = localStorage.getItem('reservasBarberia');
    if (reservasStorage) {
        reservasGuardadas = JSON.parse(reservasStorage);
    }
}

// Muestro todas las reservas en pantalla
function mostrarReservas() {
    if (reservasGuardadas.length === 0) {
        contenidoReservas.innerHTML = '<p class="text-muted">No hay reservas guardadas.</p>';
    } else {
        let html = '';
        reservasGuardadas.forEach(reserva => {
            html += `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${reserva.nombre}</h5>
                        <p class="card-text">
                            <strong>Fecha:</strong> ${reserva.fecha} a las ${reserva.hora}<br>
                            <strong>Barbero:</strong> ${reserva.barbero}<br>
                            <strong>Servicio:</strong> ${reserva.servicio}<br>
                            <strong>Precio:</strong> $${reserva.precio}<br>
                            <strong>Teléfono:</strong> ${reserva.telefono}
                        </p>
                        <small class="text-muted">Creada: ${reserva.fechaCreacion}</small>
                    </div>
                </div>
            `;
        });
        contenidoReservas.innerHTML = html;
    }
    
    // Muestro u oculto la lista según esté visible o no
    if (listaReservas.style.display === 'none') {
        listaReservas.style.display = 'block';
        botonVerReservas.textContent = 'Ocultar Reservas';
    } else {
        listaReservas.style.display = 'none';
        botonVerReservas.textContent = 'Ver Reservas';
    }
}

// Cuando envían el formulario hago todo el proceso
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    // Agarro todos los datos del form
    const datosFormulario = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        barbero: document.getElementById('barbero').value,
        servicio: document.getElementById('servicio').value
    };
    
    // Creo la reserva y la guardo
    const nuevaReserva = crearReserva(datosFormulario);
    guardarEnStorage(nuevaReserva);
    
    // Le aviso al usuario que salió todo bien
    alert(`¡Reserva confirmada para ${nuevaReserva.nombre}!`);
    
    // Limpio el formulario para la próxima reserva
    formulario.reset();
});

// Cuando hacen click en ver reservas
botonVerReservas.addEventListener('click', mostrarReservas);

// Cuando carga la página arranco todo
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    cargarDesdeStorage();
});