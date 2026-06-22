using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        // Order එක දාපු කෙනා (Foreign Key)
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "BankTransfer"; // BankTransfer හෝ COD
        public string? PaymentSlipUrl { get; set; } // Upload කරපු Slip එකේ ලින්ක් එක
        
        public string Status { get; set; } = "Pending"; // Pending, Approved, Shipped
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // මේ බිලට අයිති ඇඳුම් ලිස්ට් එක
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}