using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StockController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET /api/Stock — Get all products with stock info
        [HttpGet]
        public async Task<IActionResult> GetAllStock()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Select(p => new
                {
                    productId = p.Id,
                    productName = p.Name,
                    imageUrl = p.ImageUrl,
                    categoryName = p.Category != null ? p.Category.Name : "Uncategorized",
                    variants = p.Variants.Select(v => new
                    {
                        variantId = v.Id,
                        size = v.Size,
                        color = v.Color,
                        stockQuantity = v.StockQuantity,
                        reservedQuantity = v.ReservedQuantity,
                        availableStock = v.StockQuantity - v.ReservedQuantity,
                        lowStockThreshold = v.LowStockThreshold,
                        status = v.StockQuantity <= 0 ? "OutOfStock"
                               : (v.StockQuantity - v.ReservedQuantity) <= v.LowStockThreshold ? "LowStock"
                               : "InStock"
                    }).ToList(),
                    totalStock = p.Variants.Sum(v => v.StockQuantity),
                    totalAvailable = p.Variants.Sum(v => v.StockQuantity - v.ReservedQuantity),
                    overallStatus = p.Variants.Sum(v => v.StockQuantity) <= 0 ? "OutOfStock"
                                  : p.Variants.Any(v => (v.StockQuantity - v.ReservedQuantity) <= v.LowStockThreshold) ? "LowStock"
                                  : "InStock"
                })
                .OrderBy(p => p.productName)
                .ToListAsync();

            return Ok(products);
        }

        // 2. GET /api/Stock/{productId} — Get stock for a specific product
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductStock(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                return NotFound("Product not found.");

            var result = new
            {
                productId = product.Id,
                productName = product.Name,
                imageUrl = product.ImageUrl,
                categoryName = product.Category?.Name ?? "Uncategorized",
                variants = product.Variants.Select(v => new
                {
                    variantId = v.Id,
                    size = v.Size,
                    color = v.Color,
                    stockQuantity = v.StockQuantity,
                    reservedQuantity = v.ReservedQuantity,
                    availableStock = v.AvailableStock,
                    lowStockThreshold = v.LowStockThreshold,
                    status = v.StockQuantity <= 0 ? "OutOfStock"
                           : v.AvailableStock <= v.LowStockThreshold ? "LowStock"
                           : "InStock"
                }).ToList(),
                totalStock = product.Variants.Sum(v => v.StockQuantity),
                totalAvailable = product.Variants.Sum(v => v.AvailableStock),
            };

            return Ok(result);
        }

        // 3. GET /api/Stock/low-stock — Get products below threshold
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var lowStockVariants = await _context.ProductVariants
                .Include(v => v.Product)
                    .ThenInclude(p => p!.Images)
                .Include(v => v.Product)
                    .ThenInclude(p => p!.Category)
                .Where(v => v.StockQuantity > 0 && (v.StockQuantity - v.ReservedQuantity) <= v.LowStockThreshold)
                .Select(v => new
                {
                    variantId = v.Id,
                    productId = v.ProductId,
                    productName = v.Product != null ? v.Product.Name : "Unknown",
                    imageUrl = v.Product != null ? v.Product.ImageUrl : null,
                    categoryName = v.Product != null && v.Product.Category != null ? v.Product.Category.Name : "Uncategorized",
                    size = v.Size,
                    color = v.Color,
                    stockQuantity = v.StockQuantity,
                    availableStock = v.StockQuantity - v.ReservedQuantity,
                    lowStockThreshold = v.LowStockThreshold,
                })
                .ToListAsync();

            return Ok(lowStockVariants);
        }

        // 4. PUT /api/Stock/{variantId}/adjust — Admin adjusts stock
        [HttpPut("{variantId}/adjust")]
        public async Task<IActionResult> AdjustStock(int variantId, [FromBody] AdjustStockDto dto)
        {
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.Id == variantId);

            if (variant == null)
                return NotFound("Variant not found.");

            int previousStock = variant.StockQuantity;
            int newStock = previousStock + dto.Adjustment; // +/- adjustment

            if (newStock < 0)
                return BadRequest("Stock quantity cannot go below 0.");

            variant.StockQuantity = newStock;

            // Create stock movement record
            var movement = new StockMovement
            {
                ProductVariantId = variantId,
                Type = dto.Adjustment > 0 ? "StockIn" : "StockOut",
                Quantity = dto.Adjustment,
                PreviousStock = previousStock,
                NewStock = newStock,
                Reason = dto.Reason ?? "Manual adjustment",
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Stock updated successfully!",
                variantId = variant.Id,
                productName = variant.Product?.Name,
                size = variant.Size,
                previousStock,
                newStock,
                adjustment = dto.Adjustment
            });
        }

        // 5. GET /api/Stock/movements/{variantId} — Stock movement history
        [HttpGet("movements/{variantId}")]
        public async Task<IActionResult> GetStockMovements(int variantId)
        {
            var movements = await _context.StockMovements
                .Where(m => m.ProductVariantId == variantId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new
                {
                    id = m.Id,
                    type = m.Type,
                    quantity = m.Quantity,
                    previousStock = m.PreviousStock,
                    newStock = m.NewStock,
                    reason = m.Reason,
                    orderId = m.OrderId,
                    createdAt = m.CreatedAt
                })
                .Take(50)
                .ToListAsync();

            return Ok(movements);
        }

        // 6. GET /api/Stock/summary — Dashboard summary stats
        [HttpGet("summary")]
        public async Task<IActionResult> GetStockSummary()
        {
            var variants = await _context.ProductVariants.ToListAsync();

            var totalProducts = await _context.Products.CountAsync();
            var totalVariants = variants.Count;
            var totalItemsInStock = variants.Sum(v => v.StockQuantity);
            var outOfStockCount = variants.Count(v => v.StockQuantity <= 0);
            var lowStockCount = variants.Count(v => v.StockQuantity > 0 && (v.StockQuantity - v.ReservedQuantity) <= v.LowStockThreshold);
            var inStockCount = variants.Count(v => v.StockQuantity > 0 && (v.StockQuantity - v.ReservedQuantity) > v.LowStockThreshold);

            return Ok(new
            {
                totalProducts,
                totalVariants,
                totalItemsInStock,
                outOfStockCount,
                lowStockCount,
                inStockCount
            });
        }

        // 7. PUT /api/Stock/{variantId}/config — Admin configures variant stock threshold/reservations
        [HttpPut("{variantId}/config")]
        public async Task<IActionResult> UpdateVariantConfig(int variantId, [FromBody] UpdateVariantConfigDto dto)
        {
            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.Id == variantId);

            if (variant == null)
                return NotFound("Variant not found.");

            variant.LowStockThreshold = dto.LowStockThreshold;
            variant.ReservedQuantity = dto.ReservedQuantity;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Variant threshold and reservations updated successfully!",
                variantId = variant.Id,
                lowStockThreshold = variant.LowStockThreshold,
                reservedQuantity = variant.ReservedQuantity,
                availableStock = variant.StockQuantity - variant.ReservedQuantity
            });
        }
    }

    // DTOs
    public class UpdateVariantConfigDto
    {
        public int LowStockThreshold { get; set; }
        public int ReservedQuantity { get; set; }
    }

    public class AdjustStockDto
    {
        public int Adjustment { get; set; } // + for add, - for remove
        public string? Reason { get; set; }
    }
}
