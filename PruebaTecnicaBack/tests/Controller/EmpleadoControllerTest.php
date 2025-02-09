<?php

namespace App\Tests\Controller;

use App\Entity\Empleado;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class EmpleadoControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;
    private $passwordEncoder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $this->passwordEncoder = static::getContainer()->get(UserPasswordEncoderInterface::class);

        $this->entityManager->createQuery('DELETE FROM App\Entity\Empleado')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
    }

    private function createAuthenticatedUser(): array
    {
        $user = new User();
        $user->setEmail('testuser@example.com');
        $user->setPassword($this->passwordEncoder->encodePassword($user, 'Password123!'));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'testuser@example.com',
            'password' => 'Password123!'
        ]));

        $response = $this->client->getResponse();
        $data = json_decode($response->getContent(), true);

        return ['user' => $user, 'token' => $data['token']];
    }

    public function testCreateEmpleadoSuccess(): void
    {
        $auth = $this->createAuthenticatedUser();
        $token = $auth['token'];

        $this->client->request('POST', '/api/empleados/create', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $token
        ], json_encode([
            'nombre' => 'Carlos',
            'apellido' => 'López',
            'fecha_nacimiento' => '1990-05-15',
            'puesto_trabajo' => 'Ingeniero',
            'email' => 'carlos@example.com'
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_CREATED, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Empleado creado exitosamente, hemos enviado un correo de bienvenida', $responseData['message']);
    }

    public function testCreateEmpleadoWithExistingEmail(): void
    {
        $auth = $this->createAuthenticatedUser();
        $token = $auth['token'];
        $user = $auth['user'];

        $empleado = new Empleado();
        $empleado->setNombre('Juan');
        $empleado->setApellido('Pérez');
        $empleado->setFechaNacimiento(new \DateTime('1995-04-10'));
        $empleado->setPuestoTrabajo('Desarrollador');
        $empleado->setEmail('juan@example.com');
        $empleado->setUsuario($user);

        $this->entityManager->persist($empleado);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/empleados/create', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $token
        ], json_encode([
            'nombre' => 'Pedro',
            'apellido' => 'García',
            'fecha_nacimiento' => '1992-08-20',
            'puesto_trabajo' => 'Diseñador',
            'email' => 'juan@example.com'
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_CONFLICT, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('El email ya está en uso', $responseData['message']);
    }

    public function testListEmpleados(): void
    {
        $auth = $this->createAuthenticatedUser();
        $token = $auth['token'];
        $user = $auth['user'];

        $empleado = new Empleado();
        $empleado->setNombre('Andrés');
        $empleado->setApellido('Torres');
        $empleado->setFechaNacimiento(new \DateTime('1988-11-30'));
        $empleado->setPuestoTrabajo('Administrador');
        $empleado->setEmail('andres@example.com');
        $empleado->setUsuario($user); 

        $this->entityManager->persist($empleado);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/empleados/list', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $token
        ]);

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertCount(1, $responseData);
        $this->assertEquals('Andrés', $responseData[0]['nombre']);
    }

    public function testUpdateEmpleado(): void
    {
        $auth = $this->createAuthenticatedUser();
        $token = $auth['token'];
        $user = $auth['user'];

        $empleado = new Empleado();
        $empleado->setNombre('María');
        $empleado->setApellido('Gómez');
        $empleado->setFechaNacimiento(new \DateTime('1993-07-22'));
        $empleado->setPuestoTrabajo('Analista');
        $empleado->setEmail('maria@example.com');
        $empleado->setUsuario($user); 

        $this->entityManager->persist($empleado);
        $this->entityManager->flush();

        $this->client->request('PUT', "/api/empleados/update/{$empleado->getId()}", [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Authorization' => 'Bearer ' . $token
        ], json_encode([
            'puesto_trabajo' => 'Gerente'
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());

        $updatedEmpleado = $this->entityManager->getRepository(Empleado::class)->find($empleado->getId());
        $this->assertEquals('Gerente', $updatedEmpleado->getPuestoTrabajo());
    }
}
