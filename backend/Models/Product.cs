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
        
        public string Sizes { get; set; } = "S,M,L,XL"; // comma separated sizes
        public int Discount { get; set; } = 0; // discount percentage
        
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

        public bool IsChoice { get; set; } = false;
        public bool IsSale { get; set; } = false;
        public double Rating { get; set; } = 4.5;
        public int SoldCount { get; set; } = 0;
        public string PromoText { get; set; } = string.Empty;
        public string ShopperSavingText { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}