using Microsoft.EntityFrameworkCore;
using Server.Data;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetCategoriesByStoreIdAsync(int storeId);
    Task<Category> GetCategoryByIdAsync(int storeId, int categoryId);
    Task AddCategoryAsync(Category category);
    Task UpdateCategoryAsync(Category category);
    Task DeleteCategoryAsync(Category category);
}

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Category>> GetCategoriesByStoreIdAsync(int storeId)
    {
        return await _context.Categories.Where(c => c.StoreId == storeId).ToListAsync();
    }

    public async Task<Category> GetCategoryByIdAsync(int storeId, int categoryId)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.StoreId == storeId && c.CategoryId == categoryId);
    }

    public async Task AddCategoryAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
    }

    public Task UpdateCategoryAsync(Category category)
    {
        throw new NotImplementedException();
    }

    public Task DeleteCategoryAsync(Category category)
    {
        throw new NotImplementedException();
    }
}
