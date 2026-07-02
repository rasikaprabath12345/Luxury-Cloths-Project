using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // api/auth
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, TokenService tokenService, IConfiguration configuration)
        {
            _context = context;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        // 1. REGISTER ENDPOINT
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto registerDto)
        {
            // Email එක දැනටමත් ඩේටාබේස් එකේ තියෙනවද බලන්න
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email.ToLower()))
            {
                return BadRequest("මෙම Email ලිපිනය දැනටමත් පාවිච්චි කර ඇත.");
            }

            // BCrypt පාවිච්චි කරලා Password එක සේෆ් විදිහට Hash කිරීම
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email.ToLower(),
                PasswordHash = passwordHash,
                Role = "Customer" // මුලින්ම හැදෙන හැමෝම Customers ලා
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "ලියාපදිංචි වීම සාර්ථකයි!" });
        }

        // 2. LOGIN ENDPOINT
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email.ToLower());

            if (user == null) 
                return Unauthorized("ඇතුලත් කල Email හෝ Password වැරදියි.");

            // ගහපු Password එකයි DB එකේ තියෙන Hash එකයි ගැලපෙනවද බලන්න
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

            if (!isPasswordValid) 
                return Unauthorized("ඇතුලත් කල Email හෝ Password වැරදියි.");

            // හැමදේම හරි නම් Token එක හදලා යවන්න
            var token = _tokenService.CreateToken(user);

            return Ok(new LoginResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        // 2b. GOOGLE LOGIN ENDPOINT
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var email = dto.Email.ToLower();

            // Existing user check
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // New user - Google account සමඟ create කිරීම
                var randomPassword = Guid.NewGuid().ToString();
                user = new User
                {
                    FullName = dto.FullName ?? email,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword),
                    Avatar = dto.Avatar ?? string.Empty,
                    GoogleId = dto.GoogleId,
                    IsGoogleUser = true,
                    Role = "Customer",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Existing user - Google info update
                if (!string.IsNullOrEmpty(dto.GoogleId))
                    user.GoogleId = dto.GoogleId;
                if (!string.IsNullOrEmpty(dto.Avatar) && string.IsNullOrEmpty(user.Avatar))
                    user.Avatar = dto.Avatar;
                user.IsGoogleUser = true;
                user.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }

            var token = _tokenService.CreateToken(user);

            return Ok(new LoginResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        // 3. FORGOT PASSWORD ENDPOINT
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null)
                return Ok(new { message = "Password reset එක තැපැල්වලට යවන ලදී (Email එකට)." });

            // Generate reset token
            string resetToken = Guid.NewGuid().ToString();
            user.PasswordResetToken = resetToken;
            user.PasswordResetExpiry = DateTime.UtcNow.AddHours(24); // 24 hours validity

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // In production, send email with reset link
            // For now, return token (frontend will use it)
            var resetLink = $"{_configuration["FrontendUrl"]}/auth/reset-password?token={resetToken}&email={user.Email}";
            
            return Ok(new { 
                message = "Password reset එක තැපැල්වලට යවන ලදී.",
                resetLink = resetLink // Remove in production
            });
        }

        // 4. RESET PASSWORD ENDPOINT
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest("මුරපදය තිරස්කරණ කිරීම ගැලපෙන්නේ නැත.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null || user.PasswordResetToken != dto.Token)
                return Unauthorized("Invalid reset token.");

            if (user.PasswordResetExpiry < DateTime.UtcNow)
                return Unauthorized("Password reset token පුරාවෙලා ගිය ඇත.");

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetExpiry = null;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "මුරපදය සফලව ප්‍රතිසකස් කරන ලදී." });
        }

        // 5. GET PROFILE ENDPOINT (Protected)
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found");

            return Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Avatar = user.Avatar,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        // 6. UPDATE PROFILE ENDPOINT (Protected)
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found");

            user.FullName = dto.FullName ?? user.FullName;
            user.Phone = dto.Phone ?? user.Phone;
            user.Avatar = dto.Avatar ?? user.Avatar;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "ප්‍රොෆයිල සිටුවම් ලිපිනය සෙවුම් නිම.", user = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Avatar = user.Avatar,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            }});
        }

        // 7. CHANGE PASSWORD ENDPOINT (Protected)
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest("New passwords don't match.");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found");

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return Unauthorized("Current password is incorrect.");

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "මුරපදය සිටුවම් ලිපිනය සෙවුම් නිම." });
        }

        // 8. LOGOUT ENDPOINT (Optional - frontend handles token deletion)
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // Frontend handles token deletion from localStorage
            return Ok(new { message = "Logged out successfully" });
        }

        // 9. GET ALL USERS (Admin only)
        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
            if (adminUser == null || !string.Equals(adminUser.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Only admins can access this resource.");
            }

            var users = await _context.Users
                .Select(user => new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Avatar = user.Avatar,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // 10. UPDATE USER ROLE (Admin only)
        [HttpPut("users/{id}/role")]
        [Authorize]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDto dto)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
            if (adminUser == null || !string.Equals(adminUser.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Only admins can perform this action.");
            }

            if (string.Equals(dto.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Admins are not allowed to promote users to Admin role.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (string.Equals(user.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Admins cannot be demoted or have their role changed.");
            }

            user.Role = dto.Role;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User role updated successfully.", role = user.Role });
        }

        // 11. DELETE USER (Admin only, only Customer accounts can be deleted)
        [HttpDelete("users/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
            if (adminUser == null || !string.Equals(adminUser.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Only admins can perform this action.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // block deleting Admin accounts
            if (string.Equals(user.Role, "Admin", System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Admin accounts cannot be deleted.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }
    }
}