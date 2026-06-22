namespace backend.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        public string ImageUrl { get; set; } = string.Empty;
        
        // ප්‍රධාන ෆොටෝ එකද කියලා අඳුරගන්න (Card එකේ මුලින්ම පෙන්වන්න)
        public bool IsMainImage { get; set; } 
    }
}