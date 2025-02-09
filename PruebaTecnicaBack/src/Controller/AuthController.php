<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthController extends AbstractController
{
    /**
     * @Route("/api/register", name="api_register", methods={"POST"})
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['message' => 'Faltan datos en la solicitud'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $existingUser = $this->getDoctrine()->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['message' => 'El correo electrónico ya está registrado'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($data['email']);
        
        $user->setPassword($passwordEncoder->encodePassword($user, $data['password']));

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse([
            'user' => [
                'email' => $user->getEmail(),
            ],
            'message' => 'Usuario registrado exitosamente',
        ]);
    }

    /**
     * @Route("/api/login", name="api_login", methods={"POST"})
     */
    public function login(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['message' => 'Faltan datos en la solicitud'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || !password_verify($data['password'], $user->getPassword())) {
            return new JsonResponse(['message' => 'Credenciales inválidas'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $token = $jwtManager->create($user);

        return new JsonResponse([
            'user' => [
                'email' => $user->getEmail(),
            ],
            'token' => $token,
        ]);
    }
}
