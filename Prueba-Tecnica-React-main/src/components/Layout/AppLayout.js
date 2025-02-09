import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AddEmployeeModal from "../Employees/AddEmployeeModal";
import EditEmployeeModal from "../Employees/EditEmployeeModal";
import EmployeeList from "../Employees/EmployeeList";
import useEmployeeStore from "../../store/employeeStore";
import { AuthContext } from "../../context/AuthContext";
import sendWelcomeEmail from "../../api/emailService";
import toast, { Toaster } from "react-hot-toast";

const COLORS = [
  "#4CAF50",
  "#FF9800",
  "#2196F3",
  "#9C27B0",
  "#FFEB3B",
  "#795548",
  "#00BCD4",
];

const AppLayout = () => {
  const { logout } = useContext(AuthContext);
  const {
    employees,
    fetchEmployees,
    deleteEmployee,
    addEmployee,
    updateEmployee,
  } = useEmployeeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (employee) => {
    const result = await addEmployee(employee);
    if (result.success) {
      toast.success(result.message);
      const emailResult = await sendWelcomeEmail(
        employee.email,
        employee.nombre,
        employee.apellido
      );
      if (!emailResult.success) {
        toast.error(emailResult.message);
      } else {
        toast.success("Empleado agregado y correo enviado correctamente.");
      }
      fetchEmployees();
      setShowAddModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditEmployee = async (id, updatedData) => {
    const result = await updateEmployee(id, updatedData);
    if (result.success) {
      toast.success(result.message);
      fetchEmployees();
      setShowEditModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete);
      toast.success("Empleado eliminado correctamente.");
      setOpenDeleteModal(false);
    }
  };

  const jobTypeCounts = employees.reduce((acc, employee) => {
    const puesto = employee.puesto_trabajo || "Desconocido";
    acc[puesto] = (acc[puesto] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(jobTypeCounts).map(([puesto, count]) => ({
    puesto,
    count,
  }));

  console.log("Datos para la gráfica:", chartData);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Empleados
          </Typography>
          <Button variant="contained" color="error" onClick={logout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              align="center"
              style={{ fontWeight: "bold" }}
            >
              Lista de Empleados
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowAddModal(true)}
            >
              Agregar Empleado
            </Button>
          </Grid>
          <Grid item xs={12}>
            <EmployeeList
              employees={employees}
              onDelete={(id) => {
                setEmployeeToDelete(id);
                setOpenDeleteModal(true);
              }}
              onEdit={(employee) => {
                setSelectedEmployee(employee);
                setShowEditModal(true);
              }}
            />
          </Grid>

          {/* Gráfica de puestos de trabajo */}
          <Grid item xs={12} sx={{ pb: 4 }}>
            <Typography
              variant="h5"
              align="center"
              sx={{ mt: 4, mb: 3, fontWeight: "bold" }}
            >
              Distribución de Puestos de Trabajo
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <XAxis
                  dataKey="puesto"
                  stroke="#333"
                  textAnchor="middle"
                  tick={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "Roboto, Arial, sans-serif",
                    fill: "#333",
                  }}
                />

                <YAxis
                  tickCount={10}
                  allowDecimals={false}
                  interval={0}
                  domain={[0, "dataMax"]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, "Cantidad"]}
                  contentStyle={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Cantidad"
                  barSize={45}
                  radius={[5, 5, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Container>

      <AddEmployeeModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onAdd={handleAddEmployee}
      />
      <EditEmployeeModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        employee={selectedEmployee}
        onUpdate={handleEditEmployee}
      />

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este empleado?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteEmployee} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Toaster position="bottom-right" reverseOrder={false} />
      </Box>
    </>
  );
};

export default AppLayout;
