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
            _context.Products.Add(product);
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

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
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

            return Ok(new { message = "Product එක සාර්ථකව යාවත්කාලීන කලා!", product });
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