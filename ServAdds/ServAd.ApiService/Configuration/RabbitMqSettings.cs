namespace ServAd.ApiService.Configuration
{
    public class RabbitMqSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Exchange { get; set; } = string.Empty;
        public string Queue { get; set; } = string.Empty;
        public string RoutingKey { get; set; } = string.Empty;
    }
}