async function testUrls() {
    const urls = [
        'https://loremflickr.com/400/400/food',
        'https://placehold.co/400x400/orange/white?text=Food'
    ];
    for (const u of urls) {
        try {
            const r = await fetch(u);
            console.log(r.status, u);
        } catch (e) {
            console.error("FAIL", u, e.message);
        }
    }
}
testUrls();
