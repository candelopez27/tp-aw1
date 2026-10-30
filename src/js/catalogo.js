// =====================================================
// CATALOGO.JS — MOLA EVENTOS
// Renderizado de productos y eventos del catálogo
// =====================================================

import { productos } from "./datos/productos.js";

const grillaProductos = document.getElementById("grilla-productos");
const campoBusqueda = document.getElementById("buscar-producto");
const precioMinimo = document.getElementById("precio-minimo");
const precioMaximo = document.getElementById("precio-maximo");
const botonLimpiar = document.getElementById("limpiar-filtros");

const categorias = document.querySelectorAll(".boton-categoria");
const eventos = document.querySelectorAll('input[name="evento"]');

const listaPedido = document.getElementById("lista-pedido");
const cantidadPedido = document.getElementById("cantidad-pedido");
const importeTotal = document.getElementById("importe-total");
const cantidadCategoria = document.getElementById("cantidad-categoria");

// Categoría seleccionada actualmente.
let categoriaSeleccionada = "todas";

// Productos agregados al pedido.
// Cada elemento tendrá el id del producto y la cantidad elegida.
let pedido = JSON.parse(localStorage.getItem("pedidoMola")) || [];


// Formatea un importe como moneda argentina.
function formatearPrecio(precio) {
    return precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2
    });
}


// Busca un producto a partir de su identificador.
function buscarProductoPorId(id) {
    return productos.find(producto => producto.id === Number(id));
}


// Guarda el pedido en el almacenamiento del navegador.
function guardarPedido() {
    localStorage.setItem("pedidoMola", JSON.stringify(pedido));
}


function crearTarjeta(producto) {
    const tarjeta = document.createElement("article");

    tarjeta.classList.add("tarjeta-producto");

    tarjeta.innerHTML = `
        <input
            type="checkbox"
            id="toggle-desc-${producto.id}"
            class="check-detalle"
        >

        <div class="vista-normal">

            <div class="contenedor-imagen-producto">

                <img
                    src="${producto.imagen}"
                    alt="${producto.alt}"
                    class="imagen-producto"
                >

                <p class="etiqueta-producto">
                    ${producto.etiqueta}
                </p>

            </div>

            <div class="informacion-producto">

                <h2 class="nombre-producto">
                    ${producto.nombre}
                </h2>

                <label
                    for="toggle-desc-${producto.id}"
                    class="btn-ver-detalle"
                >
                    Ver descripción completa
                </label>

                <p class="precio-producto">
                    ${formatearPrecio(producto.precio)}
                    <span class="unidad-producto">por unidad</span>
                </p>

                <div class="controles-producto">

                    <p class="stock-productos">
                        Stock disponible: ${producto.stock} unidades
                    </p>

                    <div class="selector-cantidad">

                        <button
                            type="button"
                            class="boton-cantidad"
                            data-accion="disminuir"
                            data-id="${producto.id}"
                            aria-label="Disminuir cantidad de ${producto.etiqueta}"
                        >
                            −
                        </button>

                        <span
                            class="numero-cantidad"
                            id="cantidad-${producto.id}"
                            aria-live="polite"
                        >
                            1
                        </span>

                        <button
                            type="button"
                            class="boton-cantidad"
                            data-accion="aumentar"
                            data-id="${producto.id}"
                            aria-label="Aumentar cantidad de ${producto.etiqueta}"
                        >
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="boton-agregar"
                        data-id="${producto.id}"
                    >
                        Agregar al pedido
                    </button>

                </div>

            </div>

        </div>

        <div class="vista-detalle">

            <div class="contenido-detalle">

                <h3>Detalle del producto</h3>

                <p><strong>Descripción:</strong></p>

                <p>${producto.descripcion}</p>

                <p><strong>Incluye:</strong></p>

                <ul>
                    ${producto.incluye.map(elemento => `
                        <li>${elemento}</li>
                    `).join("")}
                </ul>

                <p><strong>No incluye:</strong></p>

                <ul>
                    ${producto.noIncluye.map(elemento => `
                        <li>${elemento}</li>
                    `).join("")}
                </ul>

            </div>

            <label
                for="toggle-desc-${producto.id}"
                class="btn-cerrar-detalle"
            >
                Volver
            </label>

        </div>
    `;

    return tarjeta;
}


function mostrarProductos(listaProductos) {
    grillaProductos.innerHTML = "";

    if (listaProductos.length === 0) {
        grillaProductos.innerHTML = `
            <p class="mensaje-sin-productos">
                No se encontraron productos con los filtros seleccionados.
            </p>
        `;

        return;
    }

    listaProductos.forEach(producto => {
        const tarjeta = crearTarjeta(producto);

        grillaProductos.appendChild(tarjeta);
    });
}


function filtrarProductos() {
    const textoBusqueda = campoBusqueda.value
        .trim()
        .toLowerCase();

    const minimo = precioMinimo.value === ""
        ? 0
        : Number(precioMinimo.value);

    const maximo = precioMaximo.value === ""
        ? Infinity
        : Number(precioMaximo.value);

    const eventosSeleccionados = Array.from(eventos)
        .filter(evento => evento.checked)
        .map(evento => evento.value);

    const productosFiltrados = productos.filter(producto => {

        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(textoBusqueda);

        const coincideCategoria =
            categoriaSeleccionada === "todas" ||
            producto.categoria === categoriaSeleccionada;

        const coincidePrecio =
            producto.precio >= minimo &&
            producto.precio <= maximo;

        const coincideEvento =
            eventosSeleccionados.length === 0 ||
            eventosSeleccionados.some(evento =>
                producto.eventos.includes(evento)
            );

        return (
            coincideBusqueda &&
            coincideCategoria &&
            coincidePrecio &&
            coincideEvento
        );
    });

    mostrarProductos(productosFiltrados);
}


function cambiarCantidad(id, accion) {
    const producto = buscarProductoPorId(id);
    const elementoCantidad = document.getElementById(`cantidad-${id}`);

    if (!producto || !elementoCantidad) {
        return;
    }

    let cantidad = Number(elementoCantidad.textContent);

    if (accion === "aumentar" && cantidad < producto.stock) {
        cantidad++;
    }

    if (accion === "disminuir" && cantidad > 1) {
        cantidad--;
    }

    elementoCantidad.textContent = cantidad;
}

function agregarAlPedido(id) {
    const producto = buscarProductoPorId(id);
    const elementoCantidad = document.getElementById(`cantidad-${id}`);

    if (!producto || !elementoCantidad) {
        return;
    }

    const cantidadSeleccionada = Number(elementoCantidad.textContent);

    const productoExistente = pedido.find(
        item => item.id === producto.id
    );

    const cantidadActual = productoExistente
        ? productoExistente.cantidad
        : 0;

    if (cantidadActual + cantidadSeleccionada > producto.stock) {
        alert(
            `Solo hay ${producto.stock} unidades disponibles de ${producto.etiqueta}.`
        );

        return;
    }

    if (productoExistente) {
        productoExistente.cantidad += cantidadSeleccionada;
    } else {
        pedido.push({
            id: producto.id,
            cantidad: cantidadSeleccionada
        });
    }

    guardarPedido();
    mostrarPedido();

    alert(`${producto.etiqueta} se agregó al pedido.`);
}


function mostrarPedido() {
    listaPedido.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;

    // Elimina del pedido los productos que ya no existen en los datos.
    pedido = pedido.filter(item => buscarProductoPorId(item.id));

    pedido.forEach(item => {
        const producto = buscarProductoPorId(item.id);

        if (!producto) {
            return;
        }

        const subtotal = producto.precio * item.cantidad;

        total += subtotal;
        cantidadTotal += item.cantidad;

        const elemento = document.createElement("li");

        elemento.classList.add("producto-pedido");

        elemento.innerHTML = `
            <img
                src="${producto.imagen}"
                alt="${producto.alt}"
                class="imagen-pedido"
            >

            <div class="detalle-pedido">

                <h3 class="nombre-pedido">
                    ${producto.etiqueta}
                </h3>

                <p class="cantidad-producto-pedido">
                    ${item.cantidad} unidades
                </p>

                <p class="precio-producto-pedido">
                    ${formatearPrecio(subtotal)}
                </p>

            </div>

            <button
                type="button"
                class="boton-eliminar"
                data-eliminar="${producto.id}"
                aria-label="Eliminar ${producto.etiqueta} del pedido"
            >
                ×
            </button>
        `;

        listaPedido.appendChild(elemento);
    });

    cantidadPedido.textContent = cantidadTotal;
    importeTotal.textContent = formatearPrecio(total);

    guardarPedido();
}


grillaProductos.addEventListener("click", evento => {

    const botonCantidad = evento.target.closest(".boton-cantidad");

    if (botonCantidad) {
        cambiarCantidad(
            botonCantidad.dataset.id,
            botonCantidad.dataset.accion
        );

        return;
    }

    const botonAgregar = evento.target.closest(".boton-agregar");

    if (botonAgregar) {
        agregarAlPedido(botonAgregar.dataset.id);
    }
});


listaPedido.addEventListener("click", evento => {

    const botonEliminar = evento.target.closest("[data-eliminar]");

    if (!botonEliminar) {
        return;
    }

    const id = Number(botonEliminar.dataset.eliminar);

    pedido = pedido.filter(item => item.id !== id);

    guardarPedido();
    mostrarPedido();
});


// Buscar por nombre.
campoBusqueda.addEventListener("input", filtrarProductos);

// Filtrar por precio.
precioMinimo.addEventListener("input", filtrarProductos);
precioMaximo.addEventListener("input", filtrarProductos);

// Filtrar por tipo de evento.
eventos.forEach(evento => {
    evento.addEventListener("change", filtrarProductos);
});

// Filtrar por categoría.
categorias.forEach(categoria => {

    categoria.addEventListener("click", evento => {
        evento.preventDefault();

        categoriaSeleccionada = categoria.dataset.categoria;

        categorias.forEach(enlace => {
            enlace.classList.remove("categoria-activa");
        });

        categoria.classList.add("categoria-activa");

        filtrarProductos();
    });
});


botonLimpiar.addEventListener("click", () => {

    campoBusqueda.value = "";
    precioMinimo.value = "";
    precioMaximo.value = "";

    eventos.forEach(evento => {
        evento.checked = false;
    });

    categoriaSeleccionada = "todas";

    categorias.forEach(categoria => {
        categoria.classList.remove("categoria-activa");
    });

    document.querySelector(
        '[data-categoria="todas"]'
    ).classList.add("categoria-activa");

    filtrarProductos();
});


cantidadCategoria.textContent = productos.length;

filtrarProductos();
mostrarPedido();
