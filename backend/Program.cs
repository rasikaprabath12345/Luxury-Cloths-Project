using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext එක SQL Server සමඟ Register කිරීම
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Next.js Frontend එකට (Port 3000) දත්ත ගන්න අවසර දීම (CORS Policy)
builder.Services.AddCors(options =>
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:3000") // Frontend Local URL එක
              .AllowCredentials();
    }));

builder.Services.AddControllers();

var app = builder.Build();

// Middleware ටික පිළිවෙලට සෙට් කිරීම
app.UseHttpsRedirection();

// CORS එක UseAuthorization වලට කලින් අනිවාර්යයෙන්ම තියෙන්න ඕනේ
app.UseCors("CorsPolicy"); 

app.UseAuthorization();

app.MapControllers();

app.Run();