<?php

namespace App\Controller;

use App\Entity\Empleado;
use App\Entity\User;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

/**
 * @Route("/api/empleados", name="empleados_")
 */
class EmpleadoController extends AbstractController
{
    private $entityManager;
    private $tokenStorage;
    private $jwtManager;
    private $emailService;

    public function __construct(EntityManagerInterface $entityManager, TokenStorageInterface $tokenStorage, JWTTokenManagerInterface $jwtManager, EmailService $emailService)
    {
        $this->entityManager = $entityManager;
        $this->tokenStorage = $tokenStorage;
        $this->jwtManager = $jwtManager;
        $this->emailService = $emailService;
    }

    /**
     * @Route("/create", name="create", methods={"POST"})
     */
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['nombre'], $data['apellido'], $data['fecha_nacimiento'], $data['puesto_trabajo'], $data['email'])) {
            return new JsonResponse(['message' => 'Faltan datos en la solicitud'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $existingEmail = $this->entityManager->getRepository(Empleado::class)->findOneBy(['email' => $data['email']]);
        if ($existingEmail) {
            return new JsonResponse(['message' => 'El email ya está en uso'], JsonResponse::HTTP_CONFLICT);
        }

        $empleado = new Empleado();
        $empleado->setNombre($data['nombre']);
        $empleado->setApellido($data['apellido']);
        $empleado->setFechaNacimiento(new \DateTime($data['fecha_nacimiento']));
        $empleado->setPuestoTrabajo($data['puesto_trabajo']);
        $empleado->setEmail($data['email']);  

        $empleado->setUsuario($user); 

        $this->entityManager->persist($empleado);
        $this->entityManager->flush();

        $this->emailService->sendWelcomeEmail($data['email'], $empleado->getNombre(), $empleado->getApellido());


        return new JsonResponse([
            'message' => 'Empleado creado exitosamente, hemos enviado un correo de bienvenida',
            'empleado' => [
                'nombre' => $empleado->getNombre(),
                'apellido' => $empleado->getApellido(),
                'fecha_nacimiento' => $empleado->getFechaNacimiento()->format('Y-m-d'),
                'puesto_trabajo' => $empleado->getPuestoTrabajo(),
                'usuario' => $empleado->getUsuario()->getUsername(),
                'email' => $empleado->getEmail(),  
            ]
        ], JsonResponse::HTTP_CREATED);
    }

    /**
     * @Route("/list", name="list", methods={"GET"})
     */
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $empleados = $this->entityManager->getRepository(Empleado::class)->findBy(['usuario' => $user]);

        $empleadosData = [];
        foreach ($empleados as $empleado) {
            $empleadosData[] = [
                'id' => $empleado->getId(),
                'nombre' => $empleado->getNombre(),
                'apellido' => $empleado->getApellido(),
                'fecha_nacimiento' => $empleado->getFechaNacimiento()->format('Y-m-d'),
                'puesto_trabajo' => $empleado->getPuestoTrabajo(),
                'email' => $empleado->getEmail(),
            ];
        }

        return new JsonResponse($empleadosData);
    }

    /**
     * @Route("/update/{id}", name="update", methods={"PUT"})
     */
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $empleado = $this->entityManager->getRepository(Empleado::class)->find($id);
        if (!$empleado || $empleado->getUsuario() !== $user) {
            return new JsonResponse(['message' => 'Empleado no encontrado o no autorizado'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $empleado->setNombre($data['nombre']);
        if (isset($data['apellido'])) $empleado->setApellido($data['apellido']);
        if (isset($data['fecha_nacimiento'])) $empleado->setFechaNacimiento(new \DateTime($data['fecha_nacimiento']));
        if (isset($data['puesto_trabajo'])) $empleado->setPuestoTrabajo($data['puesto_trabajo']);

        if (isset($data['email'])) {
            $existingEmail = $this->entityManager->getRepository(Empleado::class)->findOneBy(['email' => $data['email']]);
            if ($existingEmail && $existingEmail->getId() !== $empleado->getId()) {
                return new JsonResponse(['message' => 'El email ya está en uso'], JsonResponse::HTTP_CONFLICT);
            }
            $empleado->setEmail($data['email']);
        }

        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Empleado actualizado exitosamente']);
    }

    /**
     * @Route("/delete/{id}", name="delete", methods={"DELETE"})
     */
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'No autorizado'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $empleado = $this->entityManager->getRepository(Empleado::class)->find($id);
        if (!$empleado || $empleado->getUsuario() !== $user) {
            return new JsonResponse(['message' => 'Empleado no encontrado o no autorizado'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($empleado);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Empleado eliminado exitosamente']);
    }
}
