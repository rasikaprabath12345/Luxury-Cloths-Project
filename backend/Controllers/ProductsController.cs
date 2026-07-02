using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // api/products
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL PRODUCTS (සියලුම ඇඳුම් විස්තර ලබා ගැනීම)
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .ToListAsync();

            return Ok(products);
        }

        // 2. GET SINGLE PRODUCT BY ID (තනි ඇඳුමක විස්තර ID එකෙන් ලබා ගැනීම)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound("සමාවන්න, එවැනි භාණ්ඩයක් සොයාගත නොහැක.");
            }

            return Ok(product);
        }

        // 2.5 GET SINGLE PRODUCT BY SLUG (තනි ඇඳුමක විස්තර Slug එකෙන් ලබා ගැනීම)
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetProductBySlug(string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Slug == slug.ToLower());

            if (product == null)
            {
                return NotFound("සමාවන්න, එවැනි භාණ්ඩයක් සොයාගත නොහැක.");
            }

            return Ok(product);
        }

        // 3. GET ALL CATEGORIES (සියලුම කැටගරි ලබා ගැනීම)
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        // 4. ADD NEW PRODUCT (අලුතින් ඇඳුමක් ඇතුලත් කිරීම)
        [HttpPost]
        public async Task<IActionResult> CreateProduct(Product product)
        {
            if (string.IsNullOrEmpty(product.Slug))
            {
                product.Slug = product.Name.ToLower().Replace(" ", "-").Replace("/", "-");
            }

            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                product.Images = new List<ProductImage>
                {
                    new ProductImage { ImageUrl = product.ImageUrl, IsMainImage = true }
                };
            }

            if (product.Variants == null || product.Variants.Count == 0)
            {
                var sizesList = !string.IsNullOrEmpty(product.Sizes)
                    ? product.Sizes.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList()
                    : new List<string> { "Free Size" };

                product.Variants = sizesList.Select(size => new ProductVariant
                {
                    Size = size,
                    Color = "Default",
                    StockQuantity = 100,
                    LowStockThreshold = 5
                }).ToList();
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Log initial stock movement
            foreach (var variant in product.Variants)
            {
                _context.StockMovements.Add(new StockMovement
                {
                    ProductVariantId = variant.Id,
                    Type = "StockIn",
                    Quantity = variant.StockQuantity,
                    PreviousStock = 0,
                    NewStock = variant.StockQuantity,
                    Reason = "Product created with default stock",
                    CreatedAt = DateTime.UtcNow
                });
            }
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // 5. ADD NEW CATEGORY (අලුතින් කැටගරියක් ඇතුලත් කිරීම)
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category එක සාර්ථකව ඇතුලත් කලා!", category });
        }

        // 6. UPDATE PRODUCT (ඇඳුමක විස්තර වෙනස් කිරීම)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest("ID එක ගැලපෙන්නේ නැත.");
            }

            var existingProduct = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProduct == null)
            {
                return NotFound("සමාවන්න, එවැනි භාණ්ඩයක් සොයාගත නොහැක.");
            }

            existingProduct.Name = product.Name;
            existingProduct.Price = product.Price;
            existingProduct.Description = product.Description;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.Sizes = product.Sizes;
            existingProduct.Discount = product.Discount;
            existingProduct.IsChoice = product.IsChoice;
            existingProduct.IsSale = product.IsSale;
            existingProduct.Rating = product.Rating;
            existingProduct.SoldCount = product.SoldCount;
            existingProduct.PromoText = product.PromoText ?? string.Empty;
            existingProduct.ShopperSavingText = product.ShopperSavingText ?? string.Empty;

            if (!string.IsNullOrEmpty(product.Slug))
            {
                existingProduct.Slug = product.Slug;
            }
            else
            {
                existingProduct.Slug = product.Name.ToLower().Replace(" ", "-").Replace("/", "-");
            }

            // Sync all images (multiple images support)
            if (product.Images != null && product.Images.Count > 0)
            {
                _context.ProductImages.RemoveRange(existingProduct.Images);
                existingProduct.Images = product.Images.Select(img => new ProductImage
                {
                    ImageUrl = img.ImageUrl,
                    IsMainImage = img.IsMainImage
                }).ToList();
            }
            else if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                _context.ProductImages.RemoveRange(existingProduct.Images);
                existingProduct.Images = new List<ProductImage>
                {
                    new ProductImage { ImageUrl = product.ImageUrl, IsMainImage = true }
                };
            }

            // Sync variants based on Sizes
            var sizesList = !string.IsNullOrEmpty(product.Sizes)
                ? product.Sizes.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList()
                : new List<string> { "Free Size" };

            // Add new variants for newly added sizes
            var newVariants = new List<ProductVariant>();
            foreach (var size in sizesList)
            {
                if (!existingProduct.Variants.Any(v => v.Size.Equals(size, StringComparison.OrdinalIgnoreCase)))
                {
                    var newV = new ProductVariant
                    {
                        Size = size,
                        Color = "Default",
                        StockQuantity = 100,
                        LowStockThreshold = 5
                    };
                    existingProduct.Variants.Add(newV);
                    newVariants.Add(newV);
                }
            }

            try
            {
                await _context.SaveChangesAsync();

                // Log initial stock for new variants
                foreach (var variant in newVariants)
                {
                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductVariantId = variant.Id,
                        Type = "StockIn",
                        Quantity = variant.StockQuantity,
                        PreviousStock = 0,
                        NewStock = variant.StockQuantity,
                        Reason = "New size variant added via update",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                if (newVariants.Any())
                {
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Products.Any(e => e.Id == id))
                {
                    return NotFound("සමාවන්න, එවැනි භාණ්ඩයක් සොයාගත නොහැක.");
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Product එක සාර්ථකව යාවත්කාලීන කලා!", product = existingProduct });
        }

        // 7. DELETE PRODUCT (ඇඳුමක් අයින් කර දැමීම)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound("සමාවන්න, එවැනි භාණ්ඩයක් සොයාගත නොහැක.");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product එක සාර්ථකව ඉවත් කලා!" });
        }
    }
}