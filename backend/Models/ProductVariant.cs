namespace backend.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        public string Size { get; set; } = string.Empty; // S, M, L, XL
        public string Color { get; set; } = string.Empty; // Hex Code (උදා: #000000)
        
        public int StockQuantity { get; set; } // ඉතුරු වෙලා තියෙන ප්‍රමාණය
    }
}