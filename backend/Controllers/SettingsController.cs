using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _settingsFilePath;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
            _settingsFilePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "settings.json");
        }

        public class SiteSettings
        {
            public string HeroImage { get; set; } = "/qw.jpg";
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            if (!System.IO.File.Exists(_settingsFilePath))
            {
                // Return default settings if configuration doesn't exist yet
                return Ok(new SiteSettings());
            }

            try
            {
                var json = await System.IO.File.ReadAllTextAsync(_settingsFilePath);
                var settings = JsonSerializer.Deserialize<SiteSettings>(json);
                return Ok(settings ?? new SiteSettings());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error reading settings: {ex.Message}" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateSettings([FromBody] SiteSettings newSettings)
        {
            // Admin authorization check
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(adminIdClaim) || !int.TryParse(adminIdClaim, out var adminId))
            {
                return Unauthorized(new { message = "User not identified." });
            }

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
            if (adminUser == null || !string.Equals(adminUser.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new { message = "Only admins can modify settings." });
            }

            if (newSettings == null || string.IsNullOrWhiteSpace(newSettings.HeroImage))
            {
                return BadRequest(new { message = "Invalid settings data." });
            }

            try
            {
                // Ensure uploads directory exists
                var dir = Path.GetDirectoryName(_settingsFilePath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                {
                    Directory.CreateDirectory(dir);
                }

                var json = JsonSerializer.Serialize(newSettings, new JsonSerializerOptions { WriteIndented = true });
                await System.IO.File.WriteAllTextAsync(_settingsFilePath, json);
                return Ok(newSettings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error saving settings: {ex.Message}" });
            }
        }
    }
}
