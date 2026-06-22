namespace backend.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // උදා: Men, Women
        public string Slug { get; set; } = string.Empty; // උදා: men-collection
    }
}