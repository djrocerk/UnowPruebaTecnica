<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AuthControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;
    private $passwordEncoder;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $this->passwordEncoder = static::getContainer()->get(UserPasswordEncoderInterface::class);
    }

    public function testRegisterSuccess(): void
    {
        $this->client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertEquals('Usuario registrado exitosamente', $responseData['message']);
    }

    public function testRegisterWithExistingEmail(): void
    {
        $user = new User();
        $user->setEmail('existing@example.com');
        $user->setPassword($this->passwordEncoder->encodePassword($user, 'Password123!'));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'existing@example.com',
            'password' => 'Password123!',
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_CONFLICT, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('El correo electrónico ya está registrado', $responseData['message']);
    }

    public function testRegisterWithMissingData(): void
    {
        $this->client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Faltan datos en la solicitud', $responseData['message']);
    }

    public function testLoginSuccess(): void
    {
        $user = new User();
        $user->setEmail('login@example.com');
        $user->setPassword($this->passwordEncoder->encodePassword($user, 'Password123!'));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'login@example.com',
            'password' => 'Password123!',
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('token', $responseData);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $this->client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword',
        ]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Credenciales inválidas', $responseData['message']);
    }

    public function testLoginWithMissingData(): void
    {
        $this->client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([]));

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Faltan datos en la solicitud', $responseData['message']);
    }
}
