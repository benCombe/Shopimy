using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TestController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/test
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestItem>>> GetTestItems()
        {
            return await _context.TestTable.ToListAsync();
        }

        // GET: api/test/1
        [HttpGet("{id}")]
        public async Task<ActionResult<TestItem>> GetTestItem(int id)
        {
            var testItem = await _context.TestTable.FindAsync(id);
            if (testItem == null)
            {
                return NotFound();
            }
            return testItem;
        }
    }
}
