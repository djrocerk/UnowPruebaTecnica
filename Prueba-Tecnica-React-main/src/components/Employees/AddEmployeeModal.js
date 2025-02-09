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

const AddEmployeeModal = ({ show, handleClose, onAdd }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [puestoTrabajo, setPuestoTrabajo] = useState("");
  const [email, setEmail] = useState("");
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await getPositions();
        console.log("Positions received:", data);
        setPositions(data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Error al obtener los puestos de trabajo.");
      }
    };
    fetchPositions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0]; 

    if (!nombre || !apellido || !fechaNacimiento || !puestoTrabajo || !email) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    if (fechaNacimiento > today) {
      toast.error("La fecha de nacimiento no puede ser futura.");
      return;
    }

    try {
      const result = await onAdd({
        nombre,
        apellido,
        fecha_nacimiento: fechaNacimiento,
        puesto_trabajo: puestoTrabajo,
        email,
      });

      if (result.success) {
        toast.success(result.message || "Empleado agregado correctamente.");
        setTimeout(() => {
          handleClose();
          window.location.reload();
        }, 1000);
      } else {
        toast.error(
          result.message ||
            "Error: El correo ya existe o hubo un problema con el servidor."
        );
      }
    } catch (error) {
      console.error("Error al agregar empleado:", error);
    }
  };

  return (
    <Dialog open={show} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Agregar Empleado</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Fecha de Nacimiento"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split("T")[0], 
              }}
            />
            <FormControl margin="normal" required fullWidth>
              <InputLabel id="puesto-trabajo-label">
                Puesto de Trabajo
              </InputLabel>
              <Select
                labelId="puesto-trabajo-label"
                label="Puesto de Trabajo"
                value={puestoTrabajo}
                onChange={(e) => setPuestoTrabajo(e.target.value)}
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
              label="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEmployeeModal;
