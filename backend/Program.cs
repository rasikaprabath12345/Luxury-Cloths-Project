using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore; // නවතම Scalar UI සඳහා

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext එක SQL Server සමඟ Register කිරීම
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. CORS Policy (Frontend සඳහා)
builder.Services.AddCors(options =>
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:3000")
              .AllowCredentials();
    }));

// 3. .NET 9 නිල Native OpenAPI සේවාව සක්‍රිය කිරීම (Swashbuckle වෙනුවට)
builder.Services.AddOpenApi();

// 4. TokenService සහ Controllers
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// 5. Middleware Pipeline (Development පරිසරයේදී පමණක්)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // OpenAPI JSON Document එක සාදයි
    app.MapScalarApiReference(); // ඉතාමත් ආකර්ෂණීය Scalar UI එක ලබා දෙයි
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy"); 
app.UseAuthorization();
app.MapControllers();

app.Run();