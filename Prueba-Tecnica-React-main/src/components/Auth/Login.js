import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Auth.css"; 
import { Spinner, Alert, Button, Form, Container, Row, Col } from "react-bootstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); 

    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.token;

      localStorage.setItem("token", token);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Correo o contraseña incorrectos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} className="shadow p-4 rounded bg-white">
          <h2 className="text-center mb-4">Iniciar Sesión</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : "Iniciar Sesión"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <span>¿No tienes cuenta?</span>
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate("/register")}
            >
              Regístrate aquí
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
