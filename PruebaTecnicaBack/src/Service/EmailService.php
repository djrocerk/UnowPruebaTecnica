<?php
namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Psr\Log\LoggerInterface;

class EmailService
{
    private MailerInterface $mailer;
    private Environment $twig;
    private LoggerInterface $logger;

    public function __construct(MailerInterface $mailer, Environment $twig, LoggerInterface $logger)
    {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->logger = $logger;
    }

    public function sendWelcomeEmail(string $email, string $nombre, string $apellido): bool
    {
        try {
            $this->logger->info("📩 Intentando enviar un correo a: $email");

            $subject = "¡Bienvenido al sistema!";
            
            $htmlContent = $this->twig->render('emails/welcome.html.twig', [
                'nombre' => $nombre,
                'apellido' => $apellido
            ]);

            $emailMessage = (new Email())
                ->from('pruebatecnica <pruebatecnica709@gmail.com>') // Asegúrate de usar un correo válido
                ->to($email)
                ->subject($subject)
                ->html($htmlContent);

            $this->mailer->send($emailMessage);
            $this->logger->info("✅ Correo enviado con éxito a $email");

            return true;
        } catch (\Exception $e) {
            $this->logger->error("❌ Error al enviar el correo: " . $e->getMessage());
            return false;
        }
    }
}

?>
