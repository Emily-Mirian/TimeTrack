using System.Net;
using System.Net.Mail;

namespace PontoOnline.mvc.Services;

public class EmailSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "TimeTrack";

    public bool Configurado =>
        !string.IsNullOrWhiteSpace(Host) &&
        !string.IsNullOrWhiteSpace(User) &&
        !string.IsNullOrWhiteSpace(Password);
}

public class EmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _settings = configuration.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings();
        _logger = logger;
    }

    public bool Configurado => _settings.Configurado;

    public async Task<bool> EnviarAsync(string destinatario, string assunto, string corpoHtml)
    {
        if (!_settings.Configurado)
        {
            _logger.LogWarning("E-mail não enviado: seção 'Email' não configurada (Host/User/Password).");
            return false;
        }

        if (string.IsNullOrWhiteSpace(destinatario)) return false;

        try
        {
            using var client = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = _settings.EnableSsl,
                Credentials = new NetworkCredential(_settings.User, _settings.Password),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 15000
            };

            var remetente = string.IsNullOrWhiteSpace(_settings.FromAddress) ? _settings.User : _settings.FromAddress;
            using var mensagem = new MailMessage
            {
                From = new MailAddress(remetente, _settings.FromName),
                Subject = assunto,
                Body = corpoHtml,
                IsBodyHtml = true
            };
            mensagem.To.Add(destinatario);

            await client.SendMailAsync(mensagem);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar e-mail para {Destinatario}", destinatario);
            return false;
        }
    }
}
