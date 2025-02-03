using Shopimy.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetCategoriesForStoreAsync(int storeId);
    Task<Category> GetCategoryByIdAsync(int storeId, int categoryId);
    Task<Category> CreateCategoryAsync(int storeId, Category model);
    Task<Category> UpdateCategoryAsync(int storeId, int categoryId, Category model);
    Task DeleteCategoryAsync(int storeId, int categoryId);
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Category>> GetCategoriesForStoreAsync(int storeId)
    {
        // Retrieve all categories for the given store.
        var categories = await _repository.GetCategoriesByStoreIdAsync(storeId);
        // No mapping needed since we're working directly with the domain model.
        return categories;
    }

    public async Task<Category> GetCategoryByIdAsync(int storeId, int categoryId)
    {
        var category = await _repository.GetCategoryByStoreAndIdAsync(storeId, categoryId);
        return category;
    }

    public async Task<Category> CreateCategoryAsync(int storeId, Category model)
    {
        // You can add any business rules or validations here.
        var category = new Category
        {
            StoreId = storeId,
            Name = model.Name,
            ParentCategory = model.ParentCategory
        };

        await _repository.AddCategoryAsync(category);
        // Optionally, if your repository saves changes automatically, return the created category.
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(int storeId, int categoryId, Category model)
    {
        // Fetch the existing category.
        var category = await _repository.GetCategoryByStoreAndIdAsync(storeId, categoryId);
        if (category == null)
        {
            throw new Exception("Category not found.");
        }

        // Update the fields.
        category.Name = model.Name;
        category.ParentCategory = model.ParentCategory;

        await _repository.UpdateCategoryAsync(category);
        return category;
    }

    public async Task DeleteCategoryAsync(int storeId, int categoryId)
    {
        await _repository.DeleteCategoryAsync(storeId, categoryId);
    }
}
