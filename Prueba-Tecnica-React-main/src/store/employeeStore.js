import create from "zustand";
import api from "../api/api";

const useEmployeeStore = create((set) => ({
  employees: [],

  fetchEmployees: async () => {
    try {
      const response = await api.get("/empleados/list");
      set({ employees: response.data });
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  },

  addEmployee: async (employee) => {
    try {
      const response = await api.post("/empleados/create", employee);
      set((state) => ({ employees: [...state.employees, response.data] }));
      return { success: true, message: "Empleado agregado correctamente." };
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al agregar el empleado.",
      };
    }
  },

  updateEmployee: async (id, updatedEmployee) => {
    try {
      await api.put(`/empleados/update/${id}`, updatedEmployee);
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? { ...emp, ...updatedEmployee } : emp
        ),
      }));
      return { success: true, message: "Empleado actualizado correctamente." };
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al actualizar el empleado.",
      };
    }
  },
  
  

  deleteEmployee: async (id) => {
    try {
      await api.delete(`/empleados/delete/${id}`);
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
      }));
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  },
}));

export default useEmployeeStore;
