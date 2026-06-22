using System;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        
        // Admin ද නැත්නම් Customer ද කියලා අඳුරගන්න
        public string Role { get; set; } = "Customer"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}