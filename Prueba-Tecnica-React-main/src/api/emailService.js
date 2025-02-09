import axios from "axios";

const sendWelcomeEmail = async (recipient, nombre, apellido) => {
  const API_URL = "http://localhost:8001/api/send-email";

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No hay token disponible. El usuario no está autenticado.");
      return { success: false, message: "No autorizado. Inicia sesión primero." };
    }

    // Configurar los headers con el token de autenticación
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      API_URL,
      {
        recipient: recipient,
        subject: "¡Bienvenido al Equipo!",
        message: `Hola ${nombre}, bienvenido a la empresa. Estamos felices de tenerte en nuestro equipo.`,
        nombre: nombre,
        apellido: apellido,
      },
      config 
    );

    console.log("✅ Correo enviado correctamente:", response.data.message);
    return { success: true, message: "Correo de bienvenida enviado correctamente." };
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error.response?.data?.message || error.message);
    return { success: false, message: "Error al enviar el correo de bienvenida." };
  }
};

export default sendWelcomeEmail;
