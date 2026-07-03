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
                                .ThenInclude(p => p!.Images)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderDate = o.CreatedAt,
                        totalAmount = o.TotalAmount,
                        status = o.Status,
                        firstName = o.FirstName,
                        lastName = o.LastName,
                        email = o.Email,
                        phone = o.Phone,
                        country = o.Country,
                        state = o.State,
                        city = o.City,
                        postalCode = o.PostalCode,
                        address = o.Address,
                        orderNote = o.OrderNote,
                        shippingAddress = o.ShippingAddress,
                        paymentMethod = o.PaymentMethod,
                        paymentSlipUrl = o.PaymentSlipUrl,
                        items = o.OrderItems.Select(item => new
                        {
                            id = item.Id,
                            productName = item.ProductVariant != null && item.ProductVariant.Product != null 
                                ? item.ProductVariant.Product.Name 
                                : "Unknown Product",
                            productImageUrl = item.ProductVariant != null && item.ProductVariant.Product != null && item.ProductVariant.Product.Images.Any()
                                ? item.ProductVariant.Product.Images.OrderByDescending(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault()
                                : null,
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
                                .ThenInclude(p => p!.Images)
                    .Where(o => o.UserId == userId)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderDate = o.CreatedAt,
                        totalAmount = o.TotalAmount,
                        status = o.Status,
                        firstName = o.FirstName,
                        lastName = o.LastName,
                        email = o.Email,
                        phone = o.Phone,
                        country = o.Country,
                        state = o.State,
                        city = o.City,
                        postalCode = o.PostalCode,
                        address = o.Address,
                        orderNote = o.OrderNote,
                        shippingAddress = o.ShippingAddress,
                        paymentMethod = o.PaymentMethod,
                        paymentSlipUrl = o.PaymentSlipUrl,
                        items = o.OrderItems.Select(item => new
                        {
                            id = item.Id,
                            productName = item.ProductVariant != null && item.ProductVariant.Product != null 
                                ? item.ProductVariant.Product.Name 
                                : "Unknown Product",
                            productImageUrl = item.ProductVariant != null && item.ProductVariant.Product != null && item.ProductVariant.Product.Images.Any()
                                ? item.ProductVariant.Product.Images.OrderByDescending(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault()
                                : null,
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
        [HttpGet("{id:int}")]
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
                                .ThenInclude(p => p!.Images)
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
                    firstName = order.FirstName,
                    lastName = order.LastName,
                    email = order.Email,
                    phone = order.Phone,
                    country = order.Country,
                    state = order.State,
                    city = order.City,
                    postalCode = order.PostalCode,
                    address = order.Address,
                    orderNote = order.OrderNote,
                    shippingAddress = order.ShippingAddress,
                    userId = order.UserId,
                    items = order.OrderItems.Select(item => new
                    {
                        id = item.Id,
                        productName = item.ProductVariant != null && item.ProductVariant.Product != null 
                            ? item.ProductVariant.Product.Name 
                            : "Unknown Product",
                        productImageUrl = item.ProductVariant != null && item.ProductVariant.Product != null && item.ProductVariant.Product.Images.Any()
                            ? item.ProductVariant.Product.Images.OrderByDescending(img => img.IsMainImage).Select(img => img.ImageUrl).FirstOrDefault()
                            : null,
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
                    FirstName = orderDto.FirstName,
                    LastName = orderDto.LastName,
                    Email = orderDto.Email,
                    Phone = orderDto.Phone,
                    Country = orderDto.Country,
                    State = orderDto.State,
                    City = orderDto.City,
                    PostalCode = orderDto.PostalCode,
                    Address = orderDto.Address,
                    OrderNote = orderDto.OrderNote,
                    ShippingAddress = orderDto.ShippingAddress,
                    PaymentSlipUrl = orderDto.PaymentSlipUrl,
                    CreatedAt = DateTime.UtcNow,
                    TotalAmount = 0 // මුලින් 0 ලෙස දමා පසුව ගණනය කරමු
                };

                decimal calculatedTotal = 0;
                var stockMovements = new List<StockMovement>();

                // Cart එකේ ආපු හැම අයිතමයක්ම ලූප් එකක් හරහා චෙක් කිරීම
                foreach (var itemDto in orderDto.Items)
                {
                    // ඩේටාබේස් එකෙන් අදාළ Product Variant එක සහ එහි Price එක සොයා ගැනීම (පළමුව Variant Id ලෙසද, පසුව ProductId ලෙසද සොයයි)
                    var variant = await _context.ProductVariants
                        .Include(pv => pv.Product)
                        .FirstOrDefaultAsync(pv => pv.Id == itemDto.ProductVariantId);

                    if (variant == null)
                    {
                        variant = await _context.ProductVariants
                            .Include(pv => pv.Product)
                            .FirstOrDefaultAsync(pv => pv.ProductId == itemDto.ProductVariantId);
                    }

                    if (variant == null)
                    {
                        return NotFound($"Product Variant ID {itemDto.ProductVariantId} සොයාගත නොහැක.");
                    }

                    // Stock availability check (Available = StockQuantity - ReservedQuantity)
                    int availableStock = variant.StockQuantity - variant.ReservedQuantity;
                    if (availableStock < itemDto.Quantity)
                    {
                        string productName = variant.Product?.Name ?? "Unknown";
                        return BadRequest($"{productName} ({variant.Size}) is out of stock. Available: {availableStock}, Requested: {itemDto.Quantity}");
                    }

                    // මිල ගණන් එකතු කිරීම
                    decimal itemPrice = variant.Product?.Price ?? 0;
                    calculatedTotal += itemPrice * itemDto.Quantity;

                    // ✅ Order place වූ විට StockQuantity අඩු කිරීම නොකර ReservedQuantity වැඩි කරනවා
                    // භෞතික stock delivery වූ පසු පමණක් StockQuantity අඩු කෙරේ
                    int previousReserved = variant.ReservedQuantity;
                    variant.ReservedQuantity += itemDto.Quantity;

                    var orderItem = new OrderItem
                    {
                        ProductVariantId = variant.Id,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemPrice
                    };

                    newOrder.OrderItems.Add(orderItem);

                    // Stock movement — Reserved (Pending)
                    stockMovements.Add(new StockMovement
                    {
                        ProductVariantId = variant.Id,
                        Type = "OrderReserved",
                        Quantity = -itemDto.Quantity,
                        PreviousStock = variant.StockQuantity,
                        NewStock = variant.StockQuantity,
                        Reason = $"Order placed — {itemDto.Quantity} units reserved",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                newOrder.TotalAmount = calculatedTotal;

                // ඩේටාබේස් එකට සේව් කිරීම
                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                // Stock movement records වලට orderId එක දාන්න
                foreach (var sm in stockMovements)
                {
                    sm.OrderId = newOrder.Id;
                }
                _context.StockMovements.AddRange(stockMovements);
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
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.ProductVariant)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound($"Order ID {id} සොයාගත නොහැක.");
                }

                string previousStatus = order.Status;
                order.Status = dto.Status;

                // ✅ Cancelled → ReservedQuantity release කරනවා (StockQuantity touch නොකරනවා)
                if (dto.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) &&
                    !previousStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (item.ProductVariant != null)
                        {
                            item.ProductVariant.ReservedQuantity = Math.Max(0, item.ProductVariant.ReservedQuantity - item.Quantity);

                            _context.StockMovements.Add(new StockMovement
                            {
                                ProductVariantId = item.ProductVariantId,
                                Type = "OrderCancel",
                                Quantity = item.Quantity,
                                PreviousStock = item.ProductVariant.StockQuantity,
                                NewStock = item.ProductVariant.StockQuantity,
                                Reason = $"Order #{order.Id} cancelled — reservation released",
                                OrderId = order.Id,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }

                // ✅ Delivered/Shipped → StockQuantity physically deduct කරනවා + ReservedQuantity release
                if ((dto.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase) ||
                     dto.Status.Equals("Shipped", StringComparison.OrdinalIgnoreCase)) &&
                    !previousStatus.Equals("Delivered", StringComparison.OrdinalIgnoreCase) &&
                    !previousStatus.Equals("Shipped", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (item.ProductVariant != null)
                        {
                            int prevStock = item.ProductVariant.StockQuantity;
                            item.ProductVariant.StockQuantity = Math.Max(0, item.ProductVariant.StockQuantity - item.Quantity);
                            item.ProductVariant.ReservedQuantity = Math.Max(0, item.ProductVariant.ReservedQuantity - item.Quantity);

                            _context.StockMovements.Add(new StockMovement
                            {
                                ProductVariantId = item.ProductVariantId,
                                Type = "OrderDeduct",
                                Quantity = -item.Quantity,
                                PreviousStock = prevStock,
                                NewStock = item.ProductVariant.StockQuantity,
                                Reason = $"Order #{order.Id} {dto.Status} — stock deducted",
                                OrderId = order.Id,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }

                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                return Ok(new { message = "ඇණවුමේ තත්ත්වය සාර්ථකව වෙනස් කරන ලදී!", status = order.Status });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"ඇණවුමේ තත්ත්වය වෙනස් කිරීමට නොහැකි විය: {ex.Message}");
            }
        }

        // 4. PUT: api/Orders/{id}/slip (User uploads payment slip URL)
        [HttpPut("{id}/slip")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderSlip(int id, [FromBody] UpdateOrderSlipDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
                if (order == null)
                {
                    return NotFound($"Order ID {id} සොයාගත නොහැක.");
                }

                order.PaymentSlipUrl = dto.PaymentSlipUrl;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                return Ok(new { message = "ගෙවීම් රිසිට්පත සාර්ථකව සුරකින ලදී!", paymentSlipUrl = order.PaymentSlipUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"රිසිට්පත සුරැකීමේදී ගැටලුවක් ඇතිවිය: {ex.Message}");
            }
        }
    }

    // --- Data Transfer Objects (DTOs) ---
    public class CreateOrderDto
    {
        public int UserId { get; set; }
        public string PaymentMethod { get; set; } = "BankTransfer";
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string OrderNote { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? PaymentSlipUrl { get; set; }
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

    public class UpdateOrderSlipDto
    {
        public string PaymentSlipUrl { get; set; } = string.Empty;
    }
}