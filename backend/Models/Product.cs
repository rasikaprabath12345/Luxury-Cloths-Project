using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty; // SEO ලින්ක් එක (උදා: black-silk-dress)
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        
        // Category එකට ලින්ක් කිරීම (Foreign Key)
        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        // එක ඇඳුමකට ෆොටෝස් ගොඩක් සහ Sizes ගොඩක් තියෙන්න පුළුවන් (One-to-Many)
        public List<ProductImage> Images { get; set; } = new();
        public List<ProductVariant> Variants { get; set; } = new();
        
        private string? _imageUrl;

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? ImageUrl
        {
            get => _imageUrl ?? (Images != null && Images.Count > 0 ? Images[0].ImageUrl : null);
            set => _imageUrl = value;
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}