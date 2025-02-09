import React from "react";
import { Button } from "react-bootstrap";

const EmployeeItem = ({ employee, onDelete }) => {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <strong>{employee.nombre} {employee.apellido}</strong> - {employee.puesto_trabajo} - {employee.fecha_nacimiento}
      </div>
      <Button variant="danger" size="sm" onClick={() => onDelete(employee.id)}>
        Eliminar
      </Button>
    </li>
  );
};

export default EmployeeItem;
