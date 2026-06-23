using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // අනිවාර්යයෙන්ම එකතු කරන්න
using Microsoft.IdentityModel.Tokens; // අනිවාර්යයෙන්ම එකතු කරන්න
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext එක SQL Server සමඟ Register කිරීම
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- JWT Authentication එක මෙතන සෙට් කරන්න ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// 2. CORS Policy
builder.Services.AddCors(options =>
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:3000")
              .AllowCredentials();
    }));

// 3. OpenAPI සහ Controllers
builder.Services.AddOpenApi();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// 4. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy"); 

// !!! මේ පේළි දෙක ඉතා වැදගත් (මෙම අනුපිළිවෙලටම තිබිය යුතුය)
app.UseAuthentication(); // 1. මුලින්ම Token එක Check කරන්න
app.UseAuthorization();  // 2. ඊට පස්සේ Admin ද කියලා Check කරන්න

app.MapControllers();

app.Run();