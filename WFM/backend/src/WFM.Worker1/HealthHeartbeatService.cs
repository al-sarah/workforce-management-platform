namespace WFM.Worker1;

// Logs a heartbeat every 30 seconds so you can confirm
// the worker is alive in Docker logs
public class HealthHeartbeatService : BackgroundService
{
    private readonly ILogger<HealthHeartbeatService> _logger;

    public HealthHeartbeatService(ILogger<HealthHeartbeatService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation(
                "Worker1 heartbeat — alive at {Time}", DateTimeOffset.UtcNow);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
