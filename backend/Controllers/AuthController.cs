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
        private readonly EmailService _emailService;

        public AuthController(ApplicationDbContext context, TokenService tokenService, IConfiguration configuration, EmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _configuration = configuration;
            _emailService = emailService;
        }

        // 1. REGISTER ENDPOINT
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto registerDto)
        {
            // Email එක දැනටමත් ඩේටාබේස් එකේ තියෙනවද බලන්න
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email.ToLower());
            if (existingUser != null)
            {
                if (existingUser.IsVerified || existingUser.IsGoogleUser)
                {
                    return BadRequest("මෙම Email ලිපිනය දැනටමත් පාවිච්චි කර ඇත.");
                }
                else
                {
                    // සත්‍යාපනය නොකළ (unverified) ගිණුමක් නම්, එය database එකෙන් ඉවත් කර නැවත ලියාපදිංචි වීමට ඉඩ දෙමු.
                    _context.Users.Remove(existingUser);
                    await _context.SaveChangesAsync();
                }
            }

            // BCrypt පාවිච්චි කරලා Password එක සේෆ් විදිහට Hash කිරීම
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            // Generate 6-digit verification code
            string otpCode = new Random().Next(100000, 999999).ToString();

            var user = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email.ToLower(),
                PasswordHash = passwordHash,
                Role = "Customer", // මුලින්ම හැදෙන හැමෝම Customers ලා
                IsVerified = false,
                VerificationToken = otpCode,
                VerificationTokenExpiry = DateTime.UtcNow.AddMinutes(15)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send verification email
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #1c1c1e;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <span style='font-size: 40px;'>💎</span>
                        <h2 style='font-family: Georgia, serif; letter-spacing: 4px; margin: 10px 0;'>LUXURY.lk</h2>
                    </div>
                    <p style='font-size: 15px;'>Hi {user.FullName},</p>
                    <p style='font-size: 15px;'>Welcome to Luxury Store! Please verify your email address to complete your registration. Use the following 6-digit OTP code:</p>
                    <div style='background: #f8f9fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1c1c1e; margin: 20px 0;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 13px; color: #8e8e93;'>This verification code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #8e8e93; text-align: center;'>© 2026 Luxury Store. All rights reserved.</p>
                </div>";

            await _emailService.SendEmailAsync(user.Email, "Verify Your Luxury Store Account", emailBody);

            return Ok(new { 
                message = "ලියාපදිංචි වීම සාර්ථකයි! කරුණාකර ඔබගේ ඊමේල් ලිපිනය පරීක්ෂා කර OTP කේතය ඇතුළත් කරන්න.",
                email = user.Email,
                status = "VerificationRequired"
            });
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

            // Check if verified
            if (!user.IsVerified && !user.IsGoogleUser)
            {
                // Generate a new OTP and resend
                string otpCode = new Random().Next(100000, 999999).ToString();
                user.VerificationToken = otpCode;
                user.VerificationTokenExpiry = DateTime.UtcNow.AddMinutes(15);
                
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                string emailBody = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #1c1c1e;'>
                        <div style='text-align: center; margin-bottom: 20px;'>
                            <span style='font-size: 40px;'>💎</span>
                            <h2 style='font-family: Georgia, serif; letter-spacing: 4px; margin: 10px 0;'>LUXURY.lk</h2>
                        </div>
                        <p style='font-size: 15px;'>Hi {user.FullName},</p>
                        <p style='font-size: 15px;'>Your account is not verified yet. Please use the following new OTP verification code to log in:</p>
                        <div style='background: #f8f9fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1c1c1e; margin: 20px 0;'>
                            {otpCode}
                        </div>
                        <p style='font-size: 13px; color: #8e8e93;'>This verification code is valid for 15 minutes.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                        <p style='font-size: 12px; color: #8e8e93; text-align: center;'>© 2026 Luxury Store. All rights reserved.</p>
                    </div>";

                await _emailService.SendEmailAsync(user.Email, "Verify Your Luxury Store Account", emailBody);

                return BadRequest("AccountNotVerified");
            }

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

        // 2c. VERIFY EMAIL ENDPOINT
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest("Email and code are required.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
            if (user == null)
                return NotFound("පරිශීලකයා හමු වුනේ නැත.");

            if (user.IsVerified)
                return BadRequest("මෙම ගිණුම දැනටමත් සත්‍යාපනය කර ඇත.");

            if (user.VerificationToken != dto.Code)
                return BadRequest("ඇතුලත් කල සත්‍යාපන කේතය (OTP) වැරදියි.");

            if (user.VerificationTokenExpiry < DateTime.UtcNow)
                return BadRequest("සත්‍යාපන කේතයේ වලංගු කාලය අවසන් වී ඇත. කරුණාකර අලුත් කේතයක් ලබාගන්න.");

            // Mark as verified
            user.IsVerified = true;
            user.VerificationToken = null;
            user.VerificationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Generate Token
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

        // 2d. RESEND VERIFICATION CODE ENDPOINT
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification(ResendVerificationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
            if (user == null)
                return NotFound("පරිශීලකයා හමු වුනේ නැත.");

            if (user.IsVerified)
                return BadRequest("මෙම ගිණුම දැනටමත් සත්‍යාපනය කර ඇත.");

            // Generate new OTP
            string otpCode = new Random().Next(100000, 999999).ToString();
            user.VerificationToken = otpCode;
            user.VerificationTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Send Email
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #1c1c1e;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <span style='font-size: 40px;'>💎</span>
                        <h2 style='font-family: Georgia, serif; letter-spacing: 4px; margin: 10px 0;'>LUXURY.lk</h2>
                    </div>
                    <p style='font-size: 15px;'>Hi {user.FullName},</p>
                    <p style='font-size: 15px;'>We have generated a new OTP code for you to verify your email address:</p>
                    <div style='background: #f8f9fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1c1c1e; margin: 20px 0;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 13px; color: #8e8e93;'>This verification code is valid for 15 minutes.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #8e8e93; text-align: center;'>© 2026 Luxury Store. All rights reserved.</p>
                </div>";

            await _emailService.SendEmailAsync(user.Email, "New Verification OTP Code - Luxury Store", emailBody);

            return Ok(new { message = "නව OTP කේතය සාර්ථකව ඊමේල් පණිවිඩයක් ලෙස යවන ලදී." });
        }

        // 3. FORGOT PASSWORD ENDPOINT
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null)
                return Ok(new { message = "මුරපදය ප්‍රතිසකස් කිරීමේ OTP කේතය ඊමේල් මඟින් යවන ලදී (එම Email ලිපිනය පවතී නම්)." });

            // Generate 6-digit reset OTP
            string otpCode = new Random().Next(100000, 999999).ToString();
            user.PasswordResetToken = otpCode;
            user.PasswordResetExpiry = DateTime.UtcNow.AddMinutes(15); // 15 mins validity for OTP

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Send Reset OTP via Email Service
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #1c1c1e;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <span style='font-size: 40px;'>💎</span>
                        <h2 style='font-family: Georgia, serif; letter-spacing: 4px; margin: 10px 0;'>LUXURY.lk</h2>
                    </div>
                    <p style='font-size: 15px;'>Hi {user.FullName},</p>
                    <p style='font-size: 15px;'>We received a request to reset your password. Please use the following 6-digit OTP code to reset your password:</p>
                    <div style='background: #f8f9fa; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #1c1c1e; margin: 20px 0;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 13px; color: #8e8e93;'>This OTP code is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #8e8e93; text-align: center;'>© 2026 Luxury Store. All rights reserved.</p>
                </div>";

            await _emailService.SendEmailAsync(user.Email, "Reset Your Password OTP - Luxury Store", emailBody);

            return Ok(new { 
                message = "මුරපදය ප්‍රතිසකස් කිරීමේ OTP කේතය සාර්ථකව ඊමේල් පණිවිඩයක් ලෙස යවන ලදී."
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