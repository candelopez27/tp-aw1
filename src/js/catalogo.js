// =====================================================
// CATALOGO.JS — MOLA EVENTOS
// Renderizado de productos y eventos del catálogo
// =====================================================

import { productos } from "./datos/productos.js";

// =====================================================
// 1. ELEMENTOS DEL HTML
// =====================================================

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

// =====================================================
// 2. ESTADO DEL CATÁLOGO
// =====================================================

// Categoría seleccionada actualmente.
let categoriaSeleccionada = "todas";

// Productos agregados al pedido.
// Cada elemento tendrá el id del producto y la cantidad elegida.
let pedido = JSON.parse(localStorage.getItem("pedidoMola")) || [];


// =====================================================
// 3. FUNCIONES AUXILIARES
// =====================================================

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


// =====================================================
// 4. GENERAR UNA TARJETA DE PRODUCTO
// =====================================================

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


// =====================================================
// 5. RENDERIZAR EL CATÁLOGO
// =====================================================

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


// =====================================================
// 6. FILTRAR PRODUCTOS
// =====================================================

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


// =====================================================
// 7. CAMBIAR LA CANTIDAD SELECCIONADA
// =====================================================

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

