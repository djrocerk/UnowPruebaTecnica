import React from "react";
import { Button, Table } from "react-bootstrap";

const EmployeeList = ({ employees, onDelete, onEdit }) => {

  console.log("Lista de empleados:", employees);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Fecha de Nacimiento</th>
          <th>Puesto</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee, index) => {
          console.log("Empleado:", employee); 
          return (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td>{employee.nombre}</td>
              <td>{employee.apellido}</td>
              <td>{employee.fecha_nacimiento}</td>
              <td>{employee.puesto_trabajo}</td>
              <td>{employee.email || "No disponible"}</td>
              <td>
              <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(employee)}
                >
                  Editar
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(employee.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default EmployeeList;
