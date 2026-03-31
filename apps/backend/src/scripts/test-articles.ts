async function testArticles() {
    try {
        const response = await fetch('http://localhost:3001/api/articles');
        const data = await response.json();
        console.log('Result from /api/articles:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error: any) {
        console.error('Error fetching articles:', error.message);
    }
}

testArticles();
