import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('restaurant'); // restaurant, categories, products
    const [loading, setLoading] = useState(true);

    // Data State
    const [restaurantInfo, setRestaurantInfo] = useState({ name: '', logo: '' });
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Forms State
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchData();
            else setLoading(false);
        });

        // Listen for login/logout events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchData();
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchData() {
        setLoading(true);
        // Fetch Restaurant Info
        let { data: restData } = await supabase.from('restaurant_info').select('*').single();
        if (restData) setRestaurantInfo(restData);

        // Fetch Categories
        let { data: catData } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (catData) setCategories(catData);

        // Fetch Products
        let { data: prodData } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
        if (prodData) setProducts(prodData);

        setLoading(false);
    }

    // --- RESTAURANT HANDLERS ---
    async function saveRestaurantInfo(e) {
        e.preventDefault();
        const { error } = await supabase.from('restaurant_info').upsert({ id: 1, ...restaurantInfo });
        if (!error) alert('تم حفظ بيانات المطعم بنجاح!');
        else alert('حدث خطأ أثناء الحفظ');
    }

    // --- CATEGORY HANDLERS ---
    async function saveCategory(e) {
        e.preventDefault();
        const { id, name, description, image, color, sort_order } = editingCategory;
        if (id) {
            await supabase.from('categories').update({ name, description, image, color, sort_order }).eq('id', id);
        } else {
            await supabase.from('categories').insert([{ name, description, image, color, sort_order }]);
        }
        setEditingCategory(null);
        fetchData();
    }

    async function deleteCategory(id) {
        if(confirm('هل أنت متأكد من حذف هذا القسم؟')) {
            await supabase.from('categories').delete().eq('id', id);
            fetchData();
        }
    }

    // --- PRODUCT HANDLERS ---
    async function saveProduct(e) {
        e.preventDefault();
        const { id, category_id, name, description, price, image, color, sort_order } = editingProduct;
        if (id) {
            await supabase.from('products').update({ category_id, name, description, price, image, color, sort_order }).eq('id', id);
        } else {
            await supabase.from('products').insert([{ category_id, name, description, price, image, color, sort_order }]);
        }
        setEditingProduct(null);
        fetchData();
    }

    async function deleteProduct(id) {
        if(confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
            await supabase.from('products').delete().eq('id', id);
            fetchData();
        }
    }

    // --- UPLOAD HANDLER ---
    const [uploadingImage, setUploadingImage] = useState(false);
    async function handleImageUpload(e, setFunc, stateObj, fieldName) {
        try {
            setUploadingImage(true);
            const file = e.target.files[0];
            if (!file) return;
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage.from('menu_images').upload(filePath, file);

            if (uploadError) {
                alert('خطأ في الرفع! تأكد أنك أنشأت bucket باسم menu_images وجعلته Public في Supabase.');
                throw uploadError;
            }

            const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath);
            setFunc({ ...stateObj, [fieldName]: data.publicUrl });
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploadingImage(false);
        }
    }

    // --- AUTH HANDLERS ---
    async function handleLogin(e) {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setLoginError(error.message);
        setLoginLoading(false);
    }
    
    async function handleLogout() {
        await supabase.auth.signOut();
    }

    if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>جاري التحميل...</div>;

    if (!session) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">تسجيل الدخول للإدارة</h2>
                    {loginError && <div className="login-error">فشل تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور.</div>}
                    <form onSubmit={handleLogin} style={{textAlign: 'right'}}>
                        <div className="form-group">
                            <label className="form-label">البريد الإلكتروني (Email)</label>
                            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">كلمة المرور (Password)</label>
                            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
                        </div>
                        <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={loginLoading}>
                            {loginLoading ? 'جاري التحقق...' : 'دخول'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-title">إدارة المنيو والتطبيق</div>
                <div className="nav-links" style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button className={activeTab === 'restaurant' ? 'active' : ''} onClick={() => setActiveTab('restaurant')}>معلومات المطعم</button>
                    <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>الأقسام</button>
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>الأصناف</button>
                    <button onClick={() => window.open('/', '_blank')}>عرض المنيو</button>
                    <button onClick={handleLogout} style={{color: '#ef4444', border: '1px solid #ef4444'}}>تسجيل خروج</button>
                </div>
            </header>

            {/* RESTAURANT TAB */}
            {activeTab === 'restaurant' && (
                <div className="section-card">
                    <h2>إعدادات المطعم العامة</h2>
                    <form onSubmit={saveRestaurantInfo}>
                        <div className="form-group">
                            <label className="form-label">اسم المطعم (أو القسم المعروض في الهيدر)</label>
                            <input className="form-input" value={restaurantInfo.name || ''} onChange={e => setRestaurantInfo({...restaurantInfo, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">اللوجو (نص/إيموجي، أو ارفع صورة)</label>
                            <div className="flex-row">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setRestaurantInfo, restaurantInfo, 'logo')} disabled={uploadingImage} style={{marginBottom: '10px'}} />
                                {uploadingImage && <span style={{fontSize: '12px', color: 'blue'}}>جاري الرفع...</span>}
                            </div>
                            <input className="form-input" value={restaurantInfo.logo || ''} onChange={e => setRestaurantInfo({...restaurantInfo, logo: e.target.value})} required placeholder="سيظهر رابط الصورة هنا عند الرفع..." />
                            {restaurantInfo.logo && restaurantInfo.logo.startsWith('http') && <img src={restaurantInfo.logo} width="50" style={{marginTop:'10px'}}/>}
                        </div>
                        <button type="submit" className="btn-primary" disabled={uploadingImage}>حفظ التعديلات</button>
                    </form>
                </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
                <div className="section-card">
                    <div className="flex-row justify-between mb-4">
                        <h2>الأقسام الرئيسية</h2>
                        <button className="btn-primary" onClick={() => setEditingCategory({ name: '', description: '', image: '', color: '#D4A843', sort_order: 0 })}>+ إضافة قسم جديد</button>
                    </div>

                    {editingCategory && (
                        <form onSubmit={saveCategory} style={{background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem'}}>
                            <h3>{editingCategory.id ? 'تعديل قسم' : 'إضافة قسم'}</h3>
                            <div className="form-group">
                                <label className="form-label">اسم القسم (مثال: برجر)</label>
                                <input className="form-input" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">وصف القسم</label>
                                <input className="form-input" value={editingCategory.description || ''} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">صورة القسم (اختر من الجاليري)</label>
                                <div className="flex-row">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setEditingCategory, editingCategory, 'image')} disabled={uploadingImage} style={{marginBottom: '10px'}} />
                                    {uploadingImage && <span style={{fontSize: '12px', color: 'blue'}}>جاري الرفع...</span>}
                                </div>
                                <input className="form-input" type="url" value={editingCategory.image} onChange={e => setEditingCategory({...editingCategory, image: e.target.value})} required placeholder="الرابط سيظهر هنا..." />
                                {editingCategory.image && <img src={editingCategory.image} width="60" style={{marginTop:'10px', borderRadius: '8px'}}/>}
                            </div>
                            <div className="flex-row mt-4">
                                <button type="submit" className="btn-primary" disabled={uploadingImage}>حفظ القسم</button>
                                <button type="button" className="btn-danger" onClick={() => setEditingCategory(null)}>إلغاء</button>
                            </div>
                        </form>
                    )}

                    <table className="data-table">
                        <thead><tr><th>الصورة</th><th>الاسم</th><th>الإجراءات</th></tr></thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id}>
                                    <td><img src={c.image} alt={c.name} width="50" height="50" style={{borderRadius: '50%', objectFit: 'cover'}}/></td>
                                    <td>{c.name}</td>
                                    <td>
                                        <button className="btn-primary" style={{marginLeft: '10px'}} onClick={() => setEditingCategory(c)}>تعديل</button>
                                        <button className="btn-danger" onClick={() => deleteCategory(c.id)}>حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="section-card">
                    <div className="flex-row justify-between mb-4">
                        <h2>أصناف المنيو</h2>
                        <button className="btn-primary" onClick={() => setEditingProduct({ category_id: categories[0]?.id || '', name: '', description: '', price: '', image: '', color: '#F4A460', sort_order: 0 })}>+ إضافة صنف جديد</button>
                    </div>

                    {editingProduct && (
                        <form onSubmit={saveProduct} style={{background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem'}}>
                            <h3>{editingProduct.id ? 'تعديل صنف' : 'إضافة صنف'}</h3>
                            <div className="form-group">
                                <label className="form-label">القسم التابع له</label>
                                <select className="form-input" value={editingProduct.category_id} onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})} required>
                                    <option value="">-- اختر القسم --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">اسم الصنف</label>
                                <input className="form-input" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">الوصف</label>
                                <textarea className="form-input" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">السعر (ر.س)</label>
                                <input className="form-input" type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">صورة الصنف (اختر من الجاليري)</label>
                                <div className="flex-row">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setEditingProduct, editingProduct, 'image')} disabled={uploadingImage} style={{marginBottom: '10px'}} />
                                    {uploadingImage && <span style={{fontSize: '12px', color: 'blue'}}>جاري الرفع...</span>}
                                </div>
                                <input className="form-input" type="url" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} required placeholder="الرابط سيظهر هنا..." />
                                {editingProduct.image && <img src={editingProduct.image} width="60" style={{marginTop:'10px', borderRadius: '8px'}}/>}
                            </div>
                            <div className="flex-row mt-4">
                                <button type="submit" className="btn-primary" disabled={uploadingImage}>حفظ الصنف</button>
                                <button type="button" className="btn-danger" onClick={() => setEditingProduct(null)}>إلغاء</button>
                            </div>
                        </form>
                    )}

                    <table className="data-table">
                        <thead><tr><th>الصورة</th><th>الاسم</th><th>القسم</th><th>السعر</th><th>الإجراءات</th></tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td><img src={p.image} alt={p.name} width="50" height="50" style={{borderRadius: '50%', objectFit: 'cover'}}/></td>
                                    <td>{p.name}</td>
                                    <td>{categories.find(c => c.id === p.category_id)?.name}</td>
                                    <td>{p.price}</td>
                                    <td>
                                        <button className="btn-primary" style={{marginLeft: '10px'}} onClick={() => setEditingProduct(p)}>تعديل</button>
                                        <button className="btn-danger" onClick={() => deleteProduct(p.id)}>حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
