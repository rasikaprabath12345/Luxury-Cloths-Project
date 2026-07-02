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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "super_secret_luxury_fashion_brand_key_2026_this_is_very_long_key_64_characters")),
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
              .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.217.1:3000")
              .AllowCredentials();
    }));

// 3. OpenAPI සහ Controllers
builder.Services.AddOpenApi();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<EmailService>();
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

// Serve static files from the 'uploads' directory
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// !!! මේ පේළි දෙක ඉතා වැදගත් (මෙම අනුපිළිවෙලටම තිබිය යුතුය)
app.UseAuthentication(); // 1. මුලින්ම Token එක Check කරන්න
app.UseAuthorization();  // 2. ඊට පස්සේ Admin ද කියලා Check කරන්න

app.MapControllers();

// Seed categories: Women, Men, Children
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();
        var defaultCategories = new List<backend.Models.Category>
        {
            new backend.Models.Category { Name = "Women", Slug = "women" },
            new backend.Models.Category { Name = "Men", Slug = "men" },
            new backend.Models.Category { Name = "Children", Slug = "children" }
        };

        foreach (var cat in defaultCategories)
        {
            if (!context.Categories.Any(c => c.Slug == cat.Slug))
            {
                context.Categories.Add(cat);
            }
        }
        context.SaveChanges();

        // Seed default Admin user
        if (!context.Users.Any(u => u.Email == "admin@luxury.lk"))
        {
            var adminUser = new backend.Models.User
            {
                FullName = "Luxury Admin",
                Email = "admin@luxury.lk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding database: {ex.Message}");
    }
}

app.Run();