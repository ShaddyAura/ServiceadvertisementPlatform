using System;
using System.Net.Mail;
using System.Threading.Tasks;
using FluentEmail.Core;

namespace ServAd.ApiService.Services.Email
{
    public class EmailService
    {
        private readonly IFluentEmail _fluentEmail;

        public EmailService(IFluentEmail fluentEmail)
        {
            _fluentEmail = fluentEmail;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(to) || !to.Contains("@"))
                throw new FormatException($"Invalid email address: '{to}'");

            try
            {
                var response = await _fluentEmail
                    .To(to.Trim())
                    .Subject(subject)
                    .Body(body, true)
                    .SendAsync();

                if (!response.Successful)
                {
                    var errors = string.Join(", ", response.ErrorMessages);
                    throw new Exception($"Email sending failed: {errors}");
                }
            }
            catch (SmtpException smtpEx)
            {
                throw new Exception($"SMTP Error: {smtpEx.Message}", smtpEx);
            }
            catch (Exception ex)
            {
                throw new Exception($"Unexpected error while sending email: {ex.Message}", ex);
            }
        }
    }
}
