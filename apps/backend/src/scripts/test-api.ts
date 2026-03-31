/**
 * API Test Script - Tests all e-commerce endpoints
 * Run with: npx tsx src/scripts/test-api.ts
 */

const BASE_URL = 'http://localhost:3001/api';

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
    response?: any;
}

const results: TestResult[] = [];

async function request(method: string, endpoint: string, body?: any): Promise<{ status: number; data: any }> {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

function test(name: string, passed: boolean, message: string, response?: any) {
    results.push({ name, passed, message, response });
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${message}`);
}

// ============================================
// CATEGORY TESTS
// ============================================
async function testCategories() {
    console.log('\n📁 CATEGORY TESTS');
    console.log('─'.repeat(40));

    // Create category
    const createRes = await request('POST', '/categories', {
        name: 'Test Electronics',
        description: 'Test electronic devices'
    });
    test('POST /categories', createRes.status === 201, `Status: ${createRes.status}`, createRes.data);
    const categoryId = createRes.data.id;

    // Get all categories
    const listRes = await request('GET', '/categories');
    test('GET /categories', listRes.status === 200 && Array.isArray(listRes.data), `Found ${listRes.data?.length || 0} categories`);

    // Get single category
    const getRes = await request('GET', `/categories/${categoryId}`);
    test('GET /categories/:id', getRes.status === 200 && getRes.data.name === 'Test Electronics', `Status: ${getRes.status}`);

    // Update category
    const updateRes = await request('PUT', `/categories/${categoryId}`, {
        name: 'Updated Electronics',
        description: 'Updated description'
    });
    test('PUT /categories/:id', updateRes.status === 200, `Status: ${updateRes.status}`);

    // Get 404
    const notFoundRes = await request('GET', '/categories/99999');
    test('GET /categories/:id (404)', notFoundRes.status === 404, `Status: ${notFoundRes.status}`);

    return categoryId;
}

// ============================================
// ARTICLE TESTS
// ============================================
async function testArticles(categoryId: number) {
    console.log('\n📦 ARTICLE TESTS');
    console.log('─'.repeat(40));

    // Create article
    const createRes = await request('POST', '/articles', {
        name: 'Test Laptop',
        description: 'A powerful test laptop',
        price: 999.99,
        stock_quantity: 50,
        image_url: '/images/laptop.jpg',
        category_id: categoryId
    });
    test('POST /articles', createRes.status === 201, `Status: ${createRes.status}`, createRes.data);
    const articleId = createRes.data.id;

    // Get all articles
    const listRes = await request('GET', '/articles');
    test('GET /articles', listRes.status === 200 && Array.isArray(listRes.data), `Found ${listRes.data?.length || 0} articles`);

    // Get single article
    const getRes = await request('GET', `/articles/${articleId}`);
    test('GET /articles/:id', getRes.status === 200 && getRes.data.name === 'Test Laptop', `Status: ${getRes.status}`);

    // Get by category
    const byCatRes = await request('GET', `/articles/category/${categoryId}`);
    test('GET /articles/category/:id', byCatRes.status === 200 && Array.isArray(byCatRes.data), `Found ${byCatRes.data?.length || 0} articles`);

    // Update article
    const updateRes = await request('PUT', `/articles/${articleId}`, {
        name: 'Updated Laptop',
        price: 1099.99
    });
    test('PUT /articles/:id', updateRes.status === 200, `Status: ${updateRes.status}`);

    // Validation error
    const invalidRes = await request('POST', '/articles', { name: 'Missing fields' });
    test('POST /articles (validation)', invalidRes.status === 400, `Status: ${invalidRes.status}`);

    return articleId;
}

// ============================================
// CUSTOMER TESTS
// ============================================
async function testCustomers() {
    console.log('\n👤 CUSTOMER TESTS');
    console.log('─'.repeat(40));

    // Register customer (via auth)
    const registerRes = await request('POST', '/auth/register', {
        first_name: 'John',
        last_name: 'Doe',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        postal_code: '12345'
    });
    test('POST /auth/register', registerRes.status === 201, `Status: ${registerRes.status}`, registerRes.data);
    const customerId = registerRes.data.id;

    // Login
    const loginRes = await request('POST', '/auth/login', {
        email: registerRes.data.user?.email,
        password: 'password123'
    });
    test('POST /auth/login', loginRes.status === 200, `Status: ${loginRes.status}`);

    // Get all customers
    const listRes = await request('GET', '/customers');
    test('GET /customers', listRes.status === 200 && Array.isArray(listRes.data), `Found ${listRes.data?.length || 0} customers`);

    // Get single customer
    const getRes = await request('GET', `/customers/${customerId}`);
    test('GET /customers/:id', getRes.status === 200 && getRes.data.first_name === 'John', `Status: ${getRes.status}`);

    // Update customer
    const updateRes = await request('PUT', `/customers/${customerId}`, {
        first_name: 'Jane',
        address: '456 New St'
    });
    test('PUT /customers/:id', updateRes.status === 200, `Status: ${updateRes.status}`);

    // Wrong login
    const wrongLoginRes = await request('POST', '/auth/login', {
        email: 'wrong@example.com',
        password: 'wrong'
    });
    test('POST /auth/login (wrong)', wrongLoginRes.status === 401, `Status: ${wrongLoginRes.status}`);

    return customerId;
}

// ============================================
// ADMIN TESTS
// ============================================
async function testAdmins() {
    console.log('\n🔐 ADMIN TESTS');
    console.log('─'.repeat(40));

    // Create admin
    const createRes = await request('POST', '/admins', {
        username: 'testadmin',
        email: `admin${Date.now()}@example.com`,
        password: 'adminpass123'
    });
    test('POST /admins', createRes.status === 201, `Status: ${createRes.status}`, createRes.data);
    const adminId = createRes.data.id;

    // Admin login
    const loginRes = await request('POST', '/auth/admin/login', {
        email: createRes.data.email,
        password: 'adminpass123'
    });
    test('POST /auth/admin/login', loginRes.status === 200, `Status: ${loginRes.status}`);

    // Get all admins
    const listRes = await request('GET', '/admins');
    test('GET /admins', listRes.status === 200 && Array.isArray(listRes.data), `Found ${listRes.data?.length || 0} admins`);

    // Get single admin
    const getRes = await request('GET', `/admins/${adminId}`);
    test('GET /admins/:id', getRes.status === 200 && getRes.data.username === 'testadmin', `Status: ${getRes.status}`);

    // Update admin
    const updateRes = await request('PUT', `/admins/${adminId}`, {
        username: 'updatedadmin'
    });
    test('PUT /admins/:id', updateRes.status === 200, `Status: ${updateRes.status}`);

    return adminId;
}

// ============================================
// ORDER TESTS
// ============================================
async function testOrders(customerId: number, articleId: number) {
    console.log('\n🛒 ORDER TESTS');
    console.log('─'.repeat(40));

    // Create order
    const createRes = await request('POST', '/orders', {
        customer_id: customerId,
        items: [
            { article_id: articleId, quantity: 2 }
        ]
    });
    test('POST /orders (checkout)', createRes.status === 201, `Status: ${createRes.status}`, createRes.data);
    const orderId = createRes.data.id;

    // Get all orders
    const listRes = await request('GET', '/orders');
    test('GET /orders', listRes.status === 200 && Array.isArray(listRes.data), `Found ${listRes.data?.length || 0} orders`);

    // Get single order
    const getRes = await request('GET', `/orders/${orderId}`);
    test('GET /orders/:id', getRes.status === 200 && getRes.data.items?.length > 0, `Status: ${getRes.status}, Items: ${getRes.data.items?.length}`);

    // Get orders by customer
    const custOrdersRes = await request('GET', `/orders/customer/${customerId}`);
    test('GET /orders/customer/:id', custOrdersRes.status === 200 && Array.isArray(custOrdersRes.data), `Found ${custOrdersRes.data?.length || 0} orders`);

    // Update order status
    const statusRes = await request('PATCH', `/orders/${orderId}/status`, {
        status: 'shipped'
    });
    test('PATCH /orders/:id/status', statusRes.status === 200, `Status: ${statusRes.status}`);

    // Invalid status
    const invalidStatusRes = await request('PATCH', `/orders/${orderId}/status`, {
        status: 'invalid'
    });
    test('PATCH /orders/:id/status (invalid)', invalidStatusRes.status === 400, `Status: ${invalidStatusRes.status}`);

    // Validation error
    const invalidOrderRes = await request('POST', '/orders', { customer_id: customerId });
    test('POST /orders (validation)', invalidOrderRes.status === 400, `Status: ${invalidOrderRes.status}`);

    return orderId;
}

// ============================================
// CLEANUP TESTS
// ============================================
async function testCleanup(orderId: number, articleId: number, customerId: number, categoryId: number, adminId: number) {
    console.log('\n🧹 CLEANUP TESTS (DELETE)');
    console.log('─'.repeat(40));

    // Delete order
    const delOrderRes = await request('DELETE', `/orders/${orderId}`);
    test('DELETE /orders/:id', delOrderRes.status === 200, `Status: ${delOrderRes.status}`);

    // Delete article
    const delArticleRes = await request('DELETE', `/articles/${articleId}`);
    test('DELETE /articles/:id', delArticleRes.status === 200, `Status: ${delArticleRes.status}`);

    // Delete customer
    const delCustomerRes = await request('DELETE', `/customers/${customerId}`);
    test('DELETE /customers/:id', delCustomerRes.status === 200, `Status: ${delCustomerRes.status}`);

    // Delete category
    const delCategoryRes = await request('DELETE', `/categories/${categoryId}`);
    test('DELETE /categories/:id', delCategoryRes.status === 200, `Status: ${delCategoryRes.status}`);

    // Delete admin
    const delAdminRes = await request('DELETE', `/admins/${adminId}`);
    test('DELETE /admins/:id', delAdminRes.status === 200, `Status: ${delAdminRes.status}`);
}

// ============================================
// MAIN
// ============================================
async function main() {
    console.log('🚀 E-COMMERCE API TEST SUITE');
    console.log('═'.repeat(40));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);

    try {
        // Health check
        console.log('\n💓 HEALTH CHECK');
        console.log('─'.repeat(40));
        const healthRes = await fetch('http://localhost:3001/health');
        const healthData = await healthRes.json();
        test('GET /health', healthRes.status === 200, `Status: ${healthRes.status}`, healthData);

        // Run tests
        const categoryId = await testCategories();
        const articleId = await testArticles(categoryId);
        const customerId = await testCustomers();
        const adminId = await testAdmins();
        const orderId = await testOrders(customerId, articleId);

        // Cleanup
        await testCleanup(orderId, articleId, customerId, categoryId, adminId);

        // Summary
        console.log('\n📊 TEST SUMMARY');
        console.log('═'.repeat(40));
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;
        console.log(`Total: ${results.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            results.filter(r => !r.passed).forEach(r => {
                console.log(`  - ${r.name}: ${r.message}`);
            });
        }

        process.exit(failed > 0 ? 1 : 0);
    } catch (error: any) {
        console.error('\n💥 TEST FAILED:', error.message);
        console.error('Make sure the server is running on http://localhost:3001');
        process.exit(1);
    }
}

main();
