using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // api/auth
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(ApplicationDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
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

            return Ok(new
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
    }
}