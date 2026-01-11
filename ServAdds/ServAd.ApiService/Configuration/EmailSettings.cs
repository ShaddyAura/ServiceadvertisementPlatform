using System.ComponentModel.DataAnnotations;

namespace ServAd.ApiService.Configuration
{
    public class EmailSettings
    {
        [Required, EmailAddress]
        public string SenderEmail { get; set; } = null!;

        [Required]
        public string SenderName { get; set; } = null!;

        [Required]
        public string SmtpServer { get; set; } = null!;

        [Range(1, 65535)]
        public int SmtpPort { get; set; }

        public bool EnableSSL { get; set; } = true;

        [Required]
        public string SmtpUser { get; set; } = null!;

        [Required]
        public string SmtpPass { get; set; } = null!;
    }
}
