using System.ComponentModel.DataAnnotations.Schema;

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
        public int ReservedQuantity { get; set; } = 0; // Pending orders වලින් reserve වෙලා තියෙන ප්‍රමාණය
        public int LowStockThreshold { get; set; } = 5; // මේකට පහළ ගියොත් Low Stock warning එකක් පෙන්වනවා

        [NotMapped]
        public int AvailableStock => StockQuantity - ReservedQuantity;
    }
}