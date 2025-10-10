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

// Elementos para validaciones
const inputNombre = document.getElementById('nombre');
const inputTelefono = document.getElementById('telefono');
const inputFecha = document.getElementById('fecha');

// Funciones de validación mejoradas
function validarNombre(nombre) {
    const nombreLimpio = nombre.trim();
    
    if (nombreLimpio.length === 0) {
        return { valido: false, mensaje: 'El nombre es obligatorio' };
    }
    if (nombreLimpio.length < 2) {
        return { valido: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
    }
    if (nombreLimpio.length > 50) {
        return { valido: false, mensaje: 'El nombre no puede tener más de 50 caracteres' };
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreLimpio)) {
        return { valido: false, mensaje: 'El nombre solo puede contener letras y espacios' };
    }
    if (/^\s+|\s+$/.test(nombre)) {
        return { valido: false, mensaje: 'El nombre no puede empezar o terminar con espacios' };
    }
    if (/\s{2,}/.test(nombreLimpio)) {
        return { valido: false, mensaje: 'El nombre no puede tener espacios dobles' };
    }
    
    return { valido: true, mensaje: '¡Nombre válido!' };
}

function validarTelefono(telefono) {
    if (!telefono || telefono.trim() === '') {
        return { valido: false, mensaje: 'El teléfono es obligatorio' };
    }
    
    // Extraigo solo los números
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Verifico que tenga el formato argentino básico
    if (numeroLimpio.length < 10) {
        return { valido: false, mensaje: 'Ingresá solo números (8-15 dígitos)' };
    }
    
    // Remuevo el código de país si está presente
    let numeroSinPais = numeroLimpio;
    if (numeroSinPais.startsWith('54')) {
        numeroSinPais = numeroSinPais.substring(2);
    }
    
    // Verifico que empiece con 9 (celular argentino)
    if (!numeroSinPais.startsWith('9')) {
        return { valido: false, mensaje: 'Código de área no válido para Argentina' };
    }
    
    // Verifico la longitud del número sin el 9
    const numeroSin9 = numeroSinPais.substring(1);
    if (numeroSin9.length < 8 || numeroSin9.length > 10) {
        return { valido: false, mensaje: 'Ingresá solo números (8-15 dígitos)' };
    }
    
    // Verifico códigos de área válidos argentinos (después del 9)
    const codigoArea = numeroSin9.substring(0, 2);
    const areasValidas = ['11', '22', '23', '26', '29', '34', '35', '37', '38'];
    
    if (!areasValidas.includes(codigoArea)) {
        // Para números de 8 dígitos, el código de área puede ser de 3 dígitos
        const codigoArea3 = numeroSin9.substring(0, 3);
        const areas3Digitos = ['221', '223', '230', '236', '237', '249', '260', '261', '263', '264', '266', '280', '291', '294', '297', '298', '299', '341', '342', '343', '351', '353', '358', '362', '364', '370', '376', '379', '380', '381', '383', '385', '387', '388'];
        
        if (numeroSin9.length === 8 && !areas3Digitos.includes(codigoArea3)) {
            return { valido: false, mensaje: 'Código de área no válido para Argentina' };
        } else if (numeroSin9.length > 8 && !areasValidas.includes(codigoArea)) {
            return { valido: false, mensaje: 'Código de área no válido para Argentina' };
        }
    }
    
    return { valido: true, mensaje: '¡Perfecto!' };
}

function validarFecha(fecha) {
    if (!fecha) {
        return { valido: false, mensaje: 'Debes seleccionar una fecha' };
    }
    
    const fechaSeleccionada = new Date(fecha + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
        return { valido: false, mensaje: 'No puedes reservar en fechas pasadas' };
    }
    
    // Verifico que no sea más de 3 meses en el futuro
    const tresMesesAdelante = new Date();
    tresMesesAdelante.setMonth(tresMesesAdelante.getMonth() + 3);
    
    if (fechaSeleccionada > tresMesesAdelante) {
        const fechaLimite = tresMesesAdelante.toLocaleDateString('es-AR');
        return { valido: false, mensaje: `Solo puedes reservar hasta el ${fechaLimite}` };
    }
    
    // Verifico si es domingo (día cerrado)
    const diaSemana = fechaSeleccionada.getDay();
    if (diaSemana === 0) {
        return { valido: false, mensaje: 'Los domingos estamos cerrados' };
    }
    
    return { valido: true, mensaje: '¡Fecha disponible!' };
}

function validarHora(hora) {
    if (!hora) {
        return { valido: false, mensaje: 'Debes seleccionar una hora' };
    }
    return { valido: true, mensaje: '¡Hora seleccionada!' };
}

function validarBarbero(barberoId) {
    if (!barberoId) {
        return { valido: false, mensaje: 'Debes seleccionar un barbero' };
    }
    return { valido: true, mensaje: '¡Barbero seleccionado!' };
}

function validarServicio(servicioId) {
    if (!servicioId) {
        return { valido: false, mensaje: 'Debes seleccionar un servicio' };
    }
    return { valido: true, mensaje: '¡Servicio seleccionado!' };
}

function mostrarValidacion(elemento, esValido, mensaje = '') {
    const elementoError = document.getElementById(`error${elemento.id.charAt(0).toUpperCase() + elemento.id.slice(1)}`);
    
    if (esValido) {
        elemento.classList.remove('is-invalid');
        elemento.classList.add('is-valid');
        if (elementoError) elementoError.textContent = '';
    } else {
        elemento.classList.remove('is-valid');
        elemento.classList.add('is-invalid');
        if (elementoError) elementoError.textContent = mensaje;
    }
}

function validarCampoEnTiempoReal(elemento, funcionValidacion) {
    elemento.addEventListener('input', function() {
        const resultado = funcionValidacion(this.value);
        mostrarValidacion(this, resultado.valido, resultado.mensaje);
    });
    
    elemento.addEventListener('blur', function() {
        const resultado = funcionValidacion(this.value);
        mostrarValidacion(this, resultado.valido, resultado.mensaje);
    });
}

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
    selectBarbero.addEventListener('change', actualizarHorariosDisponibles);
    selectServicio.addEventListener('change', actualizarInfoServicio);
    selectServicio.addEventListener('change', actualizarResumen);
}

// Función para generar horarios disponibles según el día
function generarHorariosBase(fecha) {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay(); // 0 = domingo, 6 = sábado
    
    let horarios = [];
    
    if (diaSemana === 0) { // Domingo - cerrado
        return [];
    } else if (diaSemana === 6) { // Sábado - 9:00 a 16:00
        horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    } else { // Lunes a viernes - 9:00 a 18:00
        horarios = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    }
    
    return horarios;
}

// Función para verificar si un horario está ocupado
function estaHorarioOcupado(fecha, hora, barberoId) {
    return reservasGuardadas.some(reserva => 
        reserva.fecha === fecha && 
        reserva.hora === hora && 
        reserva.barberoId === barberoId
    );
}

// Función para actualizar horarios disponibles según barbero y fecha
function actualizarHorariosDisponibles() {
    const barberoId = selectBarbero.value;
    const fecha = inputFecha.value;
    
    // Limpio las opciones actuales
    selectHora.innerHTML = '<option value="">Seleccioná una hora</option>';
    
    if (!barberoId || !fecha) {
        return;
    }
    
    const horariosBase = generarHorariosBase(fecha);
    
    if (horariosBase.length === 0) {
        selectHora.innerHTML = '<option value="">Cerrado los domingos</option>';
        selectHora.disabled = true;
        return;
    }
    
    selectHora.disabled = false;
    let horariosDisponibles = 0;
    
    horariosBase.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        
        if (estaHorarioOcupado(fecha, hora, barberoId)) {
            option.textContent = `${hora} hs - OCUPADO`;
            option.disabled = true;
            option.style.color = '#dc3545';
        } else {
            option.textContent = `${hora} hs - Disponible`;
            horariosDisponibles++;
        }
        
        selectHora.appendChild(option);
    });
    
    // Muestro información sobre disponibilidad
    const infoDisponibilidad = document.getElementById('infoDisponibilidad');
    if (infoDisponibilidad) {
        if (horariosDisponibles === 0) {
            infoDisponibilidad.innerHTML = '<small class="text-danger">⚠️ No hay horarios disponibles para esta fecha</small>';
        } else {
            infoDisponibilidad.innerHTML = `<small class="text-success">✅ ${horariosDisponibles} horarios disponibles</small>`;
        }
    }
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
        barberoId: barberoSeleccionado.id, // Agrego el ID del barbero para verificar disponibilidad
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
    
    // Valido todos los campos antes de enviar
    let formularioValido = true;
    
    // Validar nombre
    const resultadoNombre = validarNombre(inputNombre.value);
    mostrarValidacion(inputNombre, resultadoNombre.valido, resultadoNombre.mensaje);
    if (!resultadoNombre.valido) formularioValido = false;
    
    // Validar teléfono
    const resultadoTelefono = validarTelefono(inputTelefono.value);
    mostrarValidacion(inputTelefono, resultadoTelefono.valido, resultadoTelefono.mensaje);
    if (!resultadoTelefono.valido) formularioValido = false;
    
    // Validar fecha
    const resultadoFecha = validarFecha(inputFecha.value);
    mostrarValidacion(inputFecha, resultadoFecha.valido, resultadoFecha.mensaje);
    if (!resultadoFecha.valido) formularioValido = false;
    
    // Validar hora
    const resultadoHora = validarHora(selectHora.value);
    mostrarValidacion(selectHora, resultadoHora.valido, resultadoHora.mensaje);
    if (!resultadoHora.valido) formularioValido = false;
    
    // Validar barbero
    const resultadoBarbero = validarBarbero(selectBarbero.value);
    mostrarValidacion(selectBarbero, resultadoBarbero.valido, resultadoBarbero.mensaje);
    if (!resultadoBarbero.valido) formularioValido = false;
    
    // Validar servicio
    const resultadoServicio = validarServicio(selectServicio.value);
    mostrarValidacion(selectServicio, resultadoServicio.valido, resultadoServicio.mensaje);
    if (!resultadoServicio.valido) formularioValido = false;
    
    // Si hay errores, no envío el formulario
    if (!formularioValido) {
        // Scroll al primer campo con error
        const primerError = document.querySelector('.is-invalid');
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerError.focus();
        }
        return;
    }
    
    // Verifico disponibilidad del horario antes de crear la reserva
    if (estaHorarioOcupado(inputFecha.value, selectHora.value, selectBarbero.value)) {
        mostrarValidacion(selectHora, false, 'Este horario ya no está disponible');
        
        // Notificación moderna con SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: '⚠️ Horario no disponible',
            text: 'Lo sentimos, este horario acaba de ser reservado por otro cliente. Por favor, seleccioná otro horario.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0d6efd'
        });
        
        actualizarHorariosDisponibles(); // Actualizo la lista de horarios
        return;
    }
    
    // Agarro todos los datos del form
    const datosFormulario = {
        nombre: inputNombre.value.trim(),
        telefono: inputTelefono.value.replace(/\s/g, ''),
        fecha: inputFecha.value,
        hora: selectHora.value,
        barbero: selectBarbero.value,
        servicio: selectServicio.value
    };
    
    // Creo la reserva y la guardo
    const nuevaReserva = crearReserva(datosFormulario);
    
    if (nuevaReserva) {
        guardarEnStorage(nuevaReserva);
        
        // Limpio el formulario y reseteo la visualización
        formulario.reset();
        
        // Remuevo todas las clases de validación
        document.querySelectorAll('.is-valid, .is-invalid').forEach(elemento => {
            elemento.classList.remove('is-valid', 'is-invalid');
        });
        
        resumenPrecio.style.display = 'none';
        infoBarbero.innerHTML = '';
        infoServicio.innerHTML = '';
        
        // Remuevo selección visual de las cards
        document.querySelectorAll('.servicio-card').forEach(card => {
            card.classList.remove('border-primary', 'bg-light');
        });
        
        // Formateo la fecha para mostrar
        const fechaObj = new Date(nuevaReserva.fecha + 'T00:00:00');
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const año = fechaObj.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${año}`;
        
        // Notificación de éxito moderna con SweetAlert2
        Swal.fire({
            icon: 'success',
            title: '🎉 ¡Reserva confirmada!',
            html: `
                <div class="text-start">
                    <p><strong>📋 Detalles de tu reserva:</strong></p>
                    <ul class="list-unstyled">
                        <li>👤 <strong>Cliente:</strong> ${nuevaReserva.nombre}</li>
                        <li>✂️ <strong>Servicio:</strong> ${nuevaReserva.servicio}</li>
                        <li>💼 <strong>Barbero:</strong> ${nuevaReserva.barbero}</li>
                        <li>📅 <strong>Fecha:</strong> ${fechaFormateada}</li>
                        <li>🕐 <strong>Hora:</strong> ${nuevaReserva.hora}</li>
                        <li>💰 <strong>Precio:</strong> $${nuevaReserva.precio.toLocaleString()}</li>
                    </ul>
                </div>
            `,
            confirmButtonText: '¡Perfecto!',
            confirmButtonColor: '#198754',
            width: '500px'
        });
        
        // Actualizo los horarios disponibles después de guardar la reserva
        actualizarHorariosDisponibles();
    }
});

// Agrego eventos para actualizar el resumen cuando cambian fecha/hora
document.getElementById('fecha').addEventListener('change', actualizarResumen);
document.getElementById('fecha').addEventListener('change', actualizarHorariosDisponibles);
selectHora.addEventListener('change', actualizarResumen);

// Agrego validaciones en tiempo real
inputNombre.addEventListener('input', () => validarCampoEnTiempoReal(inputNombre, validarNombre));
inputNombre.addEventListener('blur', () => validarCampoEnTiempoReal(inputNombre, validarNombre));

// Event listeners mejorados para el teléfono con formato argentino
inputTelefono.addEventListener('input', function() {
    const valorAnterior = this.value;
    const posicionAnterior = this.selectionStart;
    
    // Formateo automático del teléfono argentino
    const telefonoFormateado = formatearTelefonoArgentino(this.value);
    
    // Solo actualizo el valor si es diferente
    if (this.value !== telefonoFormateado) {
        this.value = telefonoFormateado;
        
        // Calculo y ajusto la posición del cursor usando la función mejorada
        const nuevaPosicion = calcularPosicionCursor(valorAnterior, telefonoFormateado, posicionAnterior);
        
        // Uso setTimeout para asegurar que el cursor se posicione correctamente
        setTimeout(() => {
            this.setSelectionRange(nuevaPosicion, nuevaPosicion);
        }, 0);
    }
    
    // Valido el teléfono
    const resultado = validarTelefono(this.value);
    mostrarValidacion(this, resultado.valido, resultado.mensaje);
});

inputTelefono.addEventListener('blur', function() {
    const telefonoLimpio = this.value.replace(/\D/g, '');
    
    // Valido el teléfono
    const resultado = validarTelefono(this.value);
    mostrarValidacion(this, resultado.valido, resultado.mensaje);
    
    // Si el teléfono es válido, busco datos del cliente
    if (resultado.valido && telefonoLimpio.length >= 8) {
        const datosCliente = obtenerHistorialCliente(telefonoLimpio);
        precargarDatosCliente(datosCliente);
    } else {
        // Limpio la información si el teléfono no es válido
        const infoCliente = document.getElementById('infoCliente');
        if (infoCliente) {
            infoCliente.style.display = 'none';
        }
        limpiarSugerencias();
    }
});

inputFecha.addEventListener('change', () => validarCampoEnTiempoReal(inputFecha, validarFecha));
inputFecha.addEventListener('blur', () => validarCampoEnTiempoReal(inputFecha, validarFecha));

// Validación para selects con validaciones mejoradas
selectHora.addEventListener('change', function() {
    const resultado = validarHora(this.value);
    mostrarValidacion(this, resultado.valido, resultado.mensaje);
});

selectBarbero.addEventListener('change', function() {
    const resultado = validarBarbero(this.value);
    mostrarValidacion(this, resultado.valido, resultado.mensaje);
});

selectServicio.addEventListener('change', function() {
    const resultado = validarServicio(this.value);
    mostrarValidacion(this, resultado.valido, resultado.mensaje);
});

// Cuando hacen click en ver reservas
botonVerReservas.addEventListener('click', mostrarReservas);

// Cuando carga la página arranco todo
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    cargarDesdeStorage();
    inicializarSistemaClienteInteligente();
});


// Nuevas funciones para manejo de datos del cliente
function obtenerHistorialCliente(telefono) {
    // Busco en las reservas guardadas si ya existe este teléfono
    const reservasCliente = reservasGuardadas.filter(reserva => 
        reserva.telefono.replace(/\s/g, '') === telefono.replace(/\s/g, '')
    );
    
    if (reservasCliente.length > 0) {
        // Obtengo la reserva más reciente
        const reservaReciente = reservasCliente.sort((a, b) => b.id - a.id)[0];
        return {
            existe: true,
            nombre: reservaReciente.nombre,
            telefono: reservaReciente.telefono,
            totalReservas: reservasCliente.length,
            ultimaReserva: reservaReciente.fechaCreacion,
            servicioFavorito: obtenerServicioMasFrecuente(reservasCliente),
            barberoFavorito: obtenerBarberoMasFrecuente(reservasCliente)
        };
    }
    
    return { existe: false };
}

function obtenerServicioMasFrecuente(reservasCliente) {
    const servicios = {};
    reservasCliente.forEach(reserva => {
        servicios[reserva.servicio] = (servicios[reserva.servicio] || 0) + 1;
    });
    
    return Object.keys(servicios).reduce((a, b) => 
        servicios[a] > servicios[b] ? a : b
    );
}

function obtenerBarberoMasFrecuente(reservasCliente) {
    const barberos = {};
    reservasCliente.forEach(reserva => {
        barberos[reserva.barbero] = (barberos[reserva.barbero] || 0) + 1;
    });
    
    return Object.keys(barberos).reduce((a, b) => 
        barberos[a] > barberos[b] ? a : b
    );
}

function precargarDatosCliente(datosCliente) {
    if (datosCliente.existe) {
        // Precargo el nombre
        inputNombre.value = datosCliente.nombre;
        mostrarValidacion(inputNombre, true);
        
        // Muestro información del cliente (básica o avanzada según el historial)
        if (datosCliente.totalReservas >= 3) {
            mostrarEstadisticasAvanzadas(datosCliente);
        } else {
            const infoCliente = document.getElementById('infoCliente');
            if (infoCliente) {
                infoCliente.innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-person-check"></i> 
                        <strong>Cliente frecuente</strong> - ${datosCliente.totalReservas} reserva(s) anterior(es)
                        <br><small>Última visita: ${datosCliente.ultimaReserva}</small>
                    </div>
                `;
                infoCliente.style.display = 'block';
            }
        }
        
        // Sugiero servicio y barbero favoritos
        mostrarSugerenciasInteligentes(datosCliente);
    } else {
        // Limpio la información si no es cliente conocido
        const infoCliente = document.getElementById('infoCliente');
        if (infoCliente) {
            infoCliente.style.display = 'none';
        }
        limpiarSugerencias();
    }
}

function mostrarSugerenciasInteligentes(datosCliente) {
    const sugerenciasDiv = document.getElementById('sugerenciasInteligentes');
    if (sugerenciasDiv) {
        sugerenciasDiv.innerHTML = `
            <div class="alert alert-success">
                <h6><i class="bi bi-lightbulb"></i> Sugerencias basadas en tu historial:</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Servicio favorito:</strong> ${datosCliente.servicioFavorito}
                        <button type="button" class="btn btn-sm btn-outline-success ms-2" 
                                onclick="aplicarSugerenciaServicio('${datosCliente.servicioFavorito}')">
                            Aplicar
                        </button>
                    </div>
                    <div class="col-md-6">
                        <strong>Barbero favorito:</strong> ${datosCliente.barberoFavorito}
                        <button type="button" class="btn btn-sm btn-outline-success ms-2" 
                                onclick="aplicarSugerenciaBarbero('${datosCliente.barberoFavorito}')">
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        `;
        sugerenciasDiv.style.display = 'block';
    }
}

function aplicarSugerenciaServicio(nombreServicio) {
    const servicio = serviciosData.servicios.find(s => s.nombre === nombreServicio);
    if (servicio) {
        selectServicio.value = servicio.id;
        selectServicio.dispatchEvent(new Event('change'));
        mostrarValidacion(selectServicio, true);
    }
}

function aplicarSugerenciaBarbero(nombreBarbero) {
    const barbero = serviciosData.barberos.find(b => b.nombre === nombreBarbero);
    if (barbero) {
        selectBarbero.value = barbero.id;
        selectBarbero.dispatchEvent(new Event('change'));
        mostrarValidacion(selectBarbero, true);
    }
}

function limpiarSugerencias() {
    const sugerenciasDiv = document.getElementById('sugerenciasInteligentes');
    if (sugerenciasDiv) {
        sugerenciasDiv.style.display = 'none';
    }
}

function formatearTelefonoArgentino(input) {
    // Extraigo solo los números del input
    let numeros = input.replace(/\D/g, '');
    
    // Si está vacío, retorno el prefijo base
    if (numeros.length === 0) {
        return '+54 9 ';
    }
    
    // Remuevo el código de país si alguien lo escribió
    if (numeros.startsWith('54')) {
        numeros = numeros.substring(2);
    }
    
    // Si no empieza con 9, lo agrego automáticamente
    if (!numeros.startsWith('9')) {
        numeros = '9' + numeros;
    }
    
    // Limito a 11 dígitos (9 + 10 dígitos del número)
    if (numeros.length > 11) {
        numeros = numeros.substring(0, 11);
    }
    
    // Formato simple sin paréntesis: +54 9 11 1234-5678
    let resultado = '+54 9 ';
    
    if (numeros.length > 1) {
        // Agrego el código de área sin paréntesis
        const codigoArea = numeros.substring(1, 3);
        if (codigoArea.length > 0) {
            resultado += codigoArea;
            if (codigoArea.length === 2) {
                resultado += ' ';
            }
        }
        
        // Agrego el número
        if (numeros.length > 3) {
            const numero = numeros.substring(3);
            if (numero.length <= 4) {
                resultado += numero;
            } else {
                resultado += numero.substring(0, 4) + '-' + numero.substring(4);
            }
        }
    }
    
    return resultado;
}

function calcularPosicionCursor(valorAnterior, valorNuevo, posicionAnterior) {
    // Para una experiencia más natural, simplemente mantengo el cursor al final
    // cuando se está escribiendo de forma continua
    if (valorNuevo.length >= valorAnterior.length) {
        // Si se está agregando contenido, pongo el cursor al final
        return valorNuevo.length;
    }
    
    // Si se está borrando, mantengo una posición relativa
    const diferencia = valorAnterior.length - valorNuevo.length;
    let nuevaPosicion = Math.max(0, posicionAnterior - diferencia);
    
    // Me aseguro de que no esté en un carácter de formato
    const caracteresFormato = ['+', '5', '4', ' ', '9', '-'];
    while (nuevaPosicion < valorNuevo.length && 
           caracteresFormato.includes(valorNuevo[nuevaPosicion])) {
        nuevaPosicion++;
    }
    
    return Math.min(nuevaPosicion, valorNuevo.length);
}


function limpiarFormularioCompleto() {
    // Limpio el formulario y reseteo la visualización
    formulario.reset();
    
    // Remuevo todas las clases de validación
    document.querySelectorAll('.is-valid, .is-invalid').forEach(elemento => {
        elemento.classList.remove('is-valid', 'is-invalid');
    });
    
    resumenPrecio.style.display = 'none';
    infoBarbero.innerHTML = '';
    infoServicio.innerHTML = '';
    
    // Remuevo selección visual de las cards
    document.querySelectorAll('.servicio-card').forEach(card => {
        card.classList.remove('border-primary', 'bg-light');
    });
    
    // Limpio información del cliente y sugerencias
    const infoCliente = document.getElementById('infoCliente');
    if (infoCliente) {
        infoCliente.style.display = 'none';
    }
    limpiarSugerencias();
}

function obtenerEstadisticasCliente(telefono) {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const reservasCliente = reservasGuardadas.filter(reserva => 
        reserva.telefono.replace(/\D/g, '') === telefonoLimpio
    );
    
    if (reservasCliente.length === 0) {
        return null;
    }
    
    // Calculo estadísticas
    const totalGastado = reservasCliente.reduce((total, reserva) => total + reserva.precio, 0);
    const serviciosUnicos = [...new Set(reservasCliente.map(r => r.servicio))];
    const barberosUnicos = [...new Set(reservasCliente.map(r => r.barbero))];
    
    // Encuentro el mes con más reservas
    const reservasPorMes = {};
    reservasCliente.forEach(reserva => {
        const fecha = new Date(reserva.fecha + 'T00:00:00');
        const mesAño = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        reservasPorMes[mesAño] = (reservasPorMes[mesAño] || 0) + 1;
    });
    
    const mesFavorito = Object.keys(reservasPorMes).reduce((a, b) => 
        reservasPorMes[a] > reservasPorMes[b] ? a : b
    );
    
    return {
        totalReservas: reservasCliente.length,
        totalGastado,
        serviciosUnicos: serviciosUnicos.length,
        barberosUnicos: barberosUnicos.length,
        mesFavorito,
        reservasEnMesFavorito: reservasPorMes[mesFavorito]
    };
}

function mostrarEstadisticasAvanzadas(datosCliente) {
    const estadisticas = obtenerEstadisticasCliente(datosCliente.telefono);
    
    if (estadisticas && estadisticas.totalReservas >= 3) {
        const infoCliente = document.getElementById('infoCliente');
        if (infoCliente) {
            infoCliente.innerHTML = `
                <div class="alert alert-info">
                    <div class="row">
                        <div class="col-md-8">
                            <i class="bi bi-person-check"></i> 
                            <strong>Cliente VIP</strong> - ${estadisticas.totalReservas} reservas
                            <br><small>Última visita: ${datosCliente.ultimaReserva}</small>
                            <br><small>Total gastado: $${estadisticas.totalGastado.toLocaleString()}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="badge bg-primary">
                                ${estadisticas.serviciosUnicos} servicios probados
                            </div>
                            <br>
                            <div class="badge bg-success mt-1">
                                Mes favorito: ${estadisticas.mesFavorito}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}


function mostrarIndicadorClienteGuardado() {
    // Agrego un indicador visual cuando se guarda un cliente nuevo
    const inputTelefono = document.getElementById('telefono');
    if (inputTelefono) {
        inputTelefono.classList.add('cliente-nuevo-guardado');
        
        // Remuevo el indicador después de 3 segundos
        setTimeout(() => {
            inputTelefono.classList.remove('cliente-nuevo-guardado');
        }, 3000);
    }
}

function aplicarFormatoAutomaticoNombre() {
    const inputNombre = document.getElementById('nombre');
    if (inputNombre && inputNombre.value) {
        // Capitalizo la primera letra de cada palabra
        const nombreFormateado = inputNombre.value
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ')
            .replace(/\s+/g, ' ') // Remuevo espacios dobles
            .trim();
        
        if (nombreFormateado !== inputNombre.value) {
            inputNombre.value = nombreFormateado;
        }
    }
}

function limpiarYValidarCamposEnTiempoReal() {
    // Formateo automático del nombre
    inputNombre.addEventListener('blur', aplicarFormatoAutomaticoNombre);
    
    // Limpieza automática de caracteres especiales en nombre
    inputNombre.addEventListener('input', function() {
        // Remuevo números y caracteres especiales, excepto espacios, acentos y ñ
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
    
    // Prevención de espacios múltiples en tiempo real
    inputNombre.addEventListener('input', function() {
        // Reemplazo múltiples espacios con uno solo
        this.value = this.value.replace(/\s{2,}/g, ' ');
    });
}

function inicializarSistemaClienteInteligente() {
    // Inicializo todas las funcionalidades del sistema de cliente inteligente
    limpiarYValidarCamposEnTiempoReal();
    
    // Agrego evento para mostrar indicador cuando se crea una nueva reserva
    const originalCrearReserva = crearReserva;
    window.crearReserva = function(datosReserva) {
        const resultado = originalCrearReserva(datosReserva);
        
        // Si es un cliente nuevo, muestro el indicador
        const historialExistente = obtenerHistorialCliente(datosReserva.telefono);
        if (!historialExistente.existe) {
            mostrarIndicadorClienteGuardado();
        }
        
        return resultado;
    };
}