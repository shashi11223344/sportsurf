'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [activeSport, setActiveSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products").then(res => res.json()),
      fetch("/api/admin/categories").then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setActiveSport("all"); // Reset sport when category changes via nav
    } else {
      setActiveCategory("all");
      setActiveSport("all");
    }
  }, [categoryParam]);

  const currentCategoryLabel = useMemo(() => {
    if (activeCategory === 'all') return 'All Categories';
    const cat = categories.find(c => c.id === activeCategory);
    return cat ? cat.label : 'Category';
  }, [activeCategory, categories]);

  const sportsInCategory = useMemo(() => {
    if (activeCategory === 'all') return [];
    const catProducts = products.filter(p => {
      const productCategorySlug = p.category.toLowerCase().replace(/\s+/g, '-');
      return p.category === activeCategory || productCategorySlug === activeCategory || p.category === currentCategoryLabel;
    });
    // Unique list of subcategories/sports (stored in shortSpec or as fallback use specific attribute)
    const uniqueSports = Array.from(new Set(catProducts.map(p => p.shortSpec || p.name).filter(Boolean)));
    return uniqueSports;
  }, [activeCategory, products, currentCategoryLabel]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
      const matchesCategory = activeCategory === 'all'
        || product.category === activeCategory
        || productCategorySlug === activeCategory
        || product.category === currentCategoryLabel;
      const matchesSport = activeSport === 'all' || product.shortSpec === activeSport || product.name === activeSport;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSport && matchesSearch;
    });
  }, [products, activeCategory, activeSport, searchQuery, currentCategoryLabel]);

  if (loading) {
    return (
      <div className="pt-12      min-h-screen bg-ag-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-ag-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-12   min-h-screen bg-ag-bg  pb-20">
      <div className="container-retail">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-body text-ag-text-muted mb-4 tracking-wider uppercase">
            <Link href="/" className="hover:text-ag-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-ag-primary transition-colors">Products</Link>
            {activeCategory !== 'all' && (
              <>
                <ChevronRight size={12} />
                <span className="text-ag-primary font-semibold">{currentCategoryLabel}</span>
              </>
            )}
            {activeSport !== 'all' && (
                <>
                <ChevronRight size={12} />
                <span className="text-ag-primary font-semibold">{activeSport}</span>
                </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {activeCategory === 'all' ? (
                <PageHeader
                  page="products"
                  defaultTag=""
                  defaultTitle="Explore Infrastructure"
                  defaultSubtitle="Select a category from the top navigation to explore our premium sports infrastructure solutions."
                  titleClassName="text-3xl md:text-4xl font-heading font-black text-ag-text mb-2 tracking-tighter uppercase"
                  wrapperClassName=""
                  subtitleClassName="text-ag-text-muted max-w-2xl text-sm font-body"
                />
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-heading font-black text-ag-text mb-2 tracking-tighter uppercase">
                    {activeSport !== 'all' ? activeSport : currentCategoryLabel}
                  </h1>
                  <p className="text-ag-text-muted max-w-2xl text-sm font-body">
                    {`Discover our range of premium sports infrastructure and equipment tailored for ${currentCategoryLabel.toLowerCase()}.`}
                  </p>
                </>
              )}
            </div>
            
            <button 
              className="md:hidden flex items-center gap-2 text-ag-text bg-white px-4 py-2 border border-ag-border rounded font-body text-sm self-start"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-ag-border p-6 transform transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 lg:w-auto lg:p-0 lg:bg-transparent lg:border-none lg:z-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h3 className="font-heading font-bold text-lg text-ag-text">Filters</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-ag-text-muted">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-10 sticky top-40">
              {/* Categories - managed in Admin > Navbar & Categories */}
              <div className="space-y-4">
                <h3 className="font-body font-extrabold text-xs uppercase tracking-widest text-ag-text pb-2 border-b border-ag-border">
                  Categories
                </h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      router.push('/products');
                      setIsSidebarOpen(false);
                    }}
                    className={`text-left text-sm py-2 px-3 rounded transition-colors ${activeCategory === 'all' ? 'bg-ag-bg-alt text-ag-primary font-bold border-l-2 border-ag-primary' : 'text-ag-text-muted hover:bg-ag-bg-alt/50 hover:text-ag-text'}`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        router.push(`/products?category=${cat.id}`);
                        setIsSidebarOpen(false);
                      }}
                      className={`text-left text-sm py-2 px-3 rounded transition-colors ${activeCategory === cat.id ? 'bg-ag-bg-alt text-ag-primary font-bold border-l-2 border-ag-primary' : 'text-ag-text-muted hover:bg-ag-bg-alt/50 hover:text-ag-text'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-categories within the selected category */}
              {activeCategory !== 'all' && (
                <div className="space-y-4">
                  <h3 className="font-body font-extrabold text-xs uppercase tracking-widest text-ag-text pb-2 border-b border-ag-border">
                    {currentCategoryLabel}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setActiveSport('all')}
                      className={`text-left text-sm py-2 px-3 rounded transition-colors ${activeSport === 'all' ? 'bg-ag-bg-alt text-ag-primary font-bold border-l-2 border-ag-primary' : 'text-ag-text-muted hover:bg-ag-bg-alt/50 hover:text-ag-text'}`}
                    >
                      Show All {currentCategoryLabel}
                    </button>
                    {sportsInCategory.map(sport => (
                      <button
                        key={sport}
                        onClick={() => setActiveSport(sport)}
                        className={`text-left text-sm py-2 px-3 rounded transition-colors ${activeSport === sport ? 'bg-ag-bg-alt text-ag-primary font-bold border-l-2 border-ag-primary' : 'text-ag-text-muted hover:bg-ag-bg-alt/50 hover:text-ag-text'}`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick-Jump for Sub-categories (Horizontal on desktop top if activeSport is all) */}
            {activeCategory !== 'all' && activeSport === 'all' && sportsInCategory.length > 1 && (
              <div className="mb-10 bg-white border border-ag-border p-4 overflow-x-auto">
                <p className="text-[10px] font-body font-bold text-ag-text-muted uppercase tracking-widest mb-3 px-2">Sub Categories</p>
                <div className="flex gap-3">
                  {sportsInCategory.map(sport => (
                    <button
                      key={sport}
                      onClick={() => setActiveSport(sport)}
                      className="px-4 py-2 bg-ag-bg-alt border border-ag-border rounded text-xs font-bold text-ag-text whitespace-nowrap hover:border-ag-primary transition-colors"
                    >
                      {sport.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Header / Search */}
            <div className="bg-white border border-ag-border p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-ag-text-muted font-body">
                Showing <span className="font-bold text-ag-text">{filteredProducts.length}</span> products
              </div>
              <div className="flex gap-2 relative">
                  <input
                      type="text"
                      placeholder="Search within..."
                      className="border border-ag-border px-3 py-1.5 text-sm font-body outline-none focus:border-ag-primary w-full sm:w-48 transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ag-text-muted hover:text-ag-text">
                          <X size={14} />
                      </button>
                  )}
              </div>
            </div>

            {/* Product Grid / Grouped Display */}
            {filteredProducts.length > 0 ? (
              <div className="space-y-16">
                {activeSport === 'all' && activeCategory !== 'all' && sportsInCategory.length > 0 ? (
                  // Grouped by Sub-Category (Sport) - only meaningful within a selected category
                  sportsInCategory.map(sport => {
                    const productsInSport = filteredProducts.filter(p => p.shortSpec === sport || p.name === sport);
                    if (productsInSport.length === 0) return null;
                    
                    return (
                      <div key={sport} className="space-y-8">
                        <div className="flex items-center gap-4">
                          <h2 className="font-heading font-black text-xl md:text-2xl text-ag-text uppercase tracking-tight">
                            {sport}
                          </h2>
                          <div className="flex-1 h-px bg-ag-border" />
                          <span className="text-[10px] font-body font-bold text-ag-text-muted tracking-widest uppercase">
                            {productsInSport.length} Items
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {productsInSport.map((product) => (
                            <ProductCard 
                              key={product.id}
                              name={product.name}
                              category={product.category}
                              shortSpec={product.shortSpec || product.description}
                              slug={product.slug}
                              image={product.imageUrl || "/images/sports/surface_sports.png"}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Normal Filtered Grid for specific sport
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id}
                        name={product.name}
                        category={product.category}
                        shortSpec={product.shortSpec || product.description}
                        slug={product.slug}
                        image={product.imageUrl || "/images/sports/surface_sports.png"}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-ag-border border-dashed p-12 text-center">
                <h3 className="text-xl font-heading font-bold text-ag-text mb-2">No products found</h3>
                <p className="text-ag-text-muted font-body mb-6">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => {
                    setActiveCategory('all');
                    setActiveSport('all');
                    setSearchQuery('');
                  }}
                  className="btn btn-gold px-6 py-2 text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-ag-bg flex items-center justify-center "><div className="w-8 h-8 rounded-full border-2 border-ag-primary border-t-transparent animate-spin"></div></div>}>
            <ProductsContent />
        </Suspense>
    )
}
