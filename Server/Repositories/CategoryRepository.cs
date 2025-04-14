using Server.Data;
using Shopimy.Server.Models;
using Microsoft.EntityFrameworkCore;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetCategoriesByStoreIdAsync(int storeId);
    Task<Category?> GetCategoryByIdAsync(int storeId, int categoryId);
    Task AddCategoryAsync(Category category);
    Task UpdateCategoryAsync(Category category);
    Task DeleteCategoryAsync(Category category);
    Task<Category?> GetCategoryByStoreAndIdAsync(int storeId, int categoryId);
    Task DeleteCategoryAsync(int storeId, int categoryId);
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
        return await _context.Categories
            .Where(c => c.StoreId == storeId)
            .ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(int storeId, int categoryId)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.StoreId == storeId && c.CategoryId == categoryId);
    }

    public async Task AddCategoryAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateCategoryAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(Category category)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task<Category?> GetCategoryByStoreAndIdAsync(int storeId, int categoryId)
    {
        // This implementation is similar to GetCategoryByIdAsync. 
        return await _context.Categories.FirstOrDefaultAsync(c => c.StoreId == storeId && c.CategoryId == categoryId);
    }

    public async Task DeleteCategoryAsync(int storeId, int categoryId)
    {
        var category = await GetCategoryByStoreAndIdAsync(storeId, categoryId);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}
