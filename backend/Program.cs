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

// Configure form options for file uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10_000_000; // 10MB
});

// Configure Kestrel for larger request bodies
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10_000_000; // 10MB
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

        // Sync and fix product variants
        var productsToFix = context.Products.Include(p => p.Variants).ToList();
        foreach (var p in productsToFix)
        {
            if (!string.IsNullOrEmpty(p.Sizes))
            {
                var sizesList = p.Sizes.Split(',')
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();

                // If sizes list contains actual sizes (not just "Free Size" or empty)
                if (sizesList.Any() && !sizesList.Any(s => s.Equals("Free Size", StringComparison.OrdinalIgnoreCase)))
                {
                    var newVariants = new List<backend.Models.ProductVariant>();
                    var freeSizeVariant = p.Variants.FirstOrDefault(v => v.Size.Equals("Free Size", StringComparison.OrdinalIgnoreCase));
                    int defaultStock = freeSizeVariant?.StockQuantity ?? 100;

                    foreach (var size in sizesList)
                    {
                        if (!p.Variants.Any(v => v.Size.Equals(size, StringComparison.OrdinalIgnoreCase)))
                        {
                            var newV = new backend.Models.ProductVariant
                            {
                                ProductId = p.Id,
                                Size = size,
                                Color = "Default",
                                StockQuantity = defaultStock,
                                LowStockThreshold = 5
                            };
                            context.ProductVariants.Add(newV);
                            newVariants.Add(newV);
                        }
                    }

                    // Save new variants first
                    if (newVariants.Any())
                    {
                        context.SaveChanges();
                        foreach (var nv in newVariants)
                        {
                            context.StockMovements.Add(new backend.Models.StockMovement
                            {
                                ProductVariantId = nv.Id,
                                Type = "StockIn",
                                Quantity = nv.StockQuantity,
                                PreviousStock = 0,
                                NewStock = nv.StockQuantity,
                                Reason = "Database initialization sync for size variant",
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                        context.SaveChanges();
                    }

                    // Now handle the "Free Size" variant cleanup
                    if (freeSizeVariant != null)
                    {
                        // Check if it is referenced in OrderItems
                        bool isReferenced = context.OrderItems.Any(oi => oi.ProductVariantId == freeSizeVariant.Id);
                        if (!isReferenced)
                        {
                            // Remove stock movements first to avoid FK constraints
                            var movements = context.StockMovements.Where(sm => sm.ProductVariantId == freeSizeVariant.Id);
                            context.StockMovements.RemoveRange(movements);
                            context.ProductVariants.Remove(freeSizeVariant);
                        }
                        else
                        {
                            // Otherwise just deactivate it (set stock to 0) so it doesn't show up in stock counts
                            freeSizeVariant.StockQuantity = 0;
                        }
                        context.SaveChanges();
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding database: {ex.Message}");
    }
}

app.Run();