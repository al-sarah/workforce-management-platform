using MassTransit;
using MongoDB.Driver;
using WFM.Infrastructure.Persistence.MongoDB;
using WFM.Worker1.Consumers;
using WFM.Worker1;

var builder = Host.CreateApplicationBuilder(args);

// ─── MongoDB ─────────────────────────────────────────────────
builder.Services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(builder.Configuration.GetConnectionString("MongoDB")));

builder.Services.AddSingleton<MongoDbContext>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var dbName = builder.Configuration["MongoDB:DatabaseName"] ?? "wfm_db";
    return new MongoDbContext(client, dbName);
});

// ─── MassTransit + RabbitMQ ──────────────────────────────────
builder.Services.AddMassTransit(x =>
{
    // Register all consumers
    x.AddConsumer<EmployeeEventConsumer>();
    x.AddConsumer<LeaveRequestEventConsumer>();
    x.AddConsumer<ProjectEventConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"] ?? "localhost", h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMQ:Password"] ?? "guest");
        });

        // Configure retry policy — handles transient failures
        cfg.UseMessageRetry(r => r.Intervals(
            TimeSpan.FromSeconds(5),
            TimeSpan.FromSeconds(15),
            TimeSpan.FromSeconds(30)
        ));

        cfg.ConfigureEndpoints(context);
    });
});

// ─── Health check via heartbeat log ──────────────────────────
builder.Services.AddHostedService<HealthHeartbeatService>();

var host = builder.Build();
host.Run();
