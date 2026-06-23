using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Orders (ඇණවුම් ඉතිහාසය ලබා ගැනීම)
        [HttpGet]
        public async Task<IActionResult> GetOrderHistory()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv!.Product)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderDate = o.CreatedAt,
                        totalAmount = o.TotalAmount,
                        status = o.Status,
                        items = o.OrderItems.Select(item => new
                        {
                            id = item.Id,
                            productName = item.ProductVariant != null && item.ProductVariant.Product != null 
                                ? item.ProductVariant.Product.Name 
                                : "Unknown Product",
                            quantity = item.Quantity,
                            price = item.UnitPrice
                        }).ToList()
                    })
                    .OrderByDescending(o => o.orderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // 2. POST: api/Orders (අලුත් ඇණවුමක් සිදු කිරීම)
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto orderDto)
        {
            if (orderDto == null || orderDto.Items.Count == 0)
            {
                return BadRequest("ඇණවුමේ භාණ්ඩ ඇතුළත් වී නොමැත.");
            }

            // Database Transaction එකක් පාවිච්චි කරන්නේ මොකක් හරි එරර් එකක් වුනොත් බාගෙට ඩේටා වැටෙන එක නවත්තන්න
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // අලුත් Order Object එකක් සෑදීම
                var newOrder = new Order
                {
                    UserId = orderDto.UserId, // දැනට ෆ්‍රන්ට්එන්ඩ් එකෙන් එවන User ID එක (පසුව Auth වලින් ගන්නවා)
                    PaymentMethod = orderDto.PaymentMethod,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    TotalAmount = 0 // මුලින් 0 ලෙස දමා පසුව ගණනය කරමු
                };

                decimal calculatedTotal = 0;

                // Cart එකේ ආපු හැම අයිතමයක්ම ලූප් එකක් හරහා චෙක් කිරීම
                foreach (var itemDto in orderDto.Items)
                {
                    // ඩේටාබේස් එකෙන් අදාළ Product Variant එක සහ එහි Price එක සොයා ගැනීම
                    var variant = await _context.ProductVariants
                        .Include(pv => pv.Product)
                        .FirstOrDefaultAsync(pv => pv.Id == itemDto.ProductVariantId);

                    if (variant == null)
                    {
                        return NotFound($"Product Variant ID {itemDto.ProductVariantId} සොයාගත නොහැක.");
                    }

                    // මිල ගණන් එකතු කිරීම (ආරක්ෂාව සඳහා බැකෙන්ඩ් එකේම මිල ගණන් චෙක් කරයි)
                    decimal itemPrice = variant.Product?.Price ?? 0; // Product එකේ මිල ගනී
                    calculatedTotal += itemPrice * itemDto.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductVariantId = itemDto.ProductVariantId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemPrice
                    };

                    newOrder.OrderItems.Add(orderItem);
                }

                newOrder.TotalAmount = calculatedTotal;

                // ඩේටාබේස් එකට සේව් කිරීම
                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                // ට්‍රාන්සෙක්ෂන් එක සාර්ථකව අවසන් කිරීම
                await transaction.CommitAsync();

                return Ok(new { message = "ඇණවුම සාර්ථකව සිදු කරන ලදී!", orderId = newOrder.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"ඇණවුම සිදු කිරීමට නොහැකි විය: {ex.Message}");
            }
        }
    }

    // --- Data Transfer Objects (DTOs) ---
    public class CreateOrderDto
    {
        public int UserId { get; set; }
        public string PaymentMethod { get; set; } = "BankTransfer";
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class CartItemDto
    {
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }
}