using System;

namespace backend.Models
{
    public class StockMovement
    {
        public int Id { get; set; }
        
        public int ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
        
        // StockIn, StockOut, Adjustment, OrderDeduct, OrderCancel
        public string Type { get; set; } = string.Empty;
        
        public int Quantity { get; set; } // වෙනස් වුන ප්‍රමාණය (+/-)
        public int PreviousStock { get; set; } // වෙනස් වෙන්න කලින් තිබුන ප්‍රමාණය
        public int NewStock { get; set; } // වෙනස් වුනට පස්සේ තියෙන ප්‍රමාණය
        
        public string Reason { get; set; } = string.Empty; // වෙනස් කිරීමට හේතුව
        public int? OrderId { get; set; } // Order එකට සම්බන්ධ නම්
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
