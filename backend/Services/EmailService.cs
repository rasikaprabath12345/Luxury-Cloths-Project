using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _configuration["Smtp:Host"];
            var portStr = _configuration["Smtp:Port"];
            var enableSslStr = _configuration["Smtp:EnableSsl"];
            var username = _configuration["Smtp:Username"];
            var password = _configuration["Smtp:Password"];
            var fromEmail = _configuration["Smtp:FromEmail"] ?? "no-reply@luxury.lk";

            // If credentials are not configured, fallback to console log
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                _logger.LogInformation("=== SMTP DUMMY EMAIL SERVICE ===");
                _logger.LogInformation("To: {ToEmail}", toEmail);
                _logger.LogInformation("Subject: {Subject}", subject);
                _logger.LogInformation("Body:\n{Body}", body);
                _logger.LogInformation("================================");
                
                // Print to console directly as well for instant developer visibility
                Console.WriteLine("\n=============================================");
                Console.WriteLine($"[EMAIL FALLBACK LOGGER] To: {toEmail}");
                Console.WriteLine($"[EMAIL FALLBACK LOGGER] Subject: {subject}");
                Console.WriteLine($"[EMAIL FALLBACK LOGGER] Body:\n{body}");
                Console.WriteLine("=============================================\n");

                return true;
            }

            try
            {
                int port = int.TryParse(portStr, out var p) ? p : 587;
                bool enableSsl = !bool.TryParse(enableSslStr, out var ssl) || ssl;

                using (var client = new SmtpClient(host, port))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(username, password);
                    client.EnableSsl = enableSsl;

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(fromEmail, "Luxury Store"),
                        Subject = subject
                    };
                    mailMessage.To.Add(toEmail);

                    // HTML code එකෙන් plain-text එකක් සකසා ගැනීම (HTML tags ඉවත් කිරීම)
                    string plainText = System.Text.RegularExpressions.Regex.Replace(body, "<.*?>", string.Empty).Trim();

                    // HTML සහ Plain Text views දෙකම ඊමේල් එකට සම්බන්ධ කිරීම (MIME structure)
                    var plainView = AlternateView.CreateAlternateViewFromString(plainText, null, "text/plain");
                    var htmlView = AlternateView.CreateAlternateViewFromString(body, null, "text/html");

                    mailMessage.AlternateViews.Add(plainView);
                    mailMessage.AlternateViews.Add(htmlView);

                    await client.SendMailAsync(mailMessage);
                }

                _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {ToEmail}", toEmail);
                
                // Fallback print on real send fail
                Console.WriteLine($"\n[EMAIL SEND FAILED - FALLBACK] To: {toEmail}, Body: {body}\n");
                return false;
            }
        }
    }
}
