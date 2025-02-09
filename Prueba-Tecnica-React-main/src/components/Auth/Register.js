import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { Spinner, Alert, Button, Form, Container, Row, Col } from "react-bootstrap";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register", { email, password });
      setSuccess("Usuario registrado correctamente. Redirigiendo al login...");
      setTimeout(() => navigate("/login"), 2000); 
    } catch (err) {
      setError("Error al registrar usuario. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} className="shadow p-4 rounded bg-white">
          <h2 className="text-center mb-4">Registrar Usuario</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : "Registrar"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              ¿Ya tienes una cuenta? <a href="/">Inicia sesión aquí</a>
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
