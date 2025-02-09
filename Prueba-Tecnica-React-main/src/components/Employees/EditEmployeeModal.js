import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { getPositions } from "../../api/positionService";
import toast from "react-hot-toast";

const EditEmployeeModal = ({ show, handleClose, employee, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    puesto_trabajo: "",
    email: "",
  });
  const [positions, setPositions] = useState([]);

  // Cargar las posiciones disponibles al montar el componente
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const data = await getPositions();
        setPositions(data);
      } catch (error) {
        console.error("Error al obtener posiciones:", error);
        toast.error("Error al obtener los puestos de trabajo.");
      }
    };
    loadPositions();
  }, []);

  // Actualizar los datos del formulario cuando se recibe el empleado a editar
  useEffect(() => {
    if (employee) {
      setFormData({
        nombre: employee.nombre,
        apellido: employee.apellido,
        fecha_nacimiento: employee.fecha_nacimiento,
        puesto_trabajo: employee.puesto_trabajo,
        email: employee.email,
      });
    }
  }, [employee]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0]; 

    if (!formData.nombre || !formData.apellido || !formData.fecha_nacimiento || !formData.puesto_trabajo || !formData.email) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    if (formData.fecha_nacimiento > today) {
      toast.error("La fecha de nacimiento no puede ser futura.");
      return;
    }

    try {
      await onUpdate(employee.id, formData);
      toast.success("Empleado actualizado correctamente.");
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      toast.error("Error al actualizar empleado. Por favor, intente nuevamente.");
    }
  };

  return (
    <Dialog open={show} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Editar Empleado</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Fecha de Nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split("T")[0], 
              }}
            />
            <FormControl margin="normal" required fullWidth>
              <InputLabel id="puesto-trabajo-label">Puesto de Trabajo</InputLabel>
              <Select
                labelId="puesto-trabajo-label"
                label="Puesto de Trabajo"
                name="puesto_trabajo"
                value={formData.puesto_trabajo}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Seleccione un puesto</em>
                </MenuItem>
                {positions.map((position, index) => (
                  <MenuItem key={index} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditEmployeeModal;
