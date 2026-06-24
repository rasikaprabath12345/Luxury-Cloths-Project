using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            // 💡 'Shirts' කියන කැටගරි එක දැනටමත් නැත්නම් විතරක් මේ ටික ඔටෝ එකතු කරන්න
            if (!_context.Categories.Any(c => c.Name == "Shirts"))
            {
                _context.Categories.AddRange(
                    new Category { Name = "Shirts", Slug = "shirts" },
                    new Category { Name = "Pants", Slug = "pants" },
                    new Category { Name = "Shoes", Slug = "shoes" },
                    new Category { Name = "Watches", Slug = "watches" },
                    new Category { Name = "Accessories", Slug = "accessories" }
                );
                await _context.SaveChangesAsync();
            }

            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (category == null)
            {
                return BadRequest("Category data is null.");
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            if (category == null || category.Id != id)
            {
                return BadRequest("Invalid category payload.");
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound($"Category ID {id} not found.");
            }

            existingCategory.Name = category.Name;
            existingCategory.Slug = category.Slug;

            _context.Categories.Update(existingCategory);
            await _context.SaveChangesAsync();

            return Ok(existingCategory);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"Category ID {id} not found.");
            }

            // check if there are any products in this category before deleting (optional but safe)
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest("Cannot delete category containing products.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category deleted successfully." });
        }
    }
}