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
    }
}