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
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string OrderNote { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // මේ බිලට අයිති ඇඳුම් ලිස්ට් එක
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}