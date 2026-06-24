import React from 'react';
import Header from "../componentes/Header";
import { FaArrowCircleRight } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";

const soporte = () => {
  return (
    <div className='bg-gray-100'> 
        <Header/>
        <div className="min-h-screen flex items-center justify-center p-2">
            <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg grid grid-cols-1 lg:grid-cols-2">

                {/* --- Sección de Información de Contacto (Izquierda) --- */}
                <div className="p-6 sm:p-12 flex flex-col text-left bg-gray-50 rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
                <p className="mt-6 text-gray-800 text-sm">Estamos aqui para ayudarte</p>
                <p style={{ color: "#9188DE" }} className="text-3xl sm:text-4xl leading-tight">
                    <span style={{ color: "#9188DE" }} className="font-bold">Comunícate</span> con nosotros para ayudarte a <span style={{ color: "#9188DE" }} className="font-bold">solucionar</span> el <span style={{ color: "#9188DE" }} className="font-bold">problema</span>
                </p>

                <p className="mt-6 text-gray-600 text-sm">
                    ¿Buscas una solución para algún error dentro de la aplicación? Contáctanos
                </p>

                <div className="mt-10 space-y-4">
                    {/* Email */}
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <IoIosMail style={{ color: "#8539A3" }} size={26}/>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Correo electrónico</p>
                            <a href="mailto:amukanchile.oficial@gmail.com" className="text-purple-700 font-semibold">amukanchile.oficial@gmail.com</a>
                        </div>
                    </div>

                    {/* Teléfono 
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <FaPhoneAlt style={{ color: "#8539A3" }} size={26}/>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Número de teléfono</p>
                            <a href="tel:+56994883017" className="text-gray-700 font-semibold">+56 9 948 830 17</a>
                        </div>
                    </div>
                    */}
                </div>
                </div>
                {/* --- Fin Sección de Información --- */}

                {/* --- Sección del Formulario (Derecha) --- */}
                <div className="p-8 sm:p-12 lg:p-16 text-left">
                <form className="space-y-6">

                    {/* Campo Nombre */}
                    <div>
                    <label htmlFor="nombre" style={{ color: "#9188DE" }} className="block text-sm text-gray-800 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Amukan Chile"
                        className="w-full p-1 border border-transparent rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    </div>

                    {/* Campo Correo electrónico */}
                    <div>
                    <label htmlFor="email" style={{ color: "#9188DE" }} className="block text-sm text-gray-700 mb-1">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="amukan@dominio.com"
                        className="w-full p-1 border border-transparent rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    </div>

                    {/* Campo Empresa (Select) */}
                    <div>
                    <label htmlFor="empresa" style={{ color: "#9188DE" }} className="block text-sm text-gray-700 mb-1">
                        Empresa
                    </label>
                    <div className="relative">
                        <select
                        id="empresa"
                        name="empresa"
                        style={{ color: "#9188DE" }}
                        className="w-full p-1 appearance-none border border-transparent rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-500"
                        defaultValue=""
                        >
                        <option value="" disabled hidden>Selecciona...</option>
                        <option>Empresa A</option>
                        <option>Empresa B</option>
                        <option>Empresa C</option>
                        </select>
                        {/* Ícono de la flecha del select para replicar el diseño */}
                        <div style={{ color: "#9188DE" }} className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15 9.707l-1.414-1.414L10 12.286 6.414 8.293 5 9.707l4.293 4.243z"/></svg>
                        </div>
                    </div>
                    </div>

                    {/* Campo Mensaje */}
                    <div>
                    <label htmlFor="mensaje" style={{ color: "#9188DE" }} className="block text-sm text-gray-700 mb-1">
                        Mensaje
                    </label>
                    <textarea
                        id="mensaje"
                        name="mensaje"
                        rows="4"
                        placeholder="Escriba su mensaje"
                        className="w-full p-1 border border-transparent rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    </div>

                    {/* Botón de Envío */}
                    <button
                        type="submit"
                        className="flex items-center justify-left space-x-3 boton-soporte"
                        >
                        <FaArrowCircleRight size={26}/>
                        <span>Enviar</span>
                    </button>
                </form>
                </div>
                {/* --- Fin Sección del Formulario --- */}

            </div>
            </div>
    </div>
    
  );
};

export default soporte;