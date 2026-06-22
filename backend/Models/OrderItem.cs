namespace backend.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        
        // ගත්තු ඇඳුමේ විශේෂිත Size එකයි Color එකයි
        public int ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
        
        public int Quantity { get; set; } // ගත්තු ගාණ
        public decimal UnitPrice { get; set; } // ගනිද්දී තිබ්බ ගාණ (පස්සේ කාලෙක Price වෙනස් වුනොත් අවුල් යන්නෙ නැති වෙන්න)
    }
}