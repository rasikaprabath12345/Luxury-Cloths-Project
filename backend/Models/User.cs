using System;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty; // Profile image URL
        
        // Admin ද නැත්නම් Customer ද කියලා අඳුරගන්න
        public string Role { get; set; } = "Customer"; 
        
        // Google OAuth fields
        public string? GoogleId { get; set; }
        public bool IsGoogleUser { get; set; } = false;

        // Password reset fields
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpiry { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}