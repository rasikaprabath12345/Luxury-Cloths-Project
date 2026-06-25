using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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

        // 1. GET: api/Orders (ඇණවුම් ඉතිහාසය ලබා ගැනීම - Admin Only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
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

        // 1.5 GET: api/Orders/my-orders (පරිශීලකයාගේ ඇණවුම් ලබා ගැනීම)
        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized("පරිශීලකයා හඳුනාගත නොහැක.");
                }

                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv!.Product)
                    .Where(o => o.UserId == userId)
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

        // GET: api/Orders/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrder(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                            .ThenInclude(pv => pv!.Product)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound($"Order ID {id} සොයාගත නොහැක.");
                }

                // If not Admin and not the owner of the order, deny access
                if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) && order.UserId != userId)
                {
                    return Unauthorized("ඔබට මෙම ඇණවුම බැලීමට අවසර නොමැත.");
                }

                var orderDto = new
                {
                    id = order.Id,
                    orderDate = order.CreatedAt,
                    totalAmount = order.TotalAmount,
                    status = order.Status,
                    paymentMethod = order.PaymentMethod,
                    paymentSlipUrl = order.PaymentSlipUrl,
                    userId = order.UserId,
                    items = order.OrderItems.Select(item => new
                    {
                        id = item.Id,
                        productName = item.ProductVariant != null && item.ProductVariant.Product != null 
                            ? item.ProductVariant.Product.Name 
                            : "Unknown Product",
                        quantity = item.Quantity,
                        price = item.UnitPrice
                    }).ToList()
                };

                return Ok(orderDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // 2. POST: api/Orders (අලුත් ඇණවුමක් සිදු කිරීම)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto orderDto)
        {
            if (orderDto == null || orderDto.Items.Count == 0)
            {
                return BadRequest("ඇණවුමේ භාණ්ඩ ඇතුළත් වී නොමැත.");
            }

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized("පරිශීලකයා හඳුනාගත නොහැක.");
            }

            // Database Transaction එකක් පාවිච්චි කරන්නේ මොකක් හරි එරර් එකක් වුනොත් බාගෙට ඩේටා වැටෙන එක නවත්තන්න
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // අලුත් Order Object එකක් සෑදීම
                var newOrder = new Order
                {
                    UserId = userId, // Extract from JWT claims for security
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

        // 3. PUT: api/Orders/{id}/status (Admin updates order status)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                {
                    return NotFound($"Order ID {id} සොයාගත නොහැක.");
                }

                order.Status = dto.Status;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                return Ok(new { message = "ඇණවුමේ තත්ත්වය සාර්ථකව වෙනස් කරන ලදී!", status = order.Status });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ඇණවුමේ තත්ත්වය වෙනස් කිරීමට නොහැකි විය: {ex.Message}");
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

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}