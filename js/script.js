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

// Nuevos elementos para la visualización mejorada
const indicadorCarga = document.getElementById('indicadorCarga');
const contenedorServicios = document.getElementById('contenedorServicios');
const infoBarbero = document.getElementById('infoBarbero');
const infoServicio = document.getElementById('infoServicio');
const resumenPrecio = document.getElementById('resumenPrecio');
const detalleReserva = document.getElementById('detalleReserva');

// Esta función trae los datos del archivo JSON
async function cargarDatos() {
    try {
        // Muestro el indicador de carga
        indicadorCarga.style.display = 'block';
        contenedorServicios.style.display = 'none';
        
        const response = await fetch('./json/servicios.json');
        serviciosData = await response.json();
        
        // Simulo un pequeño delay para mostrar el loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        llenarSelectores();
        mostrarServiciosVisualmente();
        
        // Oculto el loading y muestro los servicios
        indicadorCarga.style.display = 'none';
        contenedorServicios.style.display = 'flex';
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        indicadorCarga.innerHTML = '<p class="text-danger">Error al cargar los servicios. Intentá recargar la página.</p>';
    }
}

// Función nueva para mostrar servicios de forma visual
function mostrarServiciosVisualmente() {
    contenedorServicios.innerHTML = '';
    
    serviciosData.servicios.forEach(servicio => {
        const tarjetaServicio = document.createElement('div');
        tarjetaServicio.className = 'col-md-6 col-lg-4';
        
        tarjetaServicio.innerHTML = `
            <div class="card h-100 servicio-card" data-servicio-id="${servicio.id}">
                <div class="card-body">
                    <h5 class="card-title">${servicio.nombre}</h5>
                    <p class="card-text">${servicio.descripcion}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary fs-6">$${servicio.precio.toLocaleString()}</span>
                        <small class="text-muted">${servicio.duracion} min</small>
                    </div>
                </div>
            </div>
        `;
        
        // Agrego evento click para seleccionar el servicio
        tarjetaServicio.addEventListener('click', () => {
            seleccionarServicioDesdeCard(servicio.id);
        });
        
        contenedorServicios.appendChild(tarjetaServicio);
    });
}

// Función para seleccionar servicio desde las cards
function seleccionarServicioDesdeCard(servicioId) {
    selectServicio.value = servicioId;
    
    // Remuevo selección anterior
    document.querySelectorAll('.servicio-card').forEach(card => {
        card.classList.remove('border-primary', 'bg-light');
    });
    
    // Marco la card seleccionada
    const cardSeleccionada = document.querySelector(`[data-servicio-id="${servicioId}"]`);
    if (cardSeleccionada) {
        cardSeleccionada.classList.add('border-primary', 'bg-light');
    }
    
    // Actualizo la info del servicio
    actualizarInfoServicio();
    actualizarResumen();
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
        option.textContent = `${servicio.nombre} - $${servicio.precio.toLocaleString()}`;
        selectServicio.appendChild(option);
    });
    
    // Agrego eventos para mostrar información adicional
    selectBarbero.addEventListener('change', actualizarInfoBarbero);
    selectServicio.addEventListener('change', actualizarInfoServicio);
    selectServicio.addEventListener('change', actualizarResumen);
}

// Función para mostrar info del barbero seleccionado
function actualizarInfoBarbero() {
    const barberoId = selectBarbero.value;
    if (barberoId) {
        const barbero = serviciosData.barberos.find(b => b.id === barberoId);
        if (barbero) {
            infoBarbero.innerHTML = `
                <i class="bi bi-person-check"></i> 
                <strong>${barbero.especialidad}</strong> • ${barbero.experiencia} de experiencia
            `;
            infoBarbero.className = 'form-text text-success';
        }
    } else {
        infoBarbero.innerHTML = '';
    }
    actualizarResumen();
}

// Función para mostrar info del servicio seleccionado
function actualizarInfoServicio() {
    const servicioId = selectServicio.value;
    if (servicioId) {
        const servicio = serviciosData.servicios.find(s => s.id === servicioId);
        if (servicio) {
            infoServicio.innerHTML = `
                <i class="bi bi-clock"></i> 
                Duración: <strong>${servicio.duracion} minutos</strong> • 
                Precio: <strong>$${servicio.precio.toLocaleString()}</strong>
            `;
            infoServicio.className = 'form-text text-primary';
            
            // Actualizo la selección visual en las cards
            document.querySelectorAll('.servicio-card').forEach(card => {
                card.classList.remove('border-primary', 'bg-light');
            });
            
            const cardSeleccionada = document.querySelector(`[data-servicio-id="${servicioId}"]`);
            if (cardSeleccionada) {
                cardSeleccionada.classList.add('border-primary', 'bg-light');
            }
        }
    } else {
        infoServicio.innerHTML = '';
        // Remuevo selección visual
        document.querySelectorAll('.servicio-card').forEach(card => {
            card.classList.remove('border-primary', 'bg-light');
        });
    }
}

// Función para actualizar el resumen de la reserva
function actualizarResumen() {
    const barberoId = selectBarbero.value;
    const servicioId = selectServicio.value;
    const fecha = document.getElementById('fecha').value;
    const hora = selectHora.value;
    
    if (barberoId && servicioId) {
        const barbero = serviciosData.barberos.find(b => b.id === barberoId);
        const servicio = serviciosData.servicios.find(s => s.id === servicioId);
        
        let resumenHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>Servicio:</strong> ${servicio.nombre}<br>
                    <strong>Barbero:</strong> ${barbero.nombre}<br>
                </div>
                <div class="col-md-6">
                    <strong>Duración:</strong> ${servicio.duracion} min<br>
                    <strong>Precio:</strong> $${servicio.precio.toLocaleString()}
                </div>
            </div>
        `;
        
        if (fecha && hora) {
            // Formateo manual de la fecha para garantizar formato dd/mm/yyyy
            const fechaObj = new Date(fecha + 'T00:00:00'); // Evito problemas de zona horaria
            const dia = fechaObj.getDate().toString().padStart(2, '0');
            const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
            const año = fechaObj.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${año}`;
            
            resumenHTML += `
                <hr>
                <div class="text-center">
                    <strong>📅 ${fechaFormateada} a las ${hora} hs</strong>
                </div>
            `;
        }
        
        detalleReserva.innerHTML = resumenHTML;
        resumenPrecio.style.display = 'block';
    } else {
        resumenPrecio.style.display = 'none';
    }
}

// Armo el objeto reserva con todos los datos
function crearReserva(datosFormulario) {
    const barberoSeleccionado = serviciosData.barberos.find(b => b.id === datosFormulario.barbero);
    const servicioSeleccionado = serviciosData.servicios.find(s => s.id === datosFormulario.servicio);
    
    const nuevaReserva = {
        id: Date.now(), // uso el timestamp como ID, re simple
        nombre: datosFormulario.nombre,
        telefono: datosFormulario.telefono,
        fecha: datosFormulario.fecha, // Guardo la fecha tal como viene del input (yyyy-mm-dd)
        hora: datosFormulario.hora,
        barbero: barberoSeleccionado.nombre,
        servicio: servicioSeleccionado.nombre,
        precio: servicioSeleccionado.precio,
        fechaCreacion: new Date().toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
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
            // Formateo la fecha manualmente al formato día/mes/año
            const fecha = new Date(reserva.fecha + 'T00:00:00'); // Evito problemas de zona horaria
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const año = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${año}`;
            
            html += `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${reserva.nombre}</h5>
                        <p class="card-text">
                            <strong>Fecha:</strong> ${fechaFormateada} a las ${reserva.hora}<br>
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

// Cuando se envía el formulario
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
    
    if (nuevaReserva) {
        guardarEnStorage(nuevaReserva);
        
        // Limpio el formulario y reseteo la visualización
        formulario.reset();
        resumenPrecio.style.display = 'none';
        infoBarbero.innerHTML = '';
        infoServicio.innerHTML = '';
        
        // Remuevo selección visual de las cards
        document.querySelectorAll('.servicio-card').forEach(card => {
            card.classList.remove('border-primary', 'bg-light');
        });
        
        alert(`¡Reserva confirmada! 
        
Detalles:
• Cliente: ${nuevaReserva.nombre}
• Servicio: ${nuevaReserva.servicio}
• Barbero: ${nuevaReserva.barbero}
• Fecha: ${nuevaReserva.fecha}
• Hora: ${nuevaReserva.hora}
• Precio: $${nuevaReserva.precio}`);
    }
});

// Agrego eventos para actualizar el resumen cuando cambian fecha/hora
document.getElementById('fecha').addEventListener('change', actualizarResumen);
selectHora.addEventListener('change', actualizarResumen);

// Cuando hacen click en ver reservas
botonVerReservas.addEventListener('click', mostrarReservas);

// Cuando carga la página arranco todo
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    cargarDesdeStorage();
});