<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class EmailController extends AbstractController
{
    private EmailService $emailService;
    private LoggerInterface $logger;

    public function __construct(EmailService $emailService, LoggerInterface $logger)
    {
        $this->emailService = $emailService;
        $this->logger = $logger;
    }

    #[Route('/send-email', name: 'send_email', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function sendEmail(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
    
            $this->logger->info('📩 Datos recibidos en /send-email:', $data);
    
            if (!isset($data['recipient']) || !isset($data['nombre']) || !isset($data['apellido'])) {
                $this->logger->error('❌ Faltan datos en la solicitud', $data);
                return new JsonResponse(['message' => 'Faltan datos en la solicitud'], JsonResponse::HTTP_BAD_REQUEST);
            }
    
            $success = $this->emailService->sendWelcomeEmail(
                $data['recipient'],
                $data['nombre'],
                $data['apellido']
            );
    
            if (!$success) {
                throw new \Exception('Error al enviar el correo en EmailService.');
            }
    
            return new JsonResponse(['message' => 'Correo enviado correctamente'], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            $this->logger->error('❌ Error en /send-email: ' . $e->getMessage());
            return new JsonResponse(['message' => 'Error interno del servidor', 'error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
}
